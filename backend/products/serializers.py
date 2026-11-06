"""
Serializers for products app.
"""

from rest_framework import serializers
from .models import Product, ProductImage
from accounts.serializers import UserMinimalSerializer
from categories.serializers import CategoryListSerializer


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""

    class Meta:
        model = ProductImage
        fields = [
            'id', 'image_url', 'cloudinary_public_id',
            'is_primary', 'display_order', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Minimal product serializer for list views."""

    seller_name = serializers.CharField(source='seller.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    college_short_name = serializers.CharField(source='college.short_name', read_only=True)
    primary_image_url = serializers.SerializerMethodField()
    condition_display = serializers.CharField(
        source='get_condition_display', read_only=True
    )
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'price', 'original_price',
            'condition', 'condition_display', 'is_available', 'is_sold',
            'seller', 'seller_name', 'category', 'category_name', 'category_slug',
            'college', 'college_name', 'college_short_name', 'exchange_location',
            'primary_image_url', 'view_count', 'is_wishlisted', 'created_at',
        ]

    def get_primary_image_url(self, obj):
        img = obj.primary_image
        return img.image_url if img else None

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(
                wishlist__user=request.user
            ).exists()
        return False


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full product serializer with all details."""

    seller = UserMinimalSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    college_short_name = serializers.CharField(
        source='college.short_name', read_only=True
    )
    condition_display = serializers.CharField(
        source='get_condition_display', read_only=True
    )
    is_wishlisted = serializers.SerializerMethodField()
    enquiry_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'original_price',
            'condition', 'condition_display', 'is_available', 'is_sold',
            'is_approved', 'view_count', 'seller', 'category', 'category_name',
            'category_slug', 'college', 'college_name', 'college_short_name',
            'exchange_location', 'images', 'is_wishlisted', 'enquiry_count',
            'created_at', 'updated_at',
        ]

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(
                wishlist__user=request.user
            ).exists()
        return False

    def get_enquiry_count(self, obj):
        return obj.enquiries.count()


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products."""

    images = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False, default=[]
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'price', 'original_price',
            'category', 'condition', 'college', 'exchange_location', 'images', 'created_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value

    def validate_original_price(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                'Original price must be greater than zero.'
            )
        return value

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        validated_data['seller'] = self.context['request'].user

        # Set college from seller's profile if not provided
        if not validated_data.get('college'):
            profile = getattr(
                self.context['request'].user, 'student_profile', None
            )
            if profile and profile.college:
                validated_data['college'] = profile.college

        product = Product.objects.create(**validated_data)

        for idx, img_data in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image_url=img_data.get('image_url', ''),
                cloudinary_public_id=img_data.get('cloudinary_public_id', ''),
                is_primary=img_data.get('is_primary', idx == 0),
                display_order=img_data.get('display_order', idx),
            )

        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data is not None:
            instance.images.all().delete()
            for idx, img_data in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image_url=img_data.get('image_url', ''),
                    cloudinary_public_id=img_data.get('cloudinary_public_id', ''),
                    is_primary=img_data.get('is_primary', idx == 0),
                    display_order=img_data.get('display_order', idx),
                )

        return instance
