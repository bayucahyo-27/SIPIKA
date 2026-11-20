// ==========================================
// FITUR DASHBOARD ADMIN
// MENGAMBIL STATISTIK DARI DATABASE MYSQL
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Mengambil elemen statistik Dashboard
    const totalPengguna = document.getElementById("totalPengguna");
    const totalPetugas = document.getElementById("totalPetugas");
    const totalNelayan = document.getElementById("totalNelayan");

    // Hanya berjalan pada halaman Dashboard Admin
    if (!totalPengguna || !totalPetugas || !totalNelayan) {
        return;
    }

    // Mengambil statistik dari backend
    async function loadDashboardStats() {

        try {

            const response = await fetch(
                "/SIPIKA/backend/admin/dashboard",
                {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal mengambil statistik dashboard."
                );
            }

            // Memperbarui angka statistik
            totalPengguna.textContent =
                Number(result.data.total_pengguna).toLocaleString("id-ID");

            totalPetugas.textContent =
                Number(result.data.total_petugas).toLocaleString("id-ID");

            totalNelayan.textContent =
                Number(result.data.total_nelayan).toLocaleString("id-ID");

        } catch (error) {

            console.error("Kesalahan Dashboard Admin:", error);

        }
    }

    // Memuat statistik ketika halaman dibuka
    loadDashboardStats();

});

/* =========================================
   KELOLA PENGGUNA ADMIN
   TERINTEGRASI DENGAN DATABASE MYSQL
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. MENGAMBIL ELEMEN HTML
    // =========================================

    const searchInput = document.getElementById("search-user");
    const roleFilter = document.getElementById("filter-role");
    const statusFilter = document.getElementById("filter-status");

    const tableBody = document.querySelector(".user-table tbody");

    const paginationButtons = document.querySelector(
        ".pagination-buttons"
    );

    const paginationLabel = document.querySelector(
        ".user-pagination span"
    );

    const addUserButton = document.querySelector(".btn-add-user");
    const addUserModal = document.getElementById("addUserModal");
    const closeAddModal = document.getElementById("closeAddModal");
    const cancelAddModal = document.getElementById("cancelAddModal");
    const addUserForm = document.getElementById("addUserForm");

    // Hanya berjalan pada halaman Kelola Pengguna
    if (
        !tableBody ||
        !searchInput ||
        !roleFilter ||
        !statusFilter
    ) {
        return;
    }

    // Alamat API backend
    const ADMIN_API_URL = "/SIPIKA/backend/admin/users";

    // Pengaturan pagination
    const pageSize = 10;
    let currentPage = 1;
    let totalPages = 1;

    // =========================================
    // 2. FUNGSI NOTIFIKASI
    // =========================================

    function showMessage(message) {
        alert(message);
    }

    // =========================================
    // 3. FUNGSI FORMAT TANGGAL
    // =========================================

    function formatDate(dateValue) {

        if (!dateValue) return "-";

        const date = new Date(
            dateValue.replace(" ", "T")
        );

        if (isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // =========================================
    // 4. MENGAMBIL STATISTIK PENGGUNA
    // =========================================

    async function loadUserStatistics() {

        try {

            const response = await fetch(
                ADMIN_API_URL + "/statistics",
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal mengambil statistik pengguna."
                );
            }

            const statistics = result.data;

            const totalElement = document.querySelector(
                ".stat-total .stat-info h3"
            );

            const officerElement = document.querySelector(
                ".stat-officer .stat-info h3"
            );

            const fishermanElement = document.querySelector(
                ".stat-fisherman .stat-info h3"
            );

            const inactiveElement = document.querySelector(
                ".stat-inactive .stat-info h3"
            );

            if (totalElement) {
                totalElement.textContent = statistics.total_pengguna;
            }

            if (officerElement) {
                officerElement.textContent = statistics.total_petugas;
            }

            if (fishermanElement) {
                fishermanElement.textContent = statistics.total_nelayan;
            }

            if (inactiveElement) {
                inactiveElement.textContent = statistics.total_nonaktif;
            }

        } catch (error) {

            console.error("Statistik pengguna:", error);

        }
    }

    // =========================================
    // 5. MEMBUAT BARIS PENGGUNA
    // =========================================

    function createUserRow(user, number) {

        const row = document.createElement("tr");

        // Simpan ID dan nomor telepon pengguna pada baris
        row.dataset.userId = user.id;
        row.dataset.phone = user.nomor_telepon || "";

        // Nomor urut
        const numberCell = document.createElement("td");
        numberCell.textContent = number;
        row.appendChild(numberCell);

        // Nama lengkap
        const nameCell = document.createElement("td");
        nameCell.textContent = user.nama_lengkap || "-";
        row.appendChild(nameCell);

        // Username
        const usernameCell = document.createElement("td");
        usernameCell.textContent = user.username || "-";
        row.appendChild(usernameCell);

        // Email
        const emailCell = document.createElement("td");
        emailCell.textContent = user.email || "-";
        row.appendChild(emailCell);

        // Password tidak pernah diambil dari database
        const passwordCell = document.createElement("td");
        passwordCell.textContent = "••••••••";
        row.appendChild(passwordCell);

        // Role
        const roleCell = document.createElement("td");
        const roleBadge = document.createElement("span");

        const role = user.role.toLowerCase();

        roleBadge.className = role === "petugas"
            ? "user-badge badge-petugas"
            : "user-badge badge-nelayan";

        roleBadge.textContent =
            role === "petugas" ? "Petugas" : "Nelayan";

        roleCell.appendChild(roleBadge);
        row.appendChild(roleCell);

        // Status
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        const isActive = user.status === "Aktif";

        statusBadge.className = isActive
            ? "user-badge badge-aktif"
            : "user-badge badge-nonaktif";

        statusBadge.textContent = isActive
            ? "Aktif"
            : "Tidak Aktif";

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Tanggal dibuat
        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(user.created_at);
        row.appendChild(dateCell);

        // Tombol aksi
        const actionCell = document.createElement("td");

        actionCell.innerHTML = `
            <div class="user-action-buttons">

                <button type="button"
                    class="btn-edit"
                    title="Edit">
                    ✎
                </button>

                <button type="button"
                    class="btn-delete"
                    title="Hapus">

                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>

                </button>

                <span class="status-toggle ${isActive ? "active" : ""}"
                    title="Ubah status">
                </span>

            </div>
        `;

        row.appendChild(actionCell);

        return row;
    }

    // =========================================
    // 6. MENGAMBIL DATA PENGGUNA DARI DATABASE
    // =========================================

    async function loadUsers(page = 1) {

        currentPage = page;

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:30px;">
                    Memuat data pengguna...
                </td>
            </tr>
        `;

        const params = new URLSearchParams({
            search: searchInput.value.trim(),
            role: roleFilter.value,
            status: statusFilter.value,
            page: currentPage,
            limit: pageSize
        });

        try {

            const response = await fetch(
                ADMIN_API_URL + "?" + params.toString(),
                {
                    method: "GET",
                    credentials: "same-origin"
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal mengambil data pengguna."
                );
            }

            const users = result.data;
            const pagination = result.pagination;

            totalPages = pagination.total_pages;

            tableBody.innerHTML = "";

            if (users.length === 0) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="9"
                            style="text-align:center; padding:30px;">
                            Tidak ada data pengguna ditemukan.
                        </td>
                    </tr>
                `;

            } else {

                users.forEach((user, index) => {

                    const row = createUserRow(
                        user,
                        (currentPage - 1) * pageSize + index + 1
                    );

                    tableBody.appendChild(row);

                });

            }

            // Informasi jumlah data
            const startNumber = pagination.total === 0
                ? 0
                : (currentPage - 1) * pageSize + 1;

            const endNumber = Math.min(
                currentPage * pageSize,
                pagination.total
            );

            if (paginationLabel) {

                paginationLabel.textContent =
                    `Menampilkan ${startNumber}–${endNumber} dari ${pagination.total} pengguna`;

            }

            renderPagination();

        } catch (error) {

            console.error("Data pengguna:", error);

            tableBody.innerHTML = `
                <tr>
                    <td colspan="9"
                        style="text-align:center; padding:30px;">
                        Gagal memuat data pengguna.
                    </td>
                </tr>
            `;

            if (paginationLabel) {
                paginationLabel.textContent = "Data pengguna gagal dimuat";
            }

            if (paginationButtons) {
                paginationButtons.innerHTML = "";
            }

        }
    }

    // =========================================
    // 7. MEMBUAT TOMBOL PAGINATION
    // =========================================

    function renderPagination() {

        if (!paginationButtons) return;

        paginationButtons.innerHTML = "";

        function createButton(label, page, disabled = false) {

            const button = document.createElement("button");

            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;

            if (page === currentPage) {
                button.classList.add("active");
            }

            button.addEventListener("click", function () {
                loadUsers(page);
            });

            paginationButtons.appendChild(button);
        }

        // Tombol sebelumnya
        createButton(
            "‹",
            currentPage - 1,
            currentPage === 1
        );

        // Daftar halaman
        let pages = [];

        if (totalPages <= 5) {

            pages = Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );

        } else if (currentPage <= 3) {

            pages = [1, 2, 3, "...", totalPages];

        } else if (currentPage >= totalPages - 2) {

            pages = [
                1,
                "...",
                totalPages - 2,
                totalPages - 1,
                totalPages
            ];

        } else {

            pages = [
                1,
                "...",
                currentPage - 1,
                currentPage,
                currentPage + 1,
                "...",
                totalPages
            ];

        }

        pages.forEach(page => {

            if (page === "...") {

                const dots = document.createElement("button");

                dots.type = "button";
                dots.textContent = "...";

                paginationButtons.appendChild(dots);

            } else {

                createButton(
                    page,
                    page,
                    false
                );

            }

        });

        // Tombol berikutnya
        createButton(
            "›",
            currentPage + 1,
            currentPage === totalPages || totalPages === 0
        );
    }

    // =========================================
    // 8. PENCARIAN DAN FILTER
    // =========================================

    let searchTimer;

    searchInput.addEventListener("input", function () {

        clearTimeout(searchTimer);

        searchTimer = setTimeout(function () {
            loadUsers(1);
        }, 400);

    });

    roleFilter.addEventListener("change", function () {
        loadUsers(1);
    });

    statusFilter.addEventListener("change", function () {
        loadUsers(1);
    });

    // =========================================
    // 9. MODAL TAMBAH PENGGUNA
    // =========================================

    function closeModal() {

        if (addUserModal) {
            addUserModal.hidden = true;
        }

        if (addUserForm) {
            addUserForm.reset();
        }

    }

    if (addUserButton && addUserModal) {

        addUserButton.addEventListener("click", function () {
            addUserModal.hidden = false;
        });

    }

    if (closeAddModal) {
        closeAddModal.addEventListener("click", closeModal);
    }

    if (cancelAddModal) {
        cancelAddModal.addEventListener("click", closeModal);
    }

    // =========================================
    // 10. MENAMBAHKAN PENGGUNA
    // =========================================

    if (addUserForm) {

        addUserForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const name = document.getElementById("newUserName").value.trim();
            const username = document.getElementById("newUsername").value.trim();
            const email = document.getElementById("newUserEmail").value.trim();
            const password = document.getElementById("newUserPassword").value;
            const role = document.getElementById("newUserRole").value.toLowerCase();

            if (!name || !username || !email || !password || !role) {
                showMessage("Semua data harus diisi!");
                return;
            }

            if (password.length < 8) {
                showMessage("Password minimal 8 karakter!");
                return;
            }

            try {

                const response = await fetch(ADMIN_API_URL, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nama_lengkap: name,
                        username: username,
                        email: email,
                        nomor_telepon: "",
                        password: password,
                        role: role
                    })
                });

                const result = await response.json();

                if (!response.ok || result.status !== "success") {
                    throw new Error(
                        result.message || "Gagal menambahkan pengguna."
                    );
                }

                showMessage(result.message);

                closeModal();

                await loadUsers(1);
                await loadUserStatistics();

            } catch (error) {

                showMessage(error.message);

            }

        });

    }

    // =========================================
    // 11. TOMBOL EDIT, HAPUS, DAN STATUS
    // =========================================

    tableBody.addEventListener("click", async function (event) {

        const row = event.target.closest("tr");

        if (!row || !row.dataset.userId) return;

        const userId = row.dataset.userId;

        // -------------------------------------
        // EDIT PENGGUNA
        // -------------------------------------

        if (event.target.closest(".btn-edit")) {

            const name = prompt(
                "Ubah nama lengkap:",
                row.cells[1].textContent
            );

            if (name === null) return;

            const username = prompt(
                "Ubah username:",
                row.cells[2].textContent
            );

            if (username === null) return;

            const email = prompt(
                "Ubah email:",
                row.cells[3].textContent
            );

            if (email === null) return;

            const role = prompt(
                "Masukkan role (Petugas/Nelayan):",
                row.cells[5].textContent.trim()
            );

            if (role === null) return;

            const phone = prompt(
                "Masukkan nomor telepon:",
                row.dataset.phone
            );

            if (phone === null) return;

            const password = prompt(
                "Password baru (kosongkan jika tidak ingin mengubah):",
                ""
            );

            if (password === null) return;

            const normalizedRole = role.trim().toLowerCase();

            if (
                !name.trim() ||
                !username.trim() ||
                !email.trim()
            ) {
                showMessage("Nama, username, dan email wajib diisi!");
                return;
            }

            if (!["petugas", "nelayan"].includes(normalizedRole)) {
                showMessage("Role harus Petugas atau Nelayan!");
                return;
            }

            if (password !== "" && password.length < 8) {
                showMessage("Password baru minimal 8 karakter!");
                return;
            }

            try {

                const response = await fetch(
                    ADMIN_API_URL + "/" + userId,
                    {
                        method: "PUT",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            nama_lengkap: name.trim(),
                            username: username.trim(),
                            email: email.trim(),
                            nomor_telepon: phone.trim(),
                            role: normalizedRole,
                            password: password
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || result.status !== "success") {
                    throw new Error(
                        result.message || "Gagal memperbarui pengguna."
                    );
                }

                showMessage(result.message);

                await loadUsers(currentPage);
                await loadUserStatistics();

            } catch (error) {

                showMessage(error.message);

            }

        }

        // -------------------------------------
        // HAPUS PENGGUNA
        // -------------------------------------

        if (event.target.closest(".btn-delete")) {

            const confirmation = confirm(
                "Apakah Anda yakin ingin menghapus pengguna ini?\n\n" +
                "Perhatian: data prediksi dan dataset yang terkait " +
                "dengan pengguna ini juga dapat terhapus."
            );

            if (!confirmation) return;

            try {

                const response = await fetch(
                    ADMIN_API_URL + "/" + userId,
                    {
                        method: "DELETE",
                        credentials: "same-origin"
                    }
                );

                const result = await response.json();

                if (!response.ok || result.status !== "success") {
                    throw new Error(
                        result.message || "Gagal menghapus pengguna."
                    );
                }

                showMessage(result.message);

                await loadUsers(currentPage);
                await loadUserStatistics();

            } catch (error) {

                showMessage(error.message);

            }

        }

        // -------------------------------------
        // UBAH STATUS PENGGUNA
        // -------------------------------------

        if (event.target.closest(".status-toggle")) {

            const toggle = event.target.closest(".status-toggle");

            const currentStatus = toggle.classList.contains("active")
                ? "Aktif"
                : "Nonaktif";

            const newStatus = currentStatus === "Aktif"
                ? "Nonaktif"
                : "Aktif";

            const confirmation = confirm(
                `Apakah Anda yakin ingin mengubah status pengguna menjadi ${newStatus}?`
            );

            if (!confirmation) return;

            try {

                const response = await fetch(
                    ADMIN_API_URL + "/" + userId + "/status",
                    {
                        method: "PATCH",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                const result = await response.json();

                if (!response.ok || result.status !== "success") {
                    throw new Error(
                        result.message || "Gagal mengubah status pengguna."
                    );
                }

                showMessage(result.message);

                await loadUsers(currentPage);
                await loadUserStatistics();

            } catch (error) {

                showMessage(error.message);

            }

        }

    });

    // =========================================
    // 12. MENAMPILKAN DATA SAAT HALAMAN DIBUKA
    // =========================================

    loadUsers(1);
    loadUserStatistics();

});

// ==========================================
// USERNAME ADMIN UNTUK SELURUH HALAMAN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const usernameInput = document.getElementById("username");
    const profileForm = document.querySelector(
        ".profile-form:not(.password-form)"
    );

    // Mengambil username dari localStorage
    const savedUsername =
        localStorage.getItem("sipikaAdminUsername") || "Anindya";

    // Memperbarui seluruh header akun Admin
    document.querySelectorAll(".account-name").forEach(element => {
        element.textContent = "Admin: " + savedUsername;
    });

    // Mengisi input username pada halaman Profil
    if (usernameInput) {
        usernameInput.value = savedUsername;
    }

    // Menyimpan perubahan username dari halaman Profil
    if (profileForm && usernameInput) {

        profileForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const newUsername = usernameInput.value.trim();

            if (!newUsername) {
                alert("Username tidak boleh kosong!");
                return;
            }

            localStorage.setItem(
                "sipikaAdminUsername",
                newUsername
            );

            // Memperbarui header pada halaman saat ini
            document.querySelectorAll(".account-name").forEach(element => {
                element.textContent = "Admin: " + newUsername;
            });

            alert("Username Admin berhasil diperbarui!");

        });
    }

});

// ==========================================
// FITUR FOTO PROFIL ADMIN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const avatarCircle = document.getElementById("avatarCircle");
    const uploadAvatar = document.getElementById("uploadAvatar");

    // Hanya berjalan pada halaman Profil Admin
    if (!avatarCircle || !uploadAvatar) return;

    const storageKey = "sipikaAdminAvatar";

    // Menampilkan foto
    function showAdminAvatar(imageData) {
        avatarCircle.innerHTML = "";

        const image = document.createElement("img");

        image.src = imageData;
        image.alt = "Foto Profil Admin";
        image.className = "admin-profile-photo";

        avatarCircle.appendChild(image);
    }

    // Mengambil foto yang sudah tersimpan
    const savedAvatar = localStorage.getItem(storageKey);

    if (savedAvatar) {
        showAdminAvatar(savedAvatar);
    }

    // Memilih foto dari File Explorer
    uploadAvatar.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        // Memeriksa format gambar
        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar!");
            this.value = "";
            return;
        }

        // Batas ukuran 5 MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Ukuran foto maksimal 5 MB!");
            this.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const imageData = event.target.result;

            // Menyimpan foto ke browser
            try {
                localStorage.setItem(storageKey, imageData);
            } catch (error) {
                alert("Foto gagal disimpan. Penyimpanan browser mungkin penuh.");
                return;
            }

            // Memperbarui tampilan foto
            showAdminAvatar(imageData);
        };

        reader.onerror = function () {
            alert("Gagal membaca foto!");
        };

        reader.readAsDataURL(file);
    });

});


/* =====================================================
   DATA MASTER - INTEGRASI DATA REFERENSI
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const tableBody = document.getElementById("tableBody");

    // Hanya dijalankan pada halaman Data Master
    if (!tableBody) return;

    const MASTER_API_URL = "/SIPIKA/backend/admin/master-data";

    let activeCategory = "ikan";
    let masterRows = [];
    let editingMasterId = null;

    const categoryConfig = {
        ikan: {
            title: "Data Master Jenis Ikan",
            description: "Kelola daftar jenis ikan yang tersedia dalam sistem.",
            addText: "Tambah Jenis Ikan",
            label: "Nama Jenis Ikan",
            placeholder: "Cari nama atau deskripsi ikan...",
            header: "Nama Jenis Ikan",
            icon: "fa-fish"
        },
        alat: {
            title: "Data Master Alat Tangkap",
            description: "Kelola daftar alat tangkap yang digunakan nelayan.",
            addText: "Tambah Alat Tangkap",
            label: "Nama Alat Tangkap",
            placeholder: "Cari nama atau deskripsi alat tangkap...",
            header: "Nama Alat Tangkap",
            icon: "fa-anchor"
        },
        wilayah: {
            title: "Data Master Wilayah",
            description: "Kelola daftar wilayah perikanan.",
            addText: "Tambah Wilayah",
            label: "Nama Wilayah",
            placeholder: "Cari nama atau deskripsi wilayah...",
            header: "Nama Wilayah",
            icon: "fa-location-dot"
        },
        musim: {
            title: "Data Master Musim",
            description: "Kelola daftar musim penangkapan ikan.",
            addText: "Tambah Musim",
            label: "Nama Musim",
            placeholder: "Cari nama atau deskripsi musim...",
            header: "Nama Musim",
            icon: "fa-cloud-sun"
        }
    };

    // ==========================================
    // NOTIFIKASI
    // ==========================================

    function showMasterMessage(message) {
        alert(message);
    }

    // ==========================================
    // REQUEST API
    // ==========================================

    async function masterRequest(url, options = {}) {

        const response = await fetch(url, {
            credentials: "same-origin",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error(result.message || "Terjadi kesalahan.");
        }

        return result;
    }

    // ==========================================
    // FORMAT TANGGAL
    // ==========================================

    function formatMasterDate(dateValue) {

        if (!dateValue) return "-";

        const date = new Date(
            String(dateValue).replace(" ", "T")
        );

        if (isNaN(date.getTime())) return "-";

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    // ==========================================
    // MEMUAT DATA REFERENSI
    // ==========================================
    async function loadMasterData() {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Memuat data...
                </td>
            </tr>
        `;

        try {

            const result = await masterRequest(
                `${MASTER_API_URL}/${activeCategory}`
            );

            masterRows = Array.isArray(result.data)
                ? result.data
                : [];

            renderMasterTable();

            updateCategoryCounts();


        } catch (error) {

            tableBody.innerHTML = "";

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.style.textAlign = "center";
            cell.textContent = error.message;

            row.appendChild(cell);
            tableBody.appendChild(row);

            console.error("Gagal memuat Data Referensi:", error);
        }
    }

    // ==========================================
    // MENAMPILKAN TABEL
    // ==========================================
    function renderMasterTable() {
        const keyword = document
            .getElementById("searchInput")
            .value.toLowerCase()
            .trim();

        const filteredRows = masterRows.filter(item => {
            const nama = (item.nama || "").toLowerCase();
            const deskripsi = (item.deskripsi || "").toLowerCase();

            return nama.includes(keyword) ||
                deskripsi.includes(keyword);
        });

        tableBody.innerHTML = "";

        if (filteredRows.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.textContent = "Data tidak ditemukan.";
            cell.style.textAlign = "center";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        filteredRows.forEach((item, index) => {
            const row = document.createElement("tr");

            const numberCell = document.createElement("td");
            numberCell.textContent = index + 1;

            const nameCell = document.createElement("td");
            nameCell.textContent = item.nama || "-";
            nameCell.classList.add("fw-semibold");

            const descriptionCell = document.createElement("td");
            descriptionCell.textContent = item.deskripsi || "-";

            const dateCell = document.createElement("td");
            dateCell.textContent = formatMasterDate(item.created_at);

            const statusCell = document.createElement("td");
            const statusLabel = document.createElement("span");

            statusLabel.className = item.status === "Aktif"
                ? "badge badge-status-aktif"
                : "badge badge-status-nonaktif";

            statusLabel.textContent = item.status || "Nonaktif";
            statusCell.appendChild(statusLabel);

            const actionCell = document.createElement("td");
            const actionWrapper = document.createElement("div");
            actionWrapper.className = "action-buttons";

            // Tombol edit
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className = "btn-icon text-blue btn-edit";
            editButton.title = "Edit";
            editButton.dataset.action = "edit";
            editButton.dataset.id = item.id;
            editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';

            // Tombol aktif/nonaktif
            const statusButton = document.createElement("button");
            statusButton.type = "button";
            statusButton.className = item.status === "Aktif"
                ? "btn-icon text-red"
                : "btn-icon text-green";

            statusButton.title = item.status === "Aktif"
                ? "Nonaktifkan"
                : "Aktifkan";

            statusButton.dataset.action = "toggle-status";
            statusButton.dataset.id = item.id;
            statusButton.dataset.status = item.status;

            statusButton.innerHTML = item.status === "Aktif"
                ? '<i class="fa-solid fa-toggle-on"></i>'
                : '<i class="fa-solid fa-toggle-off"></i>';

            // Tombol hapus
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "btn-icon text-red btn-delete";
            deleteButton.title = "Hapus";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.id = item.id;
            deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

            actionWrapper.appendChild(editButton);
            actionWrapper.appendChild(statusButton);
            actionWrapper.appendChild(deleteButton);

            actionCell.appendChild(actionWrapper);

            row.appendChild(numberCell);
            row.appendChild(nameCell);
            row.appendChild(descriptionCell);
            row.appendChild(dateCell);
            row.appendChild(statusCell);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    }

    // ==========================================
    // JUMLAH DATA PADA KARTU KATEGORI
    // ==========================================
    async function updateCategoryCounts() {

        const categories = ["ikan", "alat", "wilayah", "musim"];

        const cardIds = {
            ikan: "cardIkan",
            alat: "cardAlat",
            wilayah: "cardWilayah",
            musim: "cardMusim"
        };

        await Promise.all(
            categories.map(async (category) => {

                try {
                    const result = await masterRequest(
                        `${MASTER_API_URL}/${category}`
                    );

                    const card = document.getElementById(
                        cardIds[category]
                    );

                    if (card) {
                        const count = card.querySelector(
                            ".cat-count strong"
                        );

                        if (count) {
                            count.textContent = Array.isArray(result.data)
                                ? result.data.length
                                : 0;
                        }
                    }

                } catch (error) {
                    console.error(
                        `Gagal memuat jumlah ${category}:`,
                        error
                    );
                }
            })
        );
    }

    // ==========================================
    // PINDAH KATEGORI
    // ==========================================

    window.switchCategory = function (category) {

        if (!categoryConfig[category]) return;

        activeCategory = category;

        const config = categoryConfig[category];

        document.querySelectorAll(".category-card").forEach(card => {
            card.classList.remove("active");
        });

        const cardIds = {
            ikan: "cardIkan",
            alat: "cardAlat",
            wilayah: "cardWilayah",
            musim: "cardMusim"
        };

        document.getElementById(cardIds[category])
            ?.classList.add("active");

        document.getElementById("subCardTitle").textContent = config.title;
        document.getElementById("subCardDesc").textContent = config.description;
        document.getElementById("btnAddText").textContent = config.addText;
        document.getElementById("labelNamaData").textContent = config.label;
        document.getElementById("searchInput").placeholder = config.placeholder;

        document.getElementById("tableHeaderRow").children[1].textContent =
            config.header;

        const iconContainer = document.getElementById("subIconBg");

        if (iconContainer) {
            iconContainer.innerHTML =
                `<i class="fa-solid ${config.icon}"></i>`;
        }

        document.getElementById("searchInput").value = "";

        loadMasterData();
    };

    // ==========================================
    // PINDAH TAB
    // ==========================================

    window.switchTab = function (tab) {

        const sectionReferensi = document.getElementById("sectionReferensi");
        const sectionDataset = document.getElementById("sectionDataset");

        const tabReferensi = document.getElementById("tabReferensi");
        const tabDataset = document.getElementById("tabDataset");

        if (tab === "referensi") {

            sectionReferensi.style.display = "block";
            sectionDataset.style.display = "none";

            tabReferensi.classList.add("active");
            tabDataset.classList.remove("active");

        } else if (tab === "dataset") {

            sectionReferensi.style.display = "none";
            sectionDataset.style.display = "block";

            tabDataset.classList.add("active");
            tabReferensi.classList.remove("active");
        }
    };

    // ==========================================
    // MODAL TAMBAH DAN EDIT
    // ==========================================

    const modal = document.getElementById("modalTambahData");
    const form = document.getElementById("formTambahData");

    function closeMasterModal() {

        modal.style.display = "none";
        form.reset();
        editingMasterId = null;
    }

    document.getElementById("btnAddData").addEventListener("click", function () {

        editingMasterId = null;

        form.reset();

        document.getElementById("modalTitle").textContent =
            categoryConfig[activeCategory].addText;

        modal.style.display = "flex";
    });

    document.getElementById("btnCloseModal")
        .addEventListener("click", closeMasterModal);

    document.getElementById("btnBatalModal")
        .addEventListener("click", closeMasterModal);

    // ==========================================
    // SIMPAN DATA REFERENSI
    // ==========================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nama = document.getElementById("inputNamaData")
            .value.trim();

        const deskripsi = document.getElementById("inputDeskripsiData")
            .value.trim();

        if (!nama) {
            showMasterMessage("Nama wajib diisi.");
            return;
        }

        const payload = {
            nama: nama,
            deskripsi: deskripsi
        };

        try {

            if (editingMasterId !== null) {

                const existingData = masterRows.find(
                    item => String(item.id) === String(editingMasterId)
                );

                payload.status = existingData?.status || "Aktif";

                await masterRequest(
                    `${MASTER_API_URL}/${activeCategory}/${editingMasterId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    }
                );

                showMasterMessage("Data berhasil diperbarui.");

            } else {

                await masterRequest(
                    `${MASTER_API_URL}/${activeCategory}`,
                    {
                        method: "POST",
                        body: JSON.stringify(payload)
                    }
                );

                showMasterMessage("Data berhasil ditambahkan.");
            }

            closeMasterModal();
            await loadMasterData();

        } catch (error) {

            showMasterMessage(error.message);
        }
    });

    // ==========================================
    // AKSI EDIT DAN HAPUS
    // ==========================================
    tableBody.addEventListener("click", async function (event) {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "toggle-status") {
            const item = masterRows.find(
                data => String(data.id) === String(id)
            );

            if (!item) return;

            const newStatus = item.status === "Aktif"
                ? "Nonaktif"
                : "Aktif";

            const confirmed = confirm(
                `Apakah Anda yakin ingin mengubah status data "${item.nama}" menjadi ${newStatus}?`
            );

            if (!confirmed) return;

            try {
                await masterRequest(
                    `${MASTER_API_URL}/${activeCategory}/${id}/status`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            status: newStatus
                        })
                    }
                );

                showMasterMessage(
                    `Status data berhasil diubah menjadi ${newStatus}.`
                );

                await loadMasterData();

            } catch (error) {
                showMasterMessage(error.message);
            }

            return;
        }

        if (action === "edit") {

            const item = masterRows.find(
                data => String(data.id) === String(id)
            );

            if (!item) return;

            editingMasterId = item.id;

            document.getElementById("modalTitle").textContent =
                "Edit " + categoryConfig[activeCategory].label;

            document.getElementById("inputNamaData").value =
                item.nama || "";

            document.getElementById("inputDeskripsiData").value =
                item.deskripsi || "";

            modal.style.display = "flex";
        }

        if (action === "delete") {

            const confirmed = confirm(
                "Apakah Anda yakin ingin menghapus data ini?"
            );

            if (!confirmed) return;

            try {

                await masterRequest(
                    `${MASTER_API_URL}/${activeCategory}/${id}`,
                    {
                        method: "DELETE"
                    }
                );

                showMasterMessage("Data berhasil dihapus.");

                await loadMasterData();

            } catch (error) {

                showMasterMessage(error.message);
            }
        }
    });

    // ==========================================
    // PENCARIAN DATA REFERENSI
    // ==========================================

    document.getElementById("searchInput")
        .addEventListener("input", renderMasterTable);

    // ==========================================
    // INISIALISASI
    // ==========================================

    loadMasterData();

});


// ==========================================
// ADMIN - DAFTAR DATASET
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const datasetTableBody = document.getElementById("datasetTableBody");

    // Pastikan hanya berjalan pada halaman Data Master
    if (!datasetTableBody) return;

    const DATASET_API_URL = "/SIPIKA/backend/admin/datasets";
    const searchDatasetInput = document.getElementById("searchDatasetInput");

    let datasetList = [];

    async function loadDataset() {
        datasetTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Memuat data dataset...
                </td>
            </tr>
        `;

        try {
            const response = await fetch(DATASET_API_URL, {
                method: "GET",
                credentials: "same-origin"
            });

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Gagal mengambil dataset.");
            }

            datasetList = Array.isArray(result.data) ? result.data : [];
            window.adminDatasetList = datasetList;

            renderDataset(datasetList);

        } catch (error) {
            console.error("Gagal memuat dataset:", error);

            datasetTableBody.innerHTML = "";

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;
            cell.className = "text-center";
            cell.textContent = error.message || "Gagal memuat data dataset.";

            row.appendChild(cell);
            datasetTableBody.appendChild(row);
        }
    }


    function renderDataset(data) {
        datasetTableBody.innerHTML = "";

        if (data.length === 0) {
            datasetTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Belum ada dataset yang diunggah.
                </td>
            </tr>
        `;
            return;
        }

        data.forEach((dataset, index) => {
            const row = document.createElement("tr");

            const tanggal = dataset.created_at
                ? new Date(
                    String(dataset.created_at).replace(" ", "T")
                ).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })
                : "-";

            // Nomor
            const nomorCell = document.createElement("td");
            nomorCell.textContent = index + 1;
            row.appendChild(nomorCell);

            // Nama Dataset
            const namaCell = document.createElement("td");
            namaCell.textContent = dataset.nama_file || "-";
            namaCell.classList.add("fw-semibold");
            row.appendChild(namaCell);

            // Jumlah Data
            const jumlahCell = document.createElement("td");
            jumlahCell.textContent = Number(
                dataset.jumlah_data || 0
            ).toLocaleString("id-ID");
            row.appendChild(jumlahCell);

            // Tanggal Upload
            const tanggalCell = document.createElement("td");
            tanggalCell.textContent = tanggal;
            row.appendChild(tanggalCell);

            // Status
            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.textContent = dataset.status || "-";
            statusBadge.classList.add(
                "badge",
                dataset.status === "Aktif"
                    ? "badge-status-aktif"
                    : "badge-status-nonaktif"
            );

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);

            // Aksi
            const actionCell = document.createElement("td");
            const actionWrapper = document.createElement("div");
            actionWrapper.className = "action-buttons";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.className =
                "btn-icon text-blue btn-edit btn-edit-dataset";
            editButton.title = "Edit";
            editButton.dataset.action = "edit";
            editButton.dataset.id = dataset.id;
            editButton.innerHTML = '<i class="fa-solid fa-pen"></i>';

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className =
                "btn-icon text-red btn-delete btn-delete-dataset";
            deleteButton.title = "Hapus";
            deleteButton.dataset.action = "delete";
            deleteButton.dataset.id = dataset.id;
            deleteButton.innerHTML =
                '<i class="fa-solid fa-trash-can"></i>';

            actionWrapper.appendChild(editButton);
            actionWrapper.appendChild(deleteButton);
            actionCell.appendChild(actionWrapper);
            row.appendChild(actionCell);

            datasetTableBody.appendChild(row);
        });
    }


    // Pencarian dataset
    if (searchDatasetInput) {
        searchDatasetInput.addEventListener("input", function () {
            const keyword = this.value.toLowerCase().trim();

            const filteredData = datasetList.filter(dataset =>
                String(dataset.nama_file || "")
                    .toLowerCase()
                    .includes(keyword)
            );

            renderDataset(filteredData);
        });
    }

    // Simpan fungsi agar dapat dipanggil dari bagian lain
    window.loadAdminDataset = loadDataset;

    // Ambil data ketika halaman dibuka
    loadDataset();
});


// ==========================================
// ADMIN - UPLOAD DATASET CSV
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const uploadButton = document.getElementById("btnTambahDataset");
    const fileInput = document.getElementById("inputFileDataset");

    // Pastikan hanya berjalan pada halaman Data Master
    if (!uploadButton || !fileInput) return;

    const DATASET_API_URL = "/SIPIKA/backend/admin/datasets";

    // Klik tombol upload untuk memilih file
    uploadButton.addEventListener("click", function () {
        fileInput.click();
    });

    // Proses file setelah dipilih
    fileInput.addEventListener("change", async function () {
        const file = this.files[0];

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".csv")) {
            alert("Format file harus CSV.");
            this.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Ukuran file maksimal 10 MB.");
            this.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("dataset", file);

        uploadButton.disabled = true;
        uploadButton.textContent = "Mengunggah...";

        try {
            const response = await fetch(DATASET_API_URL, {
                method: "POST",
                credentials: "same-origin",
                body: formData
            });

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Upload dataset gagal.");
            }

            alert(result.message || "Dataset berhasil diunggah.");

            // Muat ulang daftar dataset
            if (typeof window.loadAdminDataset === "function") {
                await window.loadAdminDataset();
            }

        } catch (error) {
            console.error("Upload dataset gagal:", error);
            alert(error.message || "Terjadi kesalahan saat mengunggah dataset.");
        } finally {
            uploadButton.disabled = false;
            uploadButton.textContent = "Tambah Dataset";
            fileInput.value = "";
        }
    });
});


// ==========================================
// ADMIN - EDIT DATASET
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const datasetTableBody = document.getElementById("datasetTableBody");
    const editModal = document.getElementById("modalEditDataset");
    const editForm = document.getElementById("formEditDataset");

    const inputNama = document.getElementById("editNamaDataset");
    const inputJumlah = document.getElementById("editJumlahDataset");

    const closeButton = document.getElementById("btnCloseEditDataset");
    const cancelButton = document.getElementById("btnBatalEditDataset");

    if (
        !datasetTableBody ||
        !editModal ||
        !editForm ||
        !inputNama ||
        !inputJumlah
    ) return;

    const DATASET_API_URL = "/SIPIKA/backend/admin/datasets";

    let selectedDatasetId = null;

    // Jumlah data hanya ditampilkan, tidak boleh diedit
    inputJumlah.readOnly = true;

    function closeEditModal() {
        editModal.style.display = "none";
        editForm.reset();
        selectedDatasetId = null;
    }

    function openEditModal(dataset) {
        selectedDatasetId = dataset.id;

        inputNama.value = dataset.nama_file || "";
        inputJumlah.value = dataset.jumlah_data || 0;

        editModal.style.display = "flex";
    }

    // Klik tombol Edit pada tabel dataset
    datasetTableBody.addEventListener("click", function (event) {
        const editButton = event.target.closest(
            'button[data-action="edit"]'
        );

        if (!editButton) return;

        const datasetId = editButton.dataset.id;

        const dataset = (window.adminDatasetList || [])
            .find(item => String(item.id) === String(datasetId));

        if (dataset) {
            openEditModal(dataset);
        }
    });

    // Simpan perubahan nama dataset
    editForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!selectedDatasetId) return;

        const namaFile = inputNama.value.trim();

        if (!namaFile) {
            alert("Nama dataset wajib diisi.");
            return;
        }

        const submitButton = editForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch(
                `${DATASET_API_URL}/${selectedDatasetId}`,
                {
                    method: "PUT",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nama_file: namaFile
                    })
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal memperbarui dataset."
                );
            }

            alert(result.message || "Dataset berhasil diperbarui.");

            closeEditModal();

            if (typeof window.loadAdminDataset === "function") {
                await window.loadAdminDataset();
            }

        } catch (error) {
            console.error("Edit dataset gagal:", error);
            alert(error.message);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });

    // Tombol tutup dan batal
    if (closeButton) {
        closeButton.addEventListener("click", closeEditModal);
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", closeEditModal);
    }
});

// ==========================================
// ADMIN - HAPUS DATASET
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const datasetTableBody = document.getElementById("datasetTableBody");

    if (!datasetTableBody) return;

    const DATASET_API_URL = "/SIPIKA/backend/admin/datasets";

    datasetTableBody.addEventListener("click", async function (event) {
        const deleteButton = event.target.closest(
            'button[data-action="delete"]'
        );

        if (!deleteButton) return;

        const datasetId = deleteButton.dataset.id;

        if (!datasetId) return;

        const dataset = (window.adminDatasetList || [])
            .find(item => String(item.id) === String(datasetId));

        const namaDataset = dataset
            ? dataset.nama_file
            : "dataset ini";

        const konfirmasi = confirm(
            `Apakah Anda yakin ingin menghapus dataset "${namaDataset}"?\n\n` +
            "Data dataset beserta seluruh detail barisnya akan dihapus."
        );

        if (!konfirmasi) return;

        const originalContent = deleteButton.innerHTML;

        deleteButton.disabled = true;
        deleteButton.textContent = "Menghapus...";

        try {
            const response = await fetch(
                `${DATASET_API_URL}/${datasetId}`,
                {
                    method: "DELETE",
                    credentials: "same-origin"
                }
            );

            const result = await response.json();

            if (!response.ok || result.status !== "success") {
                throw new Error(
                    result.message || "Gagal menghapus dataset."
                );
            }

            alert(result.message || "Dataset berhasil dihapus.");

            if (typeof window.loadAdminDataset === "function") {
                await window.loadAdminDataset();
            }

        } catch (error) {
            console.error("Hapus dataset gagal:", error);
            alert(error.message || "Terjadi kesalahan saat menghapus dataset.");

            deleteButton.disabled = false;
            deleteButton.innerHTML = originalContent;
        }
    });
});
