# products/admin.py

from django.contrib import admin
from .models import OTP, Product, Cart, CartItem, Order, OrderItem
from django.contrib import admin
from .models import Profile, Address,  StoreSettings

admin.site.register(Profile)
admin.site.register(Address)
admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(OTP)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(StoreSettings)
