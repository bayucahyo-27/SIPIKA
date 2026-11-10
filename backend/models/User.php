<?php
// backend/models/User.php

class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Properti user
    public $id;
    public $username;
    public $nama_lengkap;
    public $email;
    public $password;
    public $role;

    // Fungsi Register
    public function register() {
        // Cek apakah username atau email udah ada
        $query = "SELECT id FROM " . $this->table . " WHERE username = ? OR email = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->username);
        $stmt->bindParam(2, $this->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return false; // Username/email udah dipake
        }

        // Insert user baru
        $query = "INSERT INTO " . $this->table . " 
                  SET username = :username, 
                      nama_lengkap = :nama_lengkap, 
                      email = :email, 
                      password = :password, 
                      role = :role";

        $stmt = $this->conn->prepare($query);

        // Hash password biar aman
        $hashed_password = password_hash($this->password, PASSWORD_BCRYPT);

        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":nama_lengkap", $this->nama_lengkap);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":role", $this->role);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Fungsi Login
    public function login() {
        $query = "SELECT id, username, nama_lengkap, email, password, role, status 
                  FROM " . $this->table . " 
                  WHERE username = ? OR email = ? 
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->username);
        $stmt->bindParam(2, $this->username); // Bisa pake username ATAU email
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Cek password
            if (password_verify($this->password, $row['password'])) {
                // Cek status akun
                if ($row['status'] == 'Nonaktif') {
                    return "nonaktif";
                }
                // Login berhasil, simpan data user
                $this->id = $row['id'];
                $this->username = $row['username'];
                $this->nama_lengkap = $row['nama_lengkap'];
                $this->email = $row['email'];
                $this->role = $row['role'];
                return true;
            }
        }
        return false;
    }
}
?>