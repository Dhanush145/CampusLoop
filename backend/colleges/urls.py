"""
URLs for colleges app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeViewSet

router = DefaultRouter()
router.register(r'', CollegeViewSet, basename='colleges')

urlpatterns = [
    path('', include(router.urls)),
]

