<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ModelEvaluation.php';

class EvaluationController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // GET: Ambil hasil evaluasi model terbaru
    public function getEvaluation()
    {
        header("Content-Type: application/json; charset=UTF-8");

        try {
            $model = new ModelEvaluation($this->db);
            $data = $model->getLatest();

            if (!$data) {
                http_response_code(404);
                echo json_encode([
                    "status" => "error",
                    "message" => "Belum ada data evaluasi model."
                ]);
                return;
            }

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "data" => $data
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
}
?>