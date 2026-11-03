"""
Notification models for CampusLoop.
"""

from django.db import models


class Notification(models.Model):
    """User notification."""

    TYPE_CHOICES = [
        ('enquiry', 'Enquiry'),
        ('message', 'Message'),
        ('transaction', 'Transaction'),
        ('system', 'System'),
    ]

    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default='system'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    related_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='triggered_notifications',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        read_status = '✓' if self.is_read else '✗'
        return f"[{read_status}] {self.title} → {self.user.full_name}"
