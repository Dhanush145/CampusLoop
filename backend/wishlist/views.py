"""
Views for wishlist app.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Wishlist, WishlistItem
from .serializers import WishlistItemSerializer, WishlistToggleSerializer
from products.models import Product


class WishlistView(APIView):
    """Retrieve all items in the user's wishlist."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        items = wishlist.items.select_related('product', 'product__seller', 'product__category', 'product__college').order_by('-added_at')
        serializer = WishlistItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)


class WishlistToggleView(APIView):
    """Add or remove an item from the user's wishlist."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WishlistToggleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        product_id = serializer.validated_data['product_id']
        product = get_object_or_404(Product, id=product_id)
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

        existing = WishlistItem.objects.filter(wishlist=wishlist, product=product).first()
        if existing:
            existing.delete()
            return Response({'status': 'removed', 'message': 'Product removed from wishlist.', 'is_wishlisted': False})
        else:
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            return Response({'status': 'added', 'message': 'Product added to wishlist.', 'is_wishlisted': True})


class WishlistRemoveItemView(APIView):
    """Remove a product from wishlist by product id or item id."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        WishlistItem.objects.filter(
            Q(wishlist=wishlist) & (Q(id=pk) | Q(product_id=pk))
        ).delete()
        return Response({'message': 'Removed from wishlist.'}, status=status.HTTP_200_OK)
