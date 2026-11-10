-- ==========================================
-- SIPIKA
-- Sistem Klasifikasi Tingkat Produksi Ikan
-- Database Schema (Final)
-- ==========================================

CREATE DATABASE IF NOT EXISTS sipika_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sipika_db;

-- 1. Tabel Users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    nomor_telepon VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    foto_profil VARCHAR(255) DEFAULT NULL,
    role ENUM('nelayan', 'petugas', 'admin') NOT NULL DEFAULT 'nelayan',
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabel Referensi (Master Data)
CREATE TABLE ref_jenis_ikan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_alat_tangkap (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_wilayah (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ref_musim (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Predictions (Hasil Klasifikasi)
CREATE TABLE predictions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    jenis_ikan VARCHAR(100) NOT NULL,
    alat_tangkap VARCHAR(100) NOT NULL,
    wilayah VARCHAR(100) NOT NULL,
    musim VARCHAR(50) NOT NULL,
    produksi_ton DECIMAL(10,2) DEFAULT NULL,
    gambar_ikan VARCHAR(255) DEFAULT NULL,
    hasil_klasifikasi ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL,
    kesimpulan TEXT,
    saran TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabel Datasets (File CSV yang diupload)
CREATE TABLE datasets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_file VARCHAR(255) NOT NULL,
    path_file VARCHAR(500) NOT NULL,
    jumlah_data INT NOT NULL DEFAULT 0,
    status ENUM('Aktif', 'Nonaktif') DEFAULT 'Aktif',
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabel Dataset Details (Isi data per baris)
CREATE TABLE dataset_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dataset_id INT NOT NULL,
    jenis_ikan VARCHAR(100) NOT NULL,
    alat_tangkap VARCHAR(100) NOT NULL,
    wilayah VARCHAR(100) NOT NULL,
    musim VARCHAR(50) NOT NULL,
    produksi_kg DECIMAL(10,2) NOT NULL,
    kategori ENUM('Rendah', 'Sedang', 'Tinggi') NOT NULL,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
);

-- 6. Tabel Model Evaluations
CREATE TABLE model_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    model_version VARCHAR(50) NOT NULL,
    dataset_id INT DEFAULT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    precision_rendah DECIMAL(5,2) DEFAULT 0,
    recall_rendah DECIMAL(5,2) DEFAULT 0,
    f1_rendah DECIMAL(5,2) DEFAULT 0,
    support_rendah INT DEFAULT 0,
    precision_sedang DECIMAL(5,2) DEFAULT 0,
    recall_sedang DECIMAL(5,2) DEFAULT 0,
    f1_sedang DECIMAL(5,2) DEFAULT 0,
    support_sedang INT DEFAULT 0,
    precision_tinggi DECIMAL(5,2) DEFAULT 0,
    recall_tinggi DECIMAL(5,2) DEFAULT 0,
    f1_tinggi DECIMAL(5,2) DEFAULT 0,
    support_tinggi INT DEFAULT 0,
    confusion_matrix JSON DEFAULT NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
);