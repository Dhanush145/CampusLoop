"""
Serializers for categories app.
"""

from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Full category serializer."""

    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'display_order', 'is_active', 'product_count', 'created_at',
        ]

    def get_product_count(self, obj):
        return obj.products.filter(is_available=True, is_approved=True, is_sold=False).count()


class CategoryListSerializer(serializers.ModelSerializer):
    """Minimal category serializer."""

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon']
