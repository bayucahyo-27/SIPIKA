
<?php

require_once __DIR__ . "/../models/MasterData.php";

class MasterDataController {
    private $masterData;

    public function __construct($db) {
        $this->masterData = new MasterData($db);
    }

    // Mengirim respons JSON
    private function response($status, $message, $data = null, $code = 200) {
        http_response_code($code);

        echo json_encode([
            "status" => $status,
            "message" => $message,
            "data" => $data
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    // Mengambil seluruh data berdasarkan kategori
    public function index($type) {
        try {
            $data = $this->masterData->getAll($type);

            $this->response(true, "Data berhasil diambil.", $data);
        } catch (Exception $e) {
            $this->response(false, $e->getMessage(), null, 400);
        }
    }

    // Mengambil data berdasarkan ID
    public function show($type, $id) {
        try {
            $data = $this->masterData->getById($type, $id);

            if (!$data) {
                $this->response(false, "Data tidak ditemukan.", null, 404);
            }

            $this->response(true, "Data berhasil diambil.", $data);
        } catch (Exception $e) {
            $this->response(false, $e->getMessage(), null, 400);
        }
    }

    // Menambahkan data
    public function store($type) {
        $input = json_decode(file_get_contents("php://input"), true);

        $nama = trim($input["nama"] ?? "");
        $deskripsi = trim($input["deskripsi"] ?? "");

        if ($nama === "") {
            $this->response(false, "Nama wajib diisi.", null, 422);
        }

        try {
            $result = $this->masterData->create($type, $nama, $deskripsi);
            $this->response($result, "Data berhasil ditambahkan.");
        } catch (Exception $e) {
            $this->response(false, $e->getMessage(), null, 400);
        }
    }

    // Mengubah data
    public function update($type, $id) {
        $input = json_decode(file_get_contents("php://input"), true);

        $nama = trim($input["nama"] ?? "");
        $deskripsi = trim($input["deskripsi"] ?? "");
        $status = $input["status"] ?? "Aktif";

        if ($nama === "") {
            $this->response(false, "Nama wajib diisi.", null, 422);
        }

        if (!in_array($status, ["Aktif", "Nonaktif"], true)) {
            $this->response(false, "Status tidak valid.", null, 422);
        }

        try {
            $result = $this->masterData->update(
                $type, $id, $nama, $deskripsi, $status
            );

            $this->response($result, "Data berhasil diperbarui.");
        } catch (Exception $e) {
            $this->response(false, $e->getMessage(), null, 400);
        }
    }

    // Menghapus data
    public function destroy($type, $id) {
        try {
            $result = $this->masterData->delete($type, $id);
            $this->response($result, "Data berhasil dihapus.");
        } catch (Exception $e) {
            $this->response(false, $e->getMessage(), null, 400);
        }
    }
}
?>
