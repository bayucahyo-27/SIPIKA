<?php
// backend/models/User.php

class User {
    private $conn;
    private $table = "users";

    // Properti user (TANPA username, sesuai database)
    public $id;
    public $nama_lengkap;
    public $email;
    public $password;
    public $role;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ==========================================
    // Fungsi Register
    // ==========================================
    public function register() {
        // 1. Cek apakah email sudah ada
        $query = "SELECT id FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return false; // Email sudah terdaftar
        }

        // 2. Insert user baru (TANPA username)
        $query = "INSERT INTO " . $this->table . " 
                  (nama_lengkap, email, password, role, status) 
                  VALUES (:nama_lengkap, :email, :password, :role, 'Aktif')";

        $stmt = $this->conn->prepare($query);

        // Hash password biar aman (Best Practice)
        $hashed_password = password_hash($this->password, PASSWORD_DEFAULT);

        // Sanitasi input
        $this->nama_lengkap = htmlspecialchars(strip_tags($this->nama_lengkap));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));

        // Bind data
        $stmt->bindParam(":nama_lengkap", $this->nama_lengkap);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":role", $this->role);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // ==========================================
    // Fungsi Login
    // ==========================================
    public function login() {
        // Cari berdasarkan EMAIL saja
        $query = "SELECT id, nama_lengkap, email, password, role, status 
                  FROM " . $this->table . " 
                  WHERE email = :email 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $this->email);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Cek status akun
            if ($row['status'] == 'Nonaktif') {
                return "nonaktif";
            }

            // Cek password
            if (password_verify($this->password, $row['password'])) {
                // Login berhasil, simpan data ke properti object
                $this->id = $row['id'];
                $this->nama_lengkap = $row['nama_lengkap'];
                $this->email = $row['email'];
                $this->role = $row['role'];
                return true;
            }
        }
        
        // Jika email tidak ditemukan atau password salah
        return false;
    }
}
?>