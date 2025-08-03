# products/models.py

import random
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from django.db import models
import uuid

class StoreSettings(models.Model):
    store_name = models.CharField(max_length=100)
    store_email = models.EmailField()
    store_phone = models.CharField(max_length=20)

    shipping_cost = models.PositiveIntegerField(default=0)
    free_shipping_min = models.PositiveIntegerField(default=0)

    enable_bank_transfer = models.BooleanField(default=True)
    enable_cod = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Pengaturan Toko"


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
# Model Produk
class Product(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True)

    def __str__(self):
        return self.name

# Keranjang pengguna (1 user = 1 cart)
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"

    def get_total_items(self):
        return sum(item.quantity for item in self.items.all())

    def get_total_price(self):
        return sum(item.get_total_price() for item in self.items.all())


# Item dalam keranjang (setiap baris adalah 1 jenis produk)
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    def get_total_price(self):
        return self.product.price * self.quantity



# OTP 

class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        self.expires_at = datetime.now() + timedelta(minutes=5) # OTP expires in 5 minutes
        super().save(*args, **kwargs)

    def generate_otp(self):
        return str(random.randint(100000, 999999))

    def __str__(self):
        return f"OTP for {self.user.username}"
    


from django.utils import timezone

# Order
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('settlement', 'Settlement'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('expire', 'Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order_id = models.CharField(max_length=50, unique=True)  # dari Midtrans
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.TextField()
    delivery_estimate = models.CharField(max_length=100, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Order {self.order_id} by {self.user.username if self.user else 'Guest'}"


# Item per Order
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Harga saat transaksi

    def __str__(self):
        return f"{self.quantity}x {self.product.name} - Order {self.order.order_id}"

    def get_total_price(self):
        return self.price * self.quantity
    
    
class Profile(models.Model):
    GENDER_CHOICES = [
        ('Laki-laki', 'Laki-laki'),
        ('Perempuan', 'Perempuan'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    def __str__(self):
        return self.user.username


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    nama_alamat = models.CharField(max_length=100)
    receiver_name = models.CharField(max_length=100)
    receiver_phone = models.CharField(max_length=20)
    full_address = models.TextField()
    rt_rw = models.CharField(max_length=20, blank=True)
    province = models.CharField(max_length=100)
    kabupaten = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    location_details = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.nama_alamat} - {self.user.username}"
