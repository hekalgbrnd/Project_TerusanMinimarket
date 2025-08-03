from rest_framework import viewsets
from .models import Product, Category, Order
from django.contrib.auth.models import User
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer, UserSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# Optional analytics endpoint
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def sales_analytics(request):
    return Response({"message": "Analytics coming soon"})
