console.log('order_history loaded3')

document.addEventListener('DOMContentLoaded', () => {
    // Memastikan fungsi-fungsi global dari dashboard.js tersedia dan UI autentikasi diperbarui.
    // checkLoginStatus akan memperbarui UI header (tombol login/daftar vs menu akun)
    if (typeof window.checkLoginStatus === 'function') {
        window.checkLoginStatus();
    }

    const orderListDiv = document.getElementById('order-list');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    const returnModal = document.getElementById('returnModal');
    const closeReturnModalBtn = document.getElementById('closeReturnModal');
    const returnOrderIdDisplay = document.getElementById('returnOrderIdDisplay');
    const returnItemsList = document.getElementById('returnItemsList');
    const returnReasonInput = document.getElementById('returnReason');
    const returnForm = document.getElementById('returnForm');
    const returnMessage = document.getElementById('returnMessage');

    let ordersData = []; // Akan diisi dengan data pesanan pengguna
    const ordersPerPage = 5;
    let currentPage = 0;
    let currentOrderForReturn = null; // To store the order being returned

//     async function fetchUserOrders() {
//     try {
//         console.log("[DEBUG] Memulai fetch pesanan...");

//         const res = await fetch('/api/orders/', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': getCookie("csrftoken"),
//             },
//             credentials: 'include'
//         });

//         console.log("[DEBUG] Response status:", res.status);

//         if (res.status === 401 || res.status === 403) {
//             console.warn("[WARN] User belum login atau tidak memiliki akses.");
//             noOrdersMessage.style.display = 'block';
//             noOrdersMessage.innerHTML = `
//                 <p class="text-secondary text-center">
//                     Anda harus login untuk melihat riwayat pesanan. Kembali ke <a href="/">Dashboard</a>.
//                 </p>`;
//             orderListDiv.innerHTML = '';
//             loadMoreBtn.style.display = 'none';
//             return [];
//         }

//         let responseData = {};
//         try {
//             responseData = await res.json();
//             console.log("[DEBUG] Data orders (raw):", responseData);
//         } catch (jsonErr) {
//             console.error("[ERROR] Gagal parsing JSON:", jsonErr);
//             throw new Error("Response dari server bukan JSON yang valid.");
//         }

//         const dataOrders = responseData.orders;

//         if (!Array.isArray(dataOrders)) {
//             console.error("[ERROR] Format data orders tidak sesuai. Key 'orders' harus berupa array.");
//             throw new Error("Format data tidak valid: 'orders' bukan array.");
//         }

//         if (dataOrders.length === 0) {
//             console.log("[INFO] Tidak ada pesanan untuk user ini.");
//             noOrdersMessage.style.display = 'block';
//             noOrdersMessage.innerHTML = `
//                 <p class="text-secondary text-center">
//                     Anda belum memiliki pesanan. Kembali ke <a href="/">Dashboard</a>.
//                 </p>`;
//             orderListDiv.innerHTML = '';
//             loadMoreBtn.style.display = 'none';
//             return [];
//         }

//         // Urutkan berdasarkan tanggal terbaru
//         dataOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//         console.log("[DEBUG] Data orders setelah sorting:", dataOrders);

//         const transformedOrders = dataOrders.map(order => {
//             try {
//                 return {
//                     orderId: order.order_id,
//                     date: order.created_at,
//                     status: order.status,
//                     total: order.total,
//                     items: Array.isArray(order.items) ? order.items.map(item => ({
//                         name: item.product_name || "Produk",
//                         quantity: item.quantity,
//                         price: item.price
//                     })) : []
//                 };
//             } catch (mapErr) {
//                 console.error(`[ERROR] Gagal transformasi order ${order.order_id}:`, mapErr);
//                 return null;
//             }
//         }).filter(order => order !== null);

//         console.log("[DEBUG] transformedOrders:", transformedOrders);
//         return transformedOrders;

//     } catch (err) {
//         console.error("[FATAL] Gagal memuat data pesanan:", err);
//         noOrdersMessage.style.display = 'block';
//         noOrdersMessage.innerHTML = `
//             <p class="text-danger text-center">
//                 Terjadi kesalahan saat mengambil data pesanan. Silakan coba lagi nanti.
//             </p>`;
//         orderListDiv.innerHTML = '';
//         loadMoreBtn.style.display = 'none';
//         return [];
//     }
// }


    async function fetchUserOrders() {
        try {
            console.log("Memulai fetch pesanan...");

            const res = await fetch('/api/orders/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie("csrftoken"),
                },
                credentials: 'include'
            });

            if (res.status === 401 || res.status === 403) {
                noOrdersMessage.style.display = 'block';
                noOrdersMessage.innerHTML = `
                    <p class="text-secondary text-center">
                        Anda harus login untuk melihat riwayat pesanan. Kembali ke <a href="/">Dashboard</a>.
                    </p>`;
                orderListDiv.innerHTML = '';
                loadMoreBtn.style.display = 'none';
                return [];
            }

            const data = await res.json();
            console.log("Data pesanan:", data);
            const dataOrders = data.orders

            if (!Array.isArray(dataOrders) || dataOrders.length === 0) {
                noOrdersMessage.style.display = 'block';
                noOrdersMessage.innerHTML = `
                    <p class="text-secondary text-center">
                        Anda belum memiliki pesanan. Kembali ke <a href="/">Dashboard</a>.
                    </p>`;
                orderListDiv.innerHTML = '';
                loadMoreBtn.style.display = 'none';
                return [];
            }

            // Urutkan berdasarkan tanggal terbaru
            dataOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const transformedOrders = await Promise.all(dataOrders.map(async (order) => {
                const itemsRes = await fetch(`/api/order-items/?order_id=${order.order_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie("csrftoken"),
                    },
                    credentials: 'include'
                });

                let items = [];
                if (itemsRes.ok) {
                    items = await itemsRes.json();
                } else {
                    console.warn(`Gagal mengambil items untuk order ${order.order_id}`);
                }

                return {
                    orderId: order.order_id,
                    date: order.created_at,
                    status: order.payment_status,
                    total: order.total_price,
                    items: items.map(item => ({
                        name: item.product_name || "Produk",
                        quantity: item.quantity,
                        price: item.price
                    }))
                };
            }));

            console.log("transformedOrders:", transformedOrders);
            return transformedOrders;
        } catch (err) {
            console.error("Gagal memuat data pesanan:", err);
            noOrdersMessage.style.display = 'block';
            noOrdersMessage.innerHTML = `
                <p class="text-danger text-center">
                    Terjadi kesalahan saat mengambil data pesanan. Silakan coba lagi nanti.
                </p>`;
            orderListDiv.innerHTML = '';
            loadMoreBtn.style.display = 'none';
            return [];
        }
    }


    function renderOrders() {
        const ordersToDisplay = ordersData;
        // const startIndex = currentPage * ordersPerPage;
        // const endIndex = startIndex + ordersPerPage;
        // const ordersToDisplay = ordersData.slice(startIndex, endIndex);

        if (ordersToDisplay.length === 0 && currentPage === 0) {
            noOrdersMessage.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        } else {
            noOrdersMessage.style.display = 'none';
        }
        ordersToDisplay.forEach(order => {
            console.log(order);
            if (order.items.length == 0) return;
            const orderCard = document.createElement('div');
            orderCard.classList.add('order-card');

            const itemsHtml = order.items.map((item) => `
                <div class="item">
                    <span>${item.name} (${item.quantity}x)</span>
                    <span>Rp ${item.price.toLocaleString('id-ID')}</span>
                    ${item.returned ? '<span class="status-badge returned-item-badge">Dikembalikan</span>' : ''}
                </div>
            `).join('');

            // Only show return button for 'Selesai' (Completed) orders and if not all items are returned
            const allItemsReturned = order.items.every(item => item.returned);
            const returnButtonHtml = (order.status === 'Selesai' && !allItemsReturned) ?
                `<button class="btn btn-return" data-order-id="${order.orderId}">Ajukan Pengembalian</button>` : '';
            
            orderCard.innerHTML = `
                <h3>Pesanan #${order.orderId}</h3>
                <p><strong>Tanggal Pesanan:</strong> ${order.date}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></p>
                <div class="items-list">
                    <h4>Detail Item:</h4>
                    ${itemsHtml}
                </div>
                <p class="total">Total Pesanan: Rp ${order.total.toLocaleString('id-ID')}</p>
                <div class="order-actions">
                    ${returnButtonHtml}
                </div>
            `;
            orderListDiv.appendChild(orderCard);
        });

        // Add event listeners to newly created return buttons
        orderListDiv.querySelectorAll('.btn-return').forEach(button => {
            button.removeEventListener('click', handleReturnButtonClick); // Prevent duplicate listeners
            button.addEventListener('click', handleReturnButtonClick);
        });

        // Add event listeners to newly created buy again buttons
        orderListDiv.querySelectorAll('.btn-buy-again').forEach(button => {
            button.removeEventListener('click', handleBuyAgainButtonClick); // Prevent duplicate listeners
            button.addEventListener('click', handleBuyAgainButtonClick);
        });
        
        // Tampilkan/Sembunyikan tombol "Muat Lebih Banyak"
        if (endIndex >= ordersData.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    // function handleReturnButtonClick(event) {
    //     const orderId = event.target.dataset.orderId;
    //     currentOrderForReturn = ordersData.find(order => order.orderId === orderId);

    //     if (currentOrderForReturn) {
    //         returnOrderIdDisplay.textContent = currentOrderForReturn.orderId;
    //         returnItemsList.innerHTML = ''; // Clear previous items

    //         const itemsToDisplayForReturn = currentOrderForReturn.items.filter(item => !item.returned);

    //         if (itemsToDisplayForReturn.length === 0) {
    //             returnMessage.textContent = 'Semua item dalam pesanan ini sudah dikembalikan.';
    //             returnMessage.style.display = 'block';
    //             returnMessage.style.color = 'orange';
    //             // Optionally, hide the modal or disable submit if nothing to return
    //             return;
    //         }

    //         itemsToDisplayForReturn.forEach((item, index) => {
    //             // Find original index to mark 'returned' status correctly in ordersData
    //             // This logic needs to be careful if duplicate items exist and some are already returned.
    //             // For simplicity, we just take the first unreturned instance that matches.
    //             const originalIndex = currentOrderForReturn.items.findIndex(originalItem => 
    //                 originalItem.name === item.name && 
    //                 originalItem.price === item.price && 
    //                 originalItem.quantity === item.quantity &&
    //                 !originalItem.returned // Ensure we target the specific unreturned item instance if duplicates exist
    //             );
                
    //             if (originalIndex !== -1) {
    //                 const checkboxDiv = document.createElement('div');
    //                 checkboxDiv.innerHTML = `
    //                     <label>
    //                         <input type="checkbox" name="returnItem" value="${originalIndex}">
    //                         ${item.name} (${item.quantity}x) - Rp ${item.price.toLocaleString('id-ID')}
    //                     </label>
    //                 `;
    //                 returnItemsList.appendChild(checkboxDiv);
    //             }
    //         });

    //         returnReasonInput.value = ''; // Clear previous reason
    //         returnMessage.style.display = 'none'; // Hide any previous messages
    //         returnModal.style.display = 'flex'; // Use flex to center the modal
    //     }
    // }

    // function handleBuyAgainButtonClick(event) {
    //     const orderId = event.target.dataset.orderId;
    //     const orderToReorder = ordersData.find(order => order.orderId === orderId);

    //     if (orderToReorder) {
    //         // Simulate adding items to cart
    //         let cart = JSON.parse(localStorage.getItem('cart')) || [];

    //         orderToReorder.items.forEach(item => {
    //             const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    //             if (existingItemIndex > -1) {
    //                 cart[existingItemIndex].quantity += item.quantity;
    //             } else {
    //                 // Add a dummy image URL. In a real application, this would come from product data.
    //                 // For demonstration, we use a placeholder image.
    //                 cart.push({ ...item, image: 'https://via.placeholder.com/50' }); 
    //             }
    //         });
    //         localStorage.setItem('cart', JSON.stringify(cart));

    //         // Trigger cart UI update if a function exists in dashboard.js
    //         if (typeof window.updateCartUI === 'function') {
    //             window.updateCartUI(); 
    //         }

    //         // Show a toast notification
    //         if (typeof window.showToast === 'function') {
    //             window.showToast('Produk dari pesanan ini telah ditambahkan ke keranjang!', 'success');
    //         }
    //         console.log(`Order ${orderId} items added to cart for re-purchase.`);
    //     }
    // }

    // Event listener for closing the return modal
    if (closeReturnModalBtn) {
        closeReturnModalBtn.addEventListener('click', () => {
            if (returnModal) returnModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === returnModal) {
            returnModal.style.display = 'none';
        }
    });

    // Handle return form submission
    // if (returnForm) {
    //     returnForm.addEventListener('submit', (event) => {
    //         event.preventDefault();

    //         const reason = returnReasonInput.value.trim();
    //         const selectedItemsCheckboxes = returnItemsList.querySelectorAll('input[name="returnItem"]:checked');
    //         const selectedItemsIndices = Array.from(selectedItemsCheckboxes).map(checkbox => parseInt(checkbox.value));

    //         if (!reason) {
    //             returnMessage.textContent = 'Alasan pengembalian tidak boleh kosong.';
    //             returnMessage.style.display = 'block';
    //             returnMessage.style.color = 'red';
    //             return;
    //         }

    //         if (selectedItemsIndices.length === 0) {
    //             returnMessage.textContent = 'Pilih setidaknya satu item untuk dikembalikan.';
    //             returnMessage.style.display = 'block';
    //             returnMessage.style.color = 'red';
    //             return;
    //         }

    //         // Simulate API call for return request
    //         console.log(`Return request for Order ID: ${currentOrderForReturn.orderId}`);
    //         console.log(`Reason: ${reason}`);
    //         console.log('Selected Items:', selectedItemsIndices.map(index => currentOrderForReturn.items[index].name));

    //         // Mark items as returned (for demonstration purposes in localStorage)
    //         selectedItemsIndices.forEach(index => {
    //             if (currentOrderForReturn && currentOrderForReturn.items[index]) {
    //                 currentOrderForReturn.items[index].returned = true;
    //             }
    //         });

    //         // Update the order's status if all items in the original order are returned
    //         const allItemsInOrderReturned = currentOrderForReturn.items.every(item => item.returned);
    //         if (allItemsInOrderReturned) {
    //             currentOrderForReturn.status = 'Dikembalikan'; // New status for fully returned orders
    //         }

    //         // Save updated orders data to localStorage
    //         if (typeof window.loadUserFromLocalStorage === 'function') {
    //             const currentUser = window.loadUserFromLocalStorage();
    //             if (currentUser) {
    //                 const ordersKey = `orders_${currentUser.username}`;
    //                 localStorage.setItem(ordersKey, JSON.stringify(ordersData));
    //             }
    //         } else {
    //              console.error("Cannot save order history: window.loadUserFromLocalStorage is not defined.");
    //         }

    //         returnMessage.textContent = 'Permintaan pengembalian Anda telah diajukan. Kami akan segera memprosesnya.';
    //         returnMessage.style.display = 'block';
    //         returnMessage.style.color = 'green';

    //         // Clear and re-render orders after a short delay to show changes
    //         setTimeout(() => {
    //             if (returnModal) returnModal.style.display = 'none';
    //             if (orderListDiv) orderListDiv.innerHTML = ''; // Clear current display
    //             currentPage = 0; // Reset pagination
    //             ordersData = fetchUserOrders(); // Re-fetch updated data
    //             renderOrders(); // Render with updated data
    //             if (typeof window.showToast === 'function') {
    //                 window.showToast('Permintaan pengembalian berhasil diajukan!', 'success');
    //             }
    //         }, 1500); // Simulate processing time
    //     });
    // }

    // Event listener untuk tombol "Muat Lebih Banyak"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderOrders();
        });
    }
    // console.log(ordersData);

    // Inisialisasi halaman saat DOM selesai dimuat
    fetchUserOrders().then(data => {
        console.log('hasil: ', data)
        ordersData = data;
        console.log(ordersData);
        renderOrders();
    });

});