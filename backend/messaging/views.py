"""
Views for messaging app.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
    MessageCreateSerializer,
)
from notifications.models import Notification
from accounts.models import User
from products.models import Product


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing conversations."""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'messages').order_by('-updated_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationListSerializer

    def create(self, request, *args, **kwargs):
        """Create or get conversation with a specific user or for a product."""
        other_user_id = request.data.get('user_id')
        product_id = request.data.get('product_id')

        if not other_user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        other_user = get_object_or_404(User, id=other_user_id)
        product = get_object_or_404(Product, id=product_id) if product_id else None

        # Check existing conversation
        existing = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        )
        if product:
            existing = existing.filter(product=product)

        conversation = existing.first()
        if not conversation:
            conversation = Conversation.objects.create(product=product)
            conversation.participants.add(request.user, other_user)

        initial_message = request.data.get('message')
        if initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=initial_message
            )

        serializer = ConversationDetailSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a conversation and mark unread messages as read."""
        conversation = self.get_object()
        # Mark other user's messages as read
        conversation.messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
        
        messages = conversation.messages.select_related('sender').order_by('created_at')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Send a message to this conversation."""
        conversation = self.get_object()
        serializer = MessageCreateSerializer(data=request.data)
        if serializer.is_valid():
            msg = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=serializer.validated_data['content']
            )
            # Update conversation timestamp
            conversation.save()

            # Notify other participant
            other = conversation.participants.exclude(id=request.user.id).first()
            if other:
                Notification.objects.create(
                    user=other,
                    notification_type='message',
                    title=f'New message from {request.user.full_name}',
                    message=msg.content[:100],
                    related_user=request.user,
                    related_product=conversation.product,
                )

            return Response(MessageSerializer(msg, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
