"""
Serializers for notifications app.
"""

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Full notification serializer."""

    type_display = serializers.CharField(
        source='get_notification_type_display', read_only=True
    )
    related_product_title = serializers.CharField(
        source='related_product.title', read_only=True, default=None
    )

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'type_display', 'title',
            'message', 'is_read', 'related_product',
            'related_product_title', 'related_user', 'created_at',
        ]
        read_only_fields = [
            'id', 'notification_type', 'title', 'message',
            'related_product', 'related_user', 'created_at',
        ]
