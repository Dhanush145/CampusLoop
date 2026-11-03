"""
Report models for CampusLoop.
"""

from django.db import models


class ProductReport(models.Model):
    """Report filed against a product."""

    REASON_CHOICES = [
        ('inappropriate', 'Inappropriate Content'),
        ('spam', 'Spam'),
        ('scam', 'Scam / Fraud'),
        ('duplicate', 'Duplicate Listing'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    reporter = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='filed_reports',
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='reports',
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reports',
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"Report on '{self.product.title}' by "
            f"{self.reporter.full_name} [{self.status}]"
        )
