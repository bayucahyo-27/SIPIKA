<?php
// backend/controllers/AuthController.php

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
        $data = json_decode(file_get_contents("php://input"));

        // VALIDASI: Cek email dan password (username kita hapus)
        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Email dan password wajib diisi!"
            ]);
            return;
        }

        $user = new User($this->db);

        // Masukkan data ke properti User
        $user->email = $data->email;
        $user->password = $data->password;
        // Nama lengkap opsional, kalau tidak ada biarkan null
        $user->nama_lengkap = isset($data->nama_lengkap) ? $data->nama_lengkap : null; 
        $user->role = 'nelayan'; // Default role saat register

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
                "message" => "Email sudah terdaftar."
            ]);
        }
    }

    // Fungsi untuk Login
    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        // VALIDASI: Cek email, password, dan role dari frontend
        if (empty($data->email) || empty($data->password) || empty($data->role)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Email, password, dan role harus diisi!"
            ]);
            return;
        }

        $user = new User($this->db);
        $user->email = $data->email;
        $user->password = $data->password;

        $result = $user->login();

        if ($result === true) {
            // Cek apakah role yang dipilih user sesuai dengan role di database
            if ($user->role !== $data->role) {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "message" => "Akun ini tidak memiliki akses sebagai " . ucfirst($data->role) . "!"
                ]);
                return;
            }

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login berhasil!",
                "data" => [
                    "id" => $user->id,
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
                "message" => "Email atau password salah!"
            ]);
        }
    }
}
?>