"""
URLs for analytics and admin management.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminDashboardStatsView,
    AdminUserManagementViewSet,
    AdminProductModerationViewSet,
)

router = DefaultRouter()
router.register(r'users', AdminUserManagementViewSet, basename='admin_users')
router.register(r'products', AdminProductModerationViewSet, basename='admin_products')

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('', include(router.urls)),
]
