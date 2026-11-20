
<?php

require_once __DIR__ . '/../services/MLService.php';
require_once __DIR__ . '/../models/Prediction.php';
require_once __DIR__ . '/../config/database.php';

class PredictionController
{
    private $mlService;
    private $prediction;
    private $db;

    public function __construct()
    {
        $this->mlService = new MLService();

        $database = new Database();
        $this->db = $database->getConnection();

        $this->prediction = new Prediction($this->db);
    }

    // ==========================================
    // MEMPROSES DAN MENYIMPAN HASIL PREDIKSI
    // ==========================================
    public function predict()
    {
        header("Content-Type: application/json; charset=UTF-8");

        try {

            // Memastikan pengguna sudah login
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            if (
                !isset($_SESSION["user_id"]) ||
                !isset($_SESSION["role"])
            ) {
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "message" => "Silakan login terlebih dahulu."
                ]);
                return;
            }

            // Membatasi fitur ini untuk akun Nelayan
            if ($_SESSION["role"] !== "nelayan") {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "message" => "Anda tidak memiliki akses melakukan klasifikasi."
                ]);
                return;
            }

            // Mengambil ID pengguna dari session
            $userId = (int) $_SESSION["user_id"];

            // Membaca data JSON dari frontend
            $data = json_decode(file_get_contents("php://input"), true);

            if (!is_array($data)) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Format data JSON tidak valid."
                ]);
                return;
            }

            // Memvalidasi empat atribut klasifikasi
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

            // Mengirim data ke model Decision Tree
            $result = $this->mlService->predict($data);

            // Memastikan hasil klasifikasi tersedia
            if (
                !isset($result["hasil_klasifikasi"]) ||
                !in_array(
                    $result["hasil_klasifikasi"],
                    ["Rendah", "Sedang", "Tinggi"],
                    true
                )
            ) {
                throw new Exception("Hasil klasifikasi tidak valid.");
            }

            // Menyimpan hasil prediksi ke database
            $predictionId = $this->prediction->create([
                "user_id" => $userId,
                "jenis_ikan" => $data["jenis_ikan"],
                "alat_tangkap" => $data["alat_tangkap"],
                "wilayah" => $data["wilayah"],
                "musim" => $data["musim"],
                "hasil_klasifikasi" => $result["hasil_klasifikasi"],
                "kesimpulan" => null,
                "saran" => null
            ]);

            if (!$predictionId) {
                throw new Exception("Gagal menyimpan riwayat prediksi.");
            }

            // Mengirim hasil prediksi beserta ID database
            $result["prediction_id"] = $predictionId;

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

    // ==========================================
    // METHOD: MENGAMBIL RIWAYAT PREDIKSI NELAYAN
    // ==========================================
    public function getHistory()
    {
        header("Content-Type: application/json; charset=UTF-8");

        try {
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            if (!isset($_SESSION["user_id"]) || !isset($_SESSION["role"])) {
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "message" => "Silakan login terlebih dahulu."
                ]);
                return;
            }

            if ($_SESSION["role"] !== "nelayan") {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "message" => "Akses hanya untuk nelayan."
                ]);
                return;
            }

            $userId = (int) $_SESSION["user_id"];
            $history = $this->prediction->getAllByUserId($userId);

            echo json_encode([
                "status" => "success",
                "data" => $history
            ]);

        } catch (Exception $error) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => $error->getMessage()
            ]);
        }
    }


    // ==========================================
    // METHOD: MENGAMBIL DETAIL PREDIKSI NELAYAN
    // ==========================================
    public function getDetail($id)
    {
        header("Content-Type: application/json; charset=UTF-8");

        try {
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            if (!isset($_SESSION["user_id"]) || !isset($_SESSION["role"])) {
                http_response_code(401);
                echo json_encode([
                    "status" => "error",
                    "message" => "Silakan login terlebih dahulu."
                ]);
                return;
            }

            if ($_SESSION["role"] !== "nelayan") {
                http_response_code(403);
                echo json_encode([
                    "status" => "error",
                    "message" => "Akses hanya untuk nelayan."
                ]);
                return;
            }

            $userId = (int) $_SESSION["user_id"];
            $detail = $this->prediction->getByIdAndUserId($id, $userId);

            if (!$detail) {
                http_response_code(404);
                echo json_encode([
                    "status" => "error",
                    "message" => "Riwayat prediksi tidak ditemukan."
                ]);
                return;
            }

            echo json_encode([
                "status" => "success",
                "data" => $detail
            ]);

        } catch (Exception $error) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => $error->getMessage()
            ]);
        }
    }

}
