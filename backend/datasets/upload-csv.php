<?php
// backend/datasets/upload-csv.php
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/../controllers/DatasetController.php';

$controller = new DatasetController();
$controller->uploadCsv();
?>