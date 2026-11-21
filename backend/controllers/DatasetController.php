
<?php
// backend/controllers/DatasetController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/DataProduksi.php';
require_once __DIR__ . '/../models/DatasetFile.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class DatasetController {
    private $db;
    private $datasetFile;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();

        $this->datasetFile = new DatasetFile($this->db);
    }

    // ==========================================
    // BAGIAN A: CRUD DATA PRODUKSI
    // ==========================================

    // GET: Ambil semua data produksi
    public function getAll() {
        $dataProduksi = new DataProduksi($this->db);
        $stmt = $dataProduksi->read();
        $data_arr = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $data_arr,
            "message" => count($data_arr) > 0
                ? "Data produksi berhasil diambil."
                : "Belum ada data produksi."
        ]);
    }

    // POST: Tambah data produksi
    public function create() {
        $data = json_decode(file_get_contents("php://input"));

        if (
            !$data ||
            empty($data->jenis_ikan) ||
            !isset($data->produksi_kg) ||
            $data->produksi_kg === ""
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Data tidak lengkap!"
            ]);
            return;
        }

        $item = new DataProduksi($this->db);
        $item->jenis_ikan = $data->jenis_ikan;
        $item->alat_tangkap = $data->alat_tangkap ?? "";
        $item->wilayah = $data->wilayah ?? "";
        $item->musim = $data->musim ?? "";
        $item->produksi_kg = $data->produksi_kg;

        if ($item->create()) {
            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Data berhasil ditambahkan!"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal menambahkan data."
            ]);
        }
    }

    // PUT: Update data produksi
    public function update($id) {
        $data = json_decode(file_get_contents("php://input"));

        if (
            !$data ||
            empty($data->jenis_ikan) ||
            !isset($data->produksi_kg) ||
            $data->produksi_kg === ""
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Data tidak lengkap!"
            ]);
            return;
        }

        $item = new DataProduksi($this->db);
        $item->id = $id;
        $item->jenis_ikan = $data->jenis_ikan;
        $item->alat_tangkap = $data->alat_tangkap ?? "";
        $item->wilayah = $data->wilayah ?? "";
        $item->musim = $data->musim ?? "";
        $item->produksi_kg = $data->produksi_kg;

        if ($item->update()) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Data berhasil diperbarui!"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal memperbarui data."
            ]);
        }
    }

    // DELETE: Hapus data produksi
    public function delete($id) {
        $item = new DataProduksi($this->db);
        $item->id = $id;

        if ($item->delete()) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Data berhasil dihapus!"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal menghapus data."
            ]);
        }
    }

        // GET: Detail satu data produksi + kesimpulan & saran otomatis (Opsi B)
    public function getDetail($id) {
        $dataProduksi = new DataProduksi($this->db);
        $item = $dataProduksi->getById($id);

        if (!$item) {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Data tidak ditemukan."
            ]);
            return;
        }

        // Generate kesimpulan & saran otomatis berdasarkan kategori
        $jenis = $item["jenis_ikan"];
        $wilayah = $item["wilayah"];
        $musim = $item["musim"];
        $produksi = $item["produksi_kg"];
        $kategori = $item["kategori"];

        switch ($kategori) {
            case "Tinggi":
                $kesimpulan = "Produksi ikan {$jenis} di wilayah {$wilayah} pada musim {$musim} tercatat {$produksi} kg, yang termasuk kategori TINGGI. Ini menandakan kondisi tangkapan yang sangat optimal di wilayah tersebut.";
                $saran = "Manfaatkan momentum produksi tinggi ini untuk mengoptimalkan distribusi hasil tangkapan. Namun tetap perhatikan keberlanjutan sumber daya ikan dan patuhi kuota tangkap agar populasi tidak menurun.";
                break;

            case "Sedang":
                $kesimpulan = "Produksi ikan {$jenis} di wilayah {$wilayah} pada musim {$musim} tercatat {$produksi} kg, yang termasuk kategori SEDANG. Kondisi tangkapan dalam batas stabil dan sesuai ekspektasi.";
                $saran = "Pertahankan metode penangkapan yang sedang digunakan. Pantau perubahan musim dan kondisi perairan secara berkala agar produksi tetap stabil atau berpotensi meningkat.";
                break;

            default: // Rendah
                $kesimpulan = "Produksi ikan {$jenis} di wilayah {$wilayah} pada musim {$musim} tercatat {$produksi} kg, yang termasuk kategori RENDAH. Ini mengindikasikan penurunan hasil tangkapan di wilayah tersebut.";
                $saran = "Lakukan evaluasi terhadap alat tangkap yang digunakan dan kondisi wilayah penangkapan. Koordinasikan dengan dinas perikanan setempat untuk mengidentifikasi penyebab penurunan dan mencari solusi bersama.";
                break;
        }

        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "data" => $item,
            "kesimpulan" => $kesimpulan,
            "saran" => $saran
        ]);
    }


    // ==========================================
    // BAGIAN B: PENGELOLAAN FILE DATASET
    // ==========================================

    // Memastikan hanya Admin yang dapat mengakses
    private function authorizeAdmin() {
        AuthMiddleware::authorize(["admin"]);
    }

    // GET: Menampilkan daftar dataset
    public function listDataset() {
        $this->authorizeAdmin();

        try {
            $data = $this->datasetFile->getAll();

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Data dataset berhasil diambil.",
                "data" => $data
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal mengambil data dataset."
            ]);
        }
    }

    // POST: Upload file CSV
    public function uploadDataset() {
        $this->authorizeAdmin();

        if (
            !isset($_FILES["dataset"]) ||
            $_FILES["dataset"]["error"] !== UPLOAD_ERR_OK
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "File dataset belum dipilih atau gagal diunggah."
            ]);
            return;
        }

        $file = $_FILES["dataset"];

        if (
            strtolower(pathinfo($file["name"], PATHINFO_EXTENSION)) !== "csv"
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Format file harus CSV."
            ]);
            return;
        }

        if ($file["size"] <= 0 || $file["size"] > 10 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Ukuran file harus lebih dari 0 dan maksimal 10 MB."
            ]);
            return;
        }

        $handle = fopen($file["tmp_name"], "r");

        if (!$handle) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "File CSV tidak dapat dibaca."
            ]);
            return;
        }

        $header = fgetcsv($handle);

        if (!$header) {
            fclose($handle);
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "File CSV kosong atau tidak memiliki header."
            ]);
            return;
        }

        // Membersihkan BOM dan spasi pada header
        $header[0] = preg_replace('/^\xEF\xBB\xBF/', '', $header[0]);

        $header = array_map(
            function ($value) {
                return strtolower(trim($value));
            },
            $header
        );

        $requiredHeaders = [
            "jenis_ikan",
            "alat_tangkap",
            "wilayah",
            "musim",
            "produksi_kg",
            "kategori"
        ];

        if ($header !== $requiredHeaders) {
            fclose($handle);
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Header CSV tidak sesuai. Gunakan: " .
                    implode(", ", $requiredHeaders)
            ]);
            return;
        }

        $rows = [];
        $lineNumber = 1;

        while (($values = fgetcsv($handle)) !== false) {
            $lineNumber++;

            if ($values === [null] || $values === []) {
                continue;
            }

            if (count($values) !== count($requiredHeaders)) {
                fclose($handle);
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Jumlah kolom tidak sesuai pada baris " .
                        $lineNumber . "."
                ]);
                return;
            }

            $row = array_combine($requiredHeaders, $values);

            foreach ($row as $key => $value) {
                $row[$key] = trim($value);
            }

            foreach ($requiredHeaders as $column) {
                if ($row[$column] === "") {
                    fclose($handle);
                    http_response_code(400);
                    echo json_encode([
                        "status" => "error",
                        "message" => "Terdapat kolom kosong pada baris " .
                            $lineNumber . "."
                    ]);
                    return;
                }
            }

            if (
                !is_numeric($row["produksi_kg"]) ||
                (float)$row["produksi_kg"] < 0
            ) {
                fclose($handle);
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Nilai produksi tidak valid pada baris " .
                        $lineNumber . "."
                ]);
                return;
            }

            if (!in_array(
                $row["kategori"],
                ["Rendah", "Sedang", "Tinggi"],
                true
            )) {
                fclose($handle);
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Kategori tidak valid pada baris " .
                        $lineNumber . "."
                ]);
                return;
            }

            $row["produksi_kg"] = (float)$row["produksi_kg"];
            $rows[] = $row;
        }

        fclose($handle);

        if (count($rows) === 0) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Dataset tidak memiliki baris data."
            ]);
            return;
        }

        $uploadDirectory = __DIR__ . "/../uploads/datasets/";

        if (
            !is_dir($uploadDirectory) &&
            !mkdir($uploadDirectory, 0775, true)
        ) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Folder penyimpanan dataset gagal dibuat."
            ]);
            return;
        }

        $originalName = basename($file["name"]);

        $safeName = preg_replace(
            '/[^a-zA-Z0-9._-]/',
            '_',
            $originalName
        );

        $newFileName = date("YmdHis") . "_" .
            bin2hex(random_bytes(4)) . "_" . $safeName;

        $destination = $uploadDirectory . $newFileName;
        $relativePath = "uploads/datasets/" . $newFileName;

        if (!move_uploaded_file($file["tmp_name"], $destination)) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "File gagal disimpan."
            ]);
            return;
        }

        try {
            $user = AuthMiddleware::user();

            $result = $this->datasetFile->create(
                $originalName,
                $relativePath,
                $user["id"],
                $rows
            );

            if (!$result) {
                if (file_exists($destination)) {
                    unlink($destination);
                }

                http_response_code(500);
                echo json_encode([
                    "status" => "error",
                    "message" => "Gagal menyimpan dataset ke database."
                ]);
                return;
            }

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Dataset berhasil diunggah.",
                "data" => [
                    "nama_file" => $originalName,
                    "jumlah_data" => count($rows)
                ]
            ]);
        } catch (Exception $e) {
            if (file_exists($destination)) {
                unlink($destination);
            }

            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Terjadi kesalahan saat menyimpan dataset."
            ]);
        }
    }

    // PUT: Mengubah nama dataset
    public function updateDataset($id) {
        $this->authorizeAdmin();

        $data = json_decode(file_get_contents("php://input"));

        if (
            !$data ||
            !isset($data->nama_file) ||
            !is_string($data->nama_file) ||
            trim($data->nama_file) === ""
        ) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Nama dataset wajib diisi."
            ]);
            return;
        }

        try {
            $result = $this->datasetFile->update(
                (int)$id,
                trim($data->nama_file)
            );

            if (!$result) {
                http_response_code(404);
                echo json_encode([
                    "status" => "error",
                    "message" => "Dataset tidak ditemukan atau gagal diperbarui."
                ]);
                return;
            }

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Nama dataset berhasil diperbarui."
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Gagal memperbarui dataset."
            ]);
        }
    }

    // DELETE: Menghapus dataset
    public function deleteDataset($id) {
        $this->authorizeAdmin();

        try {
            $dataset = $this->datasetFile->getById((int)$id);

            if (!$dataset) {
                http_response_code(404);
                echo json_encode([
                    "status" => "error",
                    "message" => "Dataset tidak ditemukan."
                ]);
                return;
            }

            $result = $this->datasetFile->delete((int)$id);

            if (!$result) {
                http_response_code(500);
                echo json_encode([
                    "status" => "error",
                    "message" => "Gagal menghapus dataset dari database."
                ]);
                return;
            }
            
            $filePath = __DIR__ . "/../" . $dataset["path_file"];

            if (is_file($filePath) && !unlink($filePath)) {
                error_log(
                    "Gagal menghapus file dataset: " . $filePath
                );
            }

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Dataset berhasil dihapus."
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Terjadi kesalahan saat menghapus dataset."
            ]);
        }
    }

        // 5. POST: Upload CSV Massal
    public function uploadCsv() {
        // Cek apakah file ada
        if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "File CSV tidak ditemukan atau rusak."]);
            return;
        }

        $file = $_FILES['csv_file']['tmp_name'];
        $handle = fopen($file, "r");

        if ($handle === false) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal membuka file CSV."]);
            return;
        }

        // Lewati baris pertama (header CSV)
        fgetcsv($handle);

        $successCount = 0;
        $errorCount = 0;
        $dataProduksi = new DataProduksi($this->db);

        // Baca setiap baris
        while (($row = fgetcsv($handle)) !== false) {
            // Pastikan baris memiliki minimal 5 kolom
            if (count($row) < 5) {
                $errorCount++;
                continue; 
            }

            // Map data (Index 0-4, Index 5 'tingkat_produksi' diabaikan karena dihitung otomatis oleh Model)
            $dataProduksi->jenis_ikan = trim($row[0]);
            $dataProduksi->alat_tangkap = trim($row[1]);
            $dataProduksi->wilayah = trim($row[2]);
            $dataProduksi->musim = trim($row[3]);
            $dataProduksi->produksi_kg = (int) trim($row[4]);

            // Validasi dasar
            if (empty($dataProduksi->jenis_ikan) || empty($dataProduksi->produksi_kg)) {
                $errorCount++;
                continue;
            }

            // Simpan ke database
            if ($dataProduksi->create()) {
                $successCount++;
            } else {
                $errorCount++;
            }
        }
        fclose($handle);

        if ($successCount > 0) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Berhasil mengunggah {$successCount} data. ({$errorCount} data dilewati/gagal).",
                "success_count" => $successCount
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memproses data. Pastikan format CSV sesuai."]);
        }
    }
}
?>

