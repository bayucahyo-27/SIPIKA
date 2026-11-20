
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // Mengambil statistik dashboard admin
    public function getDashboardStats() {
        // Pastikan hanya admin yang dapat mengakses
        AuthMiddleware::authorize(["admin"]);

        try {
            // Menghitung total seluruh pengguna
            $queryTotal = "SELECT COUNT(*) AS total FROM users";
            $stmtTotal = $this->db->prepare($queryTotal);
            $stmtTotal->execute();
            $totalPengguna = (int) $stmtTotal->fetch(PDO::FETCH_ASSOC)["total"];

            // Menghitung total petugas
            $queryPetugas = "SELECT COUNT(*) AS total FROM users WHERE role = 'petugas'";
            $stmtPetugas = $this->db->prepare($queryPetugas);
            $stmtPetugas->execute();
            $totalPetugas = (int) $stmtPetugas->fetch(PDO::FETCH_ASSOC)["total"];

            // Menghitung total nelayan
            $queryNelayan = "SELECT COUNT(*) AS total FROM users WHERE role = 'nelayan'";
            $stmtNelayan = $this->db->prepare($queryNelayan);
            $stmtNelayan->execute();
            $totalNelayan = (int) $stmtNelayan->fetch(PDO::FETCH_ASSOC)["total"];

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Statistik dashboard berhasil diambil.",
                "data" => [
                    "total_pengguna" => $totalPengguna,
                    "total_petugas" => $totalPetugas,
                    "total_nelayan" => $totalNelayan
                ]
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal mengambil statistik dashboard."
            ]);
        }
    }
}
?>
