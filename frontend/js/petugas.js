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

  // 4. Panggil Inisialisasi Spesifik per Halaman
  // Fungsi-fungsi di bawah akan otomatis "skip" (return) jika elemennya tidak ada di halaman tersebut.
  initDatasetPage();
  initRiwayatPage();
  initProfilPage();
  initDetailPage();
  initEvaluasiPage();
});

// ==========================================
// 2. LOGIKA HALAMAN DATASET (CRUD & FILTER)
// ==========================================
function initDatasetPage() {
  // Safety Check: Jika tabel dataset tidak ada di halaman ini, hentikan fungsi (mencegah error)
  const datasetTable = document.getElementById("datasetTable");
  if (!datasetTable) return;

  let currentEditRow = null;
  let currentEditId = null; // <-- BARU: ID database yang lagi diedit
  let currentPage = 1;
  let totalPages = 1; // <-- dari const jadi let, biar dinamis

  // --- FUNGSI LOAD DATA DARI BACKEND (READ) ---
  async function loadData() {
    const apiUrl = window.location.origin + "/SIPIKA/backend/data-produksi";
    try {
      const res = await fetch(apiUrl);
      const result = await res.json();
      renderFromDB(result.data || []);
    } catch (err) {
      console.error("Gagal load data:", err);
      alert("Gagal mengambil data dari server. Pastikan XAMPP nyala.");
    }
  }

  // --- FUNGSI RENDER TABEL DARI DATA DB ---
  function renderFromDB(rows) {
    const tbody = datasetTable.querySelector("tbody");
    tbody.innerHTML = ""; // <-- hapus 15 dummy + baris lama, bersih total

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;color:#888;">Belum ada data produksi.</td></tr>`;
      totalPages = 1;
      switchPage(1);
      return;
    }

    rows.forEach((r, index) => {
      const page = Math.floor(index / 10) + 1; // 10 baris per halaman
      const kategoriBadge =
        r.kategori === "Tinggi"
          ? '<span class="badge badge-tinggi">Tinggi</span>'
          : r.kategori === "Sedang"
            ? '<span class="badge badge-sedang">Sedang</span>'
            : '<span class="badge badge-rendah">Rendah</span>';

      const tr = document.createElement("tr");
      tr.setAttribute("data-date", (r.created_at || "").slice(0, 7)); // <-- UBAH JADI 'r'
      tr.setAttribute("data-id", r.id); // <-- ID buat edit/hapus
      tr.setAttribute("data-page", page);
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${r.jenis_ikan}</td>
        <td>${r.alat_tangkap}</td>
        <td>${r.wilayah}</td>
        <td>${r.musim}</td>
       <td>${Number(r.produksi_kg).toLocaleString("id-ID", {
         maximumFractionDigits: 0,
       })}</td>
        <td>${kategoriBadge}</td>
        <td>
          <button class="action-btn btn-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="action-btn btn-delete" title="Hapus"><i class="fa-solid fa-trash"></i></button>
        </td>`;
      tbody.appendChild(tr);
    });

    totalPages = Math.max(1, Math.ceil(rows.length / 10));
    switchPage(1);
  }

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
      currentEditId = currentEditRow.getAttribute("data-id");

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
    currentEditId = null;
  };

  // --- FUNGSI SIMPAN DATA (CREATE & UPDATE) ---
  // --- FUNGSI SIMPAN DATA (CREATE & UPDATE) -> BACKEND ---
  async function saveData(event) {
    event.preventDefault();

    const jenis = document.getElementById("inputJenis").value.trim();
    const alat = document.getElementById("inputAlat").value.trim();
    const wilayah = document.getElementById("inputWilayah").value.trim();
    const musim = document.getElementById("inputMusim").value.trim();
    const produksi = document.getElementById("inputProduksi").value.trim();

    if (!jenis || !alat || !wilayah || !musim || !produksi || isNaN(produksi)) {
      alert("Mohon lengkapi semua field dengan benar!");
      return;
    }

    const apiUrl = window.location.origin + "/SIPIKA/backend/data-produksi";
    const payload = {
      jenis_ikan: jenis,
      alat_tangkap: alat,
      wilayah: wilayah,
      musim: musim,
      produksi_kg: produksi,
    };

    // Tentukan POST (tambah) atau PUT (edit)
    let url = apiUrl;
    let method = "POST";
    if (currentEditId) {
      url = apiUrl + "/" + currentEditId;
      method = "PUT";
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status === "success") {
        alert("✅ " + result.message);
        closeModal();
        loadData(); // refresh tabel dari DB
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data ke server.");
    }
  }

  // --- FUNGSI HAPUS DATA (DELETE) -> BACKEND ---
  async function deleteRow(btn) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    const id = btn.closest("tr").getAttribute("data-id");
    const apiUrl =
      window.location.origin + "/SIPIKA/backend/data-produksi/" + id;

    try {
      const res = await fetch(apiUrl, { method: "DELETE" });
      const result = await res.json();
      if (result.status === "success") {
        alert("✅ " + result.message);
        loadData(); // Refresh tabel dari DB
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data.");
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
      if (!row.cells[1]) return; // <-- TAMBAHKAN INI (mencegah error kalau tabel kosong)
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

  // Inisialisasi awal: Ambil data dari Database
  loadData();

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
  // 3. Logika Proses Data CSV (REAL IMPLEMENTATION)
  window.processCSV = async function () {
    if (!csvFileInput.files || !csvFileInput.files[0]) {
      alert("Pilih file CSV terlebih dahulu!");
      return;
    }

    const formData = new FormData();
    // Nama 'csv_file' harus SAMA PERSIS dengan yang dibaca di DatasetController.php
    formData.append("csv_file", csvFileInput.files[0]);

    const btn = document.querySelector(".btn-process-csv");
    const originalText = btn.innerHTML;

    // Ubah tombol jadi loading
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
    btn.disabled = true;

    try {
      const response = await fetch("/SIPIKA/backend/datasets/upload-csv.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.status === "success") {
        alert(`✅ ${result.message}`);

        // Reset input file dan sembunyikan preview
        csvFileInput.value = "";
        document.getElementById("csvPreview").style.display = "none";

        // Tutup modal
        if (typeof closeModal === "function") {
          closeModal();
        }

        // Refresh halaman agar tabel ter-update dengan data baru dari DB
        location.reload();
      } else {
        alert(`❌ Gagal: ${result.message}`);
      }
    } catch (error) {
      console.error("Error upload CSV:", error);
      alert("Terjadi kesalahan jaringan saat mengunggah CSV.");
    } finally {
      // Kembalikan tombol ke kondisi semula
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };
}

// ==========================================
// 3. LOGIKA HALAMAN RIWAYAT DATASET PETUGAS
// ==========================================
function initRiwayatPage() {
  const historyTable = document.getElementById("historyTable");
  if (!historyTable) return;

  const tbody = historyTable.querySelector("tbody");
  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  async function loadRiwayat() {
    tbody.innerHTML =
      '<tr><td colspan="9" style="text-align:center;padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>';
    try {
      const apiUrl = window.location.origin + "/SIPIKA/backend/data-produksi";
      const res = await fetch(apiUrl);
      const result = await res.json();
      if (result.status === "success") {
        allData = result.data || [];
        renderTable();
      } else {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red;">${result.message}</td></tr>`;
      }
    } catch (err) {
      console.error(err);
      tbody.innerHTML =
        '<tr><td colspan="9" style="text-align:center;color:red;">Gagal koneksi server.</td></tr>';
    }
  }

  function renderTable() {
    tbody.innerHTML = "";
    if (allData.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="9" style="text-align:center;padding:20px;color:#888;">Belum ada data dataset.</td></tr>';
      updatePagination(0);
      return;
    }
    const totalPages = Math.ceil(allData.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const pageData = allData.slice(start, start + rowsPerPage);

    pageData.forEach((item, i) => {
      const no = start + i + 1;
      const d = new Date(item.created_at);
      const tgl = d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let badge = "badge-rendah";
      if (item.kategori === "Tinggi") badge = "badge-tinggi";
      else if (item.kategori === "Sedang") badge = "badge-sedang";

      const tr = document.createElement("tr");
      tr.setAttribute("data-date", (item.created_at || "").slice(0, 7));
      tr.innerHTML = `
        <td>${no}</td>
        <td>${tgl}</td>
        <td>${item.jenis_ikan || "-"}</td>
        <td>${item.alat_tangkap || "-"}</td>
        <td>${item.wilayah || "-"}</td>
        <td>${item.musim || "-"}</td>
        <td>${Number(item.produksi_kg).toLocaleString("id-ID", {
          maximumFractionDigits: 0,
        })}</td>
        <td><span class="badge ${badge}">${item.kategori || "-"}</span></td>
        <td style="text-align:center">
          <a href="detail-prediksi.html?id=${item.id}" class="btn-detail">Detail</a>
        </td>`;
      tbody.appendChild(tr);
    });
    updatePagination(totalPages);
  }

  function updatePagination(totalPages) {
    const wrap = document.querySelector(".pagination-container");
    if (!wrap) return;

    let html = `<button class="page-btn page-nav" id="prevBtn" ${currentPage === 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-left"></i></button>`;

    // Window: cuma tampilin max 5 nomor di sekitar halaman aktif
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    // Tampilin halaman 1 + ellipsis kalau perlu
    if (startPage > 1) {
      html += `<button class="page-btn page-num" data-page="1">1</button>`;
      if (startPage > 2) html += `<span class="page-ellipsis">…</span>`;
    }

    // Nomor halaman aktif (window)
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn page-num ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }

    // Tampilin halaman terakhir + ellipsis kalau perlu
    if (endPage < totalPages) {
      if (endPage < totalPages - 1)
        html += `<span class="page-ellipsis">…</span>`;
      html += `<button class="page-btn page-num" data-page="${totalPages}">${totalPages}</button>`;
    }

    html += `<button class="page-btn page-nav" id="nextBtn" ${currentPage === totalPages ? "disabled" : ""}><i class="fa-solid fa-chevron-right"></i></button>`;

    wrap.innerHTML = html;

    document.getElementById("prevBtn")?.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    document.getElementById("nextBtn")?.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
    wrap.querySelectorAll(".page-num").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page);
        renderTable();
      });
    });
  }

  // Filter gabungan: search + tanggal (client-side)
  window.filterHistoryTable = function () {
    const kw = document.getElementById("searchInput").value.toLowerCase();
    const dv = document.getElementById("dateFilter").value;
    tbody.querySelectorAll("tr").forEach((row) => {
      const text = row.textContent.toLowerCase();
      let ok = text.includes(kw);
      if (ok && dv) {
        ok = row.getAttribute("data-date") === dv;
      }
      row.style.display = ok ? "" : "none";
    });
  };

  document
    .getElementById("searchInput")
    ?.addEventListener("input", window.filterHistoryTable);
  document
    .getElementById("dateFilter")
    ?.addEventListener("change", window.filterHistoryTable);

  loadRiwayat();
}

// ==========================================
// 4. LOGIKA HALAMAN PROFIL
// ==========================================

function initProfilPage() {
  const uploadFotoInput = document.getElementById("uploadFotoInput");

  // 1. Preview Foto Profil
  if (uploadFotoInput) {
    uploadFotoInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;
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
  }

  // 2. Toggle Password Visibility (Show/Hide) - Anti Bug
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", function () {
      const input = this.previousElementSibling;
      if (input && input.type === "password") {
        input.type = "text";
        this.classList.remove("fa-eye-slash");
        this.classList.add("fa-eye");
      } else if (input) {
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
    document.querySelectorAll(".toggle-password").forEach((icon) => {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
      const input = icon.previousElementSibling;
      if (input) input.type = "password";
    });
  };

  // 4. Validasi & Simpan Password Baru (REAL BACKEND CONNECTION)
  window.simpanPassword = async function (event) {
    if (event) event.preventDefault();

    const currentPassword = document
      .getElementById("inputCurrentPassword")
      .value.trim();
    const newPassword = document
      .getElementById("inputNewPassword")
      .value.trim();
    const confirmPassword = document
      .getElementById("inputConfirmPassword")
      .value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("⚠️ Harap isi semua kolom password!");
      return;
    }
    if (newPassword.length < 8) {
      alert("⚠️ Password baru minimal 8 karakter!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("⚠️ Konfirmasi password tidak cocok dengan password baru!");
      return;
    }

    const userData = getSession();
    console.log("Data User dari Sesi:", userData);

    if (!userData || !userData.id) {
      alert("⚠️ Sesi tidak ditemukan. Silakan login kembali.");
      window.location.href = "/SIPIKA/frontend/pages/auth/login.html";
      return;
    }

    const btnSimpan = document.querySelector(".btn-simpan");
    const originalText = btnSimpan.innerText;
    btnSimpan.innerText = "Memproses...";
    btnSimpan.disabled = true;

    try {
      const apiUrl =
        window.location.origin + "/SIPIKA/backend/auth/change-password";
      console.log("Mengirim request ke:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const result = await response.json();
      console.log("Response dari Backend:", result);

      if (result.status === "success") {
        alert("✅ " + result.message);
        resetFormPassword();
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error koneksi backend:", error);
      alert("❌ Gagal terhubung ke server. Pastikan XAMPP menyala.");
    } finally {
      btnSimpan.innerText = originalText;
      btnSimpan.disabled = false;
    }
  };

  // Pasang event listener ke form
  const formUbahPassword = document.getElementById("formUbahPassword");
  if (formUbahPassword) {
    formUbahPassword.addEventListener("submit", simpanPassword);
  }

  // ==========================================
  // 6. LOAD & RENDER PROFIL LENGKAP DARI DATABASE
  // ==========================================
  async function loadProfilData() {
    const user = getSession();
    if (!user || !user.id) return; // belum login? skip (requireAuth udah redirect)

    const apiUrl =
      window.location.origin + "/SIPIKA/backend/auth/profile/" + user.id;

    try {
      const res = await fetch(apiUrl);
      const result = await res.json();

      if (result.status === "success" && result.data) {
        const d = result.data;

        // Username: prioritas DB, fallback nama_lengkap, fallback "-"
        const elUsername = document.getElementById("displayUsername");
        if (elUsername)
          elUsername.textContent = d.username || d.nama_lengkap || "-";

        // Nama Lengkap
        const elNama = document.getElementById("displayNamaLengkap");
        if (elNama) elNama.textContent = d.nama_lengkap || "-";

        // Email
        const elEmail = document.getElementById("displayEmail");
        if (elEmail) elEmail.textContent = d.email || "-";

        // Role: kapitalisasi huruf pertama (petugas -> Petugas)
        const roleNice = d.role
          ? d.role.charAt(0).toUpperCase() + d.role.slice(1)
          : "-";

        const elRole = document.getElementById("displayRole");
        if (elRole) elRole.textContent = roleNice;

        const elRoleBadge = document.getElementById("displayRoleBadge");
        if (elRoleBadge) elRoleBadge.textContent = roleNice;

        // Foto Profil (future-proof: baru muncul kalau upload foto udah nyambung DB)
        const elFoto = document.getElementById("uploadedAvatarImg");
        const elIcon = document.getElementById("defaultAvatarIcon");
        if (d.foto_profil && elFoto) {
          elFoto.src = "../../assets/images/" + d.foto_profil;
          elFoto.style.display = "block";
          if (elIcon) elIcon.style.display = "none";
        }
      }
    } catch (err) {
      // auto-load, jadi jangan spam alert — cukup catet di console
      console.error("Gagal load profil:", err);
    }
  }

  loadProfilData();
}

// ==========================================
// 5. LOGIKA HALAMAN DETAIL DATASET PETUGAS
// ==========================================
function initDetailPage() {
  const elJenis = document.getElementById("detailJenis");
  if (!elJenis) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.querySelector(".detail-grid").innerHTML =
      '<div style="text-align:center;padding:40px;color:#888;">ID data tidak ditemukan. Silakan buka dari halaman Riwayat.</div>';
    return;
  }

  async function loadDetail() {
    try {
      const apiUrl =
        window.location.origin + "/SIPIKA/backend/data-produksi/" + id;
      const res = await fetch(apiUrl);
      const result = await res.json();

      if (result.status !== "success") {
        document.querySelector(".detail-grid").innerHTML =
          '<div style="text-align:center;padding:40px;color:red;">' +
          (result.message || "Data tidak ditemukan.") +
          "</div>";
        return;
      }

      const d = result.data;

      document.getElementById("detailJenis").textContent = d.jenis_ikan || "-";
      document.getElementById("detailWilayah").textContent = d.wilayah || "-";
      document.getElementById("detailAlat").textContent = d.alat_tangkap || "-";
      document.getElementById("detailMusim").textContent = d.musim || "-";
      document.getElementById("detailProduksi").textContent =
        d.produksi_kg || "-";

      const dt = new Date(d.created_at);
      document.getElementById("detailTanggal").textContent = dt.toLocaleString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      );

      const badge = document.getElementById("detailBadge");
      badge.textContent = d.kategori || "-";
      badge.classList.remove("badge-tinggi", "badge-sedang", "badge-rendah");
      if (d.kategori === "Tinggi") badge.classList.add("badge-tinggi");
      else if (d.kategori === "Sedang") badge.classList.add("badge-sedang");
      else badge.classList.add("badge-rendah");

      document.getElementById("detailDesc").textContent =
        "Tingkat produksi ikan tangkapan termasuk dalam kategori " +
        (d.kategori || "-").toLowerCase() +
        ".";

      // 4.5. Warna background card ikut kategori
      const card = document.getElementById("resultCard");
      if (card) {
        let bg = "#e8f5e9",
          border = "#a5d6a7"; // default Tinggi (hijau)
        if (d.kategori === "Sedang") {
          bg = "#fff4d6";
          border = "#f5d98a";
        } else if (d.kategori === "Rendah") {
          bg = "#fdecea";
          border = "#f5b5b5";
        } else if (d.kategori === "Tinggi") {
          bg = "#e8f5e9";
          border = "#a5d6a7";
        }
        card.style.background = bg;
        card.style.border = "1px solid " + border;
      }

      // 4.6. Warna judul & icon "Hasil Klasifikasi" ikut kategori
      const title = document.getElementById("resultTitle");
      if (title) {
        title.classList.remove("green-title", "blue-title", "warning-title");
        let color = "#2e7d32"; // default Tinggi (hijau tua)
        if (d.kategori === "Sedang")
          color = "#b8860b"; // kuning/oranye tua
        else if (d.kategori === "Rendah") color = "#c62828"; // merah tua
        title.style.color = color;
        // Icon di dalam judul ikut warna juga
        const icon = title.querySelector("i");
        if (icon) icon.style.color = color;
      }

      document.getElementById("detailKesimpulan").textContent =
        result.kesimpulan || "-";
      document.getElementById("detailSaran").textContent = result.saran || "-";
    } catch (err) {
      console.error("Gagal load detail:", err);
      document.querySelector(".detail-grid").innerHTML =
        '<div style="text-align:center;padding:40px;color:red;">Gagal terhubung ke server.</div>';
    }
  }

  loadDetail();
}

// ==========================================
// 7. LOGIKA HALAMAN EVALUASI MODEL
// ==========================================
function initEvaluasiPage() {
  const evalBody = document.getElementById("evalTableBody");
  if (!evalBody) return;

  // Helper: warna heatmap berdasarkan nilai vs max
  function cellColor(v, max) {
    const r = v / max;
    if (r >= 0.9) return ["#124b8b", "#ffffff"];
    if (r >= 0.7) return ["#2874bd", "#ffffff"];
    if (r >= 0.45) return ["#4b9be5", "#ffffff"];
    return ["#eff6ff", "#1e293b"];
  }

  async function loadEvaluasi() {
    try {
      const apiUrl =
        window.location.origin + "/SIPIKA/backend/model-evaluations";
      const res = await fetch(apiUrl);
      const result = await res.json();

      if (result.status !== "success") {
        evalBody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;color:#888;">' +
          (result.message || "Belum ada data evaluasi.") +
          "</td></tr>";
        return;
      }

      const d = result.data;

      // 1. AKURASI
      const acc = document.getElementById("accuracyValue");
      if (acc) acc.textContent = (Number(d.accuracy) * 100).toFixed(1) + "%";

      // 2. TABEL METRIK (Rendah, Sedang, Tinggi)
      const rows = [
        {
          label: "Rendah",
          cls: "badge-rendah",
          p: d.precision_rendah,
          r: d.recall_rendah,
          f: d.f1_rendah,
          s: d.support_rendah,
        },
        {
          label: "Sedang",
          cls: "badge-sedang",
          p: d.precision_sedang,
          r: d.recall_sedang,
          f: d.f1_sedang,
          s: d.support_sedang,
        },
        {
          label: "Tinggi",
          cls: "badge-tinggi",
          p: d.precision_tinggi,
          r: d.recall_tinggi,
          f: d.f1_tinggi,
          s: d.support_tinggi,
        },
      ];
      evalBody.innerHTML = rows
        .map(
          (x) => `
        <tr>
          <td><span class="badge ${x.cls}">${x.label}</span></td>
          <td>${Number(x.p).toFixed(2)}</td>
          <td>${Number(x.r).toFixed(2)}</td>
          <td>${Number(x.f).toFixed(2)}</td>
          <td>${x.s}</td>
        </tr>`,
        )
        .join("");

      // 3. CONFUSION MATRIX (heatmap otomatis ngikutin nilai)
      const matrixBody = document.getElementById("matrixBody");
      if (matrixBody) {
        let cm = d.confusion_matrix;
        if (typeof cm === "string") {
          try {
            cm = JSON.parse(cm);
          } catch (e) {
            cm = null;
          }
        }

        if (!cm || !Array.isArray(cm)) {
          matrixBody.innerHTML =
            '<tr><td colspan="4" style="text-align:center;color:#888;">Data matrix tidak valid.</td></tr>';
        } else {
          const maxVal = Math.max(...cm.flat());
          const labels = ["Rendah", "Sedang", "Tinggi"];
          matrixBody.innerHTML = cm
            .map((row, i) => {
              const cells = row
                .map((v) => {
                  const [bg, fg] = cellColor(v, maxVal);
                  return `<td style="background:${bg};color:${fg};font-weight:700;">${v}</td>`;
                })
                .join("");
              return `<tr><th>${labels[i]}</th>${cells}</tr>`;
            })
            .join("");
        }
      }
    } catch (err) {
      console.error("Gagal load evaluasi:", err);
      evalBody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:red;">Gagal terhubung ke server.</td></tr>';
    }
  }

  loadEvaluasi();
}
