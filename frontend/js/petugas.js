// ==========================================
// 1. INISIALISASI GLOBAL (JALAN DI SEMUA HALAMAN PETUGAS)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Proteksi Halaman (Security Logic)
  // Memastikan user tidak bisa mengakses halaman ini tanpa login.
  // Jika belum login, fungsi requireAuth() dari global.js akan otomatis redirect ke login.
  if (typeof requireAuth === "function") {
    requireAuth();
  }

  // 2. Update UI Header Secara Dinamis (Logika Interaksi)
  // Mengambil data user dari session (localStorage) dan mengganti teks "Bayu Cahyo"
  // menjadi nama user yang sedang login sebenarnya.
  if (typeof getSession === "function") {
    const user = getSession();
    if (user) {
      const profileName = document.querySelector(".profile-name");
      const profileRole = document.querySelector(".profile-role");

      // Menggunakan optional chaining/pengecekan agar tidak error jika elemen tidak ditemukan
      if (profileName)
        profileName.textContent = user.nama_lengkap || user.username;
      if (profileRole)
        profileRole.textContent =
          user.role.charAt(0).toUpperCase() + user.role.slice(1);

      // Khusus halaman dashboard, update juga teks sambutan di banner
      const welcomeHeading = document.querySelector(".welcome-banner h1");
      if (welcomeHeading)
        welcomeHeading.textContent = `${user.nama_lengkap || user.username}!`;
    }
  }

  // 3. Setup Event Listener untuk Tombol Logout (Event Handling)
  // Menggunakan querySelectorAll untuk menangani semua tombol logout di berbagai halaman.
  const logoutBtns = document.querySelectorAll(".logout-btn");
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault(); // Mencegah link <a> berpindah halaman secara default

      if (typeof handleLogout === "function") {
        handleLogout(); // Memanggil fungsi aman dari global.js
      } else {
        // Fallback manual jika global.js belum terload (keamanan ekstra)
        if (confirm("Apakah Anda yakin ingin keluar dari SIPIKA?")) {
          localStorage.removeItem("sipika_user");
          localStorage.removeItem("sipika_isLoggedIn");
          window.location.href = "../../auth/login.html";
        }
      }
    });
  });

  // 4. Panggil Inisialisasi Spesifik per Halaman
  // Fungsi-fungsi di bawah akan otomatis "skip" (return) jika elemennya tidak ada di halaman tersebut.
  initDatasetPage();
  initRiwayatPage();
  initProfilPage();
});

// ==========================================
// 2. LOGIKA HALAMAN DATASET (CRUD & FILTER)
// ==========================================
function initDatasetPage() {
  // Safety Check: Jika tabel dataset tidak ada di halaman ini, hentikan fungsi (mencegah error)
  const datasetTable = document.getElementById("datasetTable");
  if (!datasetTable) return;

  let currentEditRow = null;
  let currentPage = 1;
  const totalPages = 2;

  // --- FUNGSI PAGINATION ---
  function switchPage(page) {
    currentPage = page;
    const rows = datasetTable.querySelectorAll("tbody tr");

    // Tampilkan baris sesuai halaman, sembunyikan yang lain
    rows.forEach((row) => {
      row.style.display =
        row.getAttribute("data-page") == currentPage ? "" : "none";
    });

    // Update status aktif pada tombol angka pagination
    const buttons = document.querySelectorAll(
      ".pagination-container .page-btn",
    );
    buttons.forEach((btn, index) => {
      if (index === 1 || index === 2) {
        btn.classList.toggle("active", index === currentPage);
      }
    });
    filterTable(); // Re-apply filter agar data yang tersembunyi tetap terfilter
  }

  function changePage(direction) {
    if (direction === "prev" && currentPage > 1) switchPage(currentPage - 1);
    else if (direction === "next" && currentPage < totalPages)
      switchPage(currentPage + 1);
  }

  // --- FUNGSI MODAL (TAMBAH & EDIT) ---
  window.openModal = function (mode, btn = null) {
    const modal = document.getElementById("dataModal");
    const title = document.getElementById("modalTitle");

    const tabsContainer = document.querySelector(".modal-tabs");
    const tabManual = document.getElementById("tabManual");
    const tabCSV = document.getElementById("tabCSV");
    const formActions = document.querySelector("#tabManual .modal-actions");

    if (!modal) return;

    modal.style.display = "flex";

    if (mode === "add") {
      // --- MODE TAMBAH DATA ---
      title.innerText = "Tambah Data Dataset";
      document.getElementById("datasetForm").reset();
      currentEditRow = null;

      // 1. Tampilkan container tabs
      if (tabsContainer) tabsContainer.style.display = "flex";

      // 2. RESET semua class active (biar tab switcher lu yang kerja)
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));

      // 3. Set default ke Tab Manual
      if (tabManual) tabManual.classList.add("active");
      const btnManual = document.querySelector('.tab-btn[data-tab="manual"]');
      if (btnManual) btnManual.classList.add("active");

      if (formActions) formActions.style.display = "flex";
    } else if (mode === "edit" && btn) {
      // --- MODE EDIT DATA ---
      title.innerText = "Edit Data Dataset";
      currentEditRow = btn.closest("tr");

      // 1. Sembunyikan container tabs
      if (tabsContainer) tabsContainer.style.display = "none";

      // 2. Pastikan hanya form manual yang punya class active
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));
      if (tabManual) tabManual.classList.add("active");

      // 3. Isi form dengan data dari baris yang diedit
      document.getElementById("inputJenis").value =
        currentEditRow.cells[1].innerText;
      document.getElementById("inputAlat").value =
        currentEditRow.cells[2].innerText;
      document.getElementById("inputWilayah").value =
        currentEditRow.cells[3].innerText;
      document.getElementById("inputMusim").value =
        currentEditRow.cells[4].innerText;
      document.getElementById("inputProduksi").value =
        currentEditRow.cells[5].innerText;

      if (formActions) formActions.style.display = "flex";
    }
  };

  window.closeModal = function () {
    const form = document.getElementById("datasetForm");
    const modal = document.getElementById("dataModal");

    // RESET class active ke default (Manual) agar下次 buka modal tambah data tetap rapi
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));

    const tabManual = document.getElementById("tabManual");
    const btnManual = document.querySelector('.tab-btn[data-tab="manual"]');
    if (tabManual) tabManual.classList.add("active");
    if (btnManual) btnManual.classList.add("active");

    if (form) form.reset();
    if (modal) modal.style.display = "none";
    currentEditRow = null;
  };

  // --- FUNGSI SIMPAN DATA (CREATE & UPDATE) ---
  function saveData(event) {
    event.preventDefault(); // Mencegah halaman reload saat form disubmit (PENTING untuk Validasi)

    // 1. Ambil dan bersihkan nilai input
    const jenis = document.getElementById("inputJenis").value.trim();
    const alat = document.getElementById("inputAlat").value.trim();
    const wilayah = document.getElementById("inputWilayah").value.trim();
    const musim = document.getElementById("inputMusim").value.trim();
    const produksi = parseInt(document.getElementById("inputProduksi").value);

    // 2. Validasi Input (Memenuhi indikator "Penanganan input kosong/tidak valid")
    if (!jenis || !alat || !wilayah || !musim || isNaN(produksi)) {
      alert("Mohon lengkapi semua field dengan benar!");
      return;
    }

    // 3. Logika Bisnis: Menentukan kategori berdasarkan nilai produksi
    let kategoriBadge = "";
    if (produksi > 1000)
      kategoriBadge = '<span class="badge badge-tinggi">Tinggi</span>';
    else if (produksi >= 500)
      kategoriBadge = '<span class="badge badge-sedang">Sedang</span>';
    else kategoriBadge = '<span class="badge badge-rendah">Rendah</span>';

    // 4. Eksekusi: Edit atau Tambah Baru?
    if (currentEditRow) {
      // MODE EDIT: Update sel-sel pada baris yang ada
      currentEditRow.cells[1].innerText = jenis;
      currentEditRow.cells[2].innerText = alat;
      currentEditRow.cells[3].innerText = wilayah;
      currentEditRow.cells[4].innerText = musim;
      currentEditRow.cells[5].innerText = produksi;
      currentEditRow.cells[6].innerHTML = kategoriBadge;
      alert("Data berhasil diperbarui! (Simulasi)");
    } else {
      // MODE TAMBAH: Buat baris HTML baru secara dinamis
      const tableBody = datasetTable.getElementsByTagName("tbody")[0];
      const newRow = tableBody.insertRow();
      newRow.setAttribute("data-page", currentPage);
      newRow.innerHTML = `
        <td>${tableBody.rows.length}</td><td>${jenis}</td><td>${alat}</td>
        <td>${wilayah}</td><td>${musim}</td><td>${produksi}</td>
        <td>${kategoriBadge}</td>
        <td>
          <button class="action-btn btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn btn-delete" title="Hapus"><i class="fa-solid fa-trash"></i></button>
        </td>`;

      // Sembunyikan jika ditambahkan di halaman yang sedang tidak aktif
      if (newRow.getAttribute("data-page") != currentPage)
        newRow.style.display = "none";
      alert("Data baru berhasil ditambahkan! (Simulasi)");
    }

    reorderRows(); // Rapikan nomor urut
    closeModal(); // Tutup modal
  }

  // --- FUNGSI HAPUS DATA (DELETE) ---
  function deleteRow(btn) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      btn.closest("tr").remove(); // Hapus elemen <tr> dari DOM
      reorderRows();
    }
  }

  function reorderRows() {
    // Loop semua baris dan update kolom pertama (No) agar urut kembali
    datasetTable.querySelectorAll("tbody tr").forEach((row, index) => {
      row.cells[0].innerText = index + 1;
    });
  }

  // --- FUNGSI FILTER & PENCARIAN ---
  window.filterTable = function () {
    const searchVal = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const jenisVal = document.getElementById("filterJenis").value.toLowerCase();
    const alatVal = document.getElementById("filterAlat").value.toLowerCase();
    const wilayahVal = document
      .getElementById("filterWilayah")
      .value.toLowerCase();
    const musimVal = document.getElementById("filterMusim").value.toLowerCase();

    datasetTable.querySelectorAll("tbody tr").forEach((row) => {
      const jenis = row.cells[1].innerText.toLowerCase();
      const alat = row.cells[2].innerText.toLowerCase();
      const wilayah = row.cells[3].innerText.toLowerCase();
      const musim = row.cells[4].innerText.toLowerCase();
      const rowText = row.innerText.toLowerCase();

      // Logika AND: Semua kondisi filter harus terpenuhi
      const isMatch =
        rowText.includes(searchVal) &&
        (!jenisVal || jenis.includes(jenisVal)) &&
        (!alatVal || alat.includes(alatVal)) &&
        (!wilayahVal || wilayah.includes(wilayahVal)) &&
        (!musimVal || musim.includes(musimVal));

      // Tampilkan hanya jika cocok DAN berada di halaman yang sedang aktif
      row.style.display =
        isMatch && row.getAttribute("data-page") == currentPage ? "" : "none";
    });
  };

  // --- EVENT LISTENERS DATASET (Event Delegation & Binding) ---
  const btnTambah = document.querySelector(".filter-action-bar .btn-primary");
  if (btnTambah) btnTambah.addEventListener("click", () => openModal("add"));

  const prevBtn = document.querySelector(
    ".pagination-container .page-btn:first-child",
  );
  const nextBtn = document.querySelector(
    ".pagination-container .page-btn:last-child",
  );
  if (prevBtn) prevBtn.addEventListener("click", () => changePage("prev"));
  if (nextBtn) nextBtn.addEventListener("click", () => changePage("next"));

  document
    .querySelectorAll(
      ".pagination-container .page-btn:not(:first-child):not(:last-child)",
    )
    .forEach((btn, index) => {
      btn.addEventListener("click", () => switchPage(index + 1));
    });

  const searchInput = document.getElementById("searchInput");
  if (searchInput)
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      switchPage(1);
    });

  ["filterJenis", "filterAlat", "filterWilayah", "filterMusim"].forEach(
    (id) => {
      const el = document.getElementById(id);
      if (el)
        el.addEventListener("change", () => {
          currentPage = 1;
          switchPage(1);
        });
    },
  );

  const datasetForm = document.getElementById("datasetForm");
  if (datasetForm) datasetForm.addEventListener("submit", saveData);

  // EVENT DELEGATION: Menangkap klik pada tombol Edit/Hapus, termasuk pada elemen yang BARU DIBUAT dinamis
  datasetTable.querySelector("tbody").addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    const deleteBtn = e.target.closest(".btn-delete");
    if (editBtn) {
      e.preventDefault();
      openModal("edit", editBtn);
    } else if (deleteBtn) {
      e.preventDefault();
      deleteRow(deleteBtn);
    }
  });

  document.querySelectorAll(".modal-close, .btn-secondary").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  // Inisialisasi awal: Tampilkan halaman 1
  switchPage(1);

  // ==========================================
  // FITUR TAMBAHAN: TAB SWITCHER & CSV UPLOAD
  // ==========================================

  // 1. Logika Pindah Tab (Manual <-> CSV)
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");

      // Hapus kelas active dari semua tombol dan konten
      tabBtns.forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });

      // Tambah kelas active ke tombol dan konten yang dipilih
      // Tambah kelas active ke tombol dan konten yang dipilih
      this.classList.add("active");

      // PERBAIKAN: Handle case "csv" menjadi "CSV" agar sesuai dengan ID di HTML
      let targetId = "tab" + tabName.charAt(0).toUpperCase() + tabName.slice(1);
      if (tabName === "csv") targetId = "tabCSV";

      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });

  // 2. Logika Buka File Explorer & Preview File CSV
  const btnUploadCsv = document.querySelector(".btn-csv-upload");
  const csvFileInput = document.getElementById("csvFileInput");

  if (btnUploadCsv && csvFileInput) {
    // Paksa buka file explorer saat tombol custom diklik
    btnUploadCsv.addEventListener("click", function (e) {
      e.preventDefault(); // Mencegah konflik dengan tag <label>
      csvFileInput.click(); // <-- INI KUNCINYA: Membuka file explorer
    });

    // Logika preview setelah file dipilih
    csvFileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        document.getElementById("csvFileName").textContent =
          "File terpilih: " + file.name;
        document.getElementById("csvPreview").style.display = "block";
      } else {
        document.getElementById("csvPreview").style.display = "none";
      }
    });
  }
  // 3. Logika Proses Data CSV
  window.processCSV = function () {
    const file = csvFileInput.files[0];
    if (!file) {
      alert("Pilih file CSV terlebih dahulu!");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const rows = text.split("\n");
      let successCount = 0;
      let errorCount = 0;

      // Loop data CSV (skip baris 0 karena itu header kolom)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const columns = row.split(",");
        if (columns.length >= 5) {
          const jenis = columns[0].trim();
          const alat = columns[1].trim();
          const wilayah = columns[2].trim();
          const musim = columns[3].trim();
          const produksi = parseInt(columns[4].trim());

          if (jenis && alat && wilayah && musim && !isNaN(produksi)) {
            let kategoriBadge = "";
            if (produksi > 1000)
              kategoriBadge = '<span class="badge badge-tinggi">Tinggi</span>';
            else if (produksi >= 500)
              kategoriBadge = '<span class="badge badge-sedang">Sedang</span>';
            else
              kategoriBadge = '<span class="badge badge-rendah">Rendah</span>';

            const tableBody = datasetTable.getElementsByTagName("tbody")[0];
            const newRow = tableBody.insertRow();
            newRow.setAttribute("data-page", currentPage);
            newRow.innerHTML = `
              <td>${tableBody.rows.length}</td>
              <td>${jenis}</td>
              <td>${alat}</td>
              <td>${wilayah}</td>
              <td>${musim}</td>
              <td>${produksi}</td>
              <td>${kategoriBadge}</td>
              <td>
                <button class="action-btn btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-delete" title="Hapus"><i class="fa-solid fa-trash"></i></button>
              </td>
            `;
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      reorderRows(); // Rapikan nomor urut
      alert(
        `Berhasil menambahkan ${successCount} data dari CSV! ${errorCount > 0 ? errorCount + " data gagal diproses (format salah)." : ""}`,
      );
      closeModal(); // Tutup modal setelah selesai
    };
    reader.readAsText(file);
  };
}

// ==========================================
// 3. LOGIKA HALAMAN RIWAYAT PREDIKSI
// ==========================================
function initRiwayatPage() {
  const historyTable = document.getElementById("historyTable");
  if (!historyTable) return;

  let historyCurrentPage = 1;
  const historyTotalPages = 3;

  function switchHistoryPage(page) {
    if (page < 1 || page > historyTotalPages) return;
    historyCurrentPage = page;

    historyTable.querySelectorAll("tbody tr").forEach((row) => {
      row.style.display =
        row.getAttribute("data-page") == historyCurrentPage ? "" : "none";
    });

    document.querySelectorAll(".page-num").forEach((btn, index) => {
      btn.classList.toggle("active", index + 1 === historyCurrentPage);
    });
  }

  window.changeHistoryPage = function (page) {
    switchHistoryPage(page);
  };

  // Filter gabungan: Pencarian Teks + Filter Dropdown Tanggal
  window.filterHistoryTable = function () {
    const searchValue = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const dateValue = document.getElementById("dateFilter").value; // Format: "YYYY-MM"
    const rows = historyTable.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const dateText = row.cells[1].innerText; // Contoh: "10 Okt 2026, 14:23"

      const matchSearch = text.includes(searchValue);

      // Logika pencocokan tanggal sederhana untuk simulasi
      let matchDate = true;
      if (dateValue) {
        const [year, month] = dateValue.split("-");
        const months = [
          "",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];
        const monthName = months[parseInt(month)];
        matchDate = dateText.includes(year) && dateText.includes(monthName);
      }

      row.style.display = matchSearch && matchDate ? "" : "none";
    });
  };

  // Event Listeners Riwayat
  const searchInputRiwayat = document.getElementById("searchInput");
  const dateFilter = document.getElementById("dateFilter");

  if (searchInputRiwayat)
    searchInputRiwayat.addEventListener("input", filterHistoryTable);
  if (dateFilter) dateFilter.addEventListener("change", filterHistoryTable);

  document.querySelectorAll(".page-num").forEach((btn, index) => {
    btn.addEventListener("click", () => switchHistoryPage(index + 1));
  });

  document
    .getElementById("prevBtn")
    ?.addEventListener("click", () =>
      switchHistoryPage(historyCurrentPage - 1),
    );
  document
    .getElementById("nextBtn")
    ?.addEventListener("click", () =>
      switchHistoryPage(historyCurrentPage + 1),
    );

  switchHistoryPage(1);
}

// ==========================================
// 4. LOGIKA HALAMAN PROFIL
// ==========================================
function initProfilPage() {
  const uploadFotoInput = document.getElementById("uploadFotoInput");
  if (!uploadFotoInput) return;

  // 1. Preview Foto Profil (Tanpa Upload ke Server)
  // Menggunakan FileReader API untuk membaca file gambar lokal dan menampilkannya langsung di browser
  uploadFotoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file gambar.");
      this.value = "";
      return;
    }

    const uploadedImg = document.getElementById("uploadedAvatarImg");
    const defaultIcon = document.getElementById("defaultAvatarIcon");
    const reader = new FileReader();

    reader.onload = function (event) {
      uploadedImg.src = event.target.result;
      uploadedImg.style.display = "block";
      defaultIcon.style.display = "none";
    };
    reader.readAsDataURL(file);
  });

  // 2. Toggle Password Visibility (Show/Hide)
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.previousElementSibling; // Mengambil elemen input yang berada tepat sebelum ikon

      if (input.type === "password") {
        input.type = "text";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      } else {
        input.type = "password";
        this.classList.remove("fa-eye");
        this.classList.add("fa-eye-slash");
      }
    });
  });

  // 3. Reset Form Password
  window.resetFormPassword = function () {
    const form = document.getElementById("formUbahPassword");
    if (form) form.reset();

    // Kembalikan semua ikon mata ke kondisi tertutup dan input ke tipe password
    document.querySelectorAll(".toggle-password").forEach((icon) => {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    });
    document
      .querySelectorAll(".input-password-wrapper input")
      .forEach((input) => {
        input.type = "password";
      });
  };

  // 4. Validasi & Simpan Password Baru
  window.simpanPassword = function (event) {
    if (event) event.preventDefault();

    const currentPassword = document.getElementById(
      "inputCurrentPassword",
    ).value;
    const newPassword = document.getElementById("inputNewPassword").value;
    const confirmPassword = document.getElementById(
      "inputConfirmPassword",
    ).value;

    // Validasi Input (Indikator: Penanganan input kosong/tidak valid)
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Harap isi semua kolom password!");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password baru minimal terdiri dari 8 karakter!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password tidak cocok dengan password baru!");
      return;
    }

    alert("Password berhasil diperbarui! (Simulasi)");
    resetFormPassword();
  };

  const formUbahPassword = document.getElementById("formUbahPassword");
  if (formUbahPassword) {
    formUbahPassword.addEventListener("submit", simpanPassword);
  }
}
