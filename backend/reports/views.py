"""
Views for reports app.
"""

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.utils import timezone

from .models import ProductReport
from .serializers import ReportSerializer, ReportCreateSerializer, ReportResolveSerializer
from accounts.permissions import IsAdminUser


class ReportCreateView(APIView):
    """File a report against an inappropriate product listing."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReportCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            report = serializer.save()
            return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminReportViewSet(viewsets.ModelViewSet):
    """Admin-only ViewSet to manage and resolve product reports."""
    permission_classes = [IsAdminUser]
    serializer_class = ReportSerializer
    queryset = ProductReport.objects.select_related('reporter', 'product', 'resolved_by').order_by('-created_at')

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        report = self.get_object()
        serializer = ReportResolveSerializer(data=request.data)
        if serializer.is_valid():
            report.status = serializer.validated_data['status']
            report.admin_notes = serializer.validated_data.get('admin_notes', '')
            report.resolved_by = request.user
            report.resolved_at = timezone.now()

            # If action includes taking down product
            if serializer.validated_data.get('take_down_product'):
                report.product.is_approved = False
                report.product.is_available = False
                report.product.save()

            report.save()
            return Response(ReportSerializer(report).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
