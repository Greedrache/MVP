document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bewerbungs-form');
  const statusDiv = document.getElementById('formular-status');
  const submitBtn = document.getElementById('submitBtn');
  const csrfInput = document.getElementById('csrf_token');

  /* ---------- CSRF-Token laden ---------- */
  function loadCsrfToken() {
    return fetch('csrf-token.php')
      .then(r => r.json())
      .then(data => {
        if (data.csrf_token) csrfInput.value = data.csrf_token;
      })
      .catch(err => console.error('CSRF-Token konnte nicht geladen werden:', err));
  }
  loadCsrfToken();

  /* ---------- Hilfsfunktionen ---------- */
  function setFieldError(id, msg) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(id + '-error');
    if (errorEl) errorEl.textContent = msg;
    if (input) input.setAttribute('aria-invalid', 'true');
  }

  function clearFieldError(id) {
    const input = document.getElementById(id);
    const errorEl = document.getElementById(id + '-error');
    if (errorEl) errorEl.textContent = '';
    if (input) input.removeAttribute('aria-invalid');
  }

  function clearAllErrors() {
    ['name', 'email', 'phone', 'message', 'accept'].forEach(clearFieldError);
    statusDiv.textContent = '';
    statusDiv.className = '';
  }

  function showStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = type === 'success' ? 'formular-erfolg' : 'formular-fehler';
    statusDiv.setAttribute('role', type === 'success' ? 'status' : 'alert');
    statusDiv.focus();
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Wird gesendet\u2026' : 'Bewerbung absenden';
    submitBtn.setAttribute('aria-busy', String(loading));
  }

  /* ---------- Live-Validierung ---------- */
  form.addEventListener('input', (e) => {
    const id = e.target.id;
    if (['name', 'email', 'phone', 'message'].includes(id)) clearFieldError(id);
  });
  form.addEventListener('change', (e) => {
    if (e.target.id === 'accept') clearFieldError('accept');
  });

  /* ---------- Client-Validierung ---------- */
  function validate() {
    let valid = true;
    const firstInvalid = [];

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    const accept = document.getElementById('accept').checked;

    if (!name || name.length < 2) {
      setFieldError('name', 'Bitte gib deinen Namen an (mind. 2 Zeichen).');
      firstInvalid.push('name');
      valid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setFieldError('email', 'Bitte gib eine gültige E-Mail-Adresse an.');
      firstInvalid.push('email');
      valid = false;
    }

    if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
      setFieldError('phone', 'Nur Zahlen und + - ( ) erlaubt.');
      firstInvalid.push('phone');
      valid = false;
    }

    if (message && message.length > 2000) {
      setFieldError('message', 'Maximal 2000 Zeichen erlaubt.');
      firstInvalid.push('message');
      valid = false;
    }

    if (!accept) {
      setFieldError('accept', 'Du musst der Datenschutzerklärung zustimmen.');
      firstInvalid.push('accept');
      valid = false;
    }

    // Fokus auf erstes fehlerhaftes Feld
    if (firstInvalid.length > 0) {
      document.getElementById(firstInvalid[0]).focus();
    }

    return valid;
  }

  /* ---------- Absenden ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    if (!validate()) {
      showStatus('Bitte überprüfe deine Eingaben.', 'error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(form);
      const response = await fetch('bewerbung-senden.php', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showStatus(result.message || 'Bewerbung erfolgreich gesendet!', 'success');
        form.reset();
        loadCsrfToken();
      } else {
        // Server-Feldvalidierungsfehler übernehmen
        if (result.errors) {
          const fields = Object.keys(result.errors);
          fields.forEach(field => setFieldError(field, result.errors[field]));
          if (fields.length > 0) document.getElementById(fields[0]).focus();
        }
        showStatus(result.message || 'Ein Fehler ist aufgetreten.', 'error');
      }
    } catch (err) {
      console.error('Netzwerkfehler:', err);
      showStatus('Netzwerkfehler – bitte überprüfe deine Verbindung und versuche es erneut.', 'error');
    } finally {
      setLoading(false);
    }
  });
});
