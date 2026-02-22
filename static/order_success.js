async function loadOrderDetails(orderId, retry = 0) {
    try {
        const response = await fetch(`/api/order-details/?order_id=${orderId}`);
        const data = await response.json();

        if (!response.ok || data.error) {
            if (retry < 3) {
                console.log("Retrying...", retry + 1);
                setTimeout(() => loadOrderDetails(orderId, retry + 1), 500);
                return;
            }
            console.error("Order tidak ditemukan setelah retry.");
            return;
        }

        document.getElementById('orderNumber').textContent = `#${data.order_id}`;
        document.getElementById('paymentMethod').textContent = data.payment_method;
        document.getElementById('shippingAddress').textContent = data.shipping_address;
        document.getElementById('deliveryEstimate').textContent = data.delivery_estimate;
        document.getElementById('finalTotalPrice').textContent =
            `Rp ${parseFloat(data.total_price).toLocaleString('id-ID')}`;

    } catch (error) {
        console.error("Error:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('order_success loadded')
    //window.updateAuthUI();

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');

    // const orderNumberElem = document.getElementById('orderNumber');
    // const paymentMethodElem = document.getElementById('paymentMethod');
    // const shippingAddressElem = document.getElementById('shippingAddress');
    // const deliveryEstimateElem = document.getElementById('deliveryEstimate');
    // const finalTotalPriceElem = document.getElementById('finalTotalPrice');

    if (orderId) {
        loadOrderDetails(orderId);
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
