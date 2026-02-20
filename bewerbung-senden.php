<?php
session_start();

// Sichere Response-Header
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self';");
header("Referrer-Policy: strict-origin-when-cross-origin");

$empfaenger = "info@mvp-politik.de";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    if (empty($_POST['csrf_token']) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Ungültiger Sicherheits-Token (CSRF). Bitte lade die Seite neu.']);
        exit;
    }

    $website = isset($_POST['website']) ? $_POST['website'] : '';
    if (!empty($website)) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Bewerbung erfolgreich gesendet.']);
        exit;
    }

    if (!isset($_SESSION['rate_limit'])) {
        $_SESSION['rate_limit'] = [];
    }
    $_SESSION['rate_limit'] = array_filter($_SESSION['rate_limit'], function($timestamp) {
        return $timestamp > (time() - 300);
    });
    if (count($_SESSION['rate_limit']) >= 3) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Zu viele Anfragen. Bitte warte ein paar Minuten.']);
        exit;
    }
    $_SESSION['rate_limit'][] = time();

    $errors = [];
    
    $name = isset($_POST['name']) ? trim($_POST['name']) : '';
    if (empty($name)) {
        $errors['name'] = 'Bitte gib deinen Namen an.';
    } elseif (strlen($name) > 100) {
        $errors['name'] = 'Der Name ist zu lang (max. 100 Zeichen).';
    } else {
        $name = htmlspecialchars(strip_tags($name), ENT_QUOTES, 'UTF-8');
    }

    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    if (empty($email)) {
        $errors['email'] = 'Bitte gib deine E-Mail-Adresse an.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Bitte gib eine gültige E-Mail-Adresse an.';
    } else {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    }

    $phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
    if (!empty($phone)) {
        if (!preg_match('/^[0-9\+\-\s\(\)]+$/', $phone) || strlen($phone) > 30) {
            $errors['phone'] = 'Bitte gib eine gültige Telefonnummer an.';
        } else {
            $phone = htmlspecialchars(strip_tags($phone), ENT_QUOTES, 'UTF-8');
        }
    }

    $message = isset($_POST['message']) ? trim($_POST['message']) : '';
    if (!empty($message)) {
        if (strlen($message) > 2000) {
            $errors['message'] = 'Die Nachricht ist zu lang (max. 2000 Zeichen).';
        } else {
            $message = htmlspecialchars(strip_tags($message), ENT_QUOTES, 'UTF-8');
        }
    }

    if (!isset($_POST['accept']) || $_POST['accept'] !== 'on') {
        $errors['accept'] = 'Du musst der Datenschutzerklärung zustimmen.';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Bitte überprüfe deine Eingaben.', 'errors' => $errors]);
        exit;
    }


    $betreff = "Neue MVP Mitgliedsbewerbung von " . $name;
    
    $nachricht = "Neue Mitgliedsbewerbung über die Website\n";
    $nachricht .= "==========================================\n\n";
    $nachricht .= "Name: " . $name . "\n";
    $nachricht .= "E-Mail: " . $email . "\n";
    
    if (!empty($phone)) {
        $nachricht .= "Telefon: " . $phone . "\n";
    }
    
    if (!empty($message)) {
        $nachricht .= "\nNachricht:\n" . $message . "\n";
    }
    
    $nachricht .= "\n==========================================\n";
    $nachricht .= "Diese Nachricht wurde automatisch über das Bewerbungsformular auf der MVP-Website gesendet.";
    
    $header = "From: MVP Website <noreply@mvp-politik.de>\r\n";
    $header .= "Reply-To: " . $name . " <" . $email . ">\r\n";
    $header .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $header .= "X-Mailer: PHP/" . phpversion();
    
    if (mail($empfaenger, $betreff, $nachricht, $header)) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Deine Bewerbung wurde erfolgreich gesendet! Wir melden uns bald bei dir.']);
    } else {
        error_log("E-Mail konnte nicht gesendet werden an: " . $empfaenger);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Beim Senden ist ein Fehler aufgetreten. Bitte versuche es später erneut.']);
    }
    exit;
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Methode nicht erlaubt.']);
    exit;
}
?>
