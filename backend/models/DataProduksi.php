<?php
// backend/models/DataProduksi.php

class DataProduksi {
    private $conn;
    private $table = "data_produksi";

    // Properti
    public $id;
    public $jenis_ikan;
    public $alat_tangkap;
    public $wilayah;
    public $musim;
    public $produksi_kg;
    public $kategori;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Helper: Hitung kategori otomatis
    private function hitungKategori($produksi) {
        if ($produksi > 1000) return 'Tinggi';
        if ($produksi >= 500) return 'Sedang';
        return 'Rendah';
   }

    // 1. READ (Ambil semua data)
    public function read() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // 2. CREATE (Tambah data baru)
    public function create() {
        $this->kategori = $this->hitungKategori($this->produksi_kg);

        $query = "INSERT INTO " . $this->table . " 
                  (jenis_ikan, alat_tangkap, wilayah, musim, produksi_kg, kategori) 
                  VALUES (:jenis, :alat, :wilayah, :musim, :produksi, :kategori)";

        $stmt = $this->conn->prepare($query);

        // Bersihkan data
        $this->jenis_ikan = htmlspecialchars(strip_tags($this->jenis_ikan));
        $this->alat_tangkap = htmlspecialchars(strip_tags($this->alat_tangkap));
        $this->wilayah = htmlspecialchars(strip_tags($this->wilayah));
        $this->musim = htmlspecialchars(strip_tags($this->musim));

        // Bind data
        $stmt->bindParam(":jenis", $this->jenis_ikan);
        $stmt->bindParam(":alat", $this->alat_tangkap);
        $stmt->bindParam(":wilayah", $this->wilayah);
        $stmt->bindParam(":musim", $this->musim);
        $stmt->bindParam(":produksi", $this->produksi_kg);
        $stmt->bindParam(":kategori", $this->kategori);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 3. UPDATE (Edit data)
    public function update() {
        $this->kategori = $this->hitungKategori($this->produksi_kg);

        $query = "UPDATE " . $this->table . " 
                  SET jenis_ikan = :jenis, alat_tangkap = :alat, wilayah = :wilayah, 
                      musim = :musim, produksi_kg = :produksi, kategori = :kategori 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->jenis_ikan = htmlspecialchars(strip_tags($this->jenis_ikan));
        $this->alat_tangkap = htmlspecialchars(strip_tags($this->alat_tangkap));
        $this->wilayah = htmlspecialchars(strip_tags($this->wilayah));
        $this->musim = htmlspecialchars(strip_tags($this->musim));

        $stmt->bindParam(":jenis", $this->jenis_ikan);
        $stmt->bindParam(":alat", $this->alat_tangkap);
        $stmt->bindParam(":wilayah", $this->wilayah);
        $stmt->bindParam(":musim", $this->musim);
        $stmt->bindParam(":produksi", $this->produksi_kg);
        $stmt->bindParam(":kategori", $this->kategori);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // 4. DELETE (Hapus data)
    public function delete() {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>