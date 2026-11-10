<?php
// backend/index.php

// 1. Izinkan Frontend akses Backend (CORS)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

// Kalau endpoint gak ditemukan
http_response_code(404);
echo json_encode([
    "status" => "error",
    "message" => "Endpoint tidak ditemukan: " . $request_uri
]);
?>