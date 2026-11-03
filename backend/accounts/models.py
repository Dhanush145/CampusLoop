"""
Custom User model and related models for CampusLoop.
"""

import random
import string
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom user model for CampusLoop."""

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15, blank=True, default='')
    is_verified = models.BooleanField(default=False)
    is_student = models.BooleanField(default=True)
    avatar = models.URLField(max_length=500, blank=True, default='')
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']

    @property
    def is_admin(self):
        return self.is_staff or self.is_superuser

    class Meta:
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class StudentProfile(models.Model):
    """Extended profile for student users."""

    YEAR_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
        (5, '5th Year'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='student_profile'
    )
    college = models.ForeignKey(
        'colleges.College',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
    )
    department = models.CharField(max_length=200, blank=True, default='')
    year_of_study = models.IntegerField(choices=YEAR_CHOICES, default=1)
    roll_number = models.CharField(max_length=50, blank=True, default='')
    bio = models.TextField(max_length=500, blank=True, default='')
    is_suspended = models.BooleanField(default=False)

    class Meta:
        ordering = ['user__full_name']

    def __str__(self):
        college_name = self.college.short_name if self.college else 'No College'
        return f"{self.user.full_name} - {college_name}"


class EmailVerification(models.Model):
    """OTP-based email verification."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='email_verifications'
    )
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"OTP for {self.user.email} - {'Used' if self.is_used else 'Active'}"

    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = ''.join(random.choices(string.digits, k=6))
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    @classmethod
    def create_for_user(cls, user):
        otp = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timezone.timedelta(minutes=15)
        return cls.objects.create(user=user, otp=otp, expires_at=expires_at)

    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired
