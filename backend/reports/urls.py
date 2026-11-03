"""
URLs for reports app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportCreateView, AdminReportViewSet

router = DefaultRouter()
router.register(r'admin/reports', AdminReportViewSet, basename='admin_reports')

urlpatterns = [
    path('reports/', ReportCreateView.as_view(), name='report_create'),
    path('', include(router.urls)),
]
