document.addEventListener("DOMContentLoaded", function () {
  // FAQ Data
  const faqData = [
    {
      category: "account",
      question: "Bagaimana cara mendaftar akun baru?",
      answer:
        "Untuk mendaftar, klik tombol 'Daftar' di pojok kanan atas halaman. Isi formulir pendaftaran dengan informasi yang diperlukan seperti username, nama lengkap, email, nomor telepon, dan kata sandi. Setelah itu, klik 'Daftar' untuk membuat akun Anda.",
    },
    {
      category: "account",
      question: "Saya lupa kata sandi, bagaimana cara meresetnya?",
      answer:
        "Jika Anda lupa kata sandi, klik 'Masuk' lalu pilih 'Lupa Kata Sandi?'. Masukkan username, email, atau nomor telepon Anda yang terdaftar, lalu ikuti instruksi yang dikirimkan ke email atau nomor telepon Anda untuk mereset kata sandi.",
    },
    {
      category: "ordering",
      question: "Bagaimana cara memesan produk?",
      answer:
        "Cari produk yang Anda inginkan, klik pada produk untuk melihat detailnya, lalu klik tombol '+ Keranjang' untuk menambahkannya ke keranjang belanja. Setelah selesai berbelanja, buka keranjang Anda dan lanjutkan ke pembayaran.",
    },
    {
      category: "ordering",
      question:
        "Bisakah saya mengubah atau membatalkan pesanan setelah dikonfirmasi?",
      answer:
        "Setelah pesanan dikonfirmasi dan pembayaran berhasil, pesanan tidak dapat diubah atau dibatalkan secara langsung melalui situs. Mohon segera hubungi layanan pelanggan kami untuk bantuan lebih lanjut.",
    },
    {
      category: "payment",
      question: "Metode pembayaran apa saja yang diterima?",
      answer:
        "Kami menerima berbagai metode pembayaran termasuk Transfer Bank (BCA, Mandiri, BRI, BNI), Cash On-Delivery (COD), dan E-Wallet (DANA, OVO, LinkAja).",
    },
    {
      category: "payment",
      question: "Apakah pembayaran saya aman?",
      answer:
        "Ya, kami menggunakan protokol keamanan standar industri untuk melindungi informasi pembayaran Anda. Semua transaksi diproses melalui gateway pembayaran yang aman.",
    },
    {
      category: "shipping",
      question: "Berapa lama estimasi pengiriman?",
      answer:
        "Estimasi pengiriman bervariasi tergantung lokasi Anda dan jenis produk. Umumnya, pengiriman memakan waktu 2-4 hari kerja setelah konfirmasi pembayaran.",
    },
    {
      category: "shipping",
      question: "Bagaimana cara melacak pesanan saya?",
      answer:
        "Anda dapat melacak status pesanan Anda di halaman 'Riwayat Pesanan' di profil Anda setelah login. Nomor resi pengiriman juga akan dikirimkan melalui email.",
    },
    {
      category: "returns",
      question: "Bagaimana kebijakan pengembalian barang?",
      answer:
        "Anda dapat mengajukan pengembalian barang dalam waktu 7 hari setelah penerimaan jika produk rusak, tidak sesuai deskripsi, atau ada cacat produksi. Mohon lihat halaman 'Pengembalian Barang' untuk detail lengkap dan prosedur pengajuan.",
    },
    {
      category: "returns",
      question: "Berapa lama proses pengembalian dana?",
      answer:
        "Proses pengembalian dana biasanya memakan waktu 3-7 hari kerja setelah barang yang dikembalikan diterima dan diverifikasi. Waktu dapat bervariasi tergantung metode pembayaran.",
    },
    {
      category: "products",
      question: "Bagaimana cara mencari produk tertentu?",
      answer:
        "Gunakan kolom pencarian di bagian atas halaman untuk mencari produk berdasarkan nama, merek, atau deskripsi. Anda juga bisa menggunakan filter kategori di halaman utama untuk mempersempit pencarian.",
    },
    {
      category: "security",
      question: "Bagaimana TerusanMinimarket melindungi data pribadi saya?",
      answer:
        "Kami menerapkan berbagai langkah keamanan teknis dan organisasi untuk melindungi data pribadi Anda dari akses tidak sah, penggunaan, atau pengungkapan. Informasi lebih lanjut dapat ditemukan di 'Kebijakan Privasi' kami.",
    },
  ];

  const faqList = document.getElementById("faqList");
  const faqSearchInput = document.getElementById("faqSearchInput");
  const faqSearchBtn = document.getElementById("faqSearchBtn");
  const faqCategorySelect = document.getElementById("faqCategorySelect");
  const noResultsMessage = document.getElementById("noResultsMessage");

  function renderFaqItems(filteredFaqs) {
    faqList.innerHTML = "";
    if (filteredFaqs.length === 0) {
      noResultsMessage.style.display = "block";
      return;
    }
    noResultsMessage.style.display = "none";

    filteredFaqs.forEach((faq, index) => {
      // Added index parameter
      const faqItem = document.createElement("div");
      faqItem.classList.add("faq-item");
      faqItem.setAttribute("data-category", faq.category);

      const faqQuestion = document.createElement("div");
      faqQuestion.classList.add("faq-question");
      // Prepend the number (index + 1)
      faqQuestion.innerHTML = `<span class="faq-number">${
        index + 1
      }.</span><span>${faq.question}</span>`;
      faqQuestion.addEventListener("click", () => {
        faqItem.classList.toggle("active");
        const answer = faqItem.querySelector(".faq-answer");
        if (faqItem.classList.contains("active")) {
          // Set max-height to scrollHeight to allow smooth transition for dynamic content
          answer.style.maxHeight = answer.scrollHeight + 100 + "px"; // diganti (ditambahin 100)
          // Ensure padding is applied
          answer.style.padding = "20px 25px";
        } else {
          answer.style.maxHeight = null;
          answer.style.padding = "0 25px"; // Reset padding when collapsed
        }
      });

      const faqAnswer = document.createElement("div");
      faqAnswer.classList.add("faq-answer");
      faqAnswer.innerHTML = `<p>${faq.answer}</p>`;

      faqItem.appendChild(faqQuestion);
      faqItem.appendChild(faqAnswer);
      faqList.appendChild(faqItem);
    });
  }

  function filterFaqs() {
    const searchTerm = faqSearchInput.value.toLowerCase();
    const selectedCategory = faqCategorySelect.value;

    const filtered = faqData.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm);
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    renderFaqItems(filtered);
  }

  // Event Listeners
  faqSearchBtn.addEventListener("click", filterFaqs);
  faqSearchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      filterFaqs();
    }
  });
  faqCategorySelect.addEventListener("change", filterFaqs);

  // Initial render
  renderFaqItems(faqData);

  // Ensure global listeners from dashboard.js are attached
  if (typeof window.attachGlobalListeners === "function") {
    window.attachGlobalListeners();
  }
  // Update auth UI on page load
  if (typeof window.updateAuthUI === "function") {
    window.updateAuthUI();
  }
});
