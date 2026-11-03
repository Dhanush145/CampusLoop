"""
Views for products app.
"""

from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import django_filters
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, ProductImage
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductImageSerializer,
)
from accounts.permissions import IsOwnerOrReadOnly, IsVerifiedStudent


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    category = django_filters.CharFilter(method='filter_category')
    college = django_filters.NumberFilter(field_name="college__id")
    condition = django_filters.CharFilter(field_name="condition")
    is_available = django_filters.BooleanFilter(field_name="is_available")

    class Meta:
        model = Product
        fields = ['category', 'condition', 'college', 'min_price', 'max_price', 'is_available']

    def filter_category(self, queryset, name, value):
        if value.isdigit():
            return queryset.filter(category__id=int(value))
        return queryset.filter(category__slug=value)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for searching, filtering, creating, and managing products.
    """
    queryset = Product.objects.select_related('seller', 'category', 'college').prefetch_related('images').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'price', 'view_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search']:
            return [AllowAny()]
        elif self.action in ['create']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # For public list, hide deleted/unapproved if needed, default is is_available or seller's own
        if self.action == 'list':
            is_sold = self.request.query_params.get('is_sold')
            if is_sold is not None:
                qs = qs.filter(is_sold=(is_sold.lower() in ('true', '1')))
            else:
                qs = qs.filter(is_approved=True)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        Product.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """Get the authenticated user's listed products."""
        products = Product.objects.filter(seller=request.user).order_by('-created_at')
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_sold(self, request, pk=None):
        """Mark a product as sold."""
        product = self.get_object()
        if product.seller != request.user and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        product.is_sold = True
        product.is_available = False
        product.save()
        return Response({'message': 'Product marked as sold.', 'is_sold': True})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def toggle_availability(self, request, pk=None):
        """Toggle product availability."""
        product = self.get_object()
        if product.seller != request.user and not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        product.is_available = not product.is_available
        product.save()
        return Response({
            'message': 'Availability updated.',
            'is_available': product.is_available,
        })
