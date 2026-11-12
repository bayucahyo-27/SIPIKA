/**
 * ==========================================
 * GLOBAL.JS - SIPIKA Frontend Utilities
 * ==========================================
 * File ini berisi fungsi-fungsi dasar yang digunakan
 * di seluruh halaman aplikasi SIPIKA.
 */

// 1. KONFIGURASI DASAR
// ==========================================
const API_BASE_URL = "http://localhost/SIPIKA/backend";

// 2. MANAJEMEN SESI (SESSION)
// ==========================================

/**
 * Menyimpan data user ke sessionStorage (akan terhapus otomatis saat tab ditutup)
 * @param {Object} userData - Data user dari backend
 */
function saveSession(userData) {
  sessionStorage.setItem("sipika_user", JSON.stringify(userData));
  sessionStorage.setItem("sipika_isLoggedIn", "true");
}

/**
 * Mengambil data user yang sedang login
 * @returns {Object|null} Data user atau null jika belum login
 */
function getSession() {
  const user = sessionStorage.getItem("sipika_user");
  return user ? JSON.parse(user) : null;
}

/**
 * Menghapus sesi user (Logout)
 */
function clearSession() {
  sessionStorage.removeItem("sipika_user");
  sessionStorage.removeItem("sipika_isLoggedIn");
}

/**
 * Mengecek apakah user sudah login.
 * Jika belum, redirect ke halaman login.
 */
function requireAuth() {
  const isLoggedIn = sessionStorage.getItem("sipika_isLoggedIn") === "true";

  // Cek apakah user sedang di halaman auth (login/register)
  const isAuthPage = window.location.href.includes("/auth/");

  if (!isLoggedIn && !isAuthPage) {
    // Belum login dan bukan di halaman auth -> paksa ke login
    window.location.href = "../auth/login.html";
  } else if (isLoggedIn && isAuthPage) {
    // Sudah login tapi masih di halaman auth -> redirect ke dashboard sesuai role
    const user = getSession();
    if (user) {
      window.location.href = `../${user.role}/dashboard.html`;
    }
  }
}

/**
 * Fungsi Logout yang dipanggil oleh tombol Logout di sidebar
 */
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar dari SIPIKA?")) {
    clearSession();
    window.location.href = "../auth/login.html";
  }
}

// 3. UTILITAS UI (User Interface)
// ==========================================

/**
 * Menampilkan notifikasi custom di tengah layar
 * @param {string} message - Pesan yang ingin ditampilkan
 * @param {string} type - Tipe notifikasi ('success', 'error', 'warning')
 */
function showNotification(message, type = "success") {
  // 1. Hapus notifikasi lama jika masih ada (mencegah tumpukan)
  const existingNotification = document.getElementById("customNotification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // 2. Buat elemen notifikasi baru
  const notification = document.createElement("div");
  notification.id = "customNotification";
  notification.className = type; // Menambahkan class 'success', 'error', atau 'warning'

  // 3. Isi dengan HTML (styling diambil dari file CSS, bukan di sini)
  notification.innerHTML = `
    <p>${message}</p>
    <button class="close-btn" onclick="this.parentElement.remove()" aria-label="Tutup">×</button>
  `;

  // 4. Masukkan ke dalam body
  document.body.appendChild(notification);

  // 5. Auto close setelah 3 detik dengan animasi fade out
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.opacity = "0";
      notification.style.transition = "opacity 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

/**
 * Mengubah state tombol menjadi loading saat proses berjalan
 * @param {HTMLElement} button - Elemen tombol
 * @param {string} originalText - Teks asli tombol sebelum loading
 */
function setLoadingState(button, originalText) {
  button.disabled = true;
  button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;

  // Kembalikan ke state semula setelah 2 detik (simulasi)
  setTimeout(() => {
    button.disabled = false;
    button.innerHTML = originalText;
  }, 2000);
}

/**
 * Mengupdate informasi user di Header/Sidebar (Nama & Role)
 */
function updateHeaderUserInfo() {
  const user = getSession();
  if (user) {
    // Update nama di header (sesuaikan ID dengan HTML temen lu)
    const headerName = document.getElementById("headerUserName");
    const headerRole = document.getElementById("headerUserRole");

    if (headerName) headerName.textContent = user.nama_lengkap || user.username;
    if (headerRole)
      headerRole.textContent =
        user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }
}

// 4. INISIALISASI GLOBAL
// ==========================================
// Jalankan requireAuth() setiap kali halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  updateHeaderUserInfo();

  // Cek jika ada tombol logout, tambahkan event listener
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});
