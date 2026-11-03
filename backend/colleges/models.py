"""
College models for CampusLoop.
"""

from django.db import models


class College(models.Model):
    """Represents a registered college/university."""

    name = models.CharField(max_length=300)
    short_name = models.CharField(max_length=50)
    domain = models.CharField(
        max_length=100,
        unique=True,
        help_text='Email domain, e.g. "college.edu"',
    )
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    logo_url = models.URLField(max_length=500, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.short_name} - {self.city}"
