
<?php

require_once __DIR__ . '/../services/MLService.php';

class PredictionController
{
    private $mlService;

    public function __construct()
    {
        $this->mlService = new MLService();
    }

    // Memproses permintaan klasifikasi dari pengguna
    public function predict()
    {
        header("Content-Type: application/json; charset=UTF-8");

        try {
            // Membaca dan mengubah JSON menjadi array PHP
            $data = json_decode(file_get_contents("php://input"), true);

            // Memastikan data yang diterima berbentuk JSON object
            if (!is_array($data)) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Format data JSON tidak valid."
                ]);
                return;
            }

            // Memastikan empat atribut tersedia dan tidak kosong
            $requiredFields = [
                "jenis_ikan",
                "alat_tangkap",
                "wilayah",
                "musim"
            ];

            foreach ($requiredFields as $field) {
                if (
                    !isset($data[$field]) ||
                    !is_string($data[$field]) ||
                    trim($data[$field]) === ""
                ) {
                    http_response_code(400);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Atribut $field wajib diisi."
                    ]);
                    return;
                }

                $data[$field] = trim($data[$field]);
            }

            // Memanggil model Decision Tree melalui MLService
            $result = $this->mlService->predict($data);

            http_response_code(200);
            echo json_encode($result);

        } catch (Exception $error) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => $error->getMessage()
            ]);
        }
    }
}