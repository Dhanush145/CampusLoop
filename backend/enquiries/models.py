"""
Enquiry models for CampusLoop.
"""

from django.db import models


class Enquiry(models.Model):
    """Buyer's enquiry about a product."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='enquiries',
    )
    buyer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='sent_enquiries',
    )
    seller = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='received_enquiries',
    )
    message = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'enquiries'
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"Enquiry by {self.buyer.full_name} "
            f"for {self.product.title} [{self.status}]"
        )
