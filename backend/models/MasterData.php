
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

    // Mengambil data referensi yang berstatus Aktif
    public function getActive($type) {
        $table = $this->getTable($type);

        $query = "SELECT id, nama
                FROM $table
                WHERE status = 'Aktif'
                ORDER BY nama ASC";

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


    // Menambahkan seluruh kelompok atribut sekaligus
    public function createBulk($dataByType) {

        $allowedTypes = [
            "jenis_ikan",
            "alat_tangkap",
            "wilayah",
            "musim"
        ];

        try {

            $this->conn->beginTransaction();

            $summary = [];

            foreach ($allowedTypes as $type) {

                if (!isset($dataByType[$type]) || !is_array($dataByType[$type])) {
                    throw new InvalidArgumentException(
                        "Data kategori $type tidak valid."
                    );
                }

                $table = $this->getTable($type);

                $query = "INSERT INTO $table (nama, deskripsi)
                          VALUES (:nama, :deskripsi)";

                $stmt = $this->conn->prepare($query);

                $count = 0;

                foreach ($dataByType[$type] as $item) {

                    // Memastikan setiap atribut berbentuk array
                    if (!is_array($item)) {
                        throw new InvalidArgumentException(
                            "Format atribut pada kategori $type tidak valid."
                        );
                    }

                    $nama = $item["nama"] ?? "";
                    $deskripsi = $item["deskripsi"] ?? "";

                    // Memastikan nama dan deskripsi berupa teks
                    if (!is_string($nama) || !is_string($deskripsi)) {
                        throw new InvalidArgumentException(
                            "Nama dan deskripsi atribut harus berupa teks."
                        );
                    }

                    $nama = trim($nama);
                    $deskripsi = trim($deskripsi);

                    // Memastikan nama tidak kosong
                    if ($nama === "") {
                        throw new InvalidArgumentException(
                            "Nama atribut pada kategori $type wajib diisi."
                        );
                    }

                    // Menyimpan atribut ke database
                    $stmt->bindValue(":nama", $nama);
                    $stmt->bindValue(
                        ":deskripsi",
                        $deskripsi !== "" ? $deskripsi : null
                    );

                    if (!$stmt->execute()) {
                        throw new Exception(
                            "Gagal menyimpan kategori $type."
                        );
                    }

                    $count++;
                }

                $summary[$type] = $count;
            }

            $this->conn->commit();

            return $summary;

        } catch (Throwable $e) {

            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            throw $e;
        }
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

        $stmt->execute();

        return $this->getById($type, $id) !== false;
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

        $stmt->execute();

        // Pastikan data dengan ID tersebut memang tersedia.
        // Tetap berhasil meskipun statusnya tidak berubah.
        return $this->getById($type, $id) !== false;
    }


    // Menghapus data
    public function delete($type, $id) {
        $table = $this->getTable($type);

        $query = "DELETE FROM $table WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":id", $id, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

}
?>