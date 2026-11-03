"""
Serializers for transactions app.
"""

from rest_framework import serializers
from .models import Transaction
from accounts.serializers import UserMinimalSerializer
from products.serializers import ProductListSerializer


class TransactionSerializer(serializers.ModelSerializer):
    """Full transaction serializer."""

    buyer = UserMinimalSerializer(read_only=True)
    seller = UserMinimalSerializer(read_only=True)
    product_detail = ProductListSerializer(source='product', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'product', 'product_detail', 'buyer', 'seller',
            'enquiry', 'status', 'status_display', 'price', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'buyer', 'seller', 'created_at', 'updated_at',
        ]


class TransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a transaction."""

    class Meta:
        model = Transaction
        fields = ['id', 'product', 'enquiry', 'notes', 'status', 'price', 'created_at']
        read_only_fields = ['id', 'status', 'price', 'created_at']

    def validate_product(self, value):
        if not value.is_available or value.is_sold:
            raise serializers.ValidationError(
                'This product is no longer available.'
            )
        return value

    def validate(self, attrs):
        request = self.context['request']
        product = attrs['product']
        if product.seller == request.user:
            raise serializers.ValidationError(
                {'product': 'You cannot create a transaction for your own product.'}
            )
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        validated_data['buyer'] = request.user
        validated_data['seller'] = validated_data['product'].seller
        validated_data['price'] = validated_data['product'].price
        return super().create(validated_data)


class TransactionStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating transaction status."""

    status = serializers.ChoiceField(
        choices=['accepted', 'rejected', 'reserved', 'completed', 'cancelled']
    )
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_status(self, value):
        transaction = self.instance
        allowed_transitions = {
            'enquiry_sent': ['accepted', 'rejected', 'cancelled'],
            'accepted': ['reserved', 'completed', 'cancelled'],
            'reserved': ['completed', 'cancelled'],
        }
        allowed = allowed_transitions.get(transaction.status, [])
        if value not in allowed:
            raise serializers.ValidationError(
                f'Cannot change status from "{transaction.status}" to "{value}".'
            )
        return value
