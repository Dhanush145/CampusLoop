"""
Serializers for colleges app.
"""

from rest_framework import serializers
from .models import College


class CollegeSerializer(serializers.ModelSerializer):
    """Full college serializer."""

    student_count = serializers.SerializerMethodField()

    class Meta:
        model = College
        fields = [
            'id', 'name', 'short_name', 'domain', 'city',
            'state', 'logo_url', 'is_active', 'student_count', 'created_at',
        ]

    def get_student_count(self, obj):
        return obj.students.count()


class CollegeListSerializer(serializers.ModelSerializer):
    """Minimal college serializer for dropdowns."""

    class Meta:
        model = College
        fields = ['id', 'name', 'short_name', 'city', 'state']
