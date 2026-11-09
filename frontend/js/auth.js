/* =========================================
   1. FITUR TAMPILKAN / SEMBUNYIKAN PASSWORD
========================================= */

// Membuat fungsi untuk mengatur tombol ikon mata
function setupPasswordToggle(inputId, buttonId, iconId) {

    // Mengambil elemen HTML berdasarkan ID
    const passwordInput = document.getElementById(inputId);
    const togglePassword = document.getElementById(buttonId);
    const passwordToggleIcon = document.getElementById(iconId);

    // Memastikan semua elemen tersedia
    if (passwordInput && togglePassword && passwordToggleIcon) {

        // Menambahkan event ketika tombol mata diklik
        togglePassword.addEventListener("click", function () {

            // Memeriksa apakah password sedang tersembunyi
            const isPasswordHidden = passwordInput.type === "password";

            if (isPasswordHidden) {

                // Menampilkan password
                passwordInput.type = "text";

                // Mengubah ikon menjadi mata dicoret
                passwordToggleIcon.innerHTML = `
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
                    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a14 14 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8"/>
                `;

                togglePassword.setAttribute(
                    "aria-label",
                    "Sembunyikan kata sandi"
                );

                togglePassword.setAttribute("aria-pressed", "true");

            } else {

                // Menyembunyikan password
                passwordInput.type = "password";

                // Mengembalikan ikon menjadi mata terbuka
                passwordToggleIcon.innerHTML = `
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
                    <circle cx="12" cy="12" r="3"/>
                `;

                togglePassword.setAttribute(
                    "aria-label",
                    "Tampilkan kata sandi"
                );

                togglePassword.setAttribute("aria-pressed", "false");

            }

        });

    }

}

// Mengaktifkan fitur pada kolom password Login dan Register
setupPasswordToggle("password", "togglePassword", "passwordToggleIcon");

// Mengaktifkan fitur pada kolom konfirmasi password Register
setupPasswordToggle(
    "confirmPassword",
    "toggleConfirmPassword",
    "confirmPasswordToggleIcon"
);


/* =========================================
   2. VALIDASI FORM LOGIN
========================================= */

// Mengambil elemen form Login berdasarkan ID
const loginForm = document.getElementById("loginForm");

// Memastikan form Login tersedia pada halaman yang sedang dibuka
if (loginForm) {

    // Menambahkan event submit ketika pengguna menekan tombol Masuk
    loginForm.addEventListener("submit", function (event) {

        // Mencegah form melakukan pengiriman secara otomatis
        event.preventDefault();

        // Mengambil nilai username, password, dan pilihan pengguna
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        // Memeriksa apakah seluruh kolom login sudah diisi
        if (username === "" || password === "" || role === "") {

            alert("Mohon lengkapi seluruh data login.");

            return;

        }

        // Mengarahkan pengguna berdasarkan role yang dipilih
        if (role === "nelayan") {

            // Mengarahkan pengguna ke Dashboard Nelayan
            window.location.href = "../nelayan/dashboard.html";

        } else if (role === "petugas") {

            // Mengarahkan pengguna ke Dashboard Petugas
            window.location.href = "../petugas/dashboard.html";

        } else if (role === "admin") {

            // Mengarahkan pengguna ke Dashboard Admin
            window.location.href = "../admin/dashboard.html";

        }

    });

}


/* =========================================
   3. VALIDASI FORM REGISTER
========================================= */

// Mengambil elemen form Register berdasarkan ID
const registerForm = document.getElementById("registerForm");

// Memastikan form Register tersedia pada halaman yang sedang dibuka
if (registerForm) {

    // Menambahkan event submit pada form Register
    registerForm.addEventListener("submit", function (event) {

        // Mencegah form melakukan pengiriman secara otomatis
        event.preventDefault();

        // Mengambil nilai email dan kedua kolom password
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Memeriksa apakah seluruh kolom pendaftaran sudah diisi
        if (email === "" || password === "" || confirmPassword === "") {
            alert("Mohon lengkapi seluruh data pendaftaran.");
            return;
        }

        // Memeriksa apakah password dan konfirmasi password sesuai
        if (password !== confirmPassword) {
            alert("Konfirmasi kata sandi tidak sesuai.");
            return;
        }

        // Memeriksa apakah password memiliki minimal 8 karakter
        if (password.length < 8) {
            alert("Kata sandi minimal terdiri dari 8 karakter.");
            return;
        }

        // Memberikan informasi bahwa validasi frontend berhasil
        alert(
            "Form pendaftaran berhasil divalidasi. " +
            "Proses penyimpanan akun akan dilanjutkan melalui backend."
        );

    });

}


/* =========================================
   4. VALIDASI FORM LUPA KATA SANDI
========================================= */

// Mengambil elemen form Lupa Kata Sandi berdasarkan ID
const forgotForm = document.getElementById("forgotForm");

// Memastikan form Lupa Kata Sandi tersedia pada halaman yang sedang dibuka
if (forgotForm) {

    // Menambahkan event submit pada form Lupa Kata Sandi
    forgotForm.addEventListener("submit", function (event) {

        // Mencegah form melakukan pengiriman secara otomatis
        event.preventDefault();

        // Mengambil nilai email yang dimasukkan pengguna
        const email = document.getElementById("email").value.trim();

        // Memeriksa apakah kolom email sudah diisi
        if (email === "") {
            alert("Mohon masukkan email terdaftar.");
            return;
        }

        // Memberikan informasi bahwa validasi frontend berhasil
        alert(
            "Email berhasil divalidasi. " +
            "Pengiriman tautan pemulihan akan dihubungkan melalui backend."
        );

    });

}


/* =========================================
   5. VALIDASI FORM RESET PASSWORD
========================================= */

// Mengambil elemen form Reset Password berdasarkan ID
const resetForm = document.getElementById("resetForm");

// Memastikan form Reset Password tersedia pada halaman yang sedang dibuka
if (resetForm) {

    // Menambahkan event submit pada form Reset Password
    resetForm.addEventListener("submit", function (event) {

        // Mencegah form melakukan pengiriman secara otomatis
        event.preventDefault();

        // Mengambil nilai password baru dan konfirmasi password
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Memeriksa apakah seluruh kolom password sudah diisi
        if (newPassword === "" || confirmPassword === "") {
            alert("Mohon lengkapi seluruh data password.");
            return;
        }

        // Memeriksa apakah password baru memiliki minimal 8 karakter
        if (newPassword.length < 8) {
            alert("Password baru minimal terdiri dari 8 karakter.");
            return;
        }

        // Memeriksa apakah password baru dan konfirmasinya sesuai
        if (newPassword !== confirmPassword) {
            alert("Konfirmasi password tidak sesuai.");
            return;
        }

        // Memberikan informasi bahwa validasi frontend berhasil
        alert("Password baru berhasil divalidasi. Proses perubahan password akan dilanjutkan melalui backend.");

    });

}