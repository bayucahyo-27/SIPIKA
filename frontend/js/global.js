
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
 * Menyimpan data user ke localStorage setelah login berhasil
 * @param {Object} userData - Data user dari backend
 */
function saveSession(userData) {
  localStorage.setItem("sipika_user", JSON.stringify(userData));
  localStorage.setItem("sipika_isLoggedIn", "true");
}

/**
 * Mengambil data user yang sedang login
 * @returns {Object|null} Data user atau null jika belum login
 */
function getSession() {
  const user = localStorage.getItem("sipika_user");
  return user ? JSON.parse(user) : null;
}

/**
 * Menghapus sesi user (Logout)
 */
function clearSession() {
  localStorage.removeItem("sipika_user");
  localStorage.removeItem("sipika_isLoggedIn");
}

/**
 * Mengecek apakah user sudah login.
 * Jika belum, redirect ke halaman login.
 */
function requireAuth() {
  const isLoggedIn = localStorage.getItem("sipika_isLoggedIn") === "true";
  
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
 * Menampilkan notifikasi/alert yang lebih rapi daripada alert() bawaan browser
 * @param {string} message - Pesan yang ingin ditampilkan
 * @param {string} type - Tipe notifikasi ('success', 'error', 'warning')
 */
function showNotification(message, type = "success") {
  // Untuk sementara kita pakai alert() bawaan dulu biar simpel.
  // Nanti bisa diganti dengan custom toast notification kalau mau nilai plus.
  alert(`[${type.toUpperCase()}] ${message}`);
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
    if (headerRole) headerRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
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