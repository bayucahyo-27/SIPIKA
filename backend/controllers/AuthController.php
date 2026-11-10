<?php
// backend/controllers/AuthController.php

// Panggil model User dan config database
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/database.php';

class AuthController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // Fungsi untuk Register
    public function register() {
        // Ambil data JSON dari frontend
        $data = json_decode(file_get_contents("php://input"));

        // Validasi data kosong
        if (empty($data->username) || empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Semua field harus diisi!"
            ]);
            return;
        }

        $user = new User($this->db);

        // Masukkan data ke properti User
        $user->username = $data->username;
        $user->nama_lengkap = isset($data->nama_lengkap) ? $data->nama_lengkap : $data->username;
        $user->email = $data->email;
        $user->password = $data->password;
        $user->role = isset($data->role) ? $data->role : 'nelayan'; // Default nelayan

        // Jalankan fungsi register di model
        if ($user->register()) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Registrasi berhasil! Silakan login."
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Username atau email sudah terdaftar."
            ]);
        }
    }

    // Fungsi untuk Login
    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->username) || empty($data->password)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Username dan password harus diisi!"
            ]);
            return;
        }

        $user = new User($this->db);
        $user->username = $data->username; // Bisa username atau email
        $user->password = $data->password;

        $result = $user->login();

        if ($result === true) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login berhasil!",
                "data" => [
                    "id" => $user->id,
                    "username" => $user->username,
                    "nama_lengkap" => $user->nama_lengkap,
                    "email" => $user->email,
                    "role" => $user->role
                ]
            ]);
        } else if ($result === "nonaktif") {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Akun Anda telah dinonaktifkan. Hubungi admin."
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Username atau password salah!"
            ]);
        }
    }
}
?>