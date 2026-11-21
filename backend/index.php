<?php
// backend/index.php

// 1. Izinkan Frontend akses Backend (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Ambil URL dan Method dari request
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request_method = $_SERVER['REQUEST_METHOD'];

// Hapus prefix '/SIPIKA/backend' dari URL biar routing lebih bersih
$request_uri = str_replace('/SIPIKA/backend', '', $request_uri);

// 3. Routing (Resepsionis)

// Route: GET / (Test Koneksi)
if ($request_method == 'GET' && $request_uri == '/') {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    if ($db) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Backend SIPIKA siap! Koneksi database berhasil."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Gagal koneksi ke database."
        ]);
    }
    exit();
}

// Route: POST /auth/register
if ($request_method == 'POST' && $request_uri == '/auth/register') {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();
    $controller->register();
    exit();
}

// Route: POST /auth/login
if ($request_method == 'POST' && $request_uri == '/auth/login') {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();
    $controller->login();
    exit();
}

// Route: POST /auth/forgot
if ($request_method == 'POST' && $request_uri == '/auth/forgot') {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();
    $controller->forgot();
    exit();
}

// Route: POST /auth/reset
if ($request_method == 'POST' && $request_uri == '/auth/reset') {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();
    $controller->reset();
    exit();
}

// Route: POST /auth/change-password
if ($request_method == 'POST' && $request_uri == '/auth/change-password') {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();
    $controller->changePassword();
    exit();
}

// Route: GET /auth/profile/{id}
if ($request_method == 'GET' && strpos($request_uri, '/auth/profile') === 0) {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();

    // Ambil ID dari URL: /auth/profile/1 -> id = 1
    $parts = explode('/', trim($request_uri, '/'));
    $id = isset($parts[2]) ? (int)$parts[2] : 0;

    $controller->getProfile($id);
    exit();
}

// Route: POST /prediction
if ($request_method == 'POST' && $request_uri == '/prediction') {
    require_once 'controllers/PredictionController.php';

    $controller = new PredictionController();
    $controller->predict();
    exit();
}

// ==========================================
// ROUTING RIWAYAT PREDIKSI NELAYAN
// ==========================================

// Route: GET /predictions
if ($request_method == 'GET' && $request_uri == '/predictions') {
    require_once 'controllers/PredictionController.php';

    $controller = new PredictionController();
    $controller->getHistory();
    exit();
}

// Route: GET /predictions/{id}
if (
    $request_method == 'GET' &&
    preg_match('#^/predictions/([0-9]+)$#', $request_uri, $matches)
) {
    require_once 'controllers/PredictionController.php';

    $controller = new PredictionController();
    $controller->getDetail((int) $matches[1]);
    exit();
}


// Route: POST /auth/logout
if ($request_method == 'POST' && $request_uri == '/auth/logout') {
    require_once 'controllers/AuthController.php';

    $controller = new AuthController();
    $controller->logout();
    exit();
}

// ==========================================
// ROUTING PROFIL NELAYAN
// ==========================================

// Route: GET /profile
if ($request_method == 'GET' && $request_uri == '/profile') {
    require_once 'controllers/ProfileController.php';

    $controller = new ProfileController();
    $controller->getProfile();
    exit();
}

// Route: PUT /profile
if ($request_method == 'PUT' && $request_uri == '/profile') {
    require_once 'controllers/ProfileController.php';

    $controller = new ProfileController();
    $controller->updateProfile();
    exit();
}

// Route: POST /profile/photo
if ($request_method == 'POST' && $request_uri == '/profile/photo') {
    require_once 'controllers/ProfileController.php';
    $controller = new ProfileController();
    $controller->uploadPhoto();
    exit();
}

// ==========================================
// ROUTING KELOLA PENGGUNA ADMIN
// ==========================================

// GET: Mengambil daftar pengguna
if ($request_method == 'GET' && $request_uri == '/admin/users') {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    $controller->index();
    exit();
}

// POST: Menambahkan pengguna
if ($request_method == 'POST' && $request_uri == '/admin/users') {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    $controller->store();
    exit();
}

// PUT: Memperbarui pengguna
if (
    $request_method == 'PUT' &&
    preg_match('#^/admin/users/([0-9]+)$#', $request_uri, $matches)
) {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    $controller->update((int) $matches[1]);
    exit();
}

// DELETE: Menghapus pengguna
if (
    $request_method == 'DELETE' &&
    preg_match('#^/admin/users/([0-9]+)$#', $request_uri, $matches)
) {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    $controller->destroy((int) $matches[1]);
    exit();
}

// PATCH: Mengubah status pengguna
if (
    $request_method == 'PATCH' &&
    preg_match('#^/admin/users/([0-9]+)/status$#', $request_uri, $matches)
) {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    $controller->updateStatus((int) $matches[1]);
    exit();
}

// ROUTING STATISTIK PENGGUNA ADMIN
if ($request_method == 'GET' && $request_uri == '/admin/users/statistics') {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    $controller->getStatistics();
    exit();
}

// ==========================================
// ROUTING PENGELOLAAN DATASET ADMIN
// ==========================================

// GET: Mengambil daftar dataset
if (
    $request_method == 'GET' &&
    $request_uri == '/admin/datasets'
) {
    require_once 'controllers/DatasetController.php';

    $controller = new DatasetController();
    $controller->listDataset();
    exit();
}

// POST: Mengunggah dataset CSV
if (
    $request_method == 'POST' &&
    $request_uri == '/admin/datasets'
) {
    require_once 'controllers/DatasetController.php';

    $controller = new DatasetController();
    $controller->uploadDataset();
    exit();
}

// PUT: Mengubah nama dataset
if (
    $request_method == 'PUT' &&
    preg_match(
        '#^/admin/datasets/([0-9]+)$#',
        $request_uri,
        $matches
    )
) {
    require_once 'controllers/DatasetController.php';

    $controller = new DatasetController();
    $controller->updateDataset((int) $matches[1]);
    exit();
}

// DELETE: Menghapus dataset
if (
    $request_method == 'DELETE' &&
    preg_match(
        '#^/admin/datasets/([0-9]+)$#',
        $request_uri,
        $matches
    )
) {
    require_once 'controllers/DatasetController.php';

    $controller = new DatasetController();
    $controller->deleteDataset((int) $matches[1]);
    exit();
}

// ==========================================
// ROUTING DATA MASTER ADMIN
// ==========================================

// Pemetaan kategori frontend ke nama tabel pada model
$masterDataTypes = [
    "ikan" => "jenis_ikan",
    "alat" => "alat_tangkap",
    "wilayah" => "wilayah",
    "musim" => "musim"
];

// Pola URL Data Master:
// /admin/master-data/ikan
// /admin/master-data/ikan/1
// /admin/master-data/ikan/1/status

if (
    preg_match(
        '#^/admin/master-data/([a-z_]+)(?:/([0-9]+))?(?:/status)?$#',
        $request_uri,
        $matches
    )
) {

    $category = $matches[1];
    $id = (isset($matches[2]) && $matches[2] !== '')
    ? (int) $matches[2]
    : null;

    // Pastikan kategori valid
    if (!isset($masterDataTypes[$category])) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Kategori Data Master tidak ditemukan."
        ]);
        exit();
    }

    // Konversi kategori frontend ke kategori model
    $type = $masterDataTypes[$category];

    require_once 'config/database.php';
    require_once 'controllers/MasterDataController.php';

    $database = new Database();
    $db = $database->getConnection();

    $controller = new MasterDataController($db);

    // GET: Mengambil seluruh data kategori
    if ($request_method == 'GET' && $id === null) {
        $controller->index($type);
        exit();
    }

    // GET: Mengambil detail data
    if ($request_method == 'GET' && $id !== null) {
        $controller->show($type, $id);
        exit();
    }

    // POST: Menambahkan data
    if ($request_method == 'POST' && $id === null) {
        $controller->store($type);
        exit();
    }

    // PUT: Memperbarui data
    if ($request_method == 'PUT' && $id !== null) {
        $controller->update($type, $id);
        exit();
    }

    // PATCH: Mengubah status data
    if (
        $request_method == 'PATCH' &&
        $id !== null &&
        preg_match('#/status$#', $request_uri)
    ) {
        $controller->updateStatus($type, $id);
        exit();
    }

    // DELETE: Menghapus data
    if ($request_method == 'DELETE' && $id !== null) {
        $controller->destroy($type, $id);
        exit();
    }
}

// ==========================================
// ROUTING DASHBOARD ADMIN
// ==========================================

// Route: GET /admin/dashboard
if ($request_method == 'GET' && $request_uri == '/admin/dashboard') {
    require_once 'controllers/AdminController.php';

    $controller = new AdminController();
    $controller->getDashboardStats();
    exit();
}

// ==========================================
// ROUTING DATA PRODUKSI (PETUGAS)
// ==========================================

// GET: /data-produksi → ambil semua data (buat render tabel)
if ($request_method == 'GET' && $request_uri == '/data-produksi') {
    require_once 'controllers/DatasetController.php';
    $controller = new DatasetController();
    $controller->getAll();
    exit();
}

// POST: /data-produksi → tambah data manual
if ($request_method == 'POST' && $request_uri == '/data-produksi') {
    require_once 'controllers/DatasetController.php';
    $controller = new DatasetController();
    $controller->create();
    exit();
}

// PUT: /data-produksi/{id} → edit data
if (
    $request_method == 'PUT' &&
    preg_match('#^/data-produksi/([0-9]+)$#', $request_uri, $matches)
) {
    require_once 'controllers/DatasetController.php';
    $controller = new DatasetController();
    $controller->update((int) $matches[1]);
    exit();
}

// DELETE: /data-produksi/{id} → hapus data
if (
    $request_method == 'DELETE' &&
    preg_match('#^/data-produksi/([0-9]+)$#', $request_uri, $matches)
) {
    require_once 'controllers/DatasetController.php';
    $controller = new DatasetController();
    $controller->delete((int) $matches[1]);
    exit();
}

// Kalau endpoint gak ditemukan
http_response_code(404);
echo json_encode([
    "status" => "error",
    "message" => "Endpoint tidak ditemukan: " . $request_uri
]);
?>