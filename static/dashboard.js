// dashboard.js
console.log("dashboard.js loadeddddddd");

// Global variables (mock data for products - still used for frontend display)
// NOTE: In a real e-commerce app, products would ideally be fetched from backend API
// Auth related DOM elements
const authButtons = document.getElementById("authButtons");
const accountMenu = document.getElementById("accountMenu");
const accountUsername = document.getElementById("accountUsername");
const logoutBtn = document.getElementById("logoutBtn");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");

// Forms
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const otpVerificationForm = document.getElementById("otpVerificationForm");

// Form inputs
const loginUsernameInput = document.getElementById("loginUsername");
const loginPasswordInput = document.getElementById("loginPassword");
const regUsernameInput = document.getElementById("regUsername");
const regNameInput = document.getElementById("regName");
const regEmailInput = document.getElementById("regEmail");
const regPhoneInput = document.getElementById("regPhone");
const regPasswordInput = document.getElementById("regPassword");
const forgotIdInput = document.getElementById("forgotId"); // for email/username/phone in forgot password
const otpInput = document.getElementById("otpInput"); // General OTP input field

// Error/Message displays
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");
const forgotError = document.getElementById("forgotError");
const otpMessage = document.getElementById("otpMessage");
const otpError = document.getElementById("otpError");
const toast = document.getElementById("toast");

// Buttons to switch forms
const showRegisterFromLogin = document.getElementById("showRegister"); // Updated ID to match HTML
const showLoginFromRegister = document.getElementById("showLoginFromRegister");
const showForgotFromLogin = document.getElementById("showForgotPassword"); // Updated ID to match HTML
const showLoginFromForgot = document.getElementById("showLoginFromForgot");
const showLoginFromOtpLink = document.getElementById("showLoginFromOtp");

// Buttons for form submissions (re-declared for clarity inside DOMContentLoaded)
let btnLoginSubmit;
let btnRegisterSubmit;
let btnResetPassword; // For sending OTP in forgot password flow
let btnVerifyOtp;
let btnResendOtp;

// Product Detail Modal DOM elements
const productDetailModal = document.getElementById("productDetailModal");
const closeDetailModal = document.getElementById("closeDetailModal");
const modalProductImage = document.getElementById("modalProductImage");
const modalProductName = document.getElementById("modalProductName");
const modalProductDescription = document.getElementById(
  "modalProductDescription"
);
const modalProductPrice = document.getElementById("modalProductPrice");
const modalProductStock = document.getElementById("modalProductStock");
const modalAddToCartBtn = document.getElementById("modalAddToCartBtn");

// Dashboard specific DOM elements
const catalogContainer = document.getElementById("catalog");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const accountDropdown = document.getElementById("accountDropdown");

const cartLink = document.getElementById("cart");


// --- Global Utility Functions ---

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', or 'info'.
 */
window.showToast = function (message, type = "info") {
  if (!toast) return;
  toast.textContent = message;
  toast.className = "toast show " + type;
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
};

/**
 * Shows a specific authentication form (login, register, forgot password, otp verification) in the modal.
 * Clears previous error/info messages.
 * @param {HTMLElement} formElement - The DOM element of the form to show.
 */
function showForm(formElement) {
  const allForms = document.querySelectorAll(".auth-form");
  allForms.forEach((form) => {
    form.style.display = "none";
  });
  if (formElement) {
    formElement.style.display = "block";
  }

  // Clear all error/info messages
  if (loginError) loginError.textContent = "";
  if (registerError) registerError.textContent = "";
  if (forgotError) forgotError.textContent = "";
  if (otpMessage) otpMessage.textContent = "";
  if (otpError) otpError.textContent = "";
}

/**
 * Shows the login modal.
 */
window.showLoginModal = function () {
  if (authModal) authModal.style.display = "flex";
  showForm(loginForm);
};

/**
 * Shows the register modal.
 */
window.showRegisterModal = function () {
  if (authModal) authModal.style.display = "flex";
  showForm(registerForm);
};

/**
 * Shows the forgot password modal.
 */
window.showForgotPasswordModal = function () {
  if (authModal) authModal.style.display = "flex";
  showForm(forgotPasswordForm);
};

/**
 * CSRF token retrieval for Django POST requests.
 */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Global variable to store the identifier for OTP re-sending
let currentOtpUserIdentifier = null;

/**
 * Fungsi untuk memuat data pengguna dari localStorage (simulasi).
 * Dalam aplikasi nyata, ini akan diperbarui dari status autentikasi backend.
 * @returns {object|null} Objek pengguna jika ada, null jika tidak ada.
 */
window.loadUserFromLocalStorage = function () {
  // Ini adalah simulasi. Dalam aplikasi nyata, Anda akan memiliki state pengguna yang lebih canggih,
  // mungkin dari API atau cookie sesi.
  // Untuk tujuan demo ini, kita berasumsi 'currentLoggedInUser' ada setelah login berhasil.
  const user = localStorage.getItem('currentLoggedInUser');
  return user ? JSON.parse(user) : null;
};

// --- Authentication and User Management (Django Backend) ---

/**
 * Checks login status with backend and updates UI.
 */
async function checkLoginStatus() {
  console.log("checklogin")
  try {
    const response = await fetch("/api/get_current_user/", {
      method: "GET",
      credentials: "include", // Essential for sending session cookies
    });
    const data = await response.json();
    console.log(data)


    if (data.is_authenticated) {
      if (authButtons) authButtons.style.display = "none";
      if (accountMenu) accountMenu.style.display = "block";
      if (accountUsername) accountUsername.textContent = data.username;
      updateAddToCartButtonsVisibility(true);
      // Store current logged in user to localStorage for other scripts
      // This is a simulation, in real app user data comes from secure session
      localStorage.setItem('currentLoggedInUser', JSON.stringify({ username: data.username, /* other user data */ }));
    } else {
      if (authButtons) authButtons.style.display = "block";
      if (accountMenu) accountMenu.style.display = "none";
      updateAddToCartButtonsVisibility(false);
      // Clear current logged in user from localStorage
      localStorage.removeItem('currentLoggedInUser');
    }
    // Update cart icon count based on current user after auth check
    if (typeof window.updateCartIconCount === "function") {
      window.updateCartIconCount();
    }
  } catch (error) {
    console.error("Failed to check login status:", error);
    // Even if error, assume not logged in to hide sensitive UI elements
    if (authButtons) authButtons.style.display = "block";
    if (accountMenu) accountMenu.style.display = "none";
    updateAddToCartButtonsVisibility(false);
    localStorage.removeItem('currentLoggedInUser'); // Ensure cleared on error
    // Ensure cart icon count is reset if there's an auth error
    if (typeof window.updateCartIconCount === "function") {
      window.updateCartIconCount(); // This will show 0 items
    }
  }
}

/**
 * Handles user logout.
 */
window.logout = async function () {
  try {
    const response = await fetch("/api/logout/", {
      method: "POST", // Use POST for logout for security reasons
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      credentials: "include",
    });
    console.log('logout clicked')
    const data = await response.json();
    if (response.ok && data.success) {
      window.showToast(data.message || "Anda telah logout.", "info");
      // Clear current logged in user from localStorage on successful logout
      localStorage.removeItem('currentLoggedInUser');
      // Reload to reflect logout state
      // window.location.reload();
      window.location.href = "/";
    } else {
      window.showToast(data.message || "Gagal logout.", "error");
    }
  } catch (error) {
    console.error("Logout error:", error);
    window.showToast("Terjadi kesalahan saat logout.", "error");
  }
};

/**
 * Sends OTP to the specified email/username.
 * @param {string} emailOrUsername - The identifier for sending OTP.
 */
async function sendOtp(emailOrUsername) {
  // Store the identifier globally for potential resend
  currentOtpUserIdentifier = emailOrUsername;

  if (otpMessage) otpMessage.textContent = "";
  if (otpError) otpError.textContent = "";

  try {
    const response = await fetch("/api/send_otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({ email_or_username: emailOrUsername }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      window.showToast(result.message || "OTP berhasil dikirim.", "success");
      // Set message in OTP form, e.g., "OTP sent to your_email@example.com"
      if (otpMessage)
        otpMessage.textContent = `OTP telah dikirim ke ${emailOrUsername}.`;
      showForm(otpVerificationForm); // Show OTP form
    } else {
      window.showToast(result.message || "Gagal mengirim OTP.", "error");
      if (otpError)
        otpError.textContent = result.message || "Gagal mengirim OTP.";
    }
  } catch (error) {
    console.error("Error sending OTP:", error);
    window.showToast("Terjadi kesalahan saat mengirim OTP.", "error");
    if (otpError)
      otpError.textContent = "Terjadi kesalahan koneksi saat mengirim OTP.";
  }
}

/**
 * Verifies the entered OTP code.
 */
async function verifyOtp() {
  const enteredOtp = otpInput.value.trim();
  const identifier = currentOtpUserIdentifier; // Use the globally stored identifier

  if (otpError) otpError.textContent = "";

  if (!enteredOtp) {
    if (otpError) otpError.textContent = "Mohon masukkan OTP.";
    return;
  }

  if (!identifier) {
    if (otpError)
      otpError.textContent = "Identitas pengguna untuk OTP tidak ditemukan.";
    window.showToast(
      "Identitas pengguna tidak ditemukan, coba lagi dari awal.",
      "error"
    );
    return;
  }

  try {
    const response = await fetch("/api/verify_otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: JSON.stringify({
        email_or_username: identifier,
        otp_code: enteredOtp,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      window.showToast(result.message, "success");
      // If OTP for registration, redirect to login.
      // If OTP for password reset, you might redirect to a reset password page or show new password form.
      // For simplicity, let's assume both redirect to login for now.
      showForm(loginForm);
      // Clear OTP input and stored identifier
      otpInput.value = "";
      currentOtpUserIdentifier = null;
      if (authModal) authModal.style.display = "none";
    } else {
      if (otpError) otpError.textContent = result.message || "OTP tidak valid.";
      window.showToast(result.message || "Verifikasi OTP gagal.", "error");
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    if (otpError)
      otpError.textContent = "Terjadi kesalahan saat memverifikasi OTP.";
    window.showToast("Kesalahan sistem saat verifikasi.", "error");
  }
}

// --- Product Catalog and Detail Functions ---

/**
 * Renders products into the catalog container.
 * @param {Array<object>} filteredProducts - Products to render.
 */
// async function renderProducts(products) {
//   if (!catalogContainer) return;

//   let newProducts = products
//   if(!products) {
//     newProducts = await fetchProducts(); // fetch from DB
//   }
//   catalogContainer.innerHTML = "";

//   if (newProducts.length === 0) {
//     catalogContainer.innerHTML =
//       '<p style="text-align: center; color: #6c757d; font-size: 1.1em; padding: 50px;">Tidak ada produk yang ditemukan.</p>';
//     return;
//   }

//   newProducts.forEach((product) => {
//     const productCard = document.createElement("div");
//     productCard.className = "product-card";

//     const truncatedDescription =
//       product.description?.length > 70
//         ? product.description.substring(0, 70) + "..."
//         : product.description;

//     productCard.innerHTML = `
//       <img src="${product.image}" alt="${product.name}" />
//       <h4>${product.name}</h4>
//       <p class="product-price">Rp ${product.price.toLocaleString("id-ID")}</p>
//       <p>${product.category}</p>
//       <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
//         + Keranjang
//       </button>
//     `;

//     catalogContainer.appendChild(productCard);

//     const elementsToClickForDetail = productCard.querySelectorAll(
//       "img, h4, p:not(.product-price), .product-badge"
//     );
//     elementsToClickForDetail.forEach((el) => {
//       el.addEventListener("click", () => showProductDetail(product.id));
//     });

//     const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
//     if (addToCartBtn) {
//       addToCartBtn.addEventListener("click", (e) => {
//         e.stopPropagation(); // Prevent product detail modal from opening
//         window.addToCart(parseInt(e.target.dataset.id));
//       });
//     }
//   });

//   checkLoginStatus(); // Re-check login status to update button visibility
// }

async function renderProducts(products) {
  if (!catalogContainer) return;

  let newProducts = products;
  if (!products) {
    newProducts = await fetchProducts(); // fetch from DB
  }

  // 💡 Simpan produk yang dirender ke variabel global
  window.renderedProducts = newProducts;

  catalogContainer.innerHTML = "";

  if (newProducts.length === 0) {
    catalogContainer.innerHTML =
      '<p style="text-align: center; color: #6c757d; font-size: 1.1em; padding: 50px;">Tidak ada produk yang ditemukan.</p>';
    return;
  }

  newProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    const truncatedDescription =
      product.description?.length > 70
        ? product.description.substring(0, 70) + "..."
        : product.description;

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p class="product-price">Rp ${product.price.toLocaleString("id-ID")}</p>
      <p>${product.category}</p>
      <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
        + Keranjang
      </button>
    `;

    catalogContainer.appendChild(productCard);

    const elementsToClickForDetail = productCard.querySelectorAll(
      "img, h4, p:not(.product-price), .product-badge"
    );
    elementsToClickForDetail.forEach((el) => {
      el.addEventListener("click", () => showProductDetail(product.id));
    });

    const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.addToCart(parseInt(e.target.dataset.id));
      });
    }
  });

  checkLoginStatus();
}

/**
 * Shows/hides "Add to Cart" buttons globally.
 * This function is called by checkLoginStatus and updateAuthUI.
 * @param {boolean} isLoggedIn - True if user is logged in, false otherwise.
 */
function updateAddToCartButtonsVisibility(isLoggedIn) {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.style.display = isLoggedIn ? "block" : "none";
  });
  if (modalAddToCartBtn) {
    modalAddToCartBtn.style.display = isLoggedIn ? "block" : "none";
  }
}


/**
 * Shows the product detail modal.
 * @param {number} productId - The ID of the product to display.
 */
async function showProductDetail(productId) {
  const products = await fetchProducts();
  const product = products.find((p) => p.id === productId);
  if (!product || !productDetailModal) return;
  console.log(product.image)
  modalProductImage.src = product.image;
  modalProductName.textContent = product.name;
  modalProductDescription.textContent = product.description;
  modalProductPrice.textContent = `Rp ${product.price.toLocaleString("id-ID")}`;
  modalProductStock.textContent =
    product.stock !== undefined ? product.stock : "N/A";
  modalAddToCartBtn.dataset.productId = product.id;

  productDetailModal.style.display = "flex";
  // Re-check status to correctly show/hide modalAddToCartBtn when modal opens
  checkLoginStatus(); // This will trigger updateAddToCartButtonsVisibility

  
}

// Close product detail modal
if (closeDetailModal) {
  closeDetailModal.addEventListener("click", () => {
    if (productDetailModal) productDetailModal.style.display = "none";
  });
}

if(productDetailModal){
  productDetailModal.addEventListener("click", (event) => {
    productDetailModal.style.display = "none";
    console.log('detail click')
    const productId = parseInt(event.target.dataset.productId);
    showProductDetail(productId)
  })
}

// Add to cart from modal
if (modalAddToCartBtn) {
  modalAddToCartBtn.addEventListener("click", (event) => {
    const productId = parseInt(event.target.dataset.productId);
    window.addToCart(productId);
    if (productDetailModal) productDetailModal.style.display = "none"; // Close modal after adding
  });
}

// --- Cart Management Functions ---

/**
 * Adds a product to the user's cart (localStorage for simplicity, but ideally backend).
 * @param {number} productId - The ID of the product to add.
 */
// window.addToCart = function (productId) {
//   fetch("/api/get_current_user/", {
//     method: "GET",
//     credentials: "include",
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (!data.is_authenticated) {
//         window.showToast(
//           "Silakan login untuk menambahkan produk ke keranjang.",
//           "error"
//         );
//         window.showLoginModal();
//         return;
//       }

//       const product = products.find((p) => p.id === productId);
//       if (!product) {
//         window.showToast("Produk tidak ditemukan.", "error");
//         return;
//       }

//       const cartKey = `cart_${data.username}`; // Use actual username from backend
//       let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

//       const existingCartItem = cart.find((item) => item.id === productId);

//       const productStock = product.stock !== undefined ? product.stock : 1000;

//       if (existingCartItem) {
//         if (existingCartItem.quantity < productStock) {
//           existingCartItem.quantity++;
//           window.showToast(
//             `Menambahkan ${product.name} ke keranjang.`,
//             "success"
//           );
//         } else {
//           window.showToast(`Stok ${product.name} terbatas.`, "error");
//         }
//       } else {
//         if (productStock > 0) {
//           // Kunci perbaikan: Menyimpan semua properti produk yang diperlukan
//           const newItem = {
//             id: product.id,
//             name: product.name,
//             price: product.price,
//             image: product.image,
//             quantity: 1,
//           };
//           cart.push(newItem);
//           console.log("Product pushed to cart:", newItem); // DEBUG: Log the item being pushed
//           window.showToast(
//             `${product.name} ditambahkan ke keranjang.`,
//             "success"
//           );
//         } else {
//           window.showToast(`${product.name} sedang tidak tersedia.`, "error");
//         }
//       }
//       localStorage.setItem(cartKey, JSON.stringify(cart));
//       console.log("Current cart in localStorage:", JSON.parse(localStorage.getItem(cartKey))); // DEBUG: Log the entire cart
//       // Memperbarui jumlah item di ikon keranjang pada header
//       if (typeof window.updateCartIconCount === "function") {
//         window.updateCartIconCount();
//       }
//     })
//     .catch((error) => {
//       console.error("Error checking login status for cart:", error);
//       window.showToast(
//         "Terjadi kesalahan. Silakan coba lagi.",
//         "error"
//       );
//     });
// };

window.addToCart = function (productId) {
  fetch("/api/get_current_user/", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.is_authenticated) {
        window.showToast(
          "Silakan login untuk menambahkan produk ke keranjang.",
          "error"
        );
        window.showLoginModal();
        return;
      }

      fetch("/api/cart/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            window.showToast(result.message, "success");

            if (typeof window.updateCartIconCount === "function") {
              window.updateCartIconCount();
            }
          } else {
            window.showToast(result.message || "Gagal menambahkan ke keranjang", "error");
          }
        })
        .catch((err) => {
          console.error("Error menambahkan produk ke cart:", err);
          window.showToast("Terjadi kesalahan saat menambahkan ke keranjang.", "error");
        });
    })
    .catch((error) => {
      console.error("Error checking login status:", error);
      window.showToast("Terjadi kesalahan. Silakan coba lagi.", "error");
    });
};



// Fungsi untuk memperbarui jumlah item di ikon keranjang pada header
window.updateCartIconCount = async function () {
  const cartCountElem = document.getElementById("cartCount");
  if (!cartCountElem) return;

  try {
    const res = await fetch("/api/cart/", {
      method: "GET",
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn("Gagal mengambil keranjang: status", res.status);
      cartCountElem.style.display = "none";
      return;
    }

    const data = await res.json();
    console.log("Cart items response:", data);

    const cartItems = Array.isArray(data.items) ? data.items : [];

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    cartCountElem.textContent = totalItems;
    cartCountElem.style.display = totalItems > 0 ? "inline-block" : "none";
  } catch (err) {
    console.error("Gagal memuat jumlah item di keranjang:", err);
    cartCountElem.style.display = "none";
  }
};




// --- Event Listeners and Initializations ---

document.addEventListener("DOMContentLoaded", function () {

  // productDetailModal.addEventListener('click', function(){
  //   console.log('click')
  //   showProductDetail();
  // })

  // const cartLink = document.getElementById("cartLink");
  if (cartLink) {
    cartLink.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Keranjang dicegah");
      // Aksi custom, misalnya buka modal atau navigasi manual
    });
  }

  // Ensure all DOM elements are loaded before attaching listeners
  initProductFiltering()
  btnLoginSubmit = document.getElementById("btnLoginSubmit");
  btnRegisterSubmit = document.getElementById("btnRegisterSubmit");
  btnResetPassword = document.getElementById("btnResetPassword");
  btnVerifyOtp = document.getElementById("btnVerifyOtp");
  btnResendOtp = document.getElementById("btnResendOtp");

  // Initial load of user data and update UI
  // Call this once on page load to set initial UI state correctly
  checkLoginStatus();

  // Event listeners for auth buttons in header
  const btnLoginHeader = document.getElementById("btnLogin");
  const btnRegisterHeader = document.getElementById("btnRegister");
  if (btnLoginHeader)
    btnLoginHeader.addEventListener("click", window.showLoginModal);
  if (btnRegisterHeader)
    btnRegisterHeader.addEventListener("click", window.showRegisterModal);

  // Event listeners for form switching
  const showRegisterLink = document.getElementById("showRegister"); // Get the correct ID from HTML
  const showForgotPasswordLink = document.getElementById("showForgotPassword"); // Get the correct ID from HTML

  if (showRegisterLink)
    showRegisterLink.addEventListener("click", () => showForm(registerForm));
  if (showLoginFromRegister)
    showLoginFromRegister.addEventListener("click", () => showForm(loginForm));
  if (showForgotPasswordLink)
    showForgotPasswordLink.addEventListener("click", () => showForm(forgotPasswordForm)); // Corrected ID usage
  if (showLoginFromForgot)
    showLoginFromForgot.addEventListener("click", () => showForm(loginForm));
  if (showLoginFromOtpLink)
    showLoginFromOtpLink.addEventListener("click", () => showForm(loginForm));


  // Event listener for account menu dropdown
  if (accountMenu && accountDropdown) {
    accountMenu.addEventListener("click", function (e) {
      accountDropdown.style.display =
        accountDropdown.style.display === "block" ? "none" : "block";
      e.stopPropagation(); // Prevent document click from closing it immediately
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", function (e) {
      if (
        !accountMenu.contains(e.target) &&
        accountDropdown.style.display === "block"
      ) {
        accountDropdown.style.display = "none";
      }
    });
  }

  // Logout button (now correctly calls the global window.logout)
  if (logoutBtn) logoutBtn.addEventListener("click", window.logout);

  // Close auth modal
  if (closeAuthModal) {
    closeAuthModal.addEventListener("click", () => {
      if (authModal) authModal.style.display = "none";
      // Clear OTP-related data when modal is closed
      currentOtpUserIdentifier = null;
      otpInput.value = "";
      if (otpMessage) otpMessage.textContent = "";
      if (otpError) otpError.textContent = "";
    });
  }
  
  if (cartLink) {
    cartLink.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Keranjang dicegah");
      const cartUrl = cartLink.getAttribute("data-cart-url");
      window.location.href = cartUrl;
      // Aksi custom, misalnya buka modal atau navigasi manual
    });
  }
  // Initial form display (e.g., show login by default)
  if (loginForm) showForm(loginForm);

  // --- Login Logic (Django Backend) ---
  if (btnLoginSubmit) {
    btnLoginSubmit.addEventListener("click", async (e) => {
      e.preventDefault();
      const username = loginUsernameInput.value.trim();
      const password = loginPasswordInput.value.trim();

      if (!username || !password) {
        if (loginError)
          loginError.textContent = "Username dan password harus diisi.";
        window.showToast("Login gagal: Data tidak lengkap!", "error");
        return;
      }

      try {
        const response = await fetch("/api/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"), // Important for Django POST
          },
          credentials: "include", // Important to receive session cookie
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok && data.success) {
          if (loginError) loginError.textContent = "";
          window.showToast(data.message, "success");
          if (authModal) authModal.style.display = "none";

          if(data.role && data.role === "admin") {
            return window.location.href = "/admin-panel/";
          }

          checkLoginStatus(); // Update UI after successful login
        } else {
          if (loginError) loginError.textContent = data.message;
          window.showToast(data.message || "Login gagal!", "error");
          if (data.message && data.message.includes("not activated")) {
            // If account not activated, show OTP form and pre-fill identifier
            currentOtpUserIdentifier = username; // Use username as identifier for resending
            if (otpMessage)
              otpMessage.textContent =
                "Akun belum aktif. Mohon verifikasi email/telepon Anda dengan OTP.";
            showForm(otpVerificationForm);
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        if (loginError) loginError.textContent = "Terjadi kesalahan saat login.";
        window.showToast("Terjadi kesalahan sistem saat login.", "error");
      }
    });
  }

  // --- Registration Logic (Django Backend) ---
  if (btnRegisterSubmit) {
    btnRegisterSubmit.addEventListener("click", async (e) => {
      e.preventDefault();
      const username = regUsernameInput.value.trim();
      const name = regNameInput.value.trim();
      const email = regEmailInput.value.trim();
      const phone = regPhoneInput.value.trim();
      const password = regPasswordInput.value;

      if (!username || !name || !email || !phone || !password) {
        if (registerError) registerError.textContent = "Semua field harus diisi.";
        window.showToast("Pendaftaran gagal: Data tidak lengkap!", "error");
        return;
      }

      try {
        const response = await fetch("/api/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
          },
          body: JSON.stringify({ username, email, password, name, phone}),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          if (registerError) registerError.textContent = "";
          window.showToast(data.message, "success");
          currentOtpUserIdentifier = email; // Store email for OTP verification
          if (otpMessage) otpMessage.textContent = data.message;
          showForm(otpVerificationForm); // Show OTP form immediately after successful registration request
          // Clear registration fields
          regUsernameInput.value = "";
          regNameInput.value = "";
          regEmailInput.value = "";
          regPhoneInput.value = "";
          regPasswordInput.value = "";
        } else {
          if (registerError) registerError.textContent = data.message;
          window.showToast(data.message || "Pendaftaran gagal!", "error");
        }
      } catch (error) {
        console.error("Registration error:", error);
        if (registerError)
          registerError.textContent = "Terjadi kesalahan saat pendaftaran.";
        window.showToast("Terjadi kesalahan sistem saat pendaftaran.", "error");
      }
    });
  }

  // --- Forgot Password / Send OTP Logic (Django Backend) ---
  if (btnResetPassword) {
    btnResetPassword.addEventListener("click", async (e) => {
      e.preventDefault();
      const emailOrUsername = forgotIdInput.value.trim();

      if (!emailOrUsername) {
        if (forgotError)
          forgotError.textContent = "Masukkan Username / Email / No. Telepon Anda.";
        return;
      }
      sendOtp(emailOrUsername); // Use the unified sendOtp function
    });
  }

  // --- OTP Verification Logic (Django Backend) ---
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener("click", async (e) => {
      e.preventDefault();
      verifyOtp(); // Use the unified verifyOtp function
    });
  }

  // --- Resend OTP Logic ---
  if (btnResendOtp) {
    btnResendOtp.addEventListener("click", async (e) => {
      e.preventDefault();
      if (currentOtpUserIdentifier) {
        sendOtp(currentOtpUserIdentifier); // Resend to the last identifier used
        window.showToast("Mengirim ulang OTP...", "info");
      } else {
        if (otpError)
          otpError.textContent = "Tidak ada tujuan OTP yang tersimpan untuk dikirim ulang.";
        window.showToast(
          "Tidak dapat mengirim ulang OTP. Silakan mulai dari awal.",
          "error"
        );
      }
    });
  }

  // --- Dashboard Specific Logic (Product Catalog) ---
  // Populate categories in the filter dropdown
  // Initial product rendering on dashboard load
});
async function fetchProducts() {
  try {
    const res = await fetch('/api/products/');
    const data = await res.json();
    return data.products; // return product array
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

async function initProductFiltering() {
  try {
    const res = await fetch("/api/products/");
    const data = await res.json();
    allProducts = data.products;

    populateCategoryOptions(allProducts);
    renderProducts(allProducts); // show all initially

    // Add listeners
    if (categoryFilter) {
      categoryFilter.addEventListener("change", filterAndSearchProducts);
    }
    if (searchInput) {
      searchInput.addEventListener("input", filterAndSearchProducts);
    }

  } catch (error) {
    console.error("Failed to load products:", error);
  }
}

// Create <option> for each category
function populateCategoryOptions(products) {
  if (!categoryFilter) return;

  const categories = [...new Set(products.map((p) => p.category))];
  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Combined filter + search logic
function filterAndSearchProducts() {
  const selectedCategory = categoryFilter?.value||  "all";
  const searchTerm = searchInput?.value.toLowerCase()||  "";

  let filtered = [...allProducts];

  if (selectedCategory !== "all") {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm)||
        p.description.toLowerCase().includes(searchTerm)||
        p.category.toLowerCase().includes(searchTerm)
    );
  }

  renderProducts(filtered);
}

// document.addEventListener("DOMContentLoaded", function () {
//   const cartLink = document.getElementById("cartLink");
//   if (cartLink) {
//     cartLink.addEventListener("click", function (event) {
//       event.preventDefault();
//       console.log("Keranjang dicegah");
//       // Aksi custom, misalnya buka modal atau navigasi manual
//     });
//   }
// });
