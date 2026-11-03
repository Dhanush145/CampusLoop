"""
Serializers for messaging app.
"""

from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import UserMinimalSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages."""

    sender = UserMinimalSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a message."""

    class Meta:
        model = Message
        fields = ['content']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty.')
        return value.strip()


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer for listing conversations."""

    participants = UserMinimalSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    product_title = serializers.CharField(
        source='product.title', read_only=True, default=None
    )
    product_id = serializers.IntegerField(
        source='product.id', read_only=True, default=None
    )

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'product_id', 'product_title',
            'last_message', 'unread_count', 'created_at', 'updated_at',
        ]

    def get_last_message(self, obj):
        msg = obj.last_message
        if msg:
            return {
                'content': msg.content[:100],
                'sender_name': msg.sender.full_name,
                'created_at': msg.created_at.isoformat(),
                'is_read': msg.is_read,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(
                sender=request.user
            ).count()
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Full conversation serializer."""

    participants = UserMinimalSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    product_title = serializers.CharField(
        source='product.title', read_only=True, default=None
    )

    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'product_title', 'messages',
            'created_at', 'updated_at',
        ]


class ConversationCreateSerializer(serializers.Serializer):
    """Serializer for creating/getting a conversation."""

    participant_id = serializers.IntegerField()
    product_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_participant_id(self, value):
        from accounts.models import User
        if not User.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('User not found.')
        if value == self.context['request'].user.id:
            raise serializers.ValidationError(
                'Cannot start a conversation with yourself.'
            )
        return value

    def validate_product_id(self, value):
        if value is not None:
            from products.models import Product
            if not Product.objects.filter(id=value).exists():
                raise serializers.ValidationError('Product not found.')
        return value
