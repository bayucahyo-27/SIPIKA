
<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/database.php';

class ProfileController {

    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // ==========================================
    // MEMERIKSA SESSION PENGGUNA
    // ==========================================
    private function checkSession() {

        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        if (empty($_SESSION["user_id"])) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Silakan login terlebih dahulu."
            ]);
            return false;
        }

        if (($_SESSION["role"] ?? "") !== "nelayan") {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Akses hanya untuk pengguna Nelayan."
            ]);
            return false;
        }

        return true;
    }

    // ==========================================
    // GET PROFIL PENGGUNA
    // ==========================================
    public function getProfile() {

        if (!$this->checkSession()) return;

        $user = new User($this->db);

        $profile = $user->getProfile($_SESSION["user_id"]);

        if (!$profile) {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Profil pengguna tidak ditemukan."
            ]);
            return;
        }

        $_SESSION["nama_lengkap"] = $profile["nama_lengkap"];
        $_SESSION["email"] = $profile["email"];

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Profil berhasil diambil.",
            "data" => $profile
        ]);
    }

    // ==========================================
    // UPDATE NAMA LENGKAP
    // ==========================================
    public function updateProfile() {

        if (!$this->checkSession()) return;

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->nama_lengkap)) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Nama lengkap wajib diisi."
            ]);
            return;
        }

        $namaLengkap = trim($data->nama_lengkap);

        if (strlen($namaLengkap) > 100) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Nama lengkap maksimal 100 karakter."
            ]);
            return;
        }

        $user = new User($this->db);

        $success = $user->updateProfile(
            $_SESSION["user_id"],
            $namaLengkap
        );

        if ($success) {
            $_SESSION["nama_lengkap"] = $namaLengkap;

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Profil berhasil diperbarui.",
                "data" => [
                    "nama_lengkap" => $namaLengkap
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal memperbarui profil."
            ]);
        }
    }

    // ==========================================
    // UPLOAD FOTO PROFIL
    // ==========================================
    public function uploadPhoto() {

        if (!$this->checkSession()) return;

        if (!isset($_FILES["foto"])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "File foto belum dipilih."
            ]);
            return;
        }

        $file = $_FILES["foto"];

        if ($file["error"] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Terjadi kesalahan saat mengunggah foto."
            ]);
            return;
        }

        if ($file["size"] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Ukuran foto maksimal 5 MB."
            ]);
            return;
        }

        // Memeriksa tipe file berdasarkan isi file
        $imageInfo = getimagesize($file["tmp_name"]);

        if ($imageInfo === false) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "File harus berupa gambar yang valid."
            ]);
            return;
        }

        $mime = $imageInfo["mime"];

        $allowedTypes = [
            "image/jpeg" => "jpg",
            "image/png" => "png",
            "image/webp" => "webp"
        ];

        if (!isset($allowedTypes[$mime])) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Format foto harus JPG, PNG, atau WEBP."
            ]);
            return;
        }

        // Membuat nama file acak
        $extension = $allowedTypes[$mime];
        $fileName = bin2hex(random_bytes(16)) . "." . $extension;

        $uploadDir = __DIR__ . "/../uploads/profiles/";

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $destination = $uploadDir . $fileName;

        if (!move_uploaded_file($file["tmp_name"], $destination)) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal menyimpan foto ke server."
            ]);
            return;
        }

        // Lokasi foto yang disimpan di database
        $photoPath = "uploads/profiles/" . $fileName;

        $user = new User($this->db);

        $success = $user->updateProfilePhoto(
            $_SESSION["user_id"],
            $photoPath
        );

        if (!$success) {
            if (file_exists($destination)) {
                unlink($destination);
            }

            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal memperbarui foto profil."
            ]);
            return;
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Foto profil berhasil diperbarui.",
            "data" => [
                "foto_profil" => "/SIPIKA/backend/" . $photoPath
            ]
        ]);
    }
}
