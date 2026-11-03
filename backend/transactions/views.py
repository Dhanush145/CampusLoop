"""
Views for transactions app.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Transaction
from .serializers import (
    TransactionSerializer,
    TransactionCreateSerializer,
    TransactionStatusUpdateSerializer,
)
from notifications.models import Notification


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for coordinating and tracking student-to-student transactions."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role')
        qs = Transaction.objects.select_related('product', 'buyer', 'seller', 'enquiry').filter(
            Q(buyer=user) | Q(seller=user)
        ).order_by('-created_at')

        if role == 'buyer':
            qs = qs.filter(buyer=user)
        elif role == 'seller':
            qs = qs.filter(seller=user)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return TransactionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TransactionStatusUpdateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        transaction = serializer.save()
        # Notify seller
        Notification.objects.create(
            user=transaction.seller,
            notification_type='transaction',
            title='Purchase Enquiry Received',
            message=f"{self.request.user.full_name} initiated a transaction for {transaction.product.title}",
            related_product=transaction.product,
            related_user=self.request.user,
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update transaction status (accepted, reserved, completed, cancelled)."""
        transaction = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        # Authorization: only participants can update
        if request.user not in [transaction.buyer, transaction.seller] and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Status transition handling
        product = transaction.product

        if new_status == 'reserved':
            if request.user != transaction.seller:
                return Response({'error': 'Only the seller can reserve the item.'}, status=status.HTTP_403_FORBIDDEN)
            transaction.status = 'reserved'
            product.is_available = False
            product.save()

            Notification.objects.create(
                user=transaction.buyer,
                notification_type='transaction',
                title='Item Reserved!',
                message=f"'{product.title}' has been reserved for you by {transaction.seller.full_name}.",
                related_product=product,
                related_user=transaction.seller,
            )

        elif new_status == 'completed':
            if request.user != transaction.seller:
                return Response({'error': 'Only the seller can confirm offline completion.'}, status=status.HTTP_403_FORBIDDEN)
            transaction.status = 'completed'
            product.is_sold = True
            product.is_available = False
            product.save()

            Notification.objects.create(
                user=transaction.buyer,
                notification_type='transaction',
                title='Transaction Completed',
                message=f"Exchange for '{product.title}' has been marked as completed. Thank you for using CampusLoop!",
                related_product=product,
                related_user=transaction.seller,
            )

        elif new_status == 'accepted':
            if request.user != transaction.seller:
                return Response({'error': 'Only the seller can accept the transaction.'}, status=status.HTTP_403_FORBIDDEN)
            transaction.status = 'accepted'

        elif new_status == 'cancelled':
            transaction.status = 'cancelled'
            if not product.is_sold:
                product.is_available = True
                product.save()
        else:
            return Response({'error': f'Invalid status: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

        if notes:
            transaction.notes = notes
        transaction.save()

        return Response(TransactionSerializer(transaction).data)
