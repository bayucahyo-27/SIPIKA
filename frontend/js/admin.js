
document.addEventListener("DOMContentLoaded", function () {

    // Mengambil elemen pencarian dan filter
    const searchInput = document.getElementById("search-user");
    const roleFilter = document.getElementById("filter-role");
    const statusFilter = document.getElementById("filter-status");

    // Mengambil seluruh baris pengguna
    const userTable = document.querySelector(".user-table");
    const tableBody = userTable?.querySelector("tbody");

    if (!searchInput || !roleFilter || !statusFilter || !tableBody) {
        return;
    }

    // Fungsi pencarian dan filter pengguna
    function filterUsers() {

        const searchValue = searchInput.value.toLowerCase().trim();
        const selectedRole = roleFilter.value.toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase();

        const rows = tableBody.querySelectorAll("tr");

        rows.forEach(row => {

            const name = row.cells[1].textContent.toLowerCase();
            const username = row.cells[2].textContent.toLowerCase();
            const email = row.cells[3].textContent.toLowerCase();

            const role = row.cells[5].textContent.toLowerCase().trim();
            const status = row.cells[6].textContent.toLowerCase().trim();

            // Memeriksa kecocokan pencarian
            const matchesSearch =
                name.includes(searchValue) ||
                username.includes(searchValue) ||
                email.includes(searchValue);

            // Memeriksa kecocokan role
            const matchesRole =
                selectedRole === "semua" ||
                role === selectedRole;

            // Memeriksa kecocokan status
            const matchesStatus =
                selectedStatus === "semua" ||
                status === selectedStatus;

            // Menampilkan atau menyembunyikan baris
            row.dataset.filtered =
                matchesSearch && matchesRole && matchesStatus
                    ? "true"
                    : "false";;
        });
        document.dispatchEvent(new Event("sipikaUsersFiltered"));
    }

    // Menjalankan pencarian ketika pengguna mengetik
    searchInput.addEventListener("input", filterUsers);

    // Menjalankan filter ketika pilihan berubah
    roleFilter.addEventListener("change", filterUsers);
    statusFilter.addEventListener("change", filterUsers);

});

// ==========================================
// FITUR TAMBAH PENGGUNA
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    const addUserButton = document.querySelector(".btn-add-user");
    const addUserModal = document.getElementById("addUserModal");
    const closeAddModal = document.getElementById("closeAddModal");
    const cancelAddModal = document.getElementById("cancelAddModal");
    const addUserForm = document.getElementById("addUserForm");
    const tableBody = document.querySelector(".user-table tbody");

    if (!addUserButton || !addUserModal || !addUserForm || !tableBody) {
        return;
    }

    // Mengambil data pengguna tambahan dari localStorage
    let additionalUsers = JSON.parse(
        localStorage.getItem("sipikaAdminUsers") || "[]"
    );

    // Membuka modal
    addUserButton.addEventListener("click", function () {
        addUserModal.hidden = false;
    });

    // Menutup modal
    function closeModal() {
        addUserModal.hidden = true;
        addUserForm.reset();
    }

    closeAddModal.addEventListener("click", closeModal);
    cancelAddModal.addEventListener("click", closeModal);

    // Membuat baris pengguna pada tabel

    function createUserRow(user, number) {
        const row = document.createElement("tr");

        // Data pengguna
        const values = [
            number,
            user.name,
            user.username,
            user.email,
            user.password,
            user.role,
            "Aktif",
            user.date,
        ];

        // Membuat kolom data
        values.forEach((value, index) => {
            const cell = document.createElement("td");

            if (index === 5) {
                // Badge Role
                const roleBadge = document.createElement("span");

                roleBadge.className = user.role === "Petugas"
                    ? "user-badge badge-petugas"
                    : "user-badge badge-nelayan";

                roleBadge.textContent = user.role;
                cell.appendChild(roleBadge);

            } else if (index === 6) {
                // Badge Status
                const statusBadge = document.createElement("span");
                statusBadge.className = "user-badge badge-aktif";
                statusBadge.textContent = "Aktif";

                cell.appendChild(statusBadge);

            } else {
                cell.textContent = value;
            }

            row.appendChild(cell);
        });

        // Kolom Aksi
        const actionCell = document.createElement("td");

        actionCell.innerHTML = `
        <div class="user-action-buttons">

            <button type="button" class="btn-edit" title="Edit">
                ✎
            </button>

            <button type="button" class="btn-delete" title="Hapus">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>

            <span class="status-toggle active"></span>

        </div>
    `;

        row.appendChild(actionCell);

        return row;
    }

    // Menampilkan pengguna tambahan
    function renderAdditionalUsers() {
        additionalUsers.forEach((user, index) => {
            const row = createUserRow(
                user,
                tableBody.rows.length + 1
            );

            tableBody.appendChild(row);
        });
    }

    renderAdditionalUsers();

    // ==========================================
    // DATA SIMULASI DAN PAGINATION
    // ==========================================

    const pageSize = 10;
    let currentPage = 1;

    const paginationButtons = document.querySelector(
        ".pagination-buttons"
    );

    const paginationLabel = document.querySelector(
        ".user-pagination span"
    );

    // Membuat data simulasi sampai total 152 pengguna
    const totalDemoUsers = 152;
    const remainingUsers = Math.max(
        0,
        totalDemoUsers - tableBody.rows.length
    );

    for (let i = 1; i <= remainingUsers; i++) {
        const number = tableBody.rows.length + 1;

        const role = i % 4 === 0 ? "Petugas" : "Nelayan";

        const demoUser = {
            name: `Pengguna Demo ${String(number).padStart(3, "0")}`,
            username: `demo${String(number).padStart(3, "0")}`,
            email: `demo${number}@sipika.com`,
            password: `sipika${number}`,
            role: role,
            status: "Aktif",
            date: "10 Mar 2025"
        };

        const row = createUserRow(demoUser, number);
        tableBody.appendChild(row);
    }

    // Mengambil seluruh pengguna yang lolos filter
    function getFilteredRows() {
        return Array.from(tableBody.rows).filter(
            row => row.dataset.filtered !== "false"
        );
    }

    // Membuat tombol pagination
    function createPageButton(label, page, active = false, disabled = false) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;

        if (active) {
            button.classList.add("active");
        }

        button.disabled = disabled;

        button.addEventListener("click", function () {
            renderPagination(page);
        });

        return button;
    }

    // Menampilkan halaman yang dipilih
    function renderPagination(page = 1) {
        const allRows = Array.from(tableBody.rows);
        const filteredRows = getFilteredRows();

        const totalPages = Math.max(
            1,
            Math.ceil(filteredRows.length / pageSize)
        );

        currentPage = Math.min(
            Math.max(1, page),
            totalPages
        );

        // Sembunyikan semua baris terlebih dahulu
        allRows.forEach(row => {
            row.style.display = "none";
        });

        // Tampilkan 10 pengguna sesuai halaman
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        filteredRows.slice(startIndex, endIndex).forEach(row => {
            row.style.display = "";
        });

        // Perbarui informasi jumlah pengguna
        const startNumber = filteredRows.length === 0
            ? 0
            : startIndex + 1;

        const endNumber = Math.min(
            endIndex,
            filteredRows.length
        );

        paginationLabel.textContent =
            `Menampilkan ${startNumber}–${endNumber} dari ${filteredRows.length} pengguna`;

        // Membuat tombol pagination
        paginationButtons.innerHTML = "";

        paginationButtons.appendChild(
            createPageButton("‹", currentPage - 1, false, currentPage === 1)
        );

        let pages = [];

        if (totalPages <= 5) {
            pages = Array.from(
                { length: totalPages },
                (_, i) => i + 1
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

        pages.forEach(item => {
            if (item === "...") {
                const dots = document.createElement("button");

                dots.type = "button";
                dots.textContent = "...";

                dots.addEventListener("click", function () {
                    renderPagination(
                        Math.min(currentPage + 3, totalPages)
                    );
                });

                paginationButtons.appendChild(dots);
            } else {
                paginationButtons.appendChild(
                    createPageButton(
                        item,
                        item,
                        item === currentPage
                    )
                );
            }
        });

        paginationButtons.appendChild(
            createPageButton(
                "›",
                currentPage + 1,
                false,
                currentPage === totalPages
            )
        );
    }

    // Pagination diperbarui ketika pencarian/filter berubah
    document.addEventListener("sipikaUsersFiltered", function () {
        renderPagination(1);
    });

    // Tampilkan halaman pertama
    renderPagination(1);

    // ==========================================
    // FUNGSI TOMBOL AKSI PENGGUNA
    // ==========================================

    tableBody.addEventListener("click", function (event) {
        const row = event.target.closest("tr");

        if (!row) return;

        // TOMBOL HAPUS
        if (event.target.closest(".btn-delete")) {
            const username = row.cells[2].textContent.trim();

            const confirmation = confirm(
                "Apakah Anda yakin ingin menghapus pengguna ini?"
            );

            if (!confirmation) return;

            additionalUsers = additionalUsers.filter(
                user => user.username !== username
            );

            localStorage.setItem(
                "sipikaAdminUsers",
                JSON.stringify(additionalUsers)
            );

            row.remove();

            // Perbarui nomor urut
            Array.from(tableBody.rows).forEach((item, index) => {
                item.cells[0].textContent = index + 1;
            });

            alert("Pengguna berhasil dihapus!");
        }

        // TOMBOL EDIT
        if (event.target.closest(".btn-edit")) {
            const oldUsername = row.cells[2].textContent.trim();

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

            const password = prompt(
                "Ubah password:",
                row.cells[4].textContent
            );
            if (password === null) return;

            const role = prompt(
                "Masukkan role (Petugas/Nelayan):",
                row.cells[5].textContent.trim()
            );
            if (role === null) return;

            if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
                alert("Data tidak boleh kosong!");
                return;
            }

            const normalizedRole = role.trim().toLowerCase();

            if (!["petugas", "nelayan"].includes(normalizedRole)) {
                alert("Role harus Petugas atau Nelayan!");
                return;
            }

            const duplicate = Array.from(tableBody.rows).some(item =>
                item !== row &&
                item.cells[2].textContent.trim().toLowerCase() === username.trim().toLowerCase()
            );

            if (duplicate) {
                alert("Username sudah digunakan!");
                return;
            }

            const updatedUser = {
                name: name.trim(),
                username: username.trim(),
                email: email.trim(),
                password: password.trim(),
                role: normalizedRole === "petugas" ? "Petugas" : "Nelayan",
                status: row.cells[6].textContent.trim(),
                date: row.cells[7].textContent.trim()
            };

            // Perbarui tampilan tabel
            row.cells[1].textContent = updatedUser.name;
            row.cells[2].textContent = updatedUser.username;
            row.cells[3].textContent = updatedUser.email;
            row.cells[4].textContent = updatedUser.password;

            const roleBadge = row.cells[5].querySelector("span");
            roleBadge.textContent = updatedUser.role;
            roleBadge.className = updatedUser.role === "Petugas"
                ? "user-badge badge-petugas"
                : "user-badge badge-nelayan";

            // Perbarui penyimpanan pengguna tambahan
            const userIndex = additionalUsers.findIndex(
                user => user.username === oldUsername
            );

            if (userIndex !== -1) {
                additionalUsers[userIndex] = updatedUser;

                localStorage.setItem(
                    "sipikaAdminUsers",
                    JSON.stringify(additionalUsers)
                );
            }

            alert("Data pengguna berhasil diperbarui!");
        }

        // TOGGLE STATUS
        if (event.target.closest(".status-toggle")) {
            const toggle = event.target.closest(".status-toggle");
            const statusBadge = row.cells[6].querySelector("span");
            const username = row.cells[2].textContent.trim();

            const isActive = toggle.classList.toggle("active");

            statusBadge.textContent = isActive
                ? "Aktif"
                : "Tidak Aktif";

            statusBadge.className = isActive
                ? "user-badge badge-aktif"
                : "user-badge badge-nonaktif";

            const userIndex = additionalUsers.findIndex(
                user => user.username === username
            );

            if (userIndex !== -1) {
                additionalUsers[userIndex].status = isActive
                    ? "Aktif"
                    : "Tidak Aktif";

                localStorage.setItem(
                    "sipikaAdminUsers",
                    JSON.stringify(additionalUsers)
                );
            }
        }
    });

    // Menyimpan pengguna baru
    addUserForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("newUserName").value.trim();
        const username = document.getElementById("newUsername").value.trim();
        const email = document.getElementById("newUserEmail").value.trim();
        const password = document.getElementById("newUserPassword").value;
        const role = document.getElementById("newUserRole").value;

        if (!name || !username || !email || !password || !role) {
            alert("Semua data harus diisi!");
            return;
        }

        // Memeriksa username yang sama
        const usernameExists = additionalUsers.some(
            user => user.username.toLowerCase() === username.toLowerCase()
        );

        if (usernameExists) {
            alert("Username sudah digunakan!");
            return;
        }

        const newUser = {
            name: name,
            username: username,
            email: email,
            password: password,
            role: role,
            status: "Aktif",
            date: new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
        };

        // Simpan data pengguna tambahan
        additionalUsers.push(newUser);

        localStorage.setItem(
            "sipikaAdminUsers",
            JSON.stringify(additionalUsers)
        );

        // Tambahkan pengguna ke tabel
        const newRow = createUserRow(
            newUser,
            tableBody.rows.length + 1
        );

        tableBody.appendChild(newRow);
        // Menampilkan ikon Lucide pada baris baru
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

        alert("Pengguna berhasil ditambahkan!");

        closeModal();
    });
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
