<?php
class ModelEvaluation
{
    private $conn;
    private $table = "model_evaluations";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Ambil evaluasi TERBARU (berdasarkan evaluated_at)
    public function getLatest()
    {
        $query = "SELECT * FROM " . $this->table . "
                  ORDER BY evaluated_at DESC, id DESC
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>