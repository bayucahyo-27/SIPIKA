/**
 * AUTH.JS - Versi Lengkap (Login + Toggle + Register)
 */

console.log("=== auth.js MULAI DIBACA ===");

// ==========================================
// 1. LOGIKA LOGIN
// ==========================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  console.log("✅ loginForm DITEMUKAN");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("🔥 Form Login disubmit!");

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (username === "" || password === "" || role === "") {
      if (typeof showNotification === "function") {
        showNotification("Mohon lengkapi seluruh data login.", "error");
      } else {
        alert("Mohon lengkapi seluruh data login.");
      }
      return;
    }

    if (typeof saveSession === "function") {
      saveSession({
        username: username,
        nama_lengkap: username,
        role: role,
      });
      console.log("✅ Sesi disimpan untuk role:", role);
    }

    if (role === "nelayan") {
      window.location.href = "../nelayan/dashboard.html";
    } else if (role === "petugas") {
      window.location.href = "../petugas/dashboard.html";
    } else if (role === "admin") {
      window.location.href = "../admin/dashboard.html";
    }
  });
} else {
  console.log("ℹ️ loginForm tidak ditemukan (halaman ini bukan login)");
}

// ==========================================
// 2. TOGGLE PASSWORD (Untuk Login & Register)
// ==========================================
console.log("=== Menambahkan Toggle Password ===");

function setupTogglePassword(toggleId, inputId, iconId) {
  const toggleBtn = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (toggleBtn && input) {
    toggleBtn.addEventListener("click", function () {
      if (input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.innerHTML = `
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/>
            <circle cx="12" cy="12" r="3"/>
          `;
        }
        console.log("👁️ Password terlihat");
      } else {
        input.type = "password";
        if (icon) {
          icon.innerHTML = `
            <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a14 14 0 0 1-3.1 3.8M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.4 0 2.7-.3 3.8-.8"/>
          `;
        }
        console.log("🙈 Password tersembunyi");
      }
    });
    console.log("✅ Toggle untuk", inputId, "berhasil ditambahkan");
  }
}

// Setup toggle untuk password pertama (login & register)
setupTogglePassword("togglePassword", "password", "passwordToggleIcon");

// Setup toggle untuk konfirmasi password (hanya di register)
setupTogglePassword(
  "toggleConfirmPassword",
  "confirmPassword",
  "confirmPasswordToggleIcon",
);

// ==========================================
// 3. LOGIKA REGISTER
// ==========================================
console.log("=== Menambahkan Logika Register ===");

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  console.log("✅ registerForm DITEMUKAN");

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("🔥 Form Register disubmit!");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    console.log("Data Register:", email, password, confirmPassword);

    // Validasi 1: Cek kosong secara spesifik
    if (email === "" && password === "" && confirmPassword === "") {
      console.log("❌ Validasi gagal: Semua field kosong");
      showNotification("Mohon lengkapi seluruh data pendaftaran.", "error");
      return;
    }
    if (email === "") {
      console.log("❌ Validasi gagal: Email kosong");
      showNotification("Email tidak boleh kosong.", "error");
      return;
    }
    if (password === "") {
      console.log("❌ Validasi gagal: Password kosong");
      showNotification("Kata sandi tidak boleh kosong.", "error");
      return;
    }
    if (confirmPassword === "") {
      console.log("❌ Validasi gagal: Konfirmasi password kosong");
      showNotification("Konfirmasi kata sandi tidak boleh kosong.", "error");
      return;
    }

    // Validasi 2: Password minimal 8 karakter
    if (password.length < 8) {
      console.log("❌ Validasi gagal: Password kurang dari 8 karakter");
      if (typeof showNotification === "function") {
        showNotification(
          "Kata sandi minimal terdiri dari 8 karakter.",
          "error",
        );
      } else {
        alert("Kata sandi minimal terdiri dari 8 karakter.");
      }
      return;
    }

    // Validasi 3: Konfirmasi password harus sama
    if (password !== confirmPassword) {
      console.log("❌ Validasi gagal: Password tidak cocok");
      if (typeof showNotification === "function") {
        showNotification("Konfirmasi kata sandi tidak sesuai.", "error");
      } else {
        alert("Konfirmasi kata sandi tidak sesuai.");
      }
      return;
    }

    // Jika semua validasi lolos
    console.log("✅ Registrasi berhasil!");
    if (typeof showNotification === "function") {
      showNotification("Registrasi berhasil! Silakan login.", "success");
    } else {
      alert("Registrasi berhasil! Silakan login.");
    }

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });

  console.log("✅ Logika Register berhasil ditambahkan");
} else {
  console.log("ℹ️ registerForm tidak ditemukan (halaman ini bukan register)");
}

// ==========================================
// 4. LOGIKA LUPA PASSWORD
// ==========================================
const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
  console.log("✅ forgotForm DITEMUKAN");

  forgotForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();

    if (email === "") {
      showNotification("Email tidak boleh kosong.", "error");
      return;
    }

    showNotification(
      "Link pemulihan password telah dikirim ke email Anda.",
      "success",
    );
  });
}

// ==========================================
// 5. LOGIKA RESET PASSWORD
// ==========================================
const resetForm = document.getElementById("resetForm");

if (resetForm) {
  console.log("✅ resetForm DITEMUKAN");

  resetForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const resetConfirmPassword = document.getElementById(
      "resetConfirmPassword",
    ).value;

    if (newPassword === "") {
      showNotification("Password baru tidak boleh kosong.", "error");
      return;
    }
    if (resetConfirmPassword === "") {
      showNotification("Konfirmasi password baru tidak boleh kosong.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showNotification("Kata sandi minimal terdiri dari 8 karakter.", "error");
      return;
    }
    if (newPassword !== resetConfirmPassword) {
      showNotification("Konfirmasi password tidak sesuai.", "error");
      return;
    }

    showNotification("Password berhasil diubah! Silakan login.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });
}

console.log("=== auth.js SELESAI DIBACA ===");
