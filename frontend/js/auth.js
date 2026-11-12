/**
 * AUTH.JS - Versi Lengkap (Login + Toggle + Register)
 */

console.log("=== auth.js MULAI DIBACA ===");

// ==========================================
// FUNGSI HELPER INLINE ERROR
// ==========================================
function showError(inputId, message) {
  const errorEl = document.getElementById(`error-${inputId}`);
  const inputEl = document.getElementById(inputId);
  const wrapper = inputEl ? inputEl.closest(".input-wrapper") : null;

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
  if (wrapper) {
    wrapper.classList.add("has-error");
  }
}

function clearError(inputId) {
  const errorEl = document.getElementById(`error-${inputId}`);
  const inputEl = document.getElementById(inputId);
  const wrapper = inputEl ? inputEl.closest(".input-wrapper") : null;

  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
  if (wrapper) {
    wrapper.classList.remove("has-error");
  }
}

// Hapus error otomatis saat user mulai mengetik/memilih
[
  "username",
  "password",
  "role",
  "email",
  "confirmPassword",
  "newPassword",
  "resetConfirmPassword",
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    const eventType = id === "role" ? "change" : "input";
    el.addEventListener(eventType, () => clearError(id));
  }
});

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

    // 1. Reset semua error dulu sebelum validasi baru
    ["username", "password", "role"].forEach(clearError);

    let hasError = false;

    // 2. Cek satu per satu, tampilkan error spesifik di bawah kolom
    if (username === "") {
      showError("username", "Username wajib diisi.");
      hasError = true;
    }
    if (password === "") {
      showError("password", "Kata sandi wajib diisi.");
      hasError = true;
    } else if (password.length < 8) {
      showError("password", "Kata sandi minimal 8 karakter.");
      hasError = true;
    }
    if (role === "") {
      showError("role", "Silakan pilih jenis pengguna.");
      hasError = true;
    }

    // 3. Jika ada error, STOP proses di sini (jangan lanjut ke redirect)
    if (hasError) {
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

    // 1. Reset semua error register dulu sebelum validasi baru
    ["email", "password", "confirmPassword"].forEach(clearError);

    let hasError = false;

    // 2. Cek field kosong satu per satu
    if (email === "") {
      showError("email", "Email tidak boleh kosong.");
      hasError = true;
    }
    if (password === "") {
      showError("password", "Kata sandi tidak boleh kosong.");
      hasError = true;
    }
    if (confirmPassword === "") {
      showError("confirmPassword", "Konfirmasi kata sandi tidak boleh kosong.");
      hasError = true;
    }

    // 3. Jika ada yang kosong, STOP di sini (jangan cek panjang password dulu)
    if (hasError) {
      return;
    }

    // 4. Validasi panjang password (hanya jalan jika password sudah diisi)
    if (password.length < 8) {
      showError("password", "Kata sandi minimal terdiri dari 8 karakter.");
      hasError = true;
    }

    // 5. Validasi kesamaan password
    if (password !== confirmPassword) {
      showError("confirmPassword", "Konfirmasi kata sandi tidak sesuai.");
      hasError = true;
    }

    // 6. Jika masih ada error dari langkah 4 atau 5, STOP
    if (hasError) {
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

    // 1. Reset error email dulu sebelum validasi
    clearError("email");

    let hasError = false;

    // 2. Cek apakah email kosong
    if (email === "") {
      showError("email", "Email tidak boleh kosong.");
      hasError = true;
    }

    // 3. Jika ada error, STOP di sini (jangan lanjut kirim)
    if (hasError) {
      return;
    }

    // 4. Jika validasi lolos, tampilkan notifikasi sukses
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

    // 1. Reset semua error reset password dulu
    ["newPassword", "resetConfirmPassword"].forEach(clearError);

    let hasError = false;

    // 2. Cek field kosong
    if (newPassword === "") {
      showError("newPassword", "Password baru tidak boleh kosong.");
      hasError = true;
    }
    if (resetConfirmPassword === "") {
      showError(
        "resetConfirmPassword",
        "Konfirmasi password baru tidak boleh kosong.",
      );
      hasError = true;
    }

    // 3. Jika ada yang kosong, STOP dulu (jangan cek panjang password)
    if (hasError) {
      return;
    }

    // 4. Validasi panjang password
    if (newPassword.length < 8) {
      showError("newPassword", "Kata sandi minimal terdiri dari 8 karakter.");
      hasError = true;
    }

    // 5. Validasi kesamaan password
    if (newPassword !== resetConfirmPassword) {
      showError("resetConfirmPassword", "Konfirmasi password tidak sesuai.");
      hasError = true;
    }

    // 6. Jika masih ada error dari langkah 4 atau 5, STOP
    if (hasError) {
      return;
    }

    // Jika semua validasi lolos
    showNotification("Password berhasil diubah! Silakan login.", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  });
}

console.log("=== auth.js SELESAI DIBACA ===");
