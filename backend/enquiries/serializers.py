"""
Serializers for enquiries app.
"""

from rest_framework import serializers
from .models import Enquiry
from accounts.serializers import UserMinimalSerializer
from products.serializers import ProductListSerializer


class EnquirySerializer(serializers.ModelSerializer):
    """Full enquiry serializer."""

    buyer = UserMinimalSerializer(read_only=True)
    seller = UserMinimalSerializer(read_only=True)
    product_detail = ProductListSerializer(source='product', read_only=True)
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = Enquiry
        fields = [
            'id', 'product', 'product_detail', 'buyer', 'seller',
            'message', 'status', 'status_display',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'buyer', 'seller', 'created_at', 'updated_at']


class EnquiryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating an enquiry."""

    class Meta:
        model = Enquiry
        fields = ['id', 'product', 'message', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

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
                {'product': 'You cannot enquire about your own product.'}
            )

        # Check for existing pending enquiry
        existing = Enquiry.objects.filter(
            product=product, buyer=request.user, status='pending'
        ).exists()
        if existing:
            raise serializers.ValidationError(
                {'product': 'You already have a pending enquiry for this product.'}
            )

        return attrs

    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        validated_data['seller'] = validated_data['product'].seller
        return super().create(validated_data)


class EnquiryStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating enquiry status."""

    status = serializers.ChoiceField(choices=['accepted', 'rejected', 'cancelled'])

    def validate_status(self, value):
        enquiry = self.instance
        allowed_transitions = {
            'pending': ['accepted', 'rejected', 'cancelled'],
            'accepted': ['cancelled'],
        }
        allowed = allowed_transitions.get(enquiry.status, [])
        if value not in allowed:
            raise serializers.ValidationError(
                f'Cannot change status from "{enquiry.status}" to "{value}".'
            )
        return value
