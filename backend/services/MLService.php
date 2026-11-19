
<?php

class MLService
{
    // Alamat Machine Learning API pada laptop yang menjalankan FastAPI
    private $apiUrl = "http://10.219.251.32:8000";

    // Mengirim empat atribut ke API untuk mendapatkan hasil prediksi
    public function predict($data)
    {
        $url = $this->apiUrl . "/predict";

        $payload = json_encode([
            "jenis_ikan" => $data["jenis_ikan"],
            "alat_tangkap" => $data["alat_tangkap"],
            "wilayah" => $data["wilayah"],
            "musim" => $data["musim"]
        ]);

        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json"
            ],
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        curl_close($curl);

        // Memeriksa apakah API berhasil dihubungi
        if ($response === false || !empty($error)) {
            throw new Exception("Gagal menghubungi Machine Learning API: " . $error);
        }

        $result = json_decode($response, true);

        // Memastikan API memberikan hasil prediksi yang valid
        if ($httpCode !== 200 || !isset($result["status"]) || $result["status"] !== "success") {
            throw new Exception("Prediksi gagal: " . ($result["detail"] ?? "Respons API tidak valid"));
        }

        return $result;
    }
}
