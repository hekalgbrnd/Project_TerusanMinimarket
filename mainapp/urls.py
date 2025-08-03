from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from . import views
from .api_view import ProductViewSet, CategoryViewSet, OrderViewSet, UserViewSet

router = DefaultRouter()
router.register(r'drf/products', ProductViewSet)
router.register(r'drf/categories', CategoryViewSet)
router.register(r'drf/orders', OrderViewSet)
router.register(r'drf/users', UserViewSet)

urlpatterns = [
    # Page Views
    path('', views.dashboard, name='home'),
    path('checkout/', views.checkout, name='checkout'),
    path('order_success/', views.order, name='order'),
    path('cart/', views.cart, name='cart'),
    path('profile/', views.profile, name='profile'),
    path('order_history/', views.order_history, name='history'),
    path('privacy_policy/', views.privacy_policy, name='privacy'),
    path('help_faq/', views.help_faq, name='help'),
    path('tutorial/', views.tutorial, name='tutorial'),
    path('return_req/', views.return_req, name='return'),
    path('admin_dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    path('admin_login/', views.admin_login_view, name='admin_login'),
    path('payment_accounts/', views.payment_accounts_view, name='payment'),
    path('confirmation_payment/', views.confirmation_payment_view, name='confirmation_payment'),

    # Auth
    path('api/get_current_user/', views.get_current_user, name='get_current_user'),
    path('api/register/', views.register_user, name='register'),
    path('api/login/', views.login_user, name='login'),
    path('api/send_otp/', views.send_otp, name='send_otp'),
    path('api/verify_otp/', views.verify_otp, name='verify_otp'),
    path('api/logout/', views.user_logout, name='logout'),

    # Cart
    path('api/cart/add/', views.add_to_cart, name='add_to_cart'),
    path("api/cart/", views.get_cart_items, name="cart-view"),
    path("api/cart/update/", views.update_cart_item, name="update-cart"),
    path("api/cart/remove/", views.remove_cart_item, name="remove-cart-item"),
    path("api/cart/clear/", views.clear_cart, name="clear-cart"),
    # path("api/cart/update/", views.update_cart_item, name="update-cart-item"),
    # path('api/cart/', views.get_cart_items, name='get_cart'),
    # path('api/cart/remove/<int:product_id>/', views.remove_cart_item, name='remove_cart_item'),    

    # Orders
    path('api/create-transaction/', views.create_transaction, name='create_transaction'),
    path('api/save-order/', views.save_order, name='save_order'),
    path('api/order-details/', views.order_details_api, name='order_details_api'),
    path('api/midtrans-callback/', views.midtrans_callback, name='midtrans_callback'),
    path('api/create-cod-transaction/', views.create_cod_transaction, name='create_cod_transaction'),

    # Dashboard & Analytics
    # path('api/dashboard/', views.get_dashboard_data, name='get_dashboard_data'),
    path('api/dashboard-summary/', views.dashboard_summary, name='dashboard_summary'),
    # path('api/analytics/sales/', sales_analytics, name='sales_analytics'),

    path('api/products/add/', views.add_product, name='add_product'),
    path('api/products/', views.get_product_list, name='get_product_list'),
    path('api/products/<int:product_id>/', views.get_product_detail, name='get_product_detail'),
    path('api/products/<int:pk>/edit/', views.update_product, name='update_product'),
    path('api/products/<int:pk>/delete/', views.delete_product, name='delete_product'),

    path('api/categories/add/', views.add_category, name='add_category'),
    path('api/categories/', views.get_category_list, name='get_category_list'),
    path('api/categories/<int:category_id>/', views.get_category_detail, name='get_category_detail'),
    path('api/categories/<int:category_id>/edit/', views.update_category, name='update_category'),
    path('api/categories/<int:category_id>/delete/', views.delete_category, name='delete_category'),
    path('api/orders/', views.get_order_list, name='get_order_list'),

    path('api/users/', views.get_user_list, name='get_user_list'),
    path('api/profile/', views.profile_view, name='api-profile'),
    path('profile/address/', views.profile_address_view, name='profile_address'),
    path('api/addresses/', views.create_address, name='create_address'),       # POST
    path('api/addresses/list/', views.get_addresses, name='get_addresses'),    # GET (list all)
    path('api/addresses/<int:address_id>/', views.address_detail, name='address_detail'),  # GET, PUT, DELETE

    path('api/get_current_user/', views.get_current_user, name='get_current_user'),
    path('api/change-password/', views.change_password, name='change_password'),

    path('api/analytics/weekly-sales/', views.weekly_sales_data, name='weekly-sales-data'),
    path('api/analytics/top-products/', views.top_products_data, name='top-products-data'),

    path('api/order-items/', views.get_user_order_items, name='get_user_order_items'),
    path('api/orders/<int:pk>/', views.order_detail, name='order-detail'),
    path('api/orders/<int:pk>/cancel/', views.cancel_order, name='cancel-order'),
    path('api/users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('api/orders/', views.get_user_orders, name='get_user_orders'),
    path('api/settings/', views.store_settings_view, name='store-settings'),

    path('api/analytics/export-excel/', views.export_sales_report_excel, name='export-sales-excel'),
    path('api/store/shipping-cost/', views.get_shipping_cost, name='get-shipping-cost'),


    # DRF ViewSets
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
