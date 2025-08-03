console.log('profil loaded2')

const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
// --- Elemen Utama Profil (ini seharusnya ada di profile.html) ---
const profileForm = document.getElementById("profileForm");
const profileUsernameInput = document.getElementById("profileUsername");
const profileNameInput = document.getElementById("profileName"); // Periksa apakah ini ada di HTML Anda
const profileEmailInput = document.getElementById("profileEmail");
const profilePhoneInput = document.getElementById("profilePhone");
const profileGenderInputs = document.getElementsByName("gender");
const profileBirthDateInput = document.getElementById("profileBirthDate");
const profileMessage = document.getElementById("profileMessage");

// --- Alamat Profil Utama (ini seharusnya ada di profile.html, mungkin sebagai input tersembunyi jika alamat utama dikelola di sini) ---
const profileReceiverNameInput = document.getElementById("profileReceiverName");
const profileReceiverPhoneInput = document.getElementById("profileReceiverPhone");
const profileFullAddressInput = document.getElementById("profileFullAddress");
const profileRtRwInput = document.getElementById("profileRtRw");
const profileProvinceInput = document.getElementById("profileProvince");
const profileKabupatenInput = document.getElementById("profileKabupaten");
const profileCityInput = document.getElementById("profileCity");
const profilePostalCodeInput = document.getElementById("profilePostalCode");
const profileLocationDetailsInput = document.getElementById("profileLocationDetails");
const profileNamaAlamatInput = document.getElementById("profileNamaAlamat");
// const profileUid = document.getElementById("profileUid"); // Tambahkan ini jika ada di HTML Anda

// --- Elemen Halaman Daftar Alamat ---
const addressMessage = document.getElementById("addressMessage");
const btnAddAddress = document.getElementById("btnAddAddress"); // Tombol untuk membuka modal pencarian alamat
const btnSaveAddress = document.getElementById("btnSaveAddress"); // Tombol submit untuk form alamat
const addressesList = document.getElementById("addressesList");

// --- Search Address Modal Elements (Cari Alamat) ---
// Gunakan new bootstrap.Modal() untuk interaksi modal yang benar
const searchAddressModalElement = document.getElementById('searchAddressModal');
const searchAddressModal = searchAddressModalElement ? new bootstrap.Modal(searchAddressModalElement) : null;
const btnUseCurrentLocation = document.getElementById("btnUseCurrentLocation");
// const searchAddressInput = document.querySelector("#searchAddressModal input[type='text']"); // Untuk input pencarian di modal ini

// --- Map Modal Elements (Tandai Titik di Peta) ---
const mapModalElement = document.getElementById('mapModal');
const mapModal = mapModalElement ? new bootstrap.Modal(mapModalElement) : null;
const mapCanvas = document.getElementById("mapCanvas");
const mapAddressText = document.getElementById("mapAddressText");
const btnSelectLocation = document.getElementById("btnSelectLocation");
let map; // Instansi Google Map
let marker; // Instansi marker Google Map
let selectedLat = null;
let selectedLng = null;

// --- Add/Edit Address Modal Elements (Ubah Alamat) ---
const addressModalElement = document.getElementById("addressModal");
const addressModal = addressModalElement ? new bootstrap.Modal(addressModalElement) : null; // Gunakan Bootstrap's Modal API
const addressModalTitle = document.getElementById("addressModalTitle");
const closeAddressModalBtn = document.getElementById("closeAddressModal");
const addressForm = document.getElementById("addressForm");
const addressFormMessage = document.getElementById("addressFormMessage");
const addressIdInput = document.getElementById("addressId");
const addressLatitudeInput = document.getElementById("addressLatitude"); // Baru: Untuk menyimpan latitude
const addressLongitudeInput = document.getElementById("addressLongitude"); // Baru: Untuk menyimpan longitude

// Elemen input yang di-update dari screenshot baru
const addressNamaAlamatInput = document.getElementById("addressNamaAlamatInput"); // ID di HTML harus 'addressNamaAlamatInput'
const addressLocationPoint = document.getElementById("addressLocationPoint"); // Baru: Menampilkan lokasi yang dipilih dari peta
const btnChangeLocationPoint = document.getElementById("btnChangeLocationPoint"); // Baru: Tombol untuk membuka ulang modal peta
const addressFullAddressInput = document.getElementById("addressFullAddressInput"); // ID di HTML harus 'addressFullAddressInput'

// Dropdown untuk wilayah
const addressProvinceInput = document.getElementById("addressProvinceInput"); // ID di HTML harus 'addressProvinceInput'
const addressKabupatenInput = document.getElementById("addressKabupatenInput"); // ID di HTML harus 'addressKabupatenInput'
const addressCityInput = document.getElementById("addressCityInput"); // ID di HTML harus 'addressCityInput'
const addressKelurahanInput = document.getElementById("addressKelurahanInput"); // Baru: Kelurahan dropdown
const addressPostalCodeInput = document.getElementById("addressPostalCodeInput"); // ID di HTML harus 'addressPostalCodeInput'

const addressReceiverNameInput = document.getElementById("addressReceiverNameInput"); // ID di HTML harus 'addressReceiverNameInput'
const addressReceiverPhoneInput = document.getElementById("addressReceiverPhoneInput"); // ID di HTML harus 'addressReceiverPhoneInput'
const addressLocationDetailsInput = document.getElementById("addressLocationDetailsInput"); // ID di HTML harus 'addressLocationDetailsInput'



document.addEventListener("DOMContentLoaded", function() {

    loadUserAddresses();

    // --- State Global untuk Editing Alamat ---
    let currentEditingAddressId = null; // Untuk melacak ID alamat yang sedang diedit

    // Fungsi getCookie Anda
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

    const openBtn = document.getElementById('openChangePasswordModal');
    const modal = document.getElementById('changePasswordModal');
    const closeBtn = document.getElementById('closeChangePasswordModal');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        });
    }

    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;

        if (newPass !== confirm) {
            alert("Konfirmasi kata sandi tidak cocok.");
            return;
        }

        try {
            const res = await fetch('/api/change-password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: 'include',
            body: JSON.stringify({
                current_password: current,
                new_password: newPass,
            }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
            alert("Kata sandi berhasil diubah.");
            modal.style.display = 'none';
            form.reset();
            } else {
            alert(data.message || "Gagal mengubah kata sandi.");
            }
        } catch (err) {
            console.error("Gagal ubah password:", err);
            alert("Terjadi kesalahan.");
        }
        });
    }

    // Fungsi bantu ambil CSRF token
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

    // --- Fungsi Helper Global (Pastikan ini didefinisikan atau diambil dari file lain) ---
    // Misalnya, untuk showToast dan showLoginModal:
    window.showToast = function(message, type) {
        console.log(`Toast (${type}): ${message}`);
        // Implementasikan Bootstrap Toast di sini, misalnya:
        // const toastEl = document.getElementById('liveToast');
        // const toastBody = toastEl.querySelector('.toast-body');
        // toastBody.textContent = message;
        // toastEl.classList.remove('text-bg-success', 'text-bg-danger', 'text-bg-warning', 'text-bg-info');
        // toastEl.classList.add(`text-bg-${type}`);
        // const toast = new bootstrap.Toast(toastEl);
        // toast.show();
        alert(message); // Fallback jika tidak ada implementasi toast
    };

    // ---------------------- LOAD PROFIL -----------------------
    window.loadUserProfile = async function () {
        const authResponse = await fetch("/api/get_current_user/", {
            method: "GET",
            credentials: "include"
        });
        const authData = await authResponse.json();

        if (!authData.is_authenticated) {
            // Sembunyikan elemen jika tidak login, hanya jika elemen tersebut ada
            if (profileForm) profileForm.style.display = "none";
            if (btnAddAddress) btnAddAddress.style.display = "none";
            if (addressesList) addressesList.style.display = "none";
            if (profileMessage) profileMessage.textContent = "Anda harus login untuk melihat profil.";
            window.showLoginModal();
            return;
        }

        userName.textContent = authData.username;
        userEmail.textContent = authData.email;

        // Tampilkan elemen jika login, hanya jika elemen tersebut ada
        if (profileForm) profileForm.style.display = "block";
        if (btnAddAddress) btnAddAddress.style.display = "block";
        if (addressesList) addressesList.style.display = "block";
        if (profileMessage) profileMessage.textContent = "";

        // Hanya muat data profil utama jika elemen input profil utama ada
        if (profileUsernameInput) {
            try {
                const response = await fetch("/api/profile/", {
                    method: "GET",
                    headers: { "X-CSRFToken": getCookie("csrftoken") },
                    credentials: "include"
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    console.log(data.username);
                    profileUsernameInput.value = data.username || '';
                    profileEmailInput.value = data.email || '';
                    profilePhoneInput.value = data.phone || '';
                    profileBirthDateInput.value = data.birth_date || '';
                    // if (profileUid) { // Jika ada elemen ini
                    //     profileUid.value = data.uid || '';
                    // }
                    if (profileNameInput) profileNameInput.value = data.name || ''; // Sesuaikan jika ada name

                    [...profileGenderInputs].forEach(radio => {
                        radio.checked = (radio.value === data.gender);
                    });

                    // Isi bidang alamat utama (jika ada dan relevan untuk halaman profil utama)
                    if (profileReceiverNameInput) profileReceiverNameInput.value = data.receiver_name || '';
                    if (profileReceiverPhoneInput) profileReceiverPhoneInput.value = data.receiver_phone || '';
                    if (profileFullAddressInput) profileFullAddressInput.value = data.full_address || '';
                    if (profileRtRwInput) profileRtRwInput.value = data.rt_rw || '';
                    if (profileProvinceInput) profileProvinceInput.value = data.province || '';
                    if (profileKabupatenInput) profileKabupatenInput.value = data.kabupaten || '';
                    if (profileCityInput) profileCityInput.value = data.city || '';
                    if (profilePostalCodeInput) profilePostalCodeInput.value = data.postal_code || '';
                    if (profileLocationDetailsInput) profileLocationDetailsInput.value = data.location_details || '';
                    if (profileNamaAlamatInput) profileNamaAlamatInput.value = data.nama_alamat || '';

                } else {
                    if (profileMessage) profileMessage.textContent = data.message || "Gagal memuat profil.";
                }
            } catch (err) {
                if (profileMessage) profileMessage.textContent = "Terjadi kesalahan saat memuat profil.";
                console.error(err);
            }
        }

        // Selalu muat alamat jika elemen daftar alamat ada (ini untuk halaman daftar alamat)
        if (addressesList) {
             loadUserAddresses();
        }
    };

    // ---------------------- UPDATE PROFIL (Hanya untuk profile.html) -----------------------
    if (profileForm) {
        profileForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            console.log("submit")

            const gender = [...profileGenderInputs].find(r => r.checked)?.value || "";

            const updatedData = {
                username: profileUsernameInput.value.trim(),
                name: profileNameInput ? profileNameInput.value.trim() : '', // Sesuaikan jika tidak ada name
                email: profileEmailInput.value.trim(),
                phone: profilePhoneInput.value.trim(),
                gender: gender,
                birth_date: profileBirthDateInput.value,
                // Bidang alamat ini sebaiknya diupdate melalui manajemen alamat,
                // tetapi disertakan jika backend profil utama Anda juga mengelolanya
                receiver_name: profileReceiverNameInput ? profileReceiverNameInput.value.trim() : '',
                receiver_phone: profileReceiverPhoneInput ? profileReceiverPhoneInput.value.trim() : '',
                full_address: profileFullAddressInput ? profileFullAddressInput.value.trim() : '',
                rt_rw: profileRtRwInput ? profileRtRwInput.value.trim() : '',
                province: profileProvinceInput ? profileProvinceInput.value.trim() : '',
                kabupaten: profileKabupatenInput ? profileKabupatenInput.value.trim() : '',
                city: profileCityInput ? profileCityInput.value.trim() : '',
                postal_code: profilePostalCodeInput ? profilePostalCodeInput.value.trim() : '',
                location_details: profileLocationDetailsInput ? profileLocationDetailsInput.value.trim() : '',
                nama_alamat: profileNamaAlamatInput ? profileNamaAlamatInput.value.trim() : '',
            };

            try {
                const response = await fetch("/api/profile/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken"),
                    },
                    credentials: "include",
                    body: JSON.stringify(updatedData)
                });
                const data = await response.json();

                if (response.ok && data.success) {
                    window.showToast("Profil berhasil diperbarui!", "success");
                    window.checkLoginStatus();
                } else {
                    profileMessage.textContent = data.message || "Gagal memperbarui profil.";
                }
            } catch (err) {
                profileMessage.textContent = "Terjadi kesalahan saat menyimpan profil.";
                console.error(err);
            }
        });
    }

    // ---------------------- LOAD ALAMAT (Untuk profile_address.html) -----------------------


    // ---------------------- INTERAKSI MODAL -----------------------

    // Buka Search Address Modal ketika "Tambahkan Alamat Baru" diklik
    btnAddAddress?.addEventListener("click", () => {
        if (searchAddressModal) searchAddressModal.show();
    });

    // Buka Map Modal ketika "Gunakan lokasi saat ini" diklik di Search Address Modal
    btnUseCurrentLocation?.addEventListener("click", () => {
        if (searchAddressModal) searchAddressModal.hide(); // Sembunyikan modal pencarian
        if (mapModal) mapModal.show(); // Tampilkan modal peta
        initializeMap(); // Inisialisasi Google Map
    });

    // Tangani tombol "Ubah" di form alamat untuk membuka ulang modal peta
    btnChangeLocationPoint?.addEventListener("click", () => {
        if (addressModal) addressModal.hide(); // Sembunyikan modal alamat saat ini
        if (mapModal) mapModal.show(); // Tampilkan modal peta
        initializeMap(selectedLat, selectedLng); // Inisialisasi ulang peta, mungkin dengan koordinat yang sudah ada
    });

    // Inisialisasi Google Map (membutuhkan Google Maps API dimuat di HTML)
    function initializeMap(lat = -6.2088, lng = 106.8456) { // Default ke Jakarta jika tidak ada koordinat yang disediakan
        if (!mapCanvas) {
            console.error("Elemen mapCanvas tidak ditemukan.");
            return;
        }
        if (!window.google || !window.google.maps) {
            console.error("Google Maps API tidak dimuat. Pastikan kunci API Anda benar dan terhubung ke internet.");
            mapCanvas.textContent = "Error: Google Maps API tidak dimuat. Silakan periksa kunci API Anda dan koneksi internet.";
            return;
        }

        const center = { lat: parseFloat(lat), lng: parseFloat(lng) };
        map = new google.maps.Map(mapCanvas, {
            center: center,
            zoom: 15,
        });

        marker = new google.maps.Marker({
            position: center,
            map: map,
            draggable: true // Izinkan pengguna untuk menyeret marker
        });

        // Perbarui koordinat dan alamat yang dipilih saat marker diseret
        marker.addListener('dragend', function() {
            const newPosition = marker.getPosition();
            selectedLat = newPosition.lat();
            selectedLng = newPosition.lng();
            geocodeLatLng(selectedLat, selectedLng); // Geocode terbalik untuk mendapatkan teks alamat
        });

        // Jika menggunakan lokasi saat ini, coba dapatkan lokasi sebenarnya dari pengguna
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
                marker.setPosition(userLocation);
                selectedLat = userLocation.lat;
                selectedLng = userLocation.lng;
                geocodeLatLng(selectedLat, selectedLng);
            }, (error) => {
                console.warn('Geolocation failed:', error);
                if (mapAddressText) mapAddressText.textContent = "Tidak dapat mendapatkan lokasi saat ini.";
                geocodeLatLng(selectedLat, selectedLng); // Tetap coba dapatkan alamat untuk koordinat default
            });
        } else {
            if (mapAddressText) mapAddressText.textContent = "Geolocation tidak didukung oleh browser Anda.";
            geocodeLatLng(selectedLat, selectedLng); // Tetap coba dapatkan alamat untuk koordinat default
        }
    }

    // Reverse geocoding untuk mendapatkan alamat dari LatLng
    async function geocodeLatLng(lat, lng) {
        if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
            console.error("Google Maps Geocoder tidak tersedia.");
            if (mapAddressText) mapAddressText.textContent = "Layanan geocoding tidak tersedia.";
            return;
        }
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

        try {
            const response = await geocoder.geocode({ 'location': latlng });
            if (response.results[0]) {
                if (mapAddressText) mapAddressText.textContent = response.results[0].formatted_address;
                // Opsional, parse komponen untuk mengisi form alamat nanti
            } else {
                if (mapAddressText) mapAddressText.textContent = "Tidak dapat menemukan alamat untuk lokasi ini.";
            }
        } catch (error) {
            console.error("Geocoder failed due to: " + error);
            if (mapAddressText) mapAddressText.textContent = "Gagal mendapatkan alamat dari koordinat.";
        }
    }

    // Tombol "Pilih Titik Lokasi" di Map Modal membuka Address Modal
    btnSelectLocation?.addEventListener("click", () => {
        if (selectedLat === null || selectedLng === null) {
            window.showToast("Silakan pilih lokasi di peta terlebih dahulu.", "warning");
            return;
        }
        if (mapModal) mapModal.hide(); // Sembunyikan modal peta
        if (addressModal) addressModal.show(); // Tampilkan modal form alamat

        // Isi display titik lokasi dan koordinat
        if (addressLocationPoint) addressLocationPoint.value = mapAddressText.textContent;
        if (addressLatitudeInput) addressLatitudeInput.value = selectedLat;
        if (addressLongitudeInput) addressLongitudeInput.value = selectedLng;

        // Reset form jika ini adalah penambahan alamat baru
        if (!currentEditingAddressId) {
            addressForm.reset();
            addressFormMessage.style.display = "none";
            addressModalTitle.textContent = "Tambahkan Alamat Baru";
        }

        // Opsional, coba isi bidang alamat lain jika geocoding memberikannya
        // Ini akan melibatkan parsing hasil geocoder yang lebih kompleks
    });

    // Tutup Add/Edit Address Modal
    closeAddressModalBtn?.addEventListener("click", () => {
        if (addressModal) addressModal.hide();
        addressForm.reset(); // Reset form saat ditutup
        if (addressFormMessage) addressFormMessage.style.display = "none";
        currentEditingAddressId = null;
        selectedLat = null; // Bersihkan lat/lng yang dipilih
        selectedLng = null;
    });

    // ---------------------- ALAMAT CRUD -----------------------

    function addAddressEventListeners() {
        document.querySelectorAll(".edit-address-btn").forEach(btn => {
            btn.addEventListener("click", () => editAddress(btn.dataset.id));
        });

        document.querySelectorAll(".delete-address-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteAddress(btn.dataset.id));
        });

        document.querySelectorAll(".set-default-btn").forEach(btn => {
            btn.addEventListener("click", () => setDefaultAddress(btn.dataset.id));
        });
    }

    async function setDefaultAddress(id) {
        try {
            const res = await fetch(`/api/addresses/${id}/set_default/`, { // Asumsi endpoint API baru untuk ini
                method: "POST",
                headers: { "X-CSRFToken": getCookie("csrftoken") },
                credentials: "include"
            });
            const data = await res.json();

            if (res.ok && data.success) {
                loadUserAddresses(); // Muat ulang untuk menampilkan badge 'Alamat Dipilih'
                window.showToast("Alamat berhasil dijadikan utama.", "success");
            } else {
                window.showToast(data.message || "Gagal menjadikan alamat utama.", "error");
            }
        } catch (error) {
            console.error("Error setting default address:", error);
            window.showToast("Terjadi kesalahan saat menjadikan alamat utama.", "error");
        }
    }

    addressForm?.addEventListener("submit", async function (e) {
        console.log('clicked')
        e.preventDefault();
        if (addressFormMessage) addressFormMessage.style.display = "none";

        const addressId = addressIdInput?.value || '';
        const method = addressId ? "PUT" : "POST";
        const url = addressId ? `/api/addresses/${addressId}/` : "/api/addresses/";

        const addressData = {
            receiver_name: addressReceiverNameInput?.value.trim(),
            receiver_phone: addressReceiverPhoneInput?.value.trim(),
            full_address: addressFullAddressInput?.value.trim(),
            rt_rw: addressRtRwInput?.value.trim(),
            postal_code: addressPostalCodeInput?.value.trim(),
        };

        // Validasi dasar
        if (Object.values(addressData).some(v => !v)) {
            addressFormMessage.textContent = "Mohon lengkapi semua bidang.";
            addressFormMessage.style.display = "block";
            return;
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                credentials: "include",
                body: JSON.stringify(addressData)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                window.showToast(data.message || "Alamat disimpan.", "success");
                if (typeof bootstrap !== "undefined" && addressModal) {
                    bootstrap.Modal.getInstance(addressModal)?.hide();
                }
                addressForm.reset();
                currentEditingAddressId = null;
                loadUserAddresses();
            } else {
                addressFormMessage.textContent = data.message || "Gagal menyimpan alamat.";
                addressFormMessage.style.display = "block";
            }
        } catch (err) {
            console.error(err);
            addressFormMessage.textContent = "Terjadi kesalahan saat menyimpan.";
            addressFormMessage.style.display = "block";
        }
    });


    // ---------------------- LOGIKA DROPDOWN WILAYAH -----------------------

    // Fungsi untuk mengambil dan mengisi provinsi
    async function populateProvinces(selectedValue = null) {
        if (!addressProvinceInput) return;
        addressProvinceInput.innerHTML = '<option value="">Pilih Provinsi</option>';
        try {
            const res = await fetch("/api/regions/provinces/"); // Endpoint API yang diasumsikan
            const data = await res.json();
            if (res.ok && data.success) {
                data.provinces.forEach(province => {
                    const option = document.createElement("option");
                    option.value = province.id; // Atau province.name jika backend Anda menggunakan nama
                    option.textContent = province.name;
                    addressProvinceInput.appendChild(option);
                });
                if (selectedValue) {
                    addressProvinceInput.value = selectedValue;
                }
            }
        } catch (error) {
            console.error("Error loading provinces:", error);
        }
    }

    // Fungsi untuk mengambil dan mengisi kabupaten/kota berdasarkan provinsi
    async function populateKabupatens(provinceId, selectedValue = null) {
        if (!addressKabupatenInput) return;
        addressKabupatenInput.innerHTML = '<option value="">Pilih Kabupaten</option>';
        if (addressCityInput) addressCityInput.innerHTML = '<option value="">Pilih Kota/Kecamatan</option>'; // Reset
        if (addressKelurahanInput) addressKelurahanInput.innerHTML = '<option value="">Pilih Kelurahan</option>'; // Reset
        if (!provinceId) return;
        try {
            const res = await fetch(`/api/regions/kabupatens/?province_id=${provinceId}`); // Endpoint API yang diasumsikan
            const data = await res.json();
            if (res.ok && data.success) {
                data.kabupatens.forEach(kab => {
                    const option = document.createElement("option");
                    option.value = kab.id;
                    option.textContent = kab.name;
                    addressKabupatenInput.appendChild(option);
                });
                if (selectedValue) {
                    addressKabupatenInput.value = selectedValue;
                }
            }
        } catch (error) {
            console.error("Error loading kabupatens:", error);
        }
    }

    // Fungsi untuk mengambil dan mengisi kota/kecamatan berdasarkan kabupaten
    async function populateCities(kabupatenId, selectedValue = null) {
        if (!addressCityInput) return;
        addressCityInput.innerHTML = '<option value="">Pilih Kota/Kecamatan</option>';
        if (addressKelurahanInput) addressKelurahanInput.innerHTML = '<option value="">Pilih Kelurahan</option>'; // Reset
        if (!kabupatenId) return;
        try {
            const res = await fetch(`/api/regions/cities/?kabupaten_id=${kabupatenId}`); // Endpoint API yang diasumsikan
            const data = await res.json();
            if (res.ok && data.success) {
                data.cities.forEach(city => {
                    const option = document.createElement("option");
                    option.value = city.id;
                    option.textContent = city.name;
                    addressCityInput.appendChild(option);
                });
                if (selectedValue) {
                    addressCityInput.value = selectedValue;
                }
            }
        } catch (error) {
            console.error("Error loading cities:", error);
        }
    }

    // Fungsi untuk mengambil dan mengisi kelurahan/desa berdasarkan kota/kecamatan
    async function populateKelurahans(cityId, selectedValue = null) {
        if (!addressKelurahanInput) return;
        addressKelurahanInput.innerHTML = '<option value="">Pilih Kelurahan</option>';
        if (!cityId) return;
        try {
            const res = await fetch(`/api/regions/kelurahans/?city_id=${cityId}`); // Endpoint API yang diasumsikan
            const data = await res.json();
            if (res.ok && data.success) {
                data.kelurahans.forEach(kel => {
                    const option = document.createElement("option");
                    option.value = kel.id;
                    option.textContent = kel.name;
                    addressKelurahanInput.appendChild(option);
                });
                if (selectedValue) {
                    addressKelurahanInput.value = selectedValue;
                }
            }
        } catch (error) {
            console.error("Error loading kelurahans:", error);
        }
    }

    // Event listener untuk perubahan dropdown wilayah
    addressProvinceInput?.addEventListener("change", () => populateKabupatens(addressProvinceInput.value));
    addressKabupatenInput?.addEventListener("change", () => populateCities(addressKabupatenInput.value));
    addressCityInput?.addEventListener("change", () => populateKelurahans(addressCityInput.value));

    // Inisialisasi awal
    // Panggil loadUserProfile() saat DOM selesai dimuat
    // Ini akan memuat data profil dan, jika ada elemen alamat, juga memuat daftar alamat.
    window.loadUserProfile();

    // Jika Anda ingin provinsi dimuat segera saat modal alamat ditampilkan
    // Ini penting agar dropdown provinsi tidak kosong saat modal pertama kali dibuka
    addressModalElement?.addEventListener('shown.bs.modal', function () {
        populateProvinces(); // Muat provinsi saat modal dibuka
    });
});

function editAddress(addressId) {
    fetch(`/api/addresses/${addressId}/`, {
        method: "GET",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.id) {
            // Isi form dengan data alamat
            document.getElementById("addressId").value = data.id;
            document.getElementById("addressReceiverNameInput").value = data.receiver_name;
            document.getElementById("addressReceiverPhoneInput").value = data.receiver_phone;
            document.getElementById("addressFullAddressInput").value = data.full_address;
            document.getElementById("addressRtRwInput").value = data.rt_rw;
            document.getElementById("addressPostalCodeInput").value = data.postal_code;

            // Tampilkan modal
            openCustomModal();
        } else {
            showToast("Gagal memuat data alamat", "error");
        }
    })
    .catch(err => {
        console.error("Error saat edit alamat:", err);
        showToast("Terjadi kesalahan", "error");
    })
}

async function deleteAddress(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;

    try {
        const res = await fetch(`/api/addresses/${id}/`, {
            method: "DELETE",
            headers: { "X-CSRFToken": getCookie("csrftoken") },
            credentials: "include"
        });

        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);  // Aman walau respons kosong
        } catch (e) {
            // ignore JSON parse error
        }
        console.log('awal')
        if (res.ok) {
            console.log('inside res.ok')
            window.showToast(data.message || "Alamat berhasil dihapus.", "success");
            closeCustomModal();
            addressForm.reset();
            currentEditingAddressId = null;
            loadUserAddresses();
        } else {
            window.showToast(data.message || "Gagal menghapus alamat.", "error");
        }
        console.log('akhir')
    } catch (error) {
        console.error("Error deleting address:", error);
        window.showToast("Terjadi kesalahan saat menghapus alamat.", "error");
    }
}


function openCustomModal() {
  document.getElementById("customModal").classList.add("active");
  document.body.style.overflow = "hidden"; // lock scroll
}

function closeCustomModal() {
  document.getElementById("customModal").classList.remove("active");
  document.body.style.overflow = ""; // unlock scroll
}

function openCustomModal() {
  const modal = document.getElementById("customModal");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";

  // Tambahkan event listener untuk klik luar
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeCustomModal();
    }
  });
}

function closeCustomModal() {
  const modal = document.getElementById("customModal");
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

async function loadUserAddresses() {
    if (!addressesList) return;

    addressesList.innerHTML = '';
    addressMessage.textContent = '';
    addressMessage.style.display = "none";

    try {
        const res = await fetch("/api/addresses/list/", {
            method: "GET",
            headers: { "X-CSRFToken": getCookie("csrftoken") },
            credentials: "include"
        });

        const data = await res.json();
        console.log('data: ', data);

        if (res.ok && data.addresses) {
            if (data.addresses.length === 0) {
                addressMessage.textContent = "Belum ada alamat tersimpan.";
                addressMessage.style.display = "block";
                return;
            }

            data.addresses.forEach(addr => {
                const el = document.createElement("div");
                el.className = "address-item card mb-3";
                el.innerHTML = `
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${addr.receiver_name}</h5>
                            <p class="card-text">
                                ${addr.full_address}<br>
                                RT/RW: ${addr.rt_rw}<br>
                                Kode Pos: ${addr.postal_code}<br>
                                Telp: ${addr.receiver_phone}
                            </p>
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-sm btn-outline-primary me-2" onclick="editAddress(${addr.id})">Edit</button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${addr.id})">Hapus</button>
                            </div>
                        </div>
                    </div>
                `;
                addressesList.appendChild(el);
            });
        } else {
            addressMessage.textContent = data.message || "Gagal memuat alamat.";
            addressMessage.style.display = "block";
        }
    } catch (err) {
        console.error("Alamat error:", err);
        addressMessage.textContent = "Terjadi kesalahan saat memuat alamat.";
        addressMessage.style.display = "block";
    }
}

// document.addEventListener('DOMContentLoaded', function () {
//   const openBtn = document.getElementById('openChangePasswordModal');
//   const modal = document.getElementById('changePasswordModal');
//   const closeBtn = document.getElementById('closeChangePasswordModal');

//   if (openBtn && modal) {
//     openBtn.addEventListener('click', () => {
//       modal.style.display = 'flex';
//     });
//   }

//   if (closeBtn && modal) {
//     closeBtn.addEventListener('click', () => {
//       modal.style.display = 'none';
//     });
//   }

//   const form = document.getElementById('changePasswordForm');
//   if (form) {
//     form.addEventListener('submit', async function (e) {
//       e.preventDefault();
//       const current = document.getElementById('currentPassword').value;
//       const newPass = document.getElementById('newPassword').value;
//       const confirm = document.getElementById('confirmNewPassword').value;

//       if (newPass !== confirm) {
//         alert("Konfirmasi kata sandi tidak cocok.");
//         return;
//       }

//       try {
//         const res = await fetch('/api/change-password/', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCookie('csrftoken'),
//           },
//           credentials: 'include',
//           body: JSON.stringify({
//             current_password: current,
//             new_password: newPass,
//           }),
//         });

//         const data = await res.json();
//         if (res.ok && data.success) {
//           alert("Kata sandi berhasil diubah.");
//           modal.style.display = 'none';
//           form.reset();
//         } else {
//           alert(data.message || "Gagal mengubah kata sandi.");
//         }
//       } catch (err) {
//         console.error("Gagal ubah password:", err);
//         alert("Terjadi kesalahan.");
//       }
//     });
//   }

//   // Fungsi bantu ambil CSRF token
//   function getCookie(name) {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== "") {
//       const cookies = document.cookie.split(";");
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim();
//         if (cookie.startsWith(name + "=")) {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//     return cookieValue;
//   }
// });

// async function loadUserAddresses() {
//   const addressContainer = document.getElementById("addressesList");
//   const addressMessage = document.getElementById("addressMessage");

//   if (!addressContainer) return;

//   try {
//     const res = await fetch("/api/addresses/", { credentials: "include" });
//     const data = await res.json();

//     addressContainer.innerHTML = "";

//     if (data.addresses.length === 0) {
//       addressMessage.style.display = "block";
//       addressMessage.textContent = "Kamu belum menambahkan alamat.";
//       return;
//     } else {
//       addressMessage.style.display = "none";
//     }

//     data.addresses.forEach(address => {
//       const col = document.createElement("div");
//       col.className = "col-md-6";

//       col.innerHTML = `
//         <div class="card">
//           <div class="card-body">
//             <h5 class="card-title">${address.receiver_name}</h5>
//             <p class="card-text">
//               ${address.full_address}<br>
//               RT/RW: ${address.rt_rw}<br>
//               Kode Pos: ${address.postal_code}<br>
//               Telp: ${address.receiver_phone}
//             </p>
//             <div class="d-flex justify-content-end">
//               <button class="btn btn-sm btn-outline-primary me-2" onclick="editAddress(${address.id})">Edit</button>
//               <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${address.id})">Hapus</button>
//             </div>
//           </div>
//         </div>
//       `;

//       addressContainer.appendChild(col);
//     });

//   } catch (err) {
//     console.error("Gagal memuat alamat:", err);
//     addressMessage.style.display = "block";
//     addressMessage.textContent = "Terjadi kesalahan saat memuat alamat.";
//   }
// }