document.addEventListener("DOMContentLoaded", function() {
    const paymentConfirmationForm = document.getElementById("paymentConfirmationForm");

    if (paymentConfirmationForm) {
        paymentConfirmationForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(paymentConfirmationForm);
            
            // For demonstration, log form data to console
            console.log("Form Data Submitted:");
            for (let [key, value] of formData.entries()) {
                if (key === 'proofImage' && value instanceof File) {
                    console.log(`${key}: ${value.name} (File)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            // In a real application, you would send this data to your backend
            // Example using fetch API (requires a Django view to handle the POST request)
            /*
            fetch('/your-django-confirm-payment-api-endpoint/', {
                method: 'POST',
                body: formData,
                // If you have CSRF protection, ensure you send the CSRF token
                // headers: {
                //     'X-CSRFToken': getCookie('csrftoken') // Function to get csrf token
                // }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Konfirmasi pembayaran berhasil dikirim!');
                // Redirect to order success page after successful backend processing
                window.location.href = '/order-success/';
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat mengirim konfirmasi pembayaran.');
            });
            */

            // For the demo purpose, we'll alert and then redirect immediately
            alert('Konfirmasi pembayaran berhasil dikirim! (Ini adalah demo, data tidak disimpan.)');
            paymentConfirmationForm.reset();
            window.location.href = '/order_success/';
        });
    }

    // Function to get CSRF token (useful for Django forms with fetch API)
    // function getCookie(name) {
    //     let cookieValue = null;
    //     if (document.cookie && document.cookie !== '') {
    //         const cookies = document.cookie.split(';');
    //         for (let i = 0; i < cookies.length; i++) {
    //             const cookie = cookies[i].trim();
    //             // Does this cookie string begin with the name we want?
    //             if (cookie.substring(0, name.length + 1) === (name + '=')) {
    //                 cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
    //                 break;
    //             }
    //         }
    //     }
    //     return cookieValue;
    // }

    // Ensure UI is updated based on authentication status (for header)
    if (window.updateAuthUI) {
        window.updateAuthUI();
    }
});