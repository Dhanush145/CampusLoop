"""
Wishlist models for CampusLoop.
"""

from django.db import models


class Wishlist(models.Model):
    """User's wishlist container."""

    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='wishlist',
    )

    class Meta:
        ordering = ['user__full_name']

    def __str__(self):
        return f"Wishlist of {self.user.full_name}"

    @property
    def item_count(self):
        return self.items.count()


class WishlistItem(models.Model):
    """Individual item in a wishlist."""

    wishlist = models.ForeignKey(
        Wishlist, on_delete=models.CASCADE, related_name='items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='wishlisted_by',
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.wishlist.user.full_name} → {self.product.title}"
