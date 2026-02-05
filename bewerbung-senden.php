<?php
$empfaenger = "monarchistische.volkspartei@gmail.com";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $name = isset($_POST['name']) ? htmlspecialchars(strip_tags($_POST['name'])) : '';
    $email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
    $adresse = isset($_POST['adresse']) ? htmlspecialchars(strip_tags($_POST['adresse'])) : 'Nicht angegeben';
    $warum = isset($_POST['warum']) ? htmlspecialchars(strip_tags($_POST['warum'])) : '';
    
    // Validierung
    if (empty($name) || empty($email) || empty($warum)) {
        header("Location: bewerben.html?status=fehler&grund=felder");
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
    $nachricht .= "E-Mail: " . $email . "\n";
    $nachricht .= "Adresse: " . $adresse . "\n\n";
    $nachricht .= "Motivation:\n";
    $nachricht .= "-------------------------------------------\n";
    $nachricht .= $warum . "\n";
    $nachricht .= "-------------------------------------------\n\n";
    $nachricht .= "Diese Nachricht wurde automatisch über das Bewerbungsformular auf der MVP-Website gesendet.";
    
    $header = "From: " . $email . "\r\n";
    $header .= "Reply-To: " . $email . "\r\n";
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
