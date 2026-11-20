
<?php

class Prediction
{
    private $conn;
    private $table = "predictions";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ==========================================
    // MENYIMPAN HASIL PREDIKSI
    // ==========================================
    public function create($data)
    {
        $query = "INSERT INTO " . $this->table . " (
                    user_id,
                    jenis_ikan,
                    alat_tangkap,
                    wilayah,
                    musim,
                    hasil_klasifikasi,
                    kesimpulan,
                    saran
                  ) VALUES (
                    :user_id,
                    :jenis_ikan,
                    :alat_tangkap,
                    :wilayah,
                    :musim,
                    :hasil_klasifikasi,
                    :kesimpulan,
                    :saran
                  )";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(":user_id", $data["user_id"], PDO::PARAM_INT);
        $stmt->bindValue(":jenis_ikan", $data["jenis_ikan"]);
        $stmt->bindValue(":alat_tangkap", $data["alat_tangkap"]);
        $stmt->bindValue(":wilayah", $data["wilayah"]);
        $stmt->bindValue(":musim", $data["musim"]);
        $stmt->bindValue(":hasil_klasifikasi", $data["hasil_klasifikasi"]);
        $stmt->bindValue(":kesimpulan", $data["kesimpulan"]);
        $stmt->bindValue(":saran", $data["saran"]);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return false;
    }

    // ==========================================
    // MENGAMBIL SELURUH RIWAYAT MILIK PENGGUNA
    // ==========================================
    public function getAllByUserId($userId)
    {
        $query = "SELECT *
                  FROM " . $this->table . "
                  WHERE user_id = :user_id
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ==========================================
    // MENGAMBIL DETAIL PREDIKSI MILIK PENGGUNA
    // ==========================================
    public function getByIdAndUserId($predictionId, $userId)
    {
        $query = "SELECT *
                  FROM " . $this->table . "
                  WHERE id = :id
                  AND user_id = :user_id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(":id", $predictionId, PDO::PARAM_INT);
        $stmt->bindValue(":user_id", $userId, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
