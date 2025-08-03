// return_req.js

document.addEventListener('DOMContentLoaded', () => {
    const returnRequestForm = document.getElementById('returnRequestForm');
    const returnReasonSelect = document.getElementById('returnReason');
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    const otherReasonTextarea = document.getElementById('otherReason');
    const productImageInput = document.getElementById('productImage');
    const imagePreviewDiv = document.getElementById('imagePreview');
    const returnMessageArea = document.getElementById('returnMessage'); // This is for general form messages
    const submitReturnButton = returnRequestForm ? returnRequestForm.querySelector('button[type="submit"]') : null;


    // Header elements
    const profileSection = document.getElementById('profileSection');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const authButtons = document.getElementById('authButtons');

    // --- Start of Header Logic ---

    // Mock User Data and Login Status (for demonstration)
    // In a real application, this would come from a backend API call
    const MOCK_LOGGED_IN_USER = {
        username: "mohammadadzaki18",
        isLoggedIn: true // Set to true to simulate logged in, false for logged out
    };

    function checkLoginStatusAndRenderHeader() {
        // In a real app, you'd fetch user data from a server or check a token
        const user = MOCK_LOGGED_IN_USER; // Use mock data for now

        if (user && user.isLoggedIn) {
            if (profileSection && usernameDisplay) {
                usernameDisplay.textContent = user.username;
                profileSection.style.display = 'flex';
            }
            if (authButtons) {
                authButtons.style.display = 'none';
            }
        } else {
            if (profileSection) {
                profileSection.style.display = 'none';
            }
            if (authButtons) {
                authButtons.style.display = 'flex';
            }
        }
    }

    // Call on page load
    checkLoginStatusAndRenderHeader();

    // Toggle profile dropdown
    if (profileSection) {
        profileSection.addEventListener('click', (event) => {
            const profileDropdown = profileSection.querySelector('.profile-dropdown');
            if (profileDropdown) {
                profileDropdown.classList.toggle('show');
            }
            event.stopPropagation(); // Prevent document click from closing it immediately
        });
    }

    // Close profile dropdown if clicked outside
    document.addEventListener('click', (event) => {
        const profileDropdown = profileSection ? profileSection.querySelector('.profile-dropdown') : null;
        if (profileDropdown && !profileSection.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Handle Logout (mock function)
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            // In a real app, send a request to log out and clear session/token
            MOCK_LOGGED_IN_USER.isLoggedIn = false; // Simulate logout
            MOCK_LOGGED_IN_USER.username = "";
            checkLoginStatusAndRenderHeader(); // Re-render header
            alert('Anda telah berhasil keluar.'); // Or show a toast notification
            // Redirect to home or login page
            // window.location.href = "/";
        });
    }

    // Mock Login/Register/Forgot Password (similar to dashboard.js)
    const loginOverlay = document.getElementById('authOverlay');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const otpVerificationForm = document.getElementById('otpVerificationForm');

    function showAuthOverlay(formToShow) {
        if (loginOverlay) {
            loginOverlay.classList.add('show');
            [loginForm, registerForm, forgotPasswordForm, otpVerificationForm].forEach(form => {
                if (form) form.style.display = 'none';
            });
            if (formToShow) {
                formToShow.style.display = 'block';
            }
        }
    }

    function hideAuthOverlay() {
        if (loginOverlay) {
            loginOverlay.classList.remove('show');
        }
    }

    // Attach event listeners for showing forms
    document.getElementById('showLogin')?.addEventListener('click', () => showAuthOverlay(loginForm));
    document.getElementById('showRegister')?.addEventListener('click', () => showAuthOverlay(registerForm));
    document.getElementById('showRegisterFromLogin')?.addEventListener('click', () => showAuthOverlay(registerForm));
    document.getElementById('showLoginFromRegister')?.addEventListener('click', () => showAuthOverlay(loginForm));
    document.getElementById('showForgotFromLogin')?.addEventListener('click', () => showAuthOverlay(forgotPasswordForm));
    document.getElementById('showLoginFromForgot')?.addEventListener('click', () => showAuthOverlay(loginForm));

    // Close button for overlay
    document.getElementById('closeAuthOverlay')?.addEventListener('click', hideAuthOverlay);

    // Event listener for Escape key to close overlay
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && loginOverlay && loginOverlay.classList.contains('show')) {
            hideAuthOverlay();
        }
    });


    // Dummy login/register/forgot password/OTP submission
    document.getElementById('btnLoginSubmit')?.addEventListener('click', (event) => {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const loginError = document.getElementById('loginError');

        if (username === 'user' && password === 'pass') {
            displayMessage(loginError, '', ''); // Clear error
            MOCK_LOGGED_IN_USER.username = username;
            MOCK_LOGGED_IN_USER.isLoggedIn = true;
            checkLoginStatusAndRenderHeader();
            hideAuthOverlay();
            showToast('Login berhasil!', 'success');
        } else {
            displayMessage(loginError, 'Username atau password salah.', 'error');
        }
    });

    document.getElementById('btnRegisterSubmit')?.addEventListener('click', (event) => {
        event.preventDefault();
        const regEmail = document.getElementById('regEmail').value;
        const regPassword = document.getElementById('regPassword').value;
        const registerError = document.getElementById('registerError');

        if (regEmail && regPassword) {
            displayMessage(registerError, '', ''); // Clear error
            showAuthOverlay(otpVerificationForm); // Move to OTP verification
            document.getElementById('otpMessage').textContent = `Masukkan kode OTP yang telah dikirim ke ${regEmail}.`;
            showToast('Registrasi berhasil, silakan verifikasi OTP Anda.', 'info');
        } else {
            displayMessage(registerError, 'Email dan password tidak boleh kosong.', 'error');
        }
    });

    document.getElementById('btnResetPassword')?.addEventListener('click', (event) => {
        event.preventDefault();
        const forgotId = document.getElementById('forgotId').value;
        const forgotError = document.getElementById('forgotError');

        if (forgotId) {
            displayMessage(forgotError, '', ''); // Clear error
            showAuthOverlay(otpVerificationForm); // Move to OTP verification
            document.getElementById('otpMessage').textContent = `Masukkan kode OTP yang telah dikirim ke ${forgotId}.`;
            showToast('Link reset kata sandi telah dikirim. Silakan cek email/nomor telepon Anda.', 'info');
        } else {
            displayMessage(forgotError, 'Username / Email / No. Telepon tidak boleh kosong.', 'error');
        }
    });

    document.getElementById('btnVerifyOtp')?.addEventListener('click', (event) => {
        event.preventDefault();
        const otpInput = document.getElementById('otpInput').value;
        // In a real app, send OTP to backend for verification
        if (otpInput === '123456') { // Mock OTP
            hideAuthOverlay();
            showToast('Verifikasi OTP berhasil!', 'success');
        } else {
            displayMessage(document.getElementById('otpMessage'), 'Kode OTP salah. Coba lagi.', 'error');
        }
    });

    // --- End of Header Logic ---


    // Conditional display for "Other Reason" textarea
    if (returnReasonSelect && otherReasonGroup) {
        returnReasonSelect.addEventListener('change', (event) => {
            if (event.target.value === 'other') {
                otherReasonGroup.style.display = 'block';
                if (otherReasonTextarea) {
                    otherReasonTextarea.setAttribute('required', 'required');
                }
            } else {
                otherReasonGroup.style.display = 'none';
                if (otherReasonTextarea) {
                    otherReasonTextarea.removeAttribute('required');
                    otherReasonTextarea.value = ''; // Clear content when hidden
                }
            }
        });
        // Set initial state in case "Other" is default or pre-selected
        if (returnReasonSelect.value !== 'other' && otherReasonGroup) {
            otherReasonGroup.style.display = 'none';
        }
    }


    // Image Preview Functionality
    if (productImageInput && imagePreviewDiv) {
        productImageInput.addEventListener('change', (event) => {
            imagePreviewDiv.innerHTML = ''; // Clear previous previews
            const files = event.target.files;

            if (files.length === 0) {
                imagePreviewDiv.textContent = 'Tidak ada gambar yang dipilih.';
                return;
            }

            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = file.name;
                        imagePreviewDiv.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const p = document.createElement('p');
                    p.textContent = `File "${file.name}" bukan gambar dan tidak akan ditampilkan.`;
                    p.style.color = 'orange';
                    imagePreviewDiv.appendChild(p);
                }
            });
        });
    }


    // Handle Return Request Form Submission
    if (returnRequestForm) {
        returnRequestForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Clear previous messages
            displayMessage(returnMessageArea, '', '');

            const orderId = document.getElementById('orderId').value;
            const productName = document.getElementById('productName').value;
            const returnReason = document.getElementById('returnReason').value;
            const otherReason = document.getElementById('otherReason').value;
            const quantity = document.getElementById('quantity').value;
            const contactEmail = document.getElementById('contactEmail').value;
            const contactPhone = document.getElementById('contactPhone').value;
            const returnDescription = document.getElementById('returnDescription').value;
            const productImage = document.getElementById('productImage').files; // FileList object

            // Simple validation (can be expanded)
            if (!orderId || !productName || !returnReason || !quantity || !contactEmail || !contactPhone || !returnDescription) {
                displayMessage(returnMessageArea, 'Harap lengkapi semua bidang yang wajib diisi.', 'error');
                return;
            }

            if (returnReason === 'other' && !otherReason.trim()) {
                displayMessage(returnMessageArea, 'Harap isi alasan lainnya.', 'error');
                return;
            }

            if (submitReturnButton) {
                submitReturnButton.disabled = true; // Disable button to prevent multiple submissions
                submitReturnButton.textContent = 'Mengirim...';
            }


            // Simulate API call
            console.log('Mengirim permintaan pengembalian...');
            setTimeout(() => {
                const success = true; // Simulate success or failure

                if (success) {
                    displayMessage(returnMessageArea, 'Permintaan pengembalian Anda telah berhasil diajukan!', 'success');
                    showToast("Ajukan pengembalian terkirim, silahkan tunggu sampai disetujui.", "success");
                    returnRequestForm.reset(); // Clear the form
                    if (imagePreviewDiv) {
                        imagePreviewDiv.innerHTML = 'Tidak ada gambar yang dipilih.'; // Clear image preview
                    }
                    if (otherReasonGroup) {
                        otherReasonGroup.style.display = 'none'; // Hide other reason field
                    }
                } else {
                    displayMessage(returnMessageArea, 'Gagal mengajukan permintaan pengembalian. Silakan coba lagi.', 'error');
                    showToast("Gagal mengajukan pengembalian. Silakan coba lagi.", 'error');
                }

                if (submitReturnButton) {
                    submitReturnButton.disabled = false; // Re-enable button
                    submitReturnButton.textContent = 'Ajukan Pengembalian';
                }
                // Optionally scroll to top or message area for better UX
                returnMessageArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1500); // Simulate network delay
        });
    }

    function displayMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message-area'; // Reset classes
        if (type === 'success') {
            element.classList.add('success');
        } else if (type === 'error') {
            element.classList.add('error');
        } else if (type === 'info') {
             element.classList.add('info');
        }
        // Set aria-live for screen readers
        if (message) {
            element.setAttribute('aria-live', 'assertive');
        } else {
            element.removeAttribute('aria-live');
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;

        if (type) {
            toast.classList.add(type);
        }

        document.body.appendChild(toast);

        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100); // Small delay to allow CSS transition

        // Hide and remove the toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }


    // Add search functionality (similar to dashboard.js)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const query = searchInput.value;
                if (query) {
                    alert(`Mencari produk: ${query}`);
                    // In a real application, you would redirect to a search results page
                    // window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }
});