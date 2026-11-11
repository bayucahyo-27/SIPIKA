/**
 * ==========================================
 * AUTH.JS - SIPIKA Authentication (Final Version)
 * ==========================================
 * Menggabungkan validasi UI yang rapi dengan simulasi Session Management.
 */

// --- FUNGSI CADANGAN (BIAR GAK ERROR "saveSession is not defined" LAGI) ---
function saveSession(userData) {
  localStorage.setItem("sipika_user", JSON.stringify(userData));
  localStorage.setItem("sipika_isLoggedIn", "true");
}
// --------------------------------------------------------------------------

/* =========================================
   1. FITUR TAMPILKAN / SEMBUNYIKAN PASSWORD (Kode Asli Teman Lu)
========================================= */
function setupPasswordToggle(inputId, buttonId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const togglePassword = document.getElementById(buttonId);
  const passwordToggleIcon = document.getElementById(iconId);

  if (passwordInput && togglePassword && passwordToggleIcon) {
    togglePassword.addEventListener("click", function () {
      const isPasswordHidden = passwordInput.type === "password";

      if (isPasswordHidden) {
        passwordInput.type = "text";
        passwordToggleIcon.innerHTML = `<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a14 14 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8"/>`;
        togglePassword.setAttribute("aria-label", "Sembunyikan kata sandi");
        togglePassword.setAttribute("aria-pressed", "true");
      } else {
        passwordInput.type = "password";
        passwordToggleIcon.innerHTML = `<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>`;
        togglePassword.setAttribute("aria-label", "Tampilkan kata sandi");
        togglePassword.setAttribute("aria-pressed", "false");
      }
    });
  }
}

setupPasswordToggle("password", "togglePassword", "passwordToggleIcon");
setupPasswordToggle(
  "confirmPassword",
  "toggleConfirmPassword",
  "confirmPasswordToggleIcon",
);

/* =========================================
   2. LOGIKA LOGIN (DITAMBAHKAN SAVE SESSION)
========================================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const btnMasuk = loginForm.querySelector("button[type='submit']");

    if (username === "" || password === "" || role === "") {
      alert("Mohon lengkapi seluruh data login.");
      return;
    }

    // Simulasi Loading
    const originalText = btnMasuk.innerText;
    btnMasuk.innerText = "Memproses...";
    btnMasuk.disabled = true;

    setTimeout(() => {
      //  KITA SIMPAN SESSION AGAR GLOBAL.JS TIDAK MENENDANG USER ---
      const userData = {
        username: username,
        nama_lengkap: username, // Bisa disesuaikan nanti
        role: role,
      };

      // Panggil fungsi saveSession 
      saveSession(userData);

      // Redirect sesuai role
      if (role === "nelayan") {
        window.location.href = "../nelayan/dashboard.html";
      } else if (role === "petugas") {
        window.location.href = "../petugas/dashboard.html";
      } else if (role === "admin") {
        window.location.href = "../admin/dashboard.html";
      }
    }, 800); // Delay 0.8 detik agar terasa seperti memproses
  });
}

/* =========================================
   3. LOGIKA REGISTER (SIMULASI PENYIMPANAN)
========================================= */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const btnDaftar = registerForm.querySelector("button[type='submit']");

    if (email === "" || password === "" || confirmPassword === "") {
      alert("Mohon lengkapi seluruh data pendaftaran.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Konfirmasi kata sandi tidak sesuai.");
      return;
    }

    if (password.length < 8) {
      alert("Kata sandi minimal terdiri dari 8 karakter.");
      return;
    }

    const originalText = btnDaftar.innerText;
    btnDaftar.innerText = "Mendaftarkan...";
    btnDaftar.disabled = true;

    setTimeout(() => {
      // Simpan ke mock database di localStorage
      let users = JSON.parse(localStorage.getItem("sipika_mock_users")) || [];

      // Cek duplikat
      if (users.some((u) => u.email === email)) {
        alert("Email sudah terdaftar!");
        btnDaftar.innerText = originalText;
        btnDaftar.disabled = false;
        return;
      }

      // Buat user baru (Default role petugas untuk kemudahan testing lu)
      const newUser = {
        id: Date.now(),
        username: email.split("@")[0],
        nama_lengkap: email.split("@")[0],
        email: email,
        password: password,
        role: "petugas", // <--- Default petugas biar lu gampang test login petugas
      };

      users.push(newUser);
      localStorage.setItem("sipika_mock_users", JSON.stringify(users));

      alert("Registrasi berhasil! Silakan login.");
      window.location.href = "login.html";
    }, 800);
  });
}

/* =========================================
   4 & 5. LUPA & RESET PASSWORD (SIMULASI)
========================================= */
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) {
      alert("Mohon masukkan email terdaftar.");
      return;
    }
    alert("Link pemulihan password telah dikirim ke email Anda. (Simulasi)");
  });
}

const resetForm = document.getElementById("resetForm");
if (resetForm) {
  resetForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (
      !newPassword ||
      !confirmPassword ||
      newPassword.length < 8 ||
      newPassword !== confirmPassword
    ) {
      alert("Password tidak valid atau tidak sesuai.");
      return;
    }
    alert("Password berhasil diubah! Silakan login. (Simulasi)");
    window.location.href = "login.html";
  });
}
