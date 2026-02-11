const params = new URLSearchParams(window.location.search);
const status = params.get('status');
const statusDiv = document.getElementById('formular-status');

if (status === 'erfolg') {
  statusDiv.innerHTML = '<p class="erfolg-meldung">✓ Deine Bewerbung wurde erfolgreich gesendet! Wir melden uns bald bei dir.</p>';
  statusDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';
} else if (status === 'fehler') {
  statusDiv.innerHTML = '<p class="fehler-meldung">✗ Beim Senden ist ein Fehler aufgetreten. Bitte versuche es erneut.</p>';
  statusDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';
}
