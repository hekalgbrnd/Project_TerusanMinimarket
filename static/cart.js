// cart.js - This file contains cart-specific logic and relies on dashboard.js for global functions
console.log('cart js loaded2')
// --- DOM Elements ---

// Biaya pengiriman yang konsisten, diasumsikan dalam IDR
let SHIPPING_COST = 0

async function fetchShippingCost() {
  try {
    const response = await fetch("/api/store/shipping-cost/");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const shippingCost = data.shipping_cost || 0;
    const freeShippingMin = data.free_shipping_min || 0;

    SHIPPING_COST = shippingCost;

    // Update elemen yang memang ADA di halaman
    const cartShippingElem = document.getElementById("cartShipping");
    if (cartShippingElem) {
      cartShippingElem.textContent = `Rp ${shippingCost.toLocaleString("id-ID")}`;
    }

    window.storeShipping = {
      cost: shippingCost,
      freeMin: freeShippingMin
    };

  } catch (error) {
    console.error("[ERROR] Gagal mengambil shipping cost:", error);
  }
}


// Catatan: Variabel 'products' diasumsikan tersedia secara global dari dashboard.js
//           karena dashboard.js akan dimuat sebelum cart.js.


/**
 * Merender item-item di keranjang dan memperbarui ringkasan total.
 * Fungsi ini diekspos secara global (melalui `window`) agar bisa dipanggil dari skrip lain (misalnya setelah login atau tambah ke keranjang).
 */
function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

async function handleQuantityChangeFromBackend(event) {
  const button = event.target;
  const productId = button.getAttribute("data-id");
  const action = button.getAttribute("data-action");

  if (!productId || !action) return;

  try {
    const res = await fetch("/api/cart/update/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ product_id: productId, action }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Keranjang diperbarui", "success");
      renderCart();
    } else {
      console.error(data);
      showToast(data.error || "Gagal memperbarui keranjang", "error");
    }
  } catch (error) {
    console.error("Error saat update jumlah item:", error);
    showToast("Terjadi kesalahan saat mengubah jumlah produk", "error");
  }
}

window.handleRemoveItemFromBackend = async function (event) {
  const productId = event.target.dataset.id;
  if (!productId) return;

  try {
    const res = await fetch("/api/cart/remove/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ product_id: productId }),
    });

    const data = await res.json();
    if (res.ok) {
      showToast("Item dihapus dari keranjang.", "success");
      renderCart();
    } else {
      showToast(data.error || "Gagal menghapus item.", "error");
    }
  } catch (error) {
    console.error("Error removing item:", error);
    showToast("Gagal menghapus item dari server.", "error");
  }
};

window.renderCart = async function () {

  const cartListContainer = document.getElementById('cartListContainer');
  const cartSubtotalElem = document.getElementById('cartSubtotal');
  const cartShippingElem = document.getElementById('cartShipping');
  const cartTotalElem = document.getElementById('cartTotal');
  const cartEmptyMessage = document.getElementById('cartEmptyMessage');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cartSummaryElement = document.getElementById('cartSummary');

  if (!cartListContainer) return;
  
  try {
    const res = await fetch("/api/cart/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
    });

    const cart = await res.json();
    const items = Array.isArray(cart.items) ? cart.items : [];

    cartListContainer.innerHTML = "";

    if (items.length === 0) {
      cartEmptyMessage.style.display = "block";
      cartSummaryElement.style.display = "none";
      checkoutBtn.disabled = true;
      clearCartBtn.disabled = true;

      if (typeof window.updateCartIconCount === "function") {
        window.updateCartIconCount(0);
      }
      return;
    }

    cartEmptyMessage.style.display = "none";
    cartSummaryElement.style.display = "block";
    checkoutBtn.disabled = false;
    clearCartBtn.disabled = false;

    let subtotal = 0;

    items.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const total = price * quantity;
      subtotal += total;

      const productName = item.product_name || "Produk";
      const productId = item.product_id;
      const productImage = item.image || "/static/images/default-product.png";

      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      cartItemDiv.innerHTML = `
        <div class="item-info">
          <img src="${productImage}" alt="${productName}" class="item-image">
          <div>
            <h4>${productName}</h4>
            <p>Harga: Rp ${price.toLocaleString("id-ID")}</p>
            <div class="item-quantity-control">
              <button class="btn-quantity" data-id="${productId}" data-action="decrease">-</button>
              <span>${quantity}</span>
              <button class="btn-quantity" data-id="${productId}" data-action="increase">+</button>
            </div>
          </div>
        </div>
        <div class="item-actions">
          <p class="item-total">Rp ${total.toLocaleString("id-ID")}</p>
          <button class="btn btn-remove" data-id="${productId}">Hapus</button>
        </div>
      `;
      cartListContainer.appendChild(cartItemDiv);
    });

    const total = subtotal + SHIPPING_COST;
    cartSubtotalElem.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`;
    cartShippingElem.textContent = `Rp ${SHIPPING_COST.toLocaleString("id-ID")}`;
    cartTotalElem.textContent = `Rp ${total.toLocaleString("id-ID")}`;

    cartListContainer.querySelectorAll(".btn-quantity").forEach((btn) =>
      btn.addEventListener("click", handleQuantityChangeFromBackend)
    );
    cartListContainer.querySelectorAll(".btn-remove").forEach((btn) =>
      btn.addEventListener("click", handleRemoveItemFromBackend)
    );

    if (typeof window.checkLoginStatus === "function") {
      window.checkLoginStatus();
    }

    if (typeof window.updateCartIconCount === "function") {
      const totalItemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      window.updateCartIconCount(totalItemCount);
    }
  } catch (error) {
    console.error("Gagal memuat keranjang:", error);
    showToast("Gagal memuat keranjang dari server.", "error");
  }
};


/**
 * Mengelola perubahan jumlah item di keranjang.
 */
// function handleQuantityChange(event) {
//     const productId = parseInt(event.target.dataset.id);
//     const action = event.target.dataset.action;

//     const currentUser = window.loadUserFromLocalStorage();
//     if (!currentUser) {
//         window.showToast("Anda harus login untuk mengelola keranjang.", "error");
//         return;
//     }

//     const cartKey = `cart_${currentUser.username}`;
//     let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

//     const itemIndex = cart.findIndex(item => item.id === productId);

//     if (itemIndex > -1) {
//         // PENTING: Perbarui detail produk (nama, harga, gambar) di item keranjang sebelum menyimpan
//         // Ini memastikan data lengkap tersimpan di localStorage dan dapat diakses checkout.js
//         const productData = window.products ? window.products.find(p => p.id === productId) : null;
//         if (productData) {
//             cart[itemIndex].name = productData.name;
//             cart[itemIndex].price = productData.price;
//             cart[itemIndex].image = productData.image;
//         } else {
//             // Fallback jika window.products tidak tersedia, setidaknya pastikan properti ada
//             // Ini bisa terjadi jika item ditambahkan tanpa window.products di halaman dashboard
//             if (cart[itemIndex].name === undefined) cart[itemIndex].name = `Produk ID ${productId}`;
//             if (cart[itemIndex].price === undefined) cart[itemIndex].price = 0;
//             if (cart[itemIndex].image === undefined) cart[itemIndex].image = 'https://via.placeholder.com/50';
//         }


//         if (action === 'increase') {
//             cart[itemIndex].quantity++;
//             window.showToast("Jumlah produk diperbarui di keranjang.", "info");
//         } else if (action === 'decrease') {
//             cart[itemIndex].quantity--;
//             if (cart[itemIndex].quantity <= 0) {
//                 cart.splice(itemIndex, 1); // Hapus jika jumlahnya 0 atau kurang
//                 window.showToast("Produk dihapus dari keranjang.", "info");
//             } else {
//                 window.showToast("Jumlah produk diperbarui di keranjang.", "info");
//             }
//         }
//         localStorage.setItem(cartKey, JSON.stringify(cart));
//         window.renderCart(); // Re-render the cart to reflect changes
//     } else {
//         window.showToast("Produk tidak ditemukan di keranjang.", "warning");
//     }
// }

/**
 * Mengelola penghapusan item dari keranjang.
 */
// function handleRemoveItem(event) {
//     const productId = parseInt(event.target.dataset.id);

//     const currentUser = window.loadUserFromLocalStorage();
//     if (!currentUser) {
//         window.showToast("Anda harus login untuk mengelola keranjang.", "error");
//         return;
//     }

//     const cartKey = `cart_${currentUser.username}`;
//     let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

//     cart = cart.filter(item => item.id !== productId); // Hapus item yang sesuai

//     localStorage.setItem(cartKey, JSON.stringify(cart));
//     window.showToast("Produk dihapus dari keranjang.", "info");
//     window.renderCart(); // Re-render the cart
// }

/**
 * Mengosongkan seluruh keranjang.
 */
// function handleClearCart() {
//     const currentUser = window.loadUserFromLocalStorage();
//     if (!currentUser) {
//         window.showToast("Anda harus login untuk mengosongkan keranjang.", "error");
//         return;
//     }

//     const cartKey = `cart_${currentUser.username}`;
//     localStorage.removeItem(cartKey); // Hapus kunci keranjang dari localStorage
//     window.showToast("Keranjang Anda telah dikosongkan.", "info");
//     window.renderCart(); // Re-render the cart
// }

async function handleClearCart() {
  try {
    const res = await fetch("/api/cart/clear/", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": getCSRFToken(),
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (res.ok) {
      window.showToast("Keranjang Anda telah dikosongkan.", "info");
      window.renderCart(); // Re-render cart from backend
    } else {
      window.showToast(data.error || "Gagal mengosongkan keranjang.", "error");
    }
  } catch (error) {
    console.error("Error saat mengosongkan keranjang:", error);
    window.showToast("Terjadi kesalahan saat menghapus keranjang.", "error");
  }
}


/**
 * Mensimulasikan proses checkout.
 * Dalam aplikasi nyata, ini akan mengirim data keranjang ke backend.
 */
async function handleCheckout() {
    const currentUser = window.loadUserFromLocalStorage();
    if (!currentUser) {
        window.showToast("Anda harus login untuk melakukan checkout.", "error");
        return;
    }

    const cartKey = `cart_${currentUser.username}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (cart.length === 0) {
        window.showToast("Keranjang Anda kosong. Tambahkan produk sebelum checkout.", "warning");
        return;
    }

    const totalOrder = calculateTotal(cart) + SHIPPING_COST;

    // Simulate API call to backend for checkout
    console.log("Simulating checkout for user:", currentUser.username);
    console.log("Cart contents:", cart);
    console.log("Total order amount (including shipping):", totalOrder);

    // Simulate backend response
    try {
        const orderData = {
            success: true,
            message: "Checkout berhasil! Pesanan Anda sedang diproses.",
            orderId: `ORD-${Date.now()}`,
            date: new Date().toLocaleString(),
            items: cart.map(item => {
                // PENTING: Gunakan properti item langsung dari cart, karena sekarang sudah diperbarui oleh handleQuantityChange (atau addToCart)
                return {
                    id: item.id, // Pastikan ID produk disertakan
                    name: item.name || `Produk ID ${item.id}`, // Fallback jika nama hilang
                    quantity: item.quantity,
                    price: item.price || 0, // Fallback jika harga hilang
                    image: item.image || '', // Fallback jika gambar hilang
                    returned: false // Tambahkan status pengembalian untuk riwayat
                };
            }),
            total: totalOrder,
            status: 'Diproses', // Status awal
            // redirect_url akan diambil dari data-checkout-url tombol
        };

        // --- Save order to localStorage for history (simulation) ---
        const ordersKey = `orders_${currentUser.username}`;
        let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
        orders.push(orderData); // Add the new order
        localStorage.setItem(ordersKey, JSON.stringify(orders));
        // --- End simulation save ---

        if (orderData.success) {
            window.showToast("Checkout berhasil! Pesanan Anda sedang diproses.", "success");
            handleClearCart(); // Clear cart after successful checkout

            // Redirect ke halaman sukses checkout/order history
            const checkoutUrl = checkoutBtn.getAttribute("data-checkout-url");
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                window.location.href = '/orders'; // Default redirect jika atribut tidak ada
            }
        } else {
            window.showToast(orderData.message || "Checkout gagal.", "error");
        }
    } catch (error) {
        console.error("Checkout error:", error);
        window.showToast("Terjadi kesalahan saat checkout.", "error");
    }
}

function calculateTotal(cart) {
    let total = 0;
    cart.forEach(item => {
        // Gunakan item.price langsung dari objek item
        if (item && item.price && item.quantity) {
            total += (parseFloat(item.price) || 0) * item.quantity; // Pastikan harga adalah angka
        }
    });
    return total;
}


// --- Event Listeners and Initializations for Cart Page ---
document.addEventListener("DOMContentLoaded", function() {

  const clearCartBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  fetchShippingCost();
    // Initial rendering of the cart when the page loads
    window.renderCart();

    // Attach event listener to the 'Clear Cart' button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', handleClearCart);
    }

    // Attach event listener to the 'Checkout' button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});