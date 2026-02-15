<?php
$empfaenger = "info@mvp-politik.de";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $name = isset($_POST['name']) ? htmlspecialchars(strip_tags($_POST['name'])) : '';
    $email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
    // Adresse removed from form; no longer processed
    // 'Warum' field removed from form; no longer collected or required
    
    // Validierung
    if (empty($name) || empty($email)) {
        header("Location: bewerben.html?status=fehler&grund=felder");
        exit;
    }

    // Zustimmung zu Satzung/Impressum prüfen
    if (!isset($_POST['accept']) || $_POST['accept'] !== 'on') {
        header("Location: bewerben.html?status=fehler&grund=akzeptieren");
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: bewerben.html?status=fehler&grund=email");
        exit;
    }
    
    // E-Mail zusammenstellen
    $betreff = "Neue MVP Mitgliedsbewerbung von " . $name;
    
    $nachricht = "Neue Mitgliedsbewerbung über die Website\n";
    $nachricht .= "==========================================\n\n";
    $nachricht .= "Name: " . $name . "\n";
    $nachricht .= "E-Mail: " . $email . "\n\n";
    // Motivation field removed from form
    $nachricht .= "Diese Nachricht wurde automatisch über das Bewerbungsformular auf der MVP-Website gesendet.";
    
    $header = "From: MVP Website <noreply@mvp-politik.de>\r\n";
    $header .= "Reply-To: " . $name . " <" . $email . ">\r\n";
    $header .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $header .= "X-Mailer: PHP/" . phpversion();
    
    if (mail($empfaenger, $betreff, $nachricht, $header)) {
        header("Location: bewerben.html?status=erfolg");
    } else {
        header("Location: bewerben.html?status=fehler&grund=senden");
    }
    exit;
    
} else {
    header("Location: bewerben.html");
    exit;
}
?>
