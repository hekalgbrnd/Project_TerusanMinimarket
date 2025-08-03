document.addEventListener("DOMContentLoaded", function() {
    // This page typically doesn't need complex JavaScript.
    // It primarily relies on global scripts for header, footer, and modals.

    // Ensure global listeners from dashboard.js are attached
    if (typeof window.attachGlobalListeners === 'function') {
        window.attachGlobalListeners();
    }
    // Update auth UI on page load
    if (typeof window.updateAuthUI === 'function') {
        window.updateAuthUI();
    }
});