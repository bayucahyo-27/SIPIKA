<?php
// backend/controllers/DatasetController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/DataProduksi.php';

class DatasetController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // 1. GET: Ambil semua data
    public function getAll() {
        $dataProduksi = new DataProduksi($this->db);
        $stmt = $dataProduksi->read();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $data_arr = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                array_push($data_arr, $row);
            }
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $data_arr]);
        } else {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => [], "message" => "Belum ada data produksi."]);
        }
    }

    // 2. POST: Tambah data baru
    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->jenis_ikan) || empty($data->produksi_kg)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
            return;
        }

        $item = new DataProduksi($this->db);
        $item->jenis_ikan = $data->jenis_ikan;
        $item->alat_tangkap = $data->alat_tangkap;
        $item->wilayah = $data->wilayah;
        $item->musim = $data->musim;
        $item->produksi_kg = $data->produksi_kg;

        if ($item->create()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Data berhasil ditambahkan!"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menambahkan data."]);
        }
    }

    // 3. PUT: Update data (ID dikirim via URL)
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->jenis_ikan) || empty($data->produksi_kg)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap!"]);
            return;
        }

        $item = new DataProduksi($this->db);
        $item->id = $id;
        $item->jenis_ikan = $data->jenis_ikan;
        $item->alat_tangkap = $data->alat_tangkap;
        $item->wilayah = $data->wilayah;
        $item->musim = $data->musim;
        $item->produksi_kg = $data->produksi_kg;

        if ($item->update()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Data berhasil diperbarui!"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memperbarui data."]);
        }
    }

    // 4. DELETE: Hapus data (ID dikirim via URL)
    public function delete($id) {
        $item = new DataProduksi($this->db);
        $item->id = $id;

        if ($item->delete()) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Data berhasil dihapus!"]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menghapus data."]);
        }
    }
}
?>