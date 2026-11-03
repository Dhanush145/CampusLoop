"""
Views for colleges app.
"""

from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import College
from .serializers import CollegeSerializer, CollegeListSerializer


class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing colleges."""
    queryset = College.objects.filter(is_active=True).order_by('name')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return CollegeListSerializer
        return CollegeSerializer
