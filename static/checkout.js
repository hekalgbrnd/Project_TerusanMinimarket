// checkout.js v2
console.log("checkout loaded3");

function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

async function populateSavedAddresses() {
  const userRes = await fetch("/api/get_current_user/", { credentials: "include" });
  const currentUser = await userRes.json();
  if (!currentUser.is_authenticated) {
    return window.location.href = "/login/";
  }
  const select = document.getElementById("savedAddressSelect");
  const section = document.getElementById("savedAddressesSection");

  if (currentUser && currentUser.addresses && select) {
    select.innerHTML = '<option value="">-- Pilih Alamat --</option>';
    currentUser.addresses.forEach((address, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = address.name || `Alamat ${index + 1}`;
      select.appendChild(option);
    });
    section.style.display = currentUser.addresses.length > 0 ? "block" : "none";
  } else if (section) {
    section.style.display = "none";
  }
}

function fillAddressForm(address) {
  if (!address) return clearAddressForm();
  document.getElementById("receiverName").value = address.receiver_name || "";
  document.getElementById("receiverPhone").value = address.receiver_phone || "";
  document.getElementById("address").value = address.full_address || "";
  document.getElementById("rtRw").value = address.rt_rw || "";
  document.getElementById("postalCode").value = address.postal_code || "";
}

function clearAddressForm() {
  ["receiverName", "receiverPhone", "address", "rtRw", "postalCode"].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const userRes = await fetch("/api/get_current_user/", { credentials: "include" });
  const currentUser = await userRes.json();
  if (!currentUser.is_authenticated) return window.location.href = "/login/";

  const subtotalElem = document.getElementById("checkoutSubtotal");
  const shippingElem = document.getElementById("checkoutShipping");
  const totalElem = document.getElementById("checkoutTotal");
  const itemsContainer = document.getElementById("checkoutItems");

  let subtotal = 0;
  let total = 0;
  let cartItems = [];

  try {
    const res = await fetch("/api/cart/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
    });

    const cart = await res.json();
    cartItems = Array.isArray(cart.items) ? cart.items : [];

    if (cartItems.length === 0) return showToast("Keranjang kosong.", "error");

    // Render cart items
    itemsContainer.innerHTML = "";
    subtotal = 0;

    cartItems.forEach(item => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      subtotal += price * quantity;

      const div = document.createElement("div");
      div.className = "summary-item";
      div.innerHTML = `
        <div>
          <strong>${item.product_name}</strong><br/>
          Jumlah: ${quantity} x Rp ${price.toLocaleString("id-ID")}
        </div>
      `;
      itemsContainer.appendChild(div);
    });

    total = subtotal + SHIPPING_COST;
    subtotalElem.textContent = `Rp ${subtotal.toLocaleString("id-ID")}`;
    shippingElem.textContent = `Rp ${SHIPPING_COST.toLocaleString("id-ID")}`;
    totalElem.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  } catch (error) {
    console.error("Gagal mengambil data keranjang:", error);
    return showToast("Gagal memuat keranjang dari server.", "error");
  }

  // ========================
  // Alamat & Pembayaran
  // ========================
  populateSavedAddresses();

  document.getElementById("savedAddressSelect").addEventListener("change", (e) => {
    const idx = e.target.value;
    if (idx !== "") fillAddressForm(currentUser.addresses[parseInt(idx)]);
    else clearAddressForm();
  });

  document.getElementById("useNewAddressBtn").addEventListener("click", () => {
    clearAddressForm();
    document.getElementById("savedAddressSelect").value = "";
  });

  document.getElementById("placeOrderBtn").addEventListener("click", async () => {
    console.log('button clicked')
    const fieldIds = ["receiverName", "receiverPhone", "address", "rtRw", "postalCode"];
    const values = {};
    for (const id of fieldIds) {
      const val = document.getElementById(id)?.value.trim();
      if (!val) return showToast("Mohon lengkapi semua field alamat.", "error");
      values[id] = val;
    }

    const paymentMethod = document.getElementById("paymentMethod").value;
    if (!paymentMethod) return showToast("Pilih metode pembayaran.", "error");

    const fullShippingAddress = `
      ${values.receiverName} - ${values.receiverPhone}, 
      ${values.address}, RT/RW: ${values.rtRw}, ${values.postalCode}
    `.trim();

    console.log("TOTAL =", total);
    console.log("CART ITEMS =", cartItems);
    const orderData = {
      amount: total,
      shipping_address: fullShippingAddress,
      receiver_name: values.receiverName,
      receiver_phone: values.receiverPhone,
      items: cartItems
    };

    // COD
    if (paymentMethod === "cod") {
      try {
        const res = await fetch("/api/create-cod-transaction/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCSRFToken()
          },
          credentials: "include",
          body: JSON.stringify(orderData)
        });

        const data = await res.json();
        if (res.ok && data.success && data.order_id) {
          window.location.href = `/order_success/?order_id=${encodeURIComponent(data.order_id)}`;
        } else {
          showToast(data.message || "Gagal memproses pesanan COD.", "error");
        }
      } catch (err) {
        console.error("COD error:", err);
        showToast("Terjadi kesalahan saat proses pesanan COD.", "error");
      }
      return;
    }

    console.log('midtrans')
    // MIDTRANS
    try {
      const res = await fetch("/api/create-transaction/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken()
        },
        credentials: "include",
        body: JSON.stringify(orderData)
      });

      const data = await res.json();

      console.log("RESPONSE STATUS:", res.status);
      console.log("RESPONSE DATA:", data);

      if (!res.ok) {
        return showToast(data.message || data.error || "Terjadi kesalahan.", "error");
      }

      if (data.token) {
        snap.pay(data.token, {
          onSuccess: () => {
            window.location.href = `/order_success/?order_id=${encodeURIComponent(data.order_id)}`;
          },
          onError: (err) => {
            showToast("Pembayaran gagal: " + err.message, "error");
          },
          onClose: () => {
            showToast("Transaksi dibatalkan.", "info");
          }
        });
      } else {
        showToast("Token tidak ditemukan dari Midtrans.", "error");
      }

    } catch (error) {
      console.error("Checkout error:", error);
      showToast("Terjadi kesalahan saat proses checkout.", "error");
    }
  });
});
