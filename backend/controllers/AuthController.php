<?php
// backend/controllers/AuthController.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../config/database.php';

class AuthController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    // ==========================================
    // Fungsi untuk Register
    // ==========================================
    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email dan password wajib diisi!"]);
            return;
        }

        $user = new User($this->db);
        $user->email = $data->email;
        $user->password = $data->password;
        $user->nama_lengkap = isset($data->nama_lengkap) ? $data->nama_lengkap : null; 
        $user->role = 'nelayan';

        if ($user->register()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Registrasi berhasil! Silakan login."]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email sudah terdaftar."]);
        }
    }

    // ==========================================
    // Fungsi untuk Login
    // ==========================================
    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password) || empty($data->role)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email, password, dan role harus diisi!"]);
            return;
        }

        $user = new User($this->db);
        $user->email = $data->email;
        $user->password = $data->password;

        $result = $user->login();

        if ($result === true) {
            if ($user->role !== $data->role) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Akun ini tidak memiliki akses sebagai " . ucfirst($data->role) . "!"]);
                return;
            }


            // Buat sesi server setelah login berhasil
            if (session_status() !== PHP_SESSION_ACTIVE) {
                session_start();
            }

            session_regenerate_id(true);

            $_SESSION["user_id"] = $user->id;
            $_SESSION["role"] = $user->role;
            $_SESSION["nama_lengkap"] = $user->nama_lengkap;
            $_SESSION["email"] = $user->email;


            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Login berhasil!",
                "data" => [
                    "id" => $user->id,
                    "nama_lengkap" => $user->nama_lengkap,
                    "email" => $user->email,
                    "role" => $user->role
                ]
            ]);
        } else if ($result === "nonaktif") {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Akun Anda telah dinonaktifkan. Hubungi admin."]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Email atau password salah!"]);
        }
    }

    // ==========================================
    // FUNGSI LUPA PASSWORD (FORGOT)
    // ==========================================
    public function forgot() {
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Email wajib diisi!"]);
            return;
        }

        $user = new User($this->db);
        $user->email = $data->email;

        // 1. Cek apakah email terdaftar
        if ($user->emailExists()) {
            
            // 2. GENERATE TOKEN (INI YANG TADI HILANG)
            $token = bin2hex(random_bytes(32));
            $user->token = $token;
            
            // 3. Simpan token ke database
            if ($user->createResetToken()) {
                
                // --- KONFIGURASI PHPMAILER ---
                require_once __DIR__ . '/../PHPMailer/src/Exception.php';
                require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
                require_once __DIR__ . '/../PHPMailer/src/SMTP.php';

                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

                try {
                    $mail->isSMTP();
                    $mail->Host       = 'smtp.gmail.com';
                    $mail->SMTPAuth   = true;
                    $mail->Username = getenv('SIPIKA_MAIL_USERNAME');
                    $mail->Password = getenv('SIPIKA_MAIL_PASSWORD');
                    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port       = 587;
                    $mail->CharSet    = 'UTF-8';

                    $mail->setFrom('salmiinnano@gmail.com', 'Sistem SIPIKA');
                    $mail->addAddress($data->email);

                    $resetLink = "http://localhost/SIPIKA/frontend/pages/auth/reset-password.html?token=" . $token;
                    $mail->isHTML(true);
                    $mail->Subject = 'Reset Password Akun SIPIKA Anda';
                    $mail->Body    = "
                        <h3>Halo,</h3>
                        <p>Anda menerima email ini karena kami menerima permintaan pengaturan ulang kata sandi untuk akun Anda.</p>
                        <p>Silakan klik tombol di bawah ini untuk mengatur ulang kata sandi Anda:</p>
                        <p><a href='{$resetLink}' style='background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>
                        <p>Atau salin link ini ke browser Anda:</p>
                        <p><a href='{$resetLink}'>{$resetLink}</a></p>
                        <p><small>Jika Anda tidak meminta ini, abaikan email ini. Token ini akan kedaluwarsa dalam 1 jam.</small></p>
                    ";
                    $mail->AltBody = "Reset Password: " . $resetLink;

                    $mail->send();
                    
                    http_response_code(200);
                    echo json_encode([
                        "status" => "success",
                        "message" => "Link reset password telah dikirim ke email Anda. Silakan cek Inbox atau folder Spam."
                    ]);

                } catch (\PHPMailer\PHPMailer\Exception $e) {
                    error_log("PHPMailer Error: " . $mail->ErrorInfo);
                    http_response_code(200);
                    echo json_encode([
                        "status" => "success",
                        "message" => "Jika email terdaftar, link reset telah dikirim."
                    ]);
                }
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal membuat token reset."]);
            }
        } else {
            // Pesan aman (tidak membocorkan apakah email ada atau tidak)
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Jika email terdaftar, link reset telah dikirim."]);
        }
    } // <--- INI PENUTUP FUNGSI forgot() YANG TADI HILANG

    // ==========================================
    // FUNGSI RESET PASSWORD
    // ==========================================
    public function reset() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->token) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Token dan password baru wajib diisi!"]);
            return;
        }

        $user = new User($this->db);
        $user->token = $data->token;
        $user->password = $data->password;

        $validToken = $user->validateResetToken();

        if ($validToken === true) {
            if ($user->updatePassword()) {
                $user->markTokenAsUsed();
                http_response_code(200);
                echo json_encode(["status" => "success", "message" => "Password berhasil diubah! Silakan login."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal mengubah password."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $validToken]);
        }
    }

        // ==========================================
    // FUNGSI UBAH PASSWORD (KHUSUS PROFIL)
    // ==========================================
    public function changePassword() {
        // 1. Ambil data JSON dari frontend
        $data = json_decode(file_get_contents("php://input"));

        // 2. Validasi input tidak boleh kosong
        if (empty($data->userId) || empty($data->currentPassword) || empty($data->newPassword)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Semua kolom password wajib diisi!"]);
            return;
        }

        // 3. Panggil Model User
        $user = new User($this->db);
        
        // 4. Eksekusi logika di User.php (yang baru saja kita tambahkan)
        $result = $user->changePassword($data->userId, $data->currentPassword, $data->newPassword);

        // 5. Kirim respon balik ke frontend
        if ($result["status"] === "success") {
            http_response_code(200);
            echo json_encode($result);
        } else {
            http_response_code(401); // 401 Unauthorized karena password lama salah
            echo json_encode($result);
        }
    }

        // ==========================================
    // FUNGSI AMBIL PROFIL (KHUSUS HALAMAN PROFIL)
    // ==========================================
    public function getProfile($id) {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID user tidak valid!"]);
            return;
        }

        $user = new User($this->db);
        
        // Panggil method getProfile di User.php yang udah kita perbaiki tadi
        $profileData = $user->getProfile($id);

        if ($profileData) {
            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "data" => $profileData
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "User tidak ditemukan."]);
        }
    }


    // ==========================================
    // FUNGSI LOGOUT
    // ==========================================
    public function logout() {

        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        // Menghapus seluruh data sesi pengguna
        $_SESSION = [];

        // Menghapus cookie sesi jika digunakan
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                "",
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        // Menghancurkan sesi pada server
        session_destroy();

        http_response_code(200);

        echo json_encode([
            "status" => "success",
            "message" => "Logout berhasil."
        ]);
    }

} // Penutup Class
?>