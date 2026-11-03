from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, StudentProfile, EmailVerification
from colleges.models import College


class AccountsAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.college = College.objects.create(
            name='IIT Bombay',
            short_name='IITB',
            domain='iitb.ac.in',
            city='Mumbai',
            state='Maharashtra'
        )

    def test_student_registration(self):
        url = reverse('register')
        data = {
            'email': 'rahul@iitb.ac.in',
            'username': 'rahul_iitb',
            'full_name': 'Rahul Verma',
            'password': 'Password123!',
            'password_confirm': 'Password123!',
            'college_id': self.college.id,
            'department': 'Mechanical',
            'year_of_study': 2,
            'phone': '9988776655',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertTrue(User.objects.filter(email='rahul@iitb.ac.in').exists())

    def test_student_login_and_jwt(self):
        user = User.objects.create_user(
            email='test@iitb.ac.in',
            username='testuser',
            full_name='Test Student',
            password='Password123!'
        )
        url = reverse('login')
        response = self.client.post(url, {'email': 'test@iitb.ac.in', 'password': 'Password123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_otp_email_verification(self):
        user = User.objects.create_user(
            email='verify@iitb.ac.in',
            username='verifyuser',
            full_name='Verify Student',
            password='Password123!'
        )
        self.client.force_authenticate(user=user)
        # Send OTP
        res_otp = self.client.post(reverse('send_otp'))
        self.assertEqual(res_otp.status_code, status.HTTP_200_OK)
        otp = res_otp.data['otp']

        # Verify
        res_verify = self.client.post(reverse('verify_email'), {'otp': otp}, format='json')
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_verified)
