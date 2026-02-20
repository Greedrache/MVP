document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bewerbungs-form');
  const statusDiv = document.getElementById('formular-status');
  const submitBtn = document.getElementById('submitBtn');
  const csrfInput = document.getElementById('csrf_token');

  fetch('csrf-token.php')
    .then(response => response.json())
    .then(data => {
      if (data.csrf_token) {
        csrfInput.value = data.csrf_token;
      }
    })
    .catch(error => console.error('Fehler beim Laden des CSRF-Tokens:', error));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    statusDiv.innerHTML = '';
    statusDiv.style.cssText = '';

    let isValid = true;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const accept = document.getElementById('accept').checked;

    if (!name) {
      document.getElementById('name-error').textContent = 'Bitte gib deinen Namen an.';
      isValid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('email-error').textContent = 'Bitte gib eine gültige E-Mail-Adresse an.';
      isValid = false;
    }
    if (phone && !/^[0-9\+\-\s\(\)]+$/.test(phone)) {
      document.getElementById('phone-error').textContent = 'Bitte gib eine gültige Telefonnummer an (nur Zahlen und + - ( ) erlaubt).';
      isValid = false;
    }
    if (!accept) {
      document.getElementById('accept-error').textContent = 'Du musst der Datenschutzerklärung zustimmen.';
      isValid = false;
    }

    if (!isValid) {
      statusDiv.innerHTML = '<p class="fehler-meldung">✗ Bitte überprüfe deine Eingaben in den markierten Feldern.</p>';
      statusDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';

    try {
      const formData = new FormData(form);
      const response = await fetch('bewerbung-senden.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        statusDiv.innerHTML = `<p class="erfolg-meldung">✓ ${result.message}</p>`;
        statusDiv.style.cssText = 'background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';
        form.reset();
        fetch('csrf-token.php')
          .then(res => res.json())
          .then(data => { if (data.csrf_token) csrfInput.value = data.csrf_token; });
      } else {
        statusDiv.innerHTML = `<p class="fehler-meldung">✗ ${result.message || 'Ein Fehler ist aufgetreten.'}</p>`;
        statusDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';

        if (result.errors) {
          for (const [field, message] of Object.entries(result.errors)) {
            const errorEl = document.getElementById(`${field}-error`);
            if (errorEl) errorEl.textContent = message;
          }
        }
      }
    } catch (error) {
      console.error('Netzwerkfehler:', error);
      statusDiv.innerHTML = '<p class="fehler-meldung">✗ Netzwerkfehler. Bitte überprüfe deine Verbindung und versuche es erneut.</p>';
      statusDiv.style.cssText = 'background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bewerbung absenden';
    }
  });
});
