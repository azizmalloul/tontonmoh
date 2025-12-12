const API = 'https://tontonmoh-api.azizekarma.workers.dev';

const form = document.getElementById('forgotForm');
const emailInput = document.getElementById('email');
const msg = document.getElementById('forgotMsg');

function isValidEmail(email) {
  email = (email || '').trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.className = 'muted';

  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    msg.textContent = 'Merci de saisir un email valide.';
    msg.className = 'error';
    return;
  }

  try {
    msg.textContent = 'Envoi en cours…';

    const res = await fetch(`${API}/api/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    // On reste volontairement vague (anti-enumération)
    msg.textContent = "Si un compte existe avec cet email, un message vient de vous être envoyé.";
    msg.className = 'success';

    // Optionnel : si tu veux loguer les erreurs côté console
    if (!res.ok) {
      const txt = await res.text();
      console.warn('API send-code error:', res.status, txt);
    }

  } catch (err) {
    console.error(err);
    msg.textContent = 'Erreur lors de l’envoi. Réessayez plus tard.';
    msg.className = 'error';
  }
});
