<?php
session_start();

// Sichere Response-Header
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self';");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Cache-Control: no-store, no-cache, must-revalidate");

$empfaenger = "info@mvp-politik.de";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt.']);
    exit;
}

if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Ungültiger Sicherheits-Token (CSRF). Bitte lade die Seite neu.']);
    exit;
}
unset($_SESSION['csrf_token']);

$website = isset($_POST['website']) ? $_POST['website'] : '';
if (!empty($website)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Bewerbung erfolgreich gesendet.']);
    exit;
}

$now = time();
$window = 300; // 5 Minuten
$maxRequests = 3;

if (!isset($_SESSION['rate_limit'])) {
    $_SESSION['rate_limit'] = [];
}
$_SESSION['rate_limit'] = array_values(array_filter($_SESSION['rate_limit'], function ($ts) use ($now, $window) {
    return $ts > ($now - $window);
}));
if (count($_SESSION['rate_limit']) >= $maxRequests) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Zu viele Anfragen. Bitte warte ein paar Minuten.']);
    exit;
}
$_SESSION['rate_limit'][] = $now;

$errors = [];

$name = isset($_POST['name']) ? trim($_POST['name']) : '';
if ($name === '') {
    $errors['name'] = 'Bitte gib deinen Namen an.';
} elseif (mb_strlen($name, 'UTF-8') < 2) {
    $errors['name'] = 'Der Name muss mindestens 2 Zeichen lang sein.';
} elseif (mb_strlen($name, 'UTF-8') > 100) {
    $errors['name'] = 'Der Name ist zu lang (max. 100 Zeichen).';
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
if ($email === '') {
    $errors['email'] = 'Bitte gib deine E-Mail-Adresse an.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Bitte gib eine gültige E-Mail-Adresse an.';
} elseif (mb_strlen($email, 'UTF-8') > 254) {
    $errors['email'] = 'Die E-Mail-Adresse ist zu lang.';
}

$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
if ($phone !== '') {
    if (!preg_match('/^[0-9+\-\s()]+$/', $phone) || mb_strlen($phone, 'UTF-8') > 30) {
        $errors['phone'] = 'Bitte gib eine gültige Telefonnummer an.';
    }
}

$message = isset($_POST['message']) ? trim($_POST['message']) : '';
if ($message !== '' && mb_strlen($message, 'UTF-8') > 2000) {
    $errors['message'] = 'Die Nachricht ist zu lang (max. 2000 Zeichen).';
}

if (!isset($_POST['accept']) || $_POST['accept'] !== 'on') {
    $errors['accept'] = 'Du musst der Datenschutzerklärung zustimmen.';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bitte überprüfe deine Eingaben.', 'errors' => $errors]);
    exit;
}

function sanitizeHeader($value) {
    return preg_replace('/[\r\n]/', '', $value);
}

$name    = htmlspecialchars(strip_tags($name), ENT_QUOTES, 'UTF-8');
$email   = filter_var($email, FILTER_SANITIZE_EMAIL);
$phone   = htmlspecialchars(strip_tags($phone), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(strip_tags($message), ENT_QUOTES, 'UTF-8');

$betreff = "Neue MVP Mitgliedsbewerbung von " . sanitizeHeader($name);

$nachricht  = "Neue Mitgliedsbewerbung über die Website\n";
$nachricht .= "==========================================\n\n";
$nachricht .= "Name:   " . $name . "\n";
$nachricht .= "E-Mail: " . $email . "\n";

if ($phone !== '') {
    $nachricht .= "Telefon: " . $phone . "\n";
}

if ($message !== '') {
    $nachricht .= "\nNachricht:\n" . $message . "\n";
}

$nachricht .= "\n==========================================\n";
$nachricht .= "Gesendet am: " . date('d.m.Y H:i') . " Uhr\n";
$nachricht .= "IP: " . sanitizeHeader($_SERVER['REMOTE_ADDR'] ?? 'unbekannt') . "\n";
$nachricht .= "Diese Nachricht wurde automatisch über das Bewerbungsformular auf der MVP-Website gesendet.";

$header  = "From: MVP Website <noreply@mvp-politik.de>\r\n";
$header .= "Reply-To: " . sanitizeHeader($name) . " <" . sanitizeHeader($email) . ">\r\n";
$header .= "Content-Type: text/plain; charset=UTF-8\r\n";
$header .= "X-Mailer: PHP/" . phpversion();

if (mail($empfaenger, $betreff, $nachricht, $header)) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Deine Bewerbung wurde erfolgreich gesendet! Wir melden uns bald bei dir.']);
} else {
    error_log("E-Mail konnte nicht gesendet werden an: " . $empfaenger . " von " . $email);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Beim Senden ist ein Fehler aufgetreten. Bitte versuche es später erneut.']);
}
exit;
