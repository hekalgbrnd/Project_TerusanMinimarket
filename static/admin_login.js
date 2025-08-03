// admin_login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        // Simple hardcoded check for demonstration (NOT secure)
        if (username === 'admin' && password === 'admin123') {
            loginMessage.textContent = 'Login successful! Redirecting...';
            loginMessage.className = 'login-message'; // Reset class
            loginMessage.style.display = 'block';
            // In a real application, you'd set a session cookie/token here
            // Assuming your Django static files setup correctly resolves 'admin_dashboard' URL
            window.location.href = '/admin-panel/'; // Adjust this if your URL pattern is different
        } else {
            loginMessage.textContent = 'Invalid username or password.';
            loginMessage.className = 'login-message error'; // Add error class
            loginMessage.style.display = 'block';
        }
    });
});