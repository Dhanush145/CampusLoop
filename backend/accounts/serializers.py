"""
Serializers for accounts app.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, StudentProfile, EmailVerification
from colleges.models import College


class RegisterSerializer(serializers.Serializer):
    """Handles user registration with college domain validation."""

    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    college_id = serializers.IntegerField(required=False, allow_null=True)
    department = serializers.CharField(max_length=200, required=False, default='')
    year_of_study = serializers.IntegerField(required=False, default=1)
    phone = serializers.CharField(max_length=15, required=False, default='')

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'Passwords do not match.'}
            )
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        college_id = validated_data.pop('college_id', None)
        department = validated_data.pop('department', '')
        year_of_study = validated_data.pop('year_of_study', 1)
        phone = validated_data.pop('phone', '')

        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            phone=phone,
            is_student=True,
        )

        college = None
        if college_id:
            try:
                college = College.objects.get(id=college_id, is_active=True)
            except College.DoesNotExist:
                pass

        StudentProfile.objects.create(
            user=user,
            college=college,
            department=department,
            year_of_study=year_of_study,
        )

        return user


class LoginSerializer(serializers.Serializer):
    """Handles user login and returns JWT tokens."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {'email': 'No account found with this email.'}
            )

        user = authenticate(username=email, password=password)
        if not user:
            if user_obj.check_password(password):
                user = user_obj
            else:
                raise serializers.ValidationError(
                    {'password': 'Invalid password.'}
                )

        if not user.is_active:
            raise serializers.ValidationError(
                {'email': 'This account has been deactivated.'}
            )

        # Check if student is suspended
        profile = getattr(user, 'student_profile', None)
        if profile and profile.is_suspended:
            raise serializers.ValidationError(
                {'email': 'Your account has been suspended. Contact support.'}
            )

        attrs['user'] = user
        return attrs

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for student profiles."""

    college_name = serializers.CharField(source='college.name', read_only=True)
    college_short_name = serializers.CharField(
        source='college.short_name', read_only=True
    )
    year_display = serializers.CharField(
        source='get_year_of_study_display', read_only=True
    )

    class Meta:
        model = StudentProfile
        fields = [
            'college', 'college_name', 'college_short_name',
            'department', 'year_of_study', 'year_display',
            'roll_number', 'bio', 'is_suspended',
        ]
        read_only_fields = ['is_suspended']


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer with profile."""

    student_profile = StudentProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name', 'phone',
            'is_verified', 'is_student', 'is_staff', 'avatar',
            'date_joined', 'student_profile',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'is_staff', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile information."""

    department = serializers.CharField(required=False, allow_blank=True)
    year_of_study = serializers.IntegerField(required=False)
    roll_number = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    college_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'phone', 'avatar',
            'department', 'year_of_study', 'roll_number', 'bio', 'college_id',
        ]

    def update(self, instance, validated_data):
        # Extract profile fields
        profile_fields = {}
        for field in ['department', 'year_of_study', 'roll_number', 'bio', 'college_id']:
            if field in validated_data:
                profile_fields[field] = validated_data.pop(field)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update profile if profile fields present
        if profile_fields:
            profile, _ = StudentProfile.objects.get_or_create(user=instance)
            college_id = profile_fields.pop('college_id', None)
            if college_id is not None:
                try:
                    profile.college = College.objects.get(id=college_id, is_active=True)
                except College.DoesNotExist:
                    pass
            for attr, value in profile_fields.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """Handles password change."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': 'New passwords do not match.'}
            )
        validate_password(attrs['new_password'])
        return attrs

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user serializer for embedding in other serializers."""

    college_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'avatar', 'college_name']

    def get_college_name(self, obj):
        profile = getattr(obj, 'student_profile', None)
        if profile and profile.college:
            return profile.college.short_name
        return None
