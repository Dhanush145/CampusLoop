"""
Views for enquiries app.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Enquiry
from .serializers import EnquirySerializer, EnquiryCreateSerializer
from notifications.models import Notification
from messaging.models import Conversation, Message


class EnquiryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for sending, listing, accepting, and rejecting enquiries.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = self.request.query_params.get('role', None)
        qs = Enquiry.objects.select_related('product', 'buyer', 'seller').filter(
            Q(buyer=user) | Q(seller=user)
        ).order_by('-created_at')

        if role == 'buyer':
            qs = qs.filter(buyer=user)
        elif role == 'seller':
            qs = qs.filter(seller=user)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return EnquiryCreateSerializer
        return EnquirySerializer

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        enquiry = serializer.save(buyer=self.request.user, seller=product.seller)

        # Create notification for seller
        Notification.objects.create(
            user=product.seller,
            notification_type='enquiry',
            title='New Product Enquiry',
            message=f"{self.request.user.full_name} is interested in your listing: {product.title}",
            related_product=product,
            related_user=self.request.user,
        )

        # Create or find conversation and send initial message
        conversation = Conversation.objects.filter(
            participants=self.request.user
        ).filter(
            participants=product.seller
        ).filter(product=product).first()

        if not conversation:
            conversation = Conversation.objects.create(product=product)
            conversation.participants.add(self.request.user, product.seller)

        Message.objects.create(
            conversation=conversation,
            sender=self.request.user,
            content=enquiry.message or f"Hi! I'm interested in '{product.title}'. Is it still available?"
        )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Seller accepts the enquiry."""
        enquiry = self.get_object()
        if enquiry.seller != request.user and not request.user.is_staff:
            return Response({'error': 'Only the seller can accept this enquiry.'}, status=status.HTTP_403_FORBIDDEN)
        
        enquiry.status = 'accepted'
        enquiry.save()

        Notification.objects.create(
            user=enquiry.buyer,
            notification_type='enquiry',
            title='Enquiry Accepted!',
            message=f"{request.user.full_name} accepted your enquiry for '{enquiry.product.title}'.",
            related_product=enquiry.product,
            related_user=request.user,
        )
        return Response({'message': 'Enquiry accepted.', 'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Seller rejects the enquiry."""
        enquiry = self.get_object()
        if enquiry.seller != request.user and not request.user.is_staff:
            return Response({'error': 'Only the seller can reject this enquiry.'}, status=status.HTTP_403_FORBIDDEN)
        
        enquiry.status = 'rejected'
        enquiry.save()

        Notification.objects.create(
            user=enquiry.buyer,
            notification_type='enquiry',
            title='Enquiry Status Update',
            message=f"Your enquiry for '{enquiry.product.title}' was declined.",
            related_product=enquiry.product,
            related_user=request.user,
        )
        return Response({'message': 'Enquiry rejected.', 'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Buyer cancels their enquiry."""
        enquiry = self.get_object()
        if enquiry.buyer != request.user and not request.user.is_staff:
            return Response({'error': 'Only the buyer can cancel this enquiry.'}, status=status.HTTP_403_FORBIDDEN)
        
        enquiry.status = 'cancelled'
        enquiry.save()
        return Response({'message': 'Enquiry cancelled.', 'status': 'cancelled'})
