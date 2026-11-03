from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from accounts.models import User
from colleges.models import College
from categories.models import Category
from products.models import Product
from enquiries.models import Enquiry
from transactions.models import Transaction


class EnquiryAndTransactionWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.college = College.objects.create(
            name='IIT Bombay',
            short_name='IITB',
            domain='iitb.ac.in',
            city='Mumbai',
            state='Maharashtra'
        )
        self.category = Category.objects.create(
            name='Calculators',
            slug='calculators',
            icon='Calculator',
            display_order=1
        )
        self.seller = User.objects.create_user(
            email='seller_tx@iitb.ac.in',
            username='seller_tx',
            full_name='Seller Aarav',
            password='Password123!'
        )
        self.buyer = User.objects.create_user(
            email='buyer_tx@iitb.ac.in',
            username='buyer_tx',
            full_name='Buyer Bhavya',
            password='Password123!'
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Casio FX-991ES Plus',
            slug='casio-fx-991es',
            description='Calculator for exams',
            price=Decimal('700.00'),
            category=self.category,
            college=self.college,
            condition='good',
            is_available=True
        )

    def test_enquiry_and_transaction_completion_flow(self):
        # 1. Buyer creates enquiry
        self.client.force_authenticate(user=self.buyer)
        res_enq = self.client.post('/api/enquiries/', {
            'product': self.product.id,
            'message': 'Can I buy your Casio calculator?'
        }, format='json')
        self.assertEqual(res_enq.status_code, status.HTTP_201_CREATED)
        enquiry_id = res_enq.data['id']

        # 2. Seller accepts enquiry
        self.client.force_authenticate(user=self.seller)
        res_accept = self.client.post(f'/api/enquiries/{enquiry_id}/accept/')
        self.assertEqual(res_accept.status_code, status.HTTP_200_OK)
        self.assertEqual(res_accept.data['status'], 'accepted')

        # 3. Buyer initiates transaction coordination
        self.client.force_authenticate(user=self.buyer)
        res_tx = self.client.post('/api/transactions/', {
            'product': self.product.id,
            'enquiry': enquiry_id,
            'notes': 'Meeting at library'
        }, format='json')
        self.assertEqual(res_tx.status_code, status.HTTP_201_CREATED)
        tx_id = res_tx.data['id']

        # 4. Seller reserves product
        self.client.force_authenticate(user=self.seller)
        res_res = self.client.post(f'/api/transactions/{tx_id}/update_status/', {'status': 'reserved'}, format='json')
        self.assertEqual(res_res.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertFalse(self.product.is_available)

        # 5. Seller marks completed after offline exchange
        res_comp = self.client.post(f'/api/transactions/{tx_id}/update_status/', {'status': 'completed'}, format='json')
        self.assertEqual(res_comp.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertTrue(self.product.is_sold)
        self.assertFalse(self.product.is_available)
