<?php

// SIPIKA - Backend Application

header("Content-Type: application/json");

echo json_encode([
    "status" => "success",
    "message" => "SIPIKA Backend is running"
]);

?>
