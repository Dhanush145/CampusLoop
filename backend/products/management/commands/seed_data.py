"""
Management command to populate CampusLoop with realistic sample data.
Run with: python manage.py seed_data [--clear]
"""

import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from accounts.models import User, StudentProfile, EmailVerification
from colleges.models import College
from categories.models import Category
from products.models import Product, ProductImage
from wishlist.models import Wishlist, WishlistItem
from enquiries.models import Enquiry
from messaging.models import Conversation, Message
from transactions.models import Transaction
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Seeds database with realistic colleges, categories, students, products, and transactions.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before seeding',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Transaction.objects.all().delete()
            Enquiry.objects.all().delete()
            Message.objects.all().delete()
            Conversation.objects.all().delete()
            WishlistItem.objects.all().delete()
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            StudentProfile.objects.all().delete()
            User.objects.exclude(is_superuser=True).delete()
            College.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared.'))

        self.stdout.write('Seeding CampusLoop database...')

        # 1. Colleges
        colleges_data = [
            {'name': 'Indian Institute of Information Technology Dharwad', 'short_name': 'IIIT Dharwad', 'domain': 'iiitdwd.ac.in', 'city': 'Dharwad', 'state': 'Karnataka'},
            {'name': 'Indian Institute of Technology Bombay', 'short_name': 'IIT Bombay', 'domain': 'iitb.ac.in', 'city': 'Mumbai', 'state': 'Maharashtra'},
            {'name': 'BITS Pilani - Pilani Campus', 'short_name': 'BITS Pilani', 'domain': 'pilani.bits-pilani.ac.in', 'city': 'Pilani', 'state': 'Rajasthan'},
            {'name': 'National Institute of Technology Trichy', 'short_name': 'NIT Trichy', 'domain': 'nitt.edu', 'city': 'Tiruchirappalli', 'state': 'Tamil Nadu'},
            {'name': 'Delhi Technological University', 'short_name': 'DTU Delhi', 'domain': 'dtu.ac.in', 'city': 'New Delhi', 'state': 'Delhi'},
        ]
        colleges = {}
        for c in colleges_data:
            col, _ = College.objects.get_or_create(
                short_name=c['short_name'],
                defaults=c
            )
            colleges[c['short_name']] = col
        self.stdout.write(f'Created {len(colleges)} colleges.')

        # 2. Categories
        categories_data = [
            {'name': 'Textbooks', 'slug': 'textbooks', 'description': 'Course textbooks, reference books, and semester notes', 'icon': 'BookOpen', 'display_order': 1},
            {'name': 'Electronics', 'slug': 'electronics', 'description': 'Headphones, chargers, power banks, monitors and cables', 'icon': 'Smartphone', 'display_order': 2},
            {'name': 'Laptops & Accessories', 'slug': 'laptops', 'description': 'Laptops, keyboards, mice, laptop stands and bags', 'icon': 'Laptop', 'display_order': 3},
            {'name': 'Calculators', 'slug': 'calculators', 'description': 'Scientific, graphic, and financial calculators', 'icon': 'Calculator', 'display_order': 4},
            {'name': 'Cycles', 'slug': 'cycles', 'description': 'Geared and single-speed campus bicycles and accessories', 'icon': 'Bike', 'display_order': 5},
            {'name': 'Hostel Essentials', 'slug': 'hostel', 'description': 'Mattresses, kettles, desk lamps, laundry baskets, storage boxes', 'icon': 'Home', 'display_order': 6},
            {'name': 'Stationery', 'slug': 'stationery', 'description': 'Drafting boards, T-squares, art supplies, notebooks, pens', 'icon': 'PenTool', 'display_order': 7},
            {'name': 'Sports Equipment', 'slug': 'sports', 'description': 'Badminton rackets, footballs, cricket gear, gym accessories', 'icon': 'Dumbbell', 'display_order': 8},
            {'name': 'Other', 'slug': 'other', 'description': 'Lab coats, lab kits, music instruments and miscellaneous items', 'icon': 'Package', 'display_order': 9},
        ]
        categories = {}
        for cat in categories_data:
            c, _ = Category.objects.get_or_create(
                slug=cat['slug'],
                defaults=cat
            )
            categories[cat['slug']] = c
        self.stdout.write(f'Created {len(categories)} categories.')

        # 3. Admin & Students
        # Create Admin
        admin_user, created = User.objects.get_or_create(
            email='admin@campusloop.in',
            defaults={
                'username': 'admin',
                'full_name': 'CampusLoop Admin',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'is_student': False,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()

        # Create Students
        students_data = [
            {'username': 'student_a', 'email': 'student_a@iitb.ac.in', 'name': 'Aarav Mehta (Student A)', 'college': 'IIT Bombay', 'dept': 'Computer Science', 'year': 3, 'roll': '22B0901', 'phone': '9876543210'},
            {'username': 'student_b', 'email': 'student_b@bits.ac.in', 'name': 'Bhavya Nair (Student B)', 'college': 'BITS Pilani', 'dept': 'Electrical & Electronics', 'year': 2, 'roll': '2023A3PS042P', 'phone': '9876543211'},
            {'username': 'priya_s', 'email': 'priya.s@iitb.ac.in', 'name': 'Priya Sharma', 'college': 'IIT Bombay', 'dept': 'Mechanical Engineering', 'year': 4, 'roll': '21B0315', 'phone': '9876543212'},
            {'username': 'rohan_v', 'email': 'rohan.v@nitt.edu', 'name': 'Rohan Verma', 'college': 'NIT Trichy', 'dept': 'Civil Engineering', 'year': 2, 'roll': '103123045', 'phone': '9876543213'},
            {'username': 'ananya_i', 'email': 'ananya.i@dtu.ac.in', 'name': 'Ananya Iyer', 'college': 'DTU Delhi', 'dept': 'Information Technology', 'year': 3, 'roll': '2K22/IT/034', 'phone': '9876543214'},
            {'username': 'vikram_s', 'email': 'vikram.s@bits.ac.in', 'name': 'Vikram Singh', 'college': 'BITS Pilani', 'dept': 'Mechanical Engineering', 'year': 3, 'roll': '2022A4PS089P', 'phone': '9876543215'},
            {'username': 'kiran_iiitdwd', 'email': 'kiran@iiitdwd.ac.in', 'name': 'Kiran Rao', 'college': 'IIIT Dharwad', 'dept': 'Data Science & AI', 'year': 3, 'roll': '23BCS045', 'phone': '9876543216'},
        ]

        students = {}
        for s in students_data:
            user, u_created = User.objects.get_or_create(
                email=s['email'],
                defaults={
                    'username': s['username'],
                    'full_name': s['name'],
                    'phone': s['phone'],
                    'is_student': True,
                    'is_verified': True,
                }
            )
            if u_created:
                user.set_password('student123')
                user.save()
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'college': colleges[s['college']],
                    'department': s['dept'],
                    'year_of_study': s['year'],
                    'roll_number': s['roll'],
                    'bio': f"{s['year']}rd year student in {s['dept']} at {s['college']}.",
                }
            )
            students[s['username']] = user
        self.stdout.write(f'Created {len(students)} student accounts.')

        # 4. Realistic Products
        products_catalog = [
            # Textbooks
            {
                'seller': 'student_a', 'category': 'textbooks', 'college': 'IIT Bombay',
                'title': 'Introduction to Algorithms (CLRS) - 4th Edition',
                'price': Decimal('750.00'), 'original_price': Decimal('1600.00'), 'condition': 'like_new',
                'exchange_location': 'Central Library Ground Floor',
                'description': 'Standard algorithms textbook for CS. Excellent condition, no pencil markings or folded pages. Perfect for CS201 / Data Structures course.',
                'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'student_b', 'category': 'textbooks', 'college': 'BITS Pilani',
                'title': 'Operating System Concepts by Silberschatz (10th Ed)',
                'price': Decimal('550.00'), 'original_price': Decimal('1200.00'), 'condition': 'good',
                'exchange_location': 'Student Activity Centre (SAC)',
                'description': 'The classic dinosaur OS book. Covers virtualization, memory management, and file systems. Mildly highlighted in Chapters 3-6.',
                'image': 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'priya_s', 'category': 'textbooks', 'college': 'IIT Bombay',
                'title': 'Higher Engineering Mathematics by B.S. Grewal (44th Ed)',
                'price': Decimal('400.00'), 'original_price': Decimal('950.00'), 'condition': 'good',
                'exchange_location': 'Hostel 12 Gate / Canteen',
                'description': 'Must-have book for 1st & 2nd year calculus and differential equations. Binding intact and clean pages throughout.',
                'image': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'rohan_v', 'category': 'textbooks', 'college': 'NIT Trichy',
                'title': 'Engineering Mechanics by S. Timoshenko & D.H. Young',
                'price': Decimal('320.00'), 'original_price': Decimal('800.00'), 'condition': 'fair',
                'exchange_location': 'Orion Lecture Hall Complex',
                'description': 'Solved problem sets for statics and dynamics. Cover has some corner wear but completely legible inside.',
                'image': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
            },
            # Calculators
            {
                'seller': 'student_a', 'category': 'calculators', 'college': 'IIT Bombay',
                'title': 'Casio FX-991EX ClassWiz Scientific Calculator',
                'price': Decimal('850.00'), 'original_price': Decimal('1695.00'), 'condition': 'like_new',
                'exchange_location': 'Main Academic Building (MAB)',
                'description': 'High-resolution display, 552 functions including matrix, vector, integration and equation solver. Allowed in university examinations.',
                'image': 'https://images.unsplash.com/photo-1611365892117-00ac5ef43759?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'vikram_s', 'category': 'calculators', 'college': 'BITS Pilani',
                'title': 'Casio FX-991ES Plus 2nd Edition Non-Programmable Calculator',
                'price': Decimal('600.00'), 'original_price': Decimal('1295.00'), 'condition': 'good',
                'exchange_location': 'Rotunda / Central Lawn',
                'description': 'Natural textbook display with 417 functions. Slide-on hard case included with brand new battery installed.',
                'image': 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
            },
            # Electronics & Laptops
            {
                'seller': 'student_b', 'category': 'laptops', 'college': 'BITS Pilani',
                'title': 'Logitech MX Master 3S Wireless Ergonomic Mouse',
                'price': Decimal('4500.00'), 'original_price': Decimal('8995.00'), 'condition': 'like_new',
                'exchange_location': 'Krishna Bhawan Common Room',
                'description': 'Quiet clicks, MagSpeed electromagnetic scrolling, works across multiple OS. USB-C cable included.',
                'image': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'student_a', 'category': 'laptops', 'college': 'IIT Bombay',
                'title': 'Keychron K2 V2 Wireless Mechanical Keyboard (Gateron Brown)',
                'price': Decimal('3800.00'), 'original_price': Decimal('7499.00'), 'condition': 'good',
                'exchange_location': 'Gymkhana Grounds / Cafe',
                'description': '75% compact layout, white LED backlight, tactile brown switches. Clean keycaps, includes keycap puller and Mac/Windows keys.',
                'image': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'ananya_i', 'category': 'electronics', 'college': 'DTU Delhi',
                'title': 'Sony WH-CH520 Wireless Bluetooth Headphones (Black)',
                'price': Decimal('2200.00'), 'original_price': Decimal('4490.00'), 'condition': 'like_new',
                'exchange_location': 'Library Lawn / Open Air Theatre (OAT)',
                'description': 'Up to 50-hour battery life with quick charge. DSEE audio enhancement and crystal clear mic for online lectures.',
                'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'rohan_v', 'category': 'electronics', 'college': 'NIT Trichy',
                'title': 'Mi 20000mAh 18W Fast Charging Power Bank 3i',
                'price': Decimal('800.00'), 'original_price': Decimal('1899.00'), 'condition': 'good',
                'exchange_location': 'Opal Mess Entrance',
                'description': 'Triple output ports, dual input (micro-USB and Type-C). Keeps your phone charged through library night-outs.',
                'image': 'https://images.unsplash.com/photo-1609592426861-6831d102a0a2?auto=format&fit=crop&w=800&q=80',
            },
            # Cycles
            {
                'seller': 'student_a', 'category': 'cycles', 'college': 'IIT Bombay',
                'title': 'Hero Sprint Pro 26T 21-Speed Geared Mountain Bike',
                'price': Decimal('3800.00'), 'original_price': Decimal('9500.00'), 'condition': 'good',
                'exchange_location': 'Hostel 14 Cycle Stand',
                'description': 'Perfect for commuting between hostel and academic blocks. Shimano gears, front suspension, comes with chain lock and bell.',
                'image': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'student_b', 'category': 'cycles', 'college': 'BITS Pilani',
                'title': 'Hercules Roadeo Hardliner 26T Single Speed Cycle',
                'price': Decimal('2500.00'), 'original_price': Decimal('6200.00'), 'condition': 'fair',
                'exchange_location': 'Main Campus Security Gate',
                'description': 'Sturdy steel frame, newly serviced brakes and lubricated chain. Campus cycle ready to ride immediately.',
                'image': 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
            },
            # Hostel Essentials
            {
                'seller': 'priya_s', 'category': 'hostel', 'college': 'IIT Bombay',
                'title': 'Prestige 1.5L Stainless Steel Electric Kettle',
                'price': Decimal('450.00'), 'original_price': Decimal('1150.00'), 'condition': 'good',
                'exchange_location': 'Hostel 15 Dining Hall',
                'description': 'Life-saver for late night Maggi, tea, and warm water during exams. Automatic cut-off feature works perfectly.',
                'image': 'https://images.unsplash.com/photo-1594213114663-ddfe1e1491cf?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'ananya_i', 'category': 'hostel', 'college': 'DTU Delhi',
                'title': 'Foldable Ergonomic Study Table with Cup Holder',
                'price': Decimal('350.00'), 'original_price': Decimal('899.00'), 'condition': 'like_new',
                'exchange_location': 'Mechanical Block Courtyard',
                'description': 'Bed study table with tablet/mobile slot and non-slip legs. Compact and easy to fold away under hostel bed.',
                'image': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'rohan_v', 'category': 'hostel', 'college': 'NIT Trichy',
                'title': 'Wipro 10W LED Desk Lamp with 3 Dimming Modes & Pen Stand',
                'price': Decimal('400.00'), 'original_price': Decimal('999.00'), 'condition': 'like_new',
                'exchange_location': 'Central Library 1st Floor',
                'description': 'Eye-care warm & cool light, flexible gooseneck, USB rechargeable battery built-in. Won’t disturb your roommate.',
                'image': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'vikram_s', 'category': 'hostel', 'college': 'BITS Pilani',
                'title': 'Single Bed Foam Mattress (6x3 ft) with Washable Cotton Cover',
                'price': Decimal('900.00'), 'original_price': Decimal('2800.00'), 'condition': 'good',
                'exchange_location': 'Hostel Block A Lobby',
                'description': 'High-density foam mattress used for one year. Clean, dry, and sanitized with fresh zipper cover.',
                'image': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
            },
            # Stationery
            {
                'seller': 'priya_s', 'category': 'stationery', 'college': 'IIT Bombay',
                'title': 'Omega Imperial Engineering Mini Drafter with Carry Bag',
                'price': Decimal('350.00'), 'original_price': Decimal('850.00'), 'condition': 'like_new',
                'exchange_location': 'Drawing Hall Complex',
                'description': 'Essential for 1st-year Engineering Graphics (ED) drawing lab. Clamps firmly, scale zero-play, smooth movement.',
                'image': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'rohan_v', 'category': 'stationery', 'college': 'NIT Trichy',
                'title': 'A2 Wooden Drawing Board with Steel Edge & T-Square',
                'price': Decimal('300.00'), 'original_price': Decimal('750.00'), 'condition': 'good',
                'exchange_location': 'Architecture Department Portico',
                'description': 'Sturdy pine wood drafting board for architectural and engineering drawing sheets. Flat and smooth surface.',
                'image': 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
            },
            # Sports
            {
                'seller': 'student_b', 'category': 'sports', 'college': 'BITS Pilani',
                'title': 'Yonex Astrox 77 Badminton Racket (Strung at 24 lbs)',
                'price': Decimal('1600.00'), 'original_price': Decimal('3800.00'), 'condition': 'good',
                'exchange_location': 'Indoor Badminton Courts (SAC)',
                'description': 'Graphite shaft, rotational generator system for steep smashes. Has fresh Yonex grip and full thermal cover.',
                'image': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'vikram_s', 'category': 'sports', 'college': 'BITS Pilani',
                'title': 'Nivia Storm Football (Size 5) with Hand Pump',
                'price': Decimal('400.00'), 'original_price': Decimal('990.00'), 'condition': 'like_new',
                'exchange_location': 'Sports Complex Pavilion',
                'description': 'Rubber molded tournament football. Air retention is perfect, used only 3 times on grass pitch.',
                'image': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
            },
            # Other
            {
                'seller': 'ananya_i', 'category': 'other', 'college': 'DTU Delhi',
                'title': 'White Unisex Lab Coat (Size 38 / M) - 100% Cotton',
                'price': Decimal('200.00'), 'original_price': Decimal('550.00'), 'condition': 'like_new',
                'exchange_location': 'Science Block Reception',
                'description': 'Mandatory for Chemistry and Biology labs. Freshly washed, ironed, with two deep pockets.',
                'image': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'student_a', 'category': 'other', 'college': 'IIT Bombay',
                'title': 'Yamaha F310 Acoustic Guitar with Padded Bag & Capo',
                'price': Decimal('4800.00'), 'original_price': Decimal('9490.00'), 'condition': 'good',
                'exchange_location': 'SAC Music Room / Cafe',
                'description': 'Warm tone, low action, easy to play chords. Perfect for hostel jam sessions. Strung with D’Addario strings.',
                'image': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'kiran_iiitdwd', 'category': 'electronics', 'college': 'IIIT Dharwad',
                'title': 'Raspberry Pi 4 Model B (4GB) + Starter Sensor Kit',
                'price': Decimal('3800.00'), 'original_price': Decimal('6500.00'), 'condition': 'like_new',
                'exchange_location': 'Main Academic Block (IIIT Campus)',
                'description': 'Original Raspberry Pi 4 (4GB RAM) with official power adapter, 32GB SanDisk Class 10 MicroSD card, acrylic case with cooling fan, and sensor kit for IoT projects.',
                'image': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            },
            {
                'seller': 'kiran_iiitdwd', 'category': 'textbooks', 'college': 'IIIT Dharwad',
                'title': 'Pattern Recognition and Machine Learning (Christopher Bishop)',
                'price': Decimal('550.00'), 'original_price': Decimal('1200.00'), 'condition': 'good',
                'exchange_location': 'Central Library Reading Hall',
                'description': 'The definitive textbook for Machine Learning and Deep Learning coursework. Binding intact, clean pages with minor pencil annotations.',
                'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
            },
        ]

        created_products = []
        for p in products_catalog:
            seller_user = students[p['seller']]
            college_obj = colleges[p['college']]
            cat_obj = categories[p['category']]

            prod = Product.objects.create(
                seller=seller_user,
                title=p['title'],
                slug=slugify(p['title']) + f"-{random.randint(100, 999)}",
                description=p['description'],
                price=p['price'],
                original_price=p['original_price'],
                category=cat_obj,
                condition=p['condition'],
                college=college_obj,
                exchange_location=p.get('exchange_location', 'Campus Central Library'),
                is_available=True,
                is_sold=False,
                is_approved=True,
                view_count=random.randint(12, 140),
            )
            # Add Primary Image
            ProductImage.objects.create(
                product=prod,
                image_url=p['image'],
                is_primary=True,
                display_order=0,
            )
            created_products.append(prod)

        self.stdout.write(f'Created {len(created_products)} realistic products with images.')

        # 5. Create Sample Wishlist Items
        # Student B wishlists Student A's CLRS textbook
        clrs_prod = next(p for p in created_products if 'CLRS' in p.title)
        wishlist_b, _ = Wishlist.objects.get_or_create(user=students['student_b'])
        WishlistItem.objects.get_or_create(wishlist=wishlist_b, product=clrs_prod)

        # 6. Sample Enquiry & Transaction (For Demonstration)
        # Student B inquires about Student A's Casio Calculator
        casio_prod = next(p for p in created_products if 'Casio FX-991EX' in p.title)
        enquiry = Enquiry.objects.create(
            product=casio_prod,
            buyer=students['student_b'],
            seller=students['student_a'],
            message='Hi Aarav! Is this scientific calculator still available? Can we meet near Hostel 12 canteen tomorrow?',
            status='accepted'
        )

        conv = Conversation.objects.create(product=casio_prod)
        conv.participants.add(students['student_b'], students['student_a'])
        Message.objects.create(
            conversation=conv,
            sender=students['student_b'],
            content='Hi Aarav! Is this scientific calculator still available? Can we meet near Hostel 12 canteen tomorrow?'
        )
        Message.objects.create(
            conversation=conv,
            sender=students['student_a'],
            content='Yes Bhavya, still available! 5 PM near Hostel 12 works for me. Bring exact cash or UPI.'
        )

        # Sample Completed Transaction
        completed_tx = Transaction.objects.create(
            product=casio_prod,
            buyer=students['student_b'],
            seller=students['student_a'],
            enquiry=enquiry,
            status='completed',
            price=casio_prod.price,
            notes='Exchanged in person near Hostel 12 canteen. Verified calculator functions.'
        )

        # Notifications
        Notification.objects.create(
            user=students['student_a'],
            notification_type='transaction',
            title='Transaction Completed',
            message=f"Your listing '{casio_prod.title}' was marked as completed with {students['student_b'].full_name}.",
            related_product=casio_prod,
            related_user=students['student_b']
        )

        self.stdout.write(self.style.SUCCESS(
            '\n=======================================================\n'
            'CAMPUSLOOP DATABASE SEEDED SUCCESSFULLY!\n'
            '=======================================================\n'
            'Sample Accounts Ready for Demonstration:\n'
            '1. Student A:    student_a@iitb.ac.in   | password: student123 (IIT Bombay)\n'
            '2. Student B:    student_b@bits.ac.in   | password: student123 (BITS Pilani)\n'
            '3. Student C:    kiran@iiitdwd.ac.in    | password: student123 (IIIT Dharwad)\n'
            '4. Admin:        admin@campusloop.in    | password: admin123\n'
            '=======================================================\n'
        ))
