"""
URLs for wishlist app.
"""

from django.urls import path
from .views import WishlistView, WishlistToggleView, WishlistRemoveItemView

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist_list'),
    path('toggle/', WishlistToggleView.as_view(), name='wishlist_toggle'),
    path('<int:pk>/', WishlistRemoveItemView.as_view(), name='wishlist_remove'),
]

