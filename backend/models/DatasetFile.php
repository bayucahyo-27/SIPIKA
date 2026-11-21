
<?php
// backend/models/DatasetFile.php

class DatasetFile {

    private $conn;
    private $table = "datasets";
    private $detailTable = "dataset_details";

    public function __construct($db) {
        $this->conn = $db;
    }

    // ==========================================
    // MENGAMBIL SEMUA DATASET
    // ==========================================

    public function getAll() {
        $query = "
            SELECT
                id,
                nama_file,
                path_file,
                jumlah_data,
                status,
                uploaded_by,
                created_at
            FROM {$this->table}
            ORDER BY id DESC
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==========================================
    // MENAMBAHKAN DATASET DAN DETAIL CSV
    // ==========================================

    public function create($namaFile, $pathFile, $uploadedBy, $rows) {
        try {
            $this->conn->beginTransaction();

            $query = "
                INSERT INTO {$this->table}
                (nama_file, path_file, jumlah_data, status, uploaded_by)
                VALUES
                (:nama_file, :path_file, :jumlah_data, 'Aktif', :uploaded_by)
            ";

            $stmt = $this->conn->prepare($query);

            $stmt->execute([
                ":nama_file" => $namaFile,
                ":path_file" => $pathFile,
                ":jumlah_data" => count($rows),
                ":uploaded_by" => $uploadedBy
            ]);

            $datasetId = $this->conn->lastInsertId();

            $detailQuery = "
                INSERT INTO {$this->detailTable}
                (
                    dataset_id,
                    jenis_ikan,
                    alat_tangkap,
                    wilayah,
                    musim,
                    produksi_kg,
                    tingkat_produksi
                )
                VALUES
                (
                    :dataset_id,
                    :jenis_ikan,
                    :alat_tangkap,
                    :wilayah,
                    :musim,
                    :produksi_kg,
                    :tingkat_produksi
                )
            ";

            $detailStmt = $this->conn->prepare($detailQuery);

            foreach ($rows as $row) {
                $detailStmt->execute([
                    ":dataset_id" => $datasetId,
                    ":jenis_ikan" => $row["jenis_ikan"],
                    ":alat_tangkap" => $row["alat_tangkap"],
                    ":wilayah" => $row["wilayah"],
                    ":musim" => $row["musim"],
                    ":produksi_kg" => $row["produksi_kg"],
                    ":tingkat_produksi" => $row["tingkat_produksi"]
                ]);
            }

            $this->conn->commit();

            return true;

        } catch (Throwable $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            throw $e;
        }
    }

    // ==========================================
    // MENGAMBIL DATASET BERDASARKAN ID
    // ==========================================

    public function getById($id) {
        $query = "
            SELECT *
            FROM {$this->table}
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([":id" => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ==========================================
    // MENGUBAH NAMA DATASET
    // ==========================================
    
    public function update($id, $namaFile) {
        $query = "
            UPDATE {$this->table}
            SET nama_file = :nama_file
            WHERE id = :id
        ";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ":nama_file" => $namaFile,
            ":id" => $id
        ]);

        // Jika tidak ada perubahan, periksa apakah ID memang tersedia
        if ($stmt->rowCount() > 0) {
            return true;
        }

        return $this->getById($id) !== false;
    }


    // ==========================================
    // MENGHAPUS DATASET DAN DETAILNYA
    // ==========================================
    public function delete($id) {
        try {
            $this->conn->beginTransaction();

            // Pastikan dataset tersedia
            $checkQuery = "
                SELECT id
                FROM {$this->table}
                WHERE id = :id
                LIMIT 1
            ";

            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->execute([":id" => $id]);

            if (!$checkStmt->fetch(PDO::FETCH_ASSOC)) {
                $this->conn->rollBack();
                return false;
            }

            // Hapus seluruh detail dataset
            $detailQuery = "
                DELETE FROM {$this->detailTable}
                WHERE dataset_id = :id
            ";

            $detailStmt = $this->conn->prepare($detailQuery);
            $detailStmt->execute([":id" => $id]);

            // Hapus metadata dataset
            $query = "
                DELETE FROM {$this->table}
                WHERE id = :id
            ";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([":id" => $id]);

            $deleted = $stmt->rowCount() > 0;

            $this->conn->commit();

            return $deleted;

        } catch (Throwable $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }

            throw $e;
        }
    }

}
