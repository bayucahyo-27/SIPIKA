
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserController {
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    // Mengambil daftar pengguna
    public function index() {
        AuthMiddleware::authorize(["admin"]);

        try {
            $search = trim($_GET["search"] ?? "");
            $role = strtolower(trim($_GET["role"] ?? ""));
            $status = trim($_GET["status"] ?? "");
            
            // Menyesuaikan nilai filter status dari frontend
            if ($status === "aktif") {
                $status = "Aktif";
            } elseif ($status === "tidak aktif") {
                $status = "Nonaktif";
            }
            $page = (int) ($_GET["page"] ?? 1);
            $limit = (int) ($_GET["limit"] ?? 10);

            if (!in_array($role, ["", "semua", "nelayan", "petugas"], true)) {
                $this->response(400, "Filter role tidak valid.");
            }

            if (!in_array($status, ["", "semua", "Aktif", "Nonaktif"], true)) {
                $this->response(400, "Filter status tidak valid.");
            }

            $result = $this->user->getAllUsers(
                $search,
                $role,
                $status,
                $page,
                $limit
            );

            echo json_encode([
                "status" => "success",
                "message" => "Data pengguna berhasil diambil.",
                "data" => $result["data"],
                "pagination" => $result["pagination"]
            ]);

        } catch (PDOException $e) {
            $this->response(500, "Gagal mengambil data pengguna.");
        }
    }

    // Menambahkan pengguna
    public function store() {
        AuthMiddleware::authorize(["admin"]);

        $data = json_decode(file_get_contents("php://input"), true);

        $this->user->username = trim($data["username"] ?? "");
        $this->user->nama_lengkap = trim($data["nama_lengkap"] ?? "");
        $this->user->email = trim($data["email"] ?? "");
        $this->user->nomor_telepon = trim($data["nomor_telepon"] ?? "");
        $this->user->password = $data["password"] ?? "";
        $this->user->role = strtolower(trim($data["role"] ?? ""));

        if (
            $this->user->username === "" ||
            $this->user->nama_lengkap === "" ||
            $this->user->email === "" ||
            $this->user->password === ""
        ) {
            $this->response(400, "Semua data wajib diisi.");
        }

        if (!filter_var($this->user->email, FILTER_VALIDATE_EMAIL)) {
            $this->response(400, "Format email tidak valid.");
        }

        if (strlen($this->user->password) < 8) {
            $this->response(400, "Password minimal 8 karakter.");
        }

        if (!in_array($this->user->role, ["nelayan", "petugas"], true)) {
            $this->response(400, "Role pengguna tidak valid.");
        }

        if ($this->isDuplicate()) {
            $this->response(409, "Username atau email sudah digunakan.");
        }

        try {
            if ($this->user->createUser()) {
                $this->response(201, "Pengguna berhasil ditambahkan.");
            }

            $this->response(500, "Gagal menambahkan pengguna.");

        } catch (PDOException $e) {
            $this->response(500, "Terjadi kesalahan saat menambahkan pengguna.");
        }
    }

    // Memperbarui pengguna
    public function update($id) {
        AuthMiddleware::authorize(["admin"]);

        if ($id <= 0) {
            $this->response(400, "ID pengguna tidak valid.");
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $this->user->username = trim($data["username"] ?? "");
        $this->user->nama_lengkap = trim($data["nama_lengkap"] ?? "");
        $this->user->email = trim($data["email"] ?? "");
        $this->user->nomor_telepon = trim($data["nomor_telepon"] ?? "");
        $this->user->role = strtolower(trim($data["role"] ?? ""));
        $this->user->password = $data["password"] ?? "";

        if (
            $this->user->username === "" ||
            $this->user->nama_lengkap === "" ||
            $this->user->email === ""
        ) {
            $this->response(400, "Nama, username, dan email wajib diisi.");
        }

        if (!filter_var($this->user->email, FILTER_VALIDATE_EMAIL)) {
            $this->response(400, "Format email tidak valid.");
        }

        if (!in_array($this->user->role, ["nelayan", "petugas"], true)) {
            $this->response(400, "Role pengguna tidak valid.");
        }

        if ($this->user->password !== "" && strlen($this->user->password) < 8) {
            $this->response(400, "Password baru minimal 8 karakter.");
        }

        if ($this->isDuplicate($id)) {
            $this->response(409, "Username atau email sudah digunakan pengguna lain.");
        }

        try {
            if ($this->user->updateUser(
                $id,
                $this->user->password !== ""
            )) {
                $this->response(200, "Data pengguna berhasil diperbarui.");
            }

            $this->response(404, "Pengguna tidak ditemukan atau tidak dapat diperbarui.");

        } catch (PDOException $e) {
            $this->response(500, "Gagal memperbarui data pengguna.");
        }
    }

    // Menghapus pengguna
    public function destroy($id) {
        AuthMiddleware::authorize(["admin"]);

        $adminId = (int) $_SESSION["user_id"];

        if ($id <= 0) {
            $this->response(400, "ID pengguna tidak valid.");
        }

        if ($id === $adminId) {
            $this->response(403, "Anda tidak dapat menghapus akun sendiri.");
        }

        try {
            if ($this->user->deleteUser($id)) {
                $this->response(200, "Pengguna berhasil dihapus.");
            }

            $this->response(404, "Pengguna tidak ditemukan atau tidak dapat dihapus.");

        } catch (PDOException $e) {
            $this->response(500, "Gagal menghapus pengguna.");
        }
    }

    // Mengubah status pengguna
    public function updateStatus($id) {
        AuthMiddleware::authorize(["admin"]);

        $adminId = (int) $_SESSION["user_id"];

        if ($id <= 0) {
            $this->response(400, "ID pengguna tidak valid.");
        }

        if ($id === $adminId) {
            $this->response(403, "Anda tidak dapat menonaktifkan akun sendiri.");
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data["status"] ?? "";

        if (!in_array($status, ["Aktif", "Nonaktif"], true)) {
            $this->response(400, "Status pengguna tidak valid.");
        }

        try {
            if ($this->user->updateUserStatus($id, $status)) {
                $this->response(200, "Status pengguna berhasil diperbarui.");
            }

            $this->response(404, "Pengguna tidak ditemukan atau status tidak dapat diperbarui.");

        } catch (PDOException $e) {
            $this->response(500, "Gagal memperbarui status pengguna.");
        }
    }

    // Memeriksa duplikasi username dan email
    private function isDuplicate($excludeId = null) {
        $query = "SELECT id FROM users
                  WHERE (username = :username OR email = :email)";

        if ($excludeId !== null) {
            $query .= " AND id != :id";
        }

        $query .= " LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->bindValue(":username", $this->user->username);
        $stmt->bindValue(":email", $this->user->email);

        if ($excludeId !== null) {
            $stmt->bindValue(":id", $excludeId, PDO::PARAM_INT);
        }

        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    // ==========================================
    // STATISTIK HALAMAN KELOLA PENGGUNA
    // ==========================================
    public function getStatistics() {
        AuthMiddleware::authorize(["admin"]);

        try {
            $query = "
                SELECT
                    COUNT(*) AS total_pengguna,
                    SUM(CASE WHEN role = 'petugas' THEN 1 ELSE 0 END) AS total_petugas,
                    SUM(CASE WHEN role = 'nelayan' THEN 1 ELSE 0 END) AS total_nelayan,
                    SUM(CASE WHEN status = 'Nonaktif' THEN 1 ELSE 0 END) AS total_nonaktif
                FROM users
                WHERE role IN ('petugas', 'nelayan')
            ";

            $stmt = $this->db->prepare($query);
            $stmt->execute();

            $statistics = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "message" => "Statistik pengguna berhasil diambil.",
                "data" => [
                    "total_pengguna" => (int) $statistics["total_pengguna"],
                    "total_petugas" => (int) $statistics["total_petugas"],
                    "total_nelayan" => (int) $statistics["total_nelayan"],
                    "total_nonaktif" => (int) $statistics["total_nonaktif"]
                ]
            ]);

        } catch (PDOException $e) {
            $this->response(500, "Gagal mengambil statistik pengguna.");
        }
    }

    // Format respons JSON
    private function response($code, $message) {
        http_response_code($code);

        echo json_encode([
            "status" => $code >= 200 && $code < 300 ? "success" : "error",
            "message" => $message
        ]);

        exit();
    }
}
?>
