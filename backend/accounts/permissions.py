"""
Custom permissions for CampusLoop.
"""

from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """Allows access only to student users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_student
        )


class IsVerifiedStudent(permissions.BasePermission):
    """Allows access only to email-verified student users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_student and
            request.user.is_verified
        )


class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser or request.user.is_admin)
        )


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission to allow only owners of an object to edit it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, 'seller', getattr(obj, 'user', getattr(obj, 'buyer', None)))
        return owner == request.user or request.user.is_admin or request.user.is_staff

