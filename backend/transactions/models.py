"""
Transaction models for CampusLoop.
"""

from django.db import models


class Transaction(models.Model):
    """Tracks a transaction between buyer and seller."""

    STATUS_CHOICES = [
        ('enquiry_sent', 'Enquiry Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('reserved', 'Reserved'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='transactions',
    )
    buyer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='purchases',
    )
    seller = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='sales',
    )
    enquiry = models.ForeignKey(
        'enquiries.Enquiry',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='enquiry_sent'
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"Transaction: {self.product.title} | "
            f"{self.buyer.full_name} → {self.seller.full_name} [{self.status}]"
        )
