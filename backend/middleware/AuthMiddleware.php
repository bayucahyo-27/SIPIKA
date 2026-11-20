
<?php

class AuthMiddleware {

    // Memastikan pengguna sudah login
    public static function check() {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }

        if (empty($_SESSION["user_id"]) || empty($_SESSION["role"])) {
            http_response_code(401);

            echo json_encode([
                "status" => "error",
                "message" => "Silakan login terlebih dahulu."
            ]);

            exit();
        }

        return true;
    }

    // Memastikan role pengguna sesuai
    public static function authorize($allowedRoles) {
        self::check();

        if (!in_array($_SESSION["role"], $allowedRoles, true)) {
            http_response_code(403);

            echo json_encode([
                "status" => "error",
                "message" => "Anda tidak memiliki hak akses."
            ]);

            exit();
        }

        return true;
    }

    // Mengambil identitas pengguna yang sedang login
    public static function user() {
        self::check();

        return [
            "id" => $_SESSION["user_id"],
            "role" => $_SESSION["role"]
        ];
    }
}
?>