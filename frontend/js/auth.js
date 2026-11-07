/* =========================================
   1. FITUR TAMPILKAN / SEMBUNYIKAN PASSWORD
========================================= */

// Mengambil elemen input password, tombol toggle, dan ikon password
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const passwordToggleIcon = document.getElementById("passwordToggleIcon");

// Memastikan seluruh elemen tersedia sebelum fitur dijalankan
if (passwordInput && togglePassword && passwordToggleIcon) {

    // Menambahkan event click pada tombol tampilkan password
    togglePassword.addEventListener("click", function () {

        // Memeriksa apakah password sedang dalam kondisi tersembunyi
        const isPasswordHidden = passwordInput.type === "password";

        if (isPasswordHidden) {

            // Mengubah tipe input agar password dapat terlihat
            passwordInput.type = "text";

            // Mengubah ikon menjadi mata dicoret
            passwordToggleIcon.src = "../../assets/icons/eye_off.svg";

            // Memperbarui label tombol untuk aksesibilitas
            togglePassword.setAttribute(
                "aria-label",
                "Sembunyikan kata sandi"
            );

            // Menandakan bahwa password sedang ditampilkan
            togglePassword.setAttribute("aria-pressed", "true");

        } else {

            // Mengubah tipe input agar password kembali tersembunyi
            passwordInput.type = "password";

            // Mengubah ikon menjadi mata terbuka
            passwordToggleIcon.src = "../../assets/icons/eye.svg";

            // Memperbarui label tombol untuk aksesibilitas
            togglePassword.setAttribute(
                "aria-label",
                "Tampilkan kata sandi"
            );

            // Menandakan bahwa password sedang disembunyikan
            togglePassword.setAttribute("aria-pressed", "false");

        }

    });

}


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
        const password = passwordInput.value;
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