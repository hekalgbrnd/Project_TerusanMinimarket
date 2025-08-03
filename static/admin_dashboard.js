console.log("Admin Dashboard JS Loaded");

    // const monthlySalesCtx = document.getElementById("monthlySalesChart").getContext("2d");
    // const topProductsCtx = document.getElementById("topProductsChart").getContext("2d");

async function fetchAnalytics() {
  try {
    const weeklySalesCtx = document.getElementById("weeklySalesChart").getContext("2d"); // ID disesuaikan
    const topProductsCtx = document.getElementById("topProductsChart").getContext("2d");

    const [weeklySalesData, topProductsData] = await Promise.all([
      fetchData("/api/analytics/weekly-sales/"),
      fetchData("/api/analytics/top-products/")
    ]);

    // === Penjualan Mingguan ===
    new Chart(weeklySalesCtx, {
      type: "line",
      data: {
        labels: weeklySalesData.labels,
        datasets: [{
          label: "Total Penjualan (7 Hari Terakhir)",
          data: weeklySalesData.data,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" }
        }
      }
    });

    // === Produk Terlaris ===
    new Chart(topProductsCtx, {
      type: "bar",
      data: {
        labels: topProductsData.labels,
        datasets: [{
          label: "Jumlah Terjual",
          data: topProductsData.data,
          backgroundColor: "rgba(255, 99, 132, 0.7)"
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (error) {
    console.error("Gagal memuat data analitik:", error);
  }
}

// Utility fetch
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Gagal mengambil " + url);
  return await response.json();
}


document.addEventListener('DOMContentLoaded', function() {
    loadCategoryTable();
    loadProductTable();
    loadOrdersTable();
    loadUsersTable();
    loadSettings();
    fetchAnalytics();

    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const currentSectionTitle = document.getElementById('currentSectionTitle');
    const headerActionsContainer = document.querySelector('.admin-header .header-actions');
    const productIdInput = document.getElementById('productId'); // hidden input
    const categoryIdInput = document.getElementById('categoryId'); // hidden input
    const isProductEdit = productIdInput && productIdInput.value;
    const isCategoryEdit = categoryIdInput && categoryIdInput.value;

    const productEndpoint = isProductEdit ? `/api/products/${productIdInput.value}/edit/` : '/api/products/add/';
    const categoryEndpoint = isCategoryEdit ? `/api/categories/${categoryIdInput.value}/edit/` : '/api/categories/add/';
    const method = (isProductEdit||isCategoryEdit) ? 'PUT' : 'POST';

    const addProductForm = document.getElementById('add-product-form');
    const addCategoryForm = document.getElementById('add-category-form');

    document.getElementById("settings-form-id").addEventListener("submit", async function (e) {
        e.preventDefault();

        const data = {
            store_name: document.getElementById("storeName").value,
            store_email: document.getElementById("storeEmail").value,
            store_phone: document.getElementById("storePhone").value,
            shipping_cost: parseInt(document.getElementById("shippingCost").value),
            free_shipping_min: parseInt(document.getElementById("freeShippingMin").value),
            enable_bank_transfer: document.getElementById("payMethodBank").checked,
            enable_cod: document.getElementById("payMethodOVO").checked
        };

        try {
            const response = await fetch("/api/settings/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(), // atau gunakan {% csrf_token %} di dalam form
            },
            body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
            alert("Pengaturan berhasil disimpan");
            } else {
            alert("Gagal menyimpan: " + JSON.stringify(result));
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menyimpan pengaturan");
        }
        });
    
    addProductForm.addEventListener('submit', async function (event) {
        console.log('submit product')
        event.preventDefault();

        const productIdInput = document.getElementById('productId'); // cek hidden input
        const isProductEdit = productIdInput && productIdInput.value;

        const formData = new FormData();
        formData.append('name', document.getElementById('productName').value);
        formData.append('category', document.getElementById('productCategory').value);
        formData.append('stock', document.getElementById('productStock').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('description', document.getElementById('productDescription').value);

        const imageFile = document.getElementById('productImage').files[0];
        if (imageFile) formData.append('image', imageFile);

        try {
            const productEndpoint = isProductEdit
                ? `/api/products/${productIdInput.value}/edit/`
                : '/api/products/add/';

            const productRes = await fetch(productEndpoint, {
                method: 'POST', // pakai POST (kecuali kamu mau pakai PUT di backend)
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                credentials: 'include',
                body: formData,
            });

            const productData = await productRes.json();

            if (productRes.ok && productData.success) {
                alert(isProductEdit ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!');
                addProductForm.reset();
                if (productIdInput) productIdInput.remove(); // Hapus input hidden setelah edit
                showSection('products');
                loadProductTable();
            } else {
                alert(data.message || 'Gagal memproses produk.');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Terjadi kesalahan saat menyimpan.');
        }
    });

    addCategoryForm.addEventListener('submit', async function (event) {
        console.log('submit category')
        event.preventDefault();

        const categoryIdInput = document.getElementById('categoryId'); // cek hidden input
        const isCategoryEdit = categoryIdInput && categoryIdInput.value;

        const categoryFormData = new FormData();
        categoryFormData.append('name', document.getElementById('categoryName').value);

        try {
            const categoryEndpoint = isCategoryEdit
                ? `/api/categories/${categoryIdInput.value}/edit/`
                : '/api/categories/add/';

            const categoryRes = await fetch(categoryEndpoint, {
                method: 'POST', // pakai POST (kecuali kamu mau pakai PUT di backend)
                headers: { 'X-CSRFToken': getCookie('csrftoken') },
                credentials: 'include',
                body: categoryFormData,
            });

            const categoryData = await categoryRes.json();

            if (categoryRes.ok && categoryData.success) {
                alert(isCategoryEdit ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
                addCategoryForm.reset();
                if (categoryIdInput) categoryIdInput.remove(); // Hapus input hidden setelah edit
                showSection('categories');
                loadCategoryTable();
            } else {
                alert(data.message || 'Gagal memproses Kategori.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Terjadi kesalahan saat menyimpan.');
        }
    });

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id !== sectionId) {
                const formsInside = section.querySelectorAll('.content-section[id$="-form"]');
                formsInside.forEach(form => form.style.display = 'none');
            }
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add('active');

        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            currentSectionTitle.textContent = activeLink.textContent.trim();
            activeLink.classList.add('active');
        } else if (sectionId === 'home') {
            currentSectionTitle.textContent = "TerusanMinimarket";
        }

        updateHeaderActions(sectionId);

        if (sectionId === 'dashboard') {
            loadDashboardStats(); // 🔥 Muat data statistik dashboard dari API
        }
    }

    function updateHeaderActions(sectionId) {
        headerActionsContainer.innerHTML = '';
        if (sectionId === 'products') {
            headerActionsContainer.innerHTML = `
                <button class="btn btn-success add-new-btn" data-target-form="add-product-form-div"><i class="fas fa-plus"></i> Tambah Produk</button>`;
                // <button class="btn btn-outline-secondary"><i class="fas fa-filter"></i> Filter</button>`;
        } else if (sectionId === 'categories') {
            headerActionsContainer.innerHTML = `
                <button class="btn btn-success add-new-btn" data-target-form="add-category-form-div"><i class="fas fa-plus"></i> Tambah Kategori</button>`;
        } else if (sectionId === 'orders') {
            // headerActionsContainer.innerHTML = `
            //     <button class="btn btn-outline-secondary"><i class="fas fa-filter"></i> Filter Status</button>
            //     <button class="btn btn-outline-secondary"><i class="fas fa-calendar-alt"></i> Filter Tanggal</button>`;
        } else if (sectionId === 'users') {
            // headerActionsContainer.innerHTML = `
            //     <button class="btn btn-outline-secondary"><i class="fas fa-filter"></i> Filter Role</button>`;
        } else if (sectionId === 'analytics') {
            // headerActionsContainer.innerHTML = `
            //     <button class="btn btn-primary"><i class="fas fa-download"></i> Unduh Laporan</button>`;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.dataset.section;
            if (sectionId) {
                showSection(sectionId);
            } else if (this.classList.contains('logout-link')) {
                window.location.href = this.href;
            }
        });
    });

    document.addEventListener('click', function(event) {
        if (event.target.closest('.add-new-btn')) {
            const button = event.target.closest('.add-new-btn');
            const targetFormId = button.dataset.targetForm;
            const currentSection = button.closest('.content-section');

            if (currentSection) currentSection.classList.remove('active');
            const targetForm = document.getElementById(targetFormId);
            if (targetForm) {
                targetForm.classList.add('active');
                targetForm.style.display = 'block';
                currentSectionTitle.textContent = targetForm.querySelector('h2').textContent.trim();
                headerActionsContainer.innerHTML = '';
            }
        }

        if (event.target.closest('.cancel-form-btn')) {
            const button = event.target.closest('.cancel-form-btn');
            const targetSectionId = button.dataset.targetSection;
            const currentForm = button.closest('.content-section');

            if (currentForm) {
                currentForm.classList.remove('active');
                currentForm.style.display = 'none';
            }
            showSection(targetSectionId);
        }

    });

    document.addEventListener('click', async function (event) {
        
        const productDeleteBtn = event.target.closest('.btn-sm[product-data-action="delete"]');
        const categoryDeleteBtn = event.target.closest('.btn-sm[category-data-action="delete"]');
        if (productDeleteBtn) {
            const productId = productDeleteBtn.dataset.id;

            const confirmDelete = confirm(`Yakin ingin menghapus produk dengan ID ${productId}?`);
            if (!confirmDelete) return;

            try {
                const res = await fetch(`/api/products/${productId}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    credentials: 'include',
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    alert('Produk berhasil dihapus.');
                    loadProductTable(); // refresh tabel
                } else {
                    alert(data.message || 'Gagal menghapus produk.');
                }
            } catch (error) {
                console.error('Gagal menghapus produk:', error);
                alert('Terjadi kesalahan saat menghapus produk.');
            }
        }

        if (categoryDeleteBtn) {
            const categoryId = categoryDeleteBtn.dataset.id;

            const confirmDelete = confirm(`Yakin ingin menghapus kategory dengan ID ${categoryId}?`);
            if (!confirmDelete) return;

            try {
                const res = await fetch(`/api/category/${categoryId}/delete/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    credentials: 'include',
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    alert('Kategori berhasil dihapus.');
                    loadCategoryTable(); // refresh tabel
                } else {
                    alert(data.message || 'Gagal menghapus Kategori.');
                }
            } catch (error) {
                console.error('Gagal menghapus Kategori:', error);
                alert('Terjadi kesalahan saat menghapus Kategori.');
            }
        }

      const productEditBtn = event.target.closest('.btn-sm[product-data-action="edit"]');
      const categoryEditBtn = event.target.closest('.btn-sm[category-data-action="edit"]');
      if (productEditBtn) {
          const productId = productEditBtn.dataset.id;

          try {
              const res = await fetch(`/api/products/${productId}/`);
              const product = await res.json();

              document.getElementById('productName').value = product.name;
              document.getElementById('productCategory').value = product.category_id || "";
              document.getElementById('productStock').value = product.stock;
              document.getElementById('productPrice').value = product.price;
              document.getElementById('productDescription').value = product.description;

              let hiddenId = document.getElementById('productId');
              if (!hiddenId) {
                  hiddenId = document.createElement('input');
                  hiddenId.type = 'hidden';
                  hiddenId.id = 'productId';
                  hiddenId.name = 'id';
                  document.getElementById('add-product-form').appendChild(hiddenId);
              }
              hiddenId.value = product.id;

              // ✅ Tampilkan form edit
              const formDiv = document.getElementById('add-product-form-div');
              if (formDiv) {
                  formDiv.style.display = 'block';
                  formDiv.classList.add('active');
              }

              // ✅ Ubah judul section
              if (currentSectionTitle) {
                  currentSectionTitle.textContent = 'Edit Produk';
              }

              // ✅ Bersihkan tombol aksi
              if (headerActionsContainer) {
                  headerActionsContainer.innerHTML = '';
              }

          } catch (err) {
              console.error('Gagal memuat data produk:', err);
              alert('Gagal memuat data produk.');
          }
      }

      if (categoryEditBtn) {
          const categoryId = categoryEditBtn.dataset.id;

          try {
              const res = await fetch(`/api/categories/${categoryId}/`);
              const category = await res.json();

              document.getElementById('categoryName').value = category.name;

              let hiddenId = document.getElementById('categoryId');
              if (!hiddenId) {
                  hiddenId = document.createElement('input');
                  hiddenId.type = 'hidden';
                  hiddenId.id = 'categoryId';
                  hiddenId.name = 'id';
                  document.getElementById('add-category-form').appendChild(hiddenId);
              }
              hiddenId.value = category.id;

              // ✅ Tampilkan form edit
              const formDiv = document.getElementById('add-category-form-div');
              if (formDiv) {
                  formDiv.style.display = 'block';
                  formDiv.classList.add('active');
              }

              // ✅ Ubah judul section
              if (currentSectionTitle) {
                  currentSectionTitle.textContent = 'Edit Kategori';
              }

              // ✅ Bersihkan tombol aksi
              if (headerActionsContainer) {
                  headerActionsContainer.innerHTML = '';
              }

          } catch (err) {
              console.error('Gagal memuat data kategori:', err);
              alert('Gagal memuat data kategori.');
          }
      }
    });

    
    const downloadBtn = document.getElementById("downloadExcelBtn");

    if (downloadBtn) {
        downloadBtn.addEventListener("click", async () => {
            try {
                const response = await fetch("/api/analytics/export-excel/", {
                    method: "GET",
                    headers: {
                    "X-Requested-With": "XMLHttpRequest"
                    }
                });

                if (!response.ok) throw new Error("Gagal mengunduh laporan.");

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "LaporanPenjualan.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                console.error("Error download laporan:", err);
                alert("Gagal mengunduh laporan penjualan.");
            }
        });
    }

    document.getElementById("ordersTableBody").addEventListener("click", async (e) => {
        const target = e.target.closest("button");
        if (!target) return;

        const action = target.dataset.action;
        const orderId = target.dataset.id;

        if (action === "detail") {
            showOrderDetail(orderId);
        }

        if (action === "cancel") {
            const confirmCancel = confirm("Yakin ingin membatalkan pesanan ini?");
            if (confirmCancel) {
                await cancelOrder(orderId);
                loadOrdersTable(); // Refresh tabel setelah cancel
            }
        }
    });

    showSection('dashboard');

    // const formDiv = document.getElementById('add-product-form-div');
    // if (formDiv) {
    //   formDiv.classList.add('active');
    //   formDiv.style.display = 'block';
    // }
});


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function loadProductTable() {
    try {
        const res = await fetch('/api/products/');
        const data = await res.json();
        const tbody = document.getElementById('productTableBody');

        if (tbody) {
            tbody.innerHTML = '';
            data.products.forEach(product => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>P${String(product.id).padStart(3, '0')}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>Rp ${parseInt(product.price).toLocaleString()}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn btn-sm btn-info" product-data-action="edit" data-id="${product.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" product-data-action="delete" data-id="${product.id}">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                    </td>`;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

async function loadCategoryTable() {
    try {
        const res = await fetch('/api/categories/');
        const data = await res.json();
        const tbody = document.getElementById('categoryTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            data.categories.forEach(category => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>C${String(category.id).padStart(3, '0')}</td>
                    <td>${category.name}</td>
                    <td>${category.product_count || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-info" category-data-action="edit" data-id="${category.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" category-data-action="delete" data-id="${category.id}">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                    </td>`;
                tbody.appendChild(tr);
            });
        }

        const categorySelect = document.getElementById('productCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}

async function loadOrdersTable() {
    try {
        const res = await fetch('/api/orders/');
        const data = await res.json();
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            data.orders.forEach(order => {
                const tr = document.createElement('tr');
                const statusClass = `status-${order.payment_status.toLowerCase()}`;

                tr.innerHTML = `
                    <td>#${order.order_id}</td>
                    <td>${order.user__username || 'Guest'}</td>
                    <td>${new Date(order.created_at).toISOString().split('T')[0]}</td>
                    <td>Rp ${parseInt(order.total_price).toLocaleString('id-ID')}</td>
                    <td><span class="${statusClass}">${order.payment_status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info" data-action="detail" data-id="${order.id}">
                            <i class="fas fa-info-circle"></i> Detail
                        </button>
                        <button class="btn btn-sm btn-danger" data-action="cancel" data-id="${order.id}">
                            <i class="fas fa-times"></i> Batal
                        </button>
                    </td>`;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}


async function showOrderDetail(orderId) {
    try {
        const res = await fetch(`/api/orders/${orderId}/`);
        if (!res.ok) throw new Error("Gagal mengambil detail pesanan");
        const order = await res.json();

        console.log(order)
        // Tampilkan detail (gunakan modal atau alert sementara)
        alert(`
            Order ID: #${order.order_id}
            User: ${order.user__username || 'Guest'}
            Tanggal: ${new Date(order.created_at).toLocaleDateString()}
            Total: Rp ${parseInt(order.total_price).toLocaleString('id-ID')}
            Status: ${order.payment_status}
            Alamat: ${order.shipping_address}
        `);
    } catch (err) {
        console.error("Gagal mengambil detail order:", err);
        alert("Gagal mengambil detail pesanan.");
    }
}


async function cancelOrder(orderId) {
    try {
        const res = await fetch(`/api/orders/${orderId}/cancel/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': getCookie('csrftoken'),
            },
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Gagal membatalkan pesanan.");
        alert("Pesanan berhasil dibatalkan.");
    } catch (err) {
        console.error("Error cancel:", err);
        alert("Gagal membatalkan pesanan.");
    }
}

async function loadUsersTable() {
    try {
        const res = await fetch('/api/users/');
        const data = await res.json();
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            data.users.forEach(user => {
                const tr = document.createElement('tr');

                const fullName = `${user.first_name} ${user.last_name}`.trim() || user.username;
                const phone = user.profile?.phone || '-';
                const statusText = user.is_active ? 'Aktif' : 'Nonaktif';
                const statusClass = user.is_active ? 'status-completed' : 'status-disabled';

                tr.innerHTML = `
                    <td>U${String(user.id).padStart(3, '0')}</td>
                    <td>${fullName}</td>
                    <td>${user.email}</td>
                    <td>${phone}</td>
                    <td><span class="${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                            Hapus
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Failed to load users:', err);
    }
}

async function deleteUser(userId) {
    if (!confirm('Yakin ingin menghapus pengguna ini?')) return;

    try {
        const res = await fetch(`/api/users/${userId}/delete/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // pastikan fungsi getCookie() tersedia
            },
            credentials: 'include',
        });

        if (res.ok) {
            alert('Pengguna berhasil dihapus.');
            loadUsersTable(); // refresh tabel setelah hapus
        } else {
            alert('Gagal menghapus pengguna.');
        }
    } catch (err) {
        console.error('Delete error:', err);
        alert('Terjadi kesalahan jaringan.');
    }
}


async function loadSettings() {
    try {
        const res = await fetch("/api/settings/");
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Server Error:", errorText);
            throw new Error("Gagal fetch data dari server");
        }

        const data = await res.json();

        document.getElementById("storeName").value = data.store_name || "";
        document.getElementById("storeEmail").value = data.store_email || "";
        document.getElementById("storePhone").value = data.store_phone || "";
        document.getElementById("shippingCost").value = data.shipping_cost || 0;
        document.getElementById("freeShippingMin").value = data.free_shipping_min || 0;
        document.getElementById("payMethodBank").checked = data.enable_bank_transfer;
        document.getElementById("payMethodOVO").checked = data.enable_cod;

    } catch (error) {
        console.error('Gagal memuat Setting :', error);
    }
}

async function loadDashboardStats() {
    try {
        const res = await fetch('/api/dashboard-summary/');
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Server Error:", errorText);
            throw new Error("Gagal fetch data dari server");
        }

        const data = await res.json();

        document.querySelector('#dashboard .stats-grid .stat-card:nth-child(1) p').textContent =
            `Rp ${parseInt(data.total_penjualan).toLocaleString()}`;
        document.querySelector('#dashboard .stats-grid .stat-card:nth-child(2) p').textContent =
            data.pesanan_baru;
        document.querySelector('#dashboard .stats-grid .stat-card:nth-child(3) p').textContent =
            data.jumlah_produk;
        document.querySelector('#dashboard .stats-grid .stat-card:nth-child(4) p').textContent =
            data.pelanggan_baru;

        const activityList = document.querySelector('#dashboard .recent-activities ul');
        activityList.innerHTML = '';

        const aktivitas = Array.isArray(data.aktivitas) ? data.aktivitas : [];

        aktivitas.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            activityList.appendChild(li);
        });

    } catch (error) {
        console.error('Gagal memuat ringkasan dashboard:', error);
    }
}

// Fungsi ambil CSRF token dari cookie (jika pakai fetch API)
function getCSRFToken() {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
  return cookieValue;
}