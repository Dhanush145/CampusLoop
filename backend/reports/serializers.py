"""
Serializers for reports app.
"""

from rest_framework import serializers
from .models import ProductReport
from accounts.serializers import UserMinimalSerializer


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a product report."""

    class Meta:
        model = ProductReport
        fields = ['product', 'reason', 'description']

    def validate_product(self, value):
        request = self.context['request']
        if value.seller == request.user:
            raise serializers.ValidationError(
                'You cannot report your own product.'
            )
        existing = ProductReport.objects.filter(
            reporter=request.user, product=value,
            status__in=['pending', 'investigating']
        ).exists()
        if existing:
            raise serializers.ValidationError(
                'You already have an active report for this product.'
            )
        return value

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class ReportSerializer(serializers.ModelSerializer):
    """Full report serializer for admin views."""

    reporter = UserMinimalSerializer(read_only=True)
    resolved_by_user = UserMinimalSerializer(source='resolved_by', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    reason_display = serializers.CharField(
        source='get_reason_display', read_only=True
    )
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = ProductReport
        fields = [
            'id', 'reporter', 'product', 'product_title',
            'reason', 'reason_display', 'description',
            'status', 'status_display', 'admin_notes',
            'created_at', 'resolved_at', 'resolved_by_user',
        ]


class ReportResolveSerializer(serializers.Serializer):
    """Serializer for admin updating or resolving a report."""

    status = serializers.ChoiceField(
        choices=['investigating', 'resolved', 'dismissed']
    )
    admin_notes = serializers.CharField(required=False, allow_blank=True, default='')
    take_down_product = serializers.BooleanField(required=False, default=False)


ReportUpdateSerializer = ReportResolveSerializer
