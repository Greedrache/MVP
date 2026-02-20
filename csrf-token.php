<?php
session_start();

header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Methode nicht erlaubt.']);
    exit;
}

$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

echo json_encode(['csrf_token' => $_SESSION['csrf_token']]);
exit;
