
<?php

require_once __DIR__ . "/../models/MasterData.php";
require_once __DIR__ . "/../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../config/database.php";

class MasterDataController {

    private $masterData;

    public function __construct($db) {
        $this->masterData = new MasterData($db);
    }

    // Mengirim respons JSON
    private function response($status, $message, $data = null, $code = 200) {

        http_response_code($code);

        echo json_encode([
            "status" => $status ? "success" : "error",
            "message" => $message,
            "data" => $data
        ], JSON_UNESCAPED_UNICODE);

        exit();
    }

    // Memastikan hanya Admin yang dapat mengakses
    private function authorizeAdmin() {
        AuthMiddleware::authorize(["admin"]);
    }
    
    // Membaca dan memvalidasi input JSON
    private function getJsonInput() {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!is_array($input)) {
            $this->response(
                false,
                "Format data yang dikirim tidak valid.",
                null,
                400
            );
        }

        return $input;
    }

    // GET: Mengambil seluruh data berdasarkan kategori
    public function index($type) {

        $this->authorizeAdmin();

        try {

            $data = $this->masterData->getAll($type);

            $this->response(
                true,
                "Data berhasil diambil.",
                $data
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

    // GET: Mengambil referensi aktif untuk Admin dan Nelayan
    public function active($type) {

        AuthMiddleware::authorize(["admin", "nelayan"]);

        try {

            $data = $this->masterData->getActive($type);

            $this->response(
                true,
                "Data referensi berhasil diambil.",
                $data
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

    // GET: Mengambil data berdasarkan ID
    public function show($type, $id) {

        $this->authorizeAdmin();

        try {

            $data = $this->masterData->getById($type, $id);

            if (!$data) {
                $this->response(
                    false,
                    "Data tidak ditemukan.",
                    null,
                    404
                );
            }

            $this->response(
                true,
                "Data berhasil diambil.",
                $data
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

    // POST: Menambahkan data baru
    public function store($type) {

        $this->authorizeAdmin();

        $input = $this->getJsonInput();

        $nama = trim($input["nama"] ?? "");
        $deskripsi = trim($input["deskripsi"] ?? "");

        if ($nama === "") {
            $this->response(
                false,
                "Nama wajib diisi.",
                null,
                422
            );
        }

        try {

            $result = $this->masterData->create(
                $type,
                $nama,
                $deskripsi
            );

            if (!$result) {
                throw new Exception("Gagal menambahkan data.");
            }

            $this->response(
                true,
                "Data berhasil ditambahkan.",
                null,
                201
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

    // PUT: Memperbarui data
    public function update($type, $id) {

        $this->authorizeAdmin();

        $input = $this->getJsonInput();

        $nama = trim($input["nama"] ?? "");
        $deskripsi = trim($input["deskripsi"] ?? "");
        $status = $input["status"] ?? "Aktif";

        if ($nama === "") {
            $this->response(
                false,
                "Nama wajib diisi.",
                null,
                422
            );
        }

        if (!in_array($status, ["Aktif", "Nonaktif"], true)) {
            $this->response(
                false,
                "Status tidak valid.",
                null,
                422
            );
        }

        try {

            $result = $this->masterData->update(
                $type,
                $id,
                $nama,
                $deskripsi,
                $status
            );

            if (!$result) {
                throw new Exception("Gagal memperbarui data.");
            }

            $this->response(
                true,
                "Data berhasil diperbarui."
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

    // PATCH: Mengubah status data
    public function updateStatus($type, $id) {

        $this->authorizeAdmin();

        $input = $this->getJsonInput();

        $status = $input["status"] ?? "";

        if (!in_array($status, ["Aktif", "Nonaktif"], true)) {
            $this->response(
                false,
                "Status tidak valid.",
                null,
                422
            );
        }

        try {

            $result = $this->masterData->updateStatus(
                $type,
                $id,
                $status
            );

            if (!$result) {
                throw new Exception("Gagal mengubah status data.");
            }

            $this->response(
                true,
                "Status data berhasil diperbarui."
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

    // DELETE: Menghapus data
    public function destroy($type, $id) {

        $this->authorizeAdmin();

        try {

            $result = $this->masterData->delete($type, $id);

            if (!$result) {
                $this->response(
                    false,
                    "Data tidak ditemukan atau gagal dihapus.",
                    null,
                    404
                );
            }

            $this->response(
                true,
                "Data berhasil dihapus."
            );

        } catch (Exception $e) {

            $this->response(
                false,
                $e->getMessage(),
                null,
                400
            );
        }
    }

}

?>
