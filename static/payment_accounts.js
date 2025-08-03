// payment_accounts.js - Logic for displaying shop's payment details (bank accounts, QRIS)

document.addEventListener("DOMContentLoaded", function() {
    // --- DOM Elements ---
    const bankAccountsList = document.getElementById("bankAccountsList");
    const qrisImage = document.getElementById("qrisImage");
    const qrisSection = document.getElementById("qrisSection");
    const confirmPaymentBtn = document.getElementById("confirmPaymentBtn"); // New: Get the button

    // --- Mock Data (Simulasi data pembayaran toko) ---
    // Dalam implementasi nyata, data ini mungkin diambil dari backend (misalnya, dari pengaturan admin).
    const shopPaymentDetails = {
        bankAccounts: [
            {
                id: 'seabank',
                bankName: 'Seabank',
                accountHolderName: 'PT Terusan Minimarket',
                accountNumber: '901601613325',
                note: 'A/N Farah Fauziah'
            },
            {
                id: 'blubca',
                bankName: 'Blu BCA',
                accountHolderName: 'PT Terusan Minimarket',
                accountNumber: '005127535510',
                note: 'A/N Farah Fauziah'
            }
        ],
        qris: {
            // GUNAKAN VARIABEL GLOBAL YANG DIDEFINISIKAN DI HTML DI SINI
            imageUrl: typeof QRIS_IMAGE_STATIC_URL !== 'undefined' ? QRIS_IMAGE_STATIC_URL : '',
            altText: "QRIS Code",
            isActive: true
        }
    };

    function renderBankAccounts() {
        if (!bankAccountsList) return;
        bankAccountsList.innerHTML = '';

        if (shopPaymentDetails.bankAccounts && shopPaymentDetails.bankAccounts.length > 0) {
            shopPaymentDetails.bankAccounts.forEach(account => {
                const accountItem = document.createElement('div');
                accountItem.className = 'payment-info-item';
                accountItem.innerHTML = `
                    <p><strong>${account.bankName}</strong></p>
                    <p>Nama Rekening: ${account.accountHolderName}</p>
                    <p>Nomor Rekening: ${account.accountNumber}</p>
                    ${account.note ? `<p class="small-text"><em>(${account.note})</em></p>` : ''}
                `;
                bankAccountsList.appendChild(accountItem);
            });
        } else {
            bankAccountsList.innerHTML = '<p>Belum ada informasi rekening bank yang tersedia.</p>';
        }
    }

    /**
     * Renders the QRIS information.
     */
    function renderQRIS() {
        if (!qrisImage || !qrisSection) return;

        if (shopPaymentDetails.qris && shopPaymentDetails.qris.isActive && shopPaymentDetails.qris.imageUrl) {
            qrisImage.src = shopPaymentDetails.qris.imageUrl;
            qrisImage.alt = shopPaymentDetails.qris.altText;
            qrisSection.style.display = 'block';
        } else {
            qrisSection.style.display = 'none';
        }
    }

    // --- Initial Load ---
    renderBankAccounts();
    renderQRIS();

    // New: Add event listener for the confirmation button
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener("click", function() {
            // Use the global variable defined in the HTML
            if (typeof CONFIRMATION_PAYMENT_URL !== 'undefined') {
                window.location.href = CONFIRMATION_PAYMENT_URL;
            } else {
                console.error("CONFIRMATION_PAYMENT_URL is not defined in the HTML.");
            }
        });
    }

    // Ensure UI is updated based on authentication status (for header)
    if (window.updateAuthUI) {
        window.updateAuthUI();
    }
});