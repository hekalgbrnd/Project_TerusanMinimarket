document.addEventListener('DOMContentLoaded', () => {
    //window.updateAuthUI();

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    const orderNumberElem = document.getElementById('orderNumber');
    const paymentMethodElem = document.getElementById('paymentMethod');
    const shippingAddressElem = document.getElementById('shippingAddress');
    const deliveryEstimateElem = document.getElementById('deliveryEstimate');
    const finalTotalPriceElem = document.getElementById('finalTotalPrice');

    if (orderId) {
        fetch(`/api/order-details/?order_id=${orderId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Gagal memuat data pesanan:', data.error);
                    return;
                }

                if (orderNumberElem) orderNumberElem.textContent = `#${data.order_id}`;
                if (paymentMethodElem) paymentMethodElem.textContent = data.payment_method;
                if (shippingAddressElem) shippingAddressElem.textContent = data.shipping_address;
                if (deliveryEstimateElem) deliveryEstimateElem.textContent = data.delivery_estimate;
                if (finalTotalPriceElem) {
                    finalTotalPriceElem.textContent = `Rp ${parseFloat(data.total_price).toLocaleString('id-ID')}`;
                }

                const currentUser = window.loadUserFromLocalStorage();
                if (currentUser) {
                    const cartKey = `cart_${currentUser.username}`;
                    localStorage.removeItem(cartKey);
                    localStorage.removeItem('lastOrderTotal');
                    console.log('Keranjang pengguna telah dikosongkan setelah pembayaran berhasil.');
                }
            })
            .catch(error => {
                console.error('Terjadi kesalahan saat mengambil detail order:', error);
            });
    }

    // Event listener UI dasar
    document.getElementById('btnLogin')?.addEventListener('click', window.showLoginModal);
    document.getElementById('btnRegister')?.addEventListener('click', window.showRegisterModal);

    const accountMenu = document.getElementById('accountMenu');
    const accountDropdown = document.getElementById('accountDropdown');
    if (accountMenu && accountDropdown) {
        accountMenu.addEventListener('click', function (e) {
            accountDropdown.style.display = accountDropdown.style.display === 'block' ? 'none' : 'block';
            e.stopPropagation();
        });
        document.addEventListener('click', function (e) {
            if (!accountMenu.contains(e.target) && accountDropdown.style.display === 'block') {
                accountDropdown.style.display = 'none';
            }
        });
    }

    document.getElementById('logoutBtn')?.addEventListener('click', window.logout);

    document.getElementById('closeAuthModal')?.addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'none';
    });

    document.getElementById('showRegister')?.addEventListener('click', () => window.showForm('register'));
    document.getElementById('showLoginFromRegister')?.addEventListener('click', () => window.showForm('login'));
    document.getElementById('showForgotPassword')?.addEventListener('click', () => window.showForm('forgot'));
    document.getElementById('showLoginFromForgot')?.addEventListener('click', () => window.showForm('login'));

    document.getElementById('btnLoginSubmit')?.addEventListener('click', window.login);
    document.getElementById('btnRegisterSubmit')?.addEventListener('click', window.register);
    document.getElementById('btnResetPassword')?.addEventListener('click', window.resetPassword);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                window.location.href = `/?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
});
