
<?php
/**
 * ==========================================
 * MASTER DATA MODEL - SIPIKA
 * Mengelola empat tabel data referensi
 * ==========================================
 */

class MasterData {
    private $conn;

    // Daftar tabel yang diizinkan
    private $tables = [
        "jenis_ikan" => "ref_jenis_ikan",
        "alat_tangkap" => "ref_alat_tangkap",
        "wilayah" => "ref_wilayah",
        "musim" => "ref_musim"
    ];

    public function __construct($db) {
        $this->conn = $db;
    }

    // Memastikan kategori data valid
    private function getTable($type) {
        if (!isset($this->tables[$type])) {
            throw new InvalidArgumentException("Jenis data tidak valid.");
        }

        return $this->tables[$type];
    }

    // Mengambil seluruh data
    public function getAll($type) {
        $table = $this->getTable($type);

        $query = "SELECT * FROM $table ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Mengambil data berdasarkan ID
    public function getById($type, $id) {
        $table = $this->getTable($type);

        $query = "SELECT * FROM $table WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Menambahkan data baru
    public function create($type, $nama, $deskripsi = null) {
        $table = $this->getTable($type);

        $query = "INSERT INTO $table (nama, deskripsi)
                  VALUES (:nama, :deskripsi)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":nama", $nama);
        $stmt->bindValue(":deskripsi", $deskripsi);
        
        return $stmt->execute();
    }

    // Mengubah data
    public function update($type, $id, $nama, $deskripsi = null, $status = "Aktif") {
        $table = $this->getTable($type);

        $query = "UPDATE $table
                  SET nama = :nama,
                      deskripsi = :deskripsi,
                      status = :status
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":nama", $nama);
        $stmt->bindValue(":deskripsi", $deskripsi);
        $stmt->bindValue(":status", $status);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Mengubah status aktif/nonaktif
    public function updateStatus($type, $id, $status) {
        $table = $this->getTable($type);

        $query = "UPDATE $table
                  SET status = :status
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":status", $status);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    // Menghapus data
    public function delete($type, $id) {
        $table = $this->getTable($type);

        $query = "DELETE FROM $table WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }
}
?>