from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from accounts.models import User
from colleges.models import College
from categories.models import Category
from products.models import Product, ProductImage
from wishlist.models import Wishlist, WishlistItem


class ProductsAndMarketplaceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.college = College.objects.create(
            name='BITS Pilani',
            short_name='BITS',
            domain='bits-pilani.ac.in',
            city='Pilani',
            state='Rajasthan'
        )
        self.category = Category.objects.create(
            name='Textbooks',
            slug='textbooks',
            description='Course books',
            icon='BookOpen',
            display_order=1
        )
        self.seller = User.objects.create_user(
            email='seller@bits-pilani.ac.in',
            username='seller',
            full_name='Seller Student',
            password='Password123!'
        )
        self.buyer = User.objects.create_user(
            email='buyer@bits-pilani.ac.in',
            username='buyer',
            full_name='Buyer Student',
            password='Password123!'
        )

    def test_product_creation(self):
        self.client.force_authenticate(user=self.seller)
        payload = {
            'title': 'Thomas Calculus 14th Edition',
            'description': 'Clean condition calculus textbook',
            'price': '500.00',
            'original_price': '1200.00',
            'category': self.category.id,
            'condition': 'like_new',
            'college': self.college.id,
            'images': [{'image_url': 'https://example.com/book.jpg', 'is_primary': True}]
        }
        response = self.client.post('/api/products/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(Product.objects.first().seller, self.seller)

    def test_product_search_and_filter(self):
        Product.objects.create(
            seller=self.seller,
            title='Casio FX-991EX Scientific Calculator',
            slug='casio-fx-991ex',
            description='Allowed in exams',
            price=Decimal('800.00'),
            category=self.category,
            college=self.college,
            condition='good',
            is_available=True,
            is_approved=True
        )
        # Search by keyword
        res = self.client.get('/api/products/?search=Casio')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)

        # Filter by price range
        res_price = self.client.get('/api/products/?min_price=1000')
        self.assertEqual(res_price.data['count'], 0)

    def test_wishlist_operations(self):
        prod = Product.objects.create(
            seller=self.seller,
            title='Hero Sprint Cycle',
            slug='hero-sprint-cycle',
            description='Geared bicycle',
            price=Decimal('3500.00'),
            category=self.category,
            college=self.college,
            condition='good'
        )
        self.client.force_authenticate(user=self.buyer)

        # Toggle add
        res_add = self.client.post('/api/wishlist/toggle/', {'product_id': prod.id}, format='json')
        self.assertEqual(res_add.status_code, status.HTTP_200_OK)
        self.assertEqual(res_add.data['status'], 'added')

        # Verify wishlist list
        res_list = self.client.get('/api/wishlist/')
        self.assertEqual(len(res_list.data), 1)

        # Toggle remove
        res_rem = self.client.post('/api/wishlist/toggle/', {'product_id': prod.id}, format='json')
        self.assertEqual(res_rem.data['status'], 'removed')
