"""
Views for analytics and admin dashboards.
"""

from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from accounts.models import User, StudentProfile
from products.models import Product
from enquiries.models import Enquiry
from transactions.models import Transaction
from reports.models import ProductReport
from categories.models import Category
from accounts.serializers import UserSerializer
from products.serializers import ProductDetailSerializer, ProductListSerializer
from accounts.permissions import IsAdminUser


class AdminDashboardStatsView(APIView):
    """Aggregate statistics for admin dashboard."""
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        total_students = User.objects.filter(is_student=True).count()
        verified_students = User.objects.filter(is_student=True, is_verified=True).count()
        total_products = Product.objects.count()
        active_products = Product.objects.filter(is_available=True, is_sold=False).count()
        sold_products = Product.objects.filter(is_sold=True).count()
        pending_reports = ProductReport.objects.filter(status='pending').count()
        total_enquiries = Enquiry.objects.count()
        completed_transactions = Transaction.objects.filter(status='completed').count()

        # Category breakdown
        category_breakdown = list(Category.objects.annotate(
            count=Count('products')
        ).values('name', 'count'))

        # Recent activities
        recent_products = ProductListSerializer(
            Product.objects.select_related('seller', 'category', 'college').order_by('-created_at')[:5],
            many=True,
            context={'request': request}
        ).data

        recent_reports = list(ProductReport.objects.filter(status='pending').values(
            'id', 'reason', 'product__title', 'reporter__full_name', 'created_at'
        )[:5])

        return Response({
            'total_students': total_students,
            'verified_students': verified_students,
            'total_products': total_products,
            'active_products': active_products,
            'sold_products': sold_products,
            'pending_reports': pending_reports,
            'total_enquiries': total_enquiries,
            'completed_transactions': completed_transactions,
            'category_breakdown': category_breakdown,
            'recent_products': recent_products,
            'recent_reports': recent_reports,
        })


class AdminUserManagementViewSet(viewsets.ModelViewSet):
    """Manage students, verify them, or suspend accounts."""
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.select_related('student_profile').all().order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def toggle_suspend(self, request, pk=None):
        user = self.get_object()
        profile, _ = StudentProfile.objects.get_or_create(user=user)
        profile.is_suspended = not profile.is_suspended
        profile.save()
        return Response({
            'message': f"Student account {'suspended' if profile.is_suspended else 'activated'}.",
            'is_suspended': profile.is_suspended
        })

    @action(detail=True, methods=['post'])
    def verify_student(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.save()
        return Response({'message': 'Student verified successfully.', 'is_verified': True})


class AdminProductModerationViewSet(viewsets.ModelViewSet):
    """Admin moderation for products."""
    permission_classes = [IsAdminUser]
    serializer_class = ProductListSerializer
    queryset = Product.objects.select_related('seller', 'category', 'college').all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def toggle_approval(self, request, pk=None):
        product = self.get_object()
        product.is_approved = not product.is_approved
        product.save()
        return Response({
            'message': f"Product {'approved' if product.is_approved else 'unapproved'}.",
            'is_approved': product.is_approved
        })
