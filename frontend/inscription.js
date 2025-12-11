const form = document.getElementById('signupForm');
const msg  = document.getElementById('formMsg');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');

const API = 'https://tontonmoh-api.azizekarma.workers.dev';

function toE164FR(phone){
  const d = (phone || '').replace(/\D/g,'');
  if(!d) return null;
  if(d.startsWith('0'))  return '+33' + d.slice(1);
  if(d.startsWith('33')) return '+' + d;
  if(d.startsWith('6') || d.startsWith('7')) return '+33' + d;
  if(d.startsWith('+'))  return d;
  return '+33' + d;
}

// petit helper si ton DB exige un code_public non nul
function makeCodePublic(){
  // ex: 6 lettres/chiffres en majuscules
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  msg.className = '';

  const data = Object.fromEntries(new FormData(form).entries());

  // --- 1) Nettoyage & vérif téléphone ---
  const phoneRaw    = data.phone || '';
  const phoneDigits = phoneRaw.replace(/\D/g, ''); // seulement les chiffres

  // Doit être exactement 10 chiffres et commencer par 0 (06…, 07…, 04…, etc.)
  if (!/^0[1-9][0-9]{8}$/.test(phoneDigits)) {
    msg.textContent = 'Merci de saisir un numéro de téléphone à 10 chiffres';
    msg.className = 'error';
    phoneInput.focus();
    return;
  }

  const phoneE164 = toE164FR(phoneDigits);
  if (!phoneE164) {
    msg.textContent = 'Numéro de téléphone invalide.';
    msg.className = 'error';
    phoneInput.focus();
    return;
  }

  // --- 2) Vérif email ---
  const email = (data.email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    msg.textContent = 'Merci de saisir une adresse e-mail valide (ex : vous@exemple.fr).';
    msg.className = 'error';
    emailInput.focus();
    return;
  }

  // --- 3) Vérif prénom ---
  const firstName = (data.first_name || '').trim();
  const lastName  = (data.last_name  || '').trim();

  if (!firstName) {
    msg.textContent = 'Merci de saisir au moins votre prénom.';
    msg.className = 'error';
    return;
  }

  // --- 4) Payload final pour l’API ---
  const payload = {
    id: 'cli_' + Math.random().toString(36).slice(2, 6).padStart(4, '0'),
    phone_e164: phoneE164,
    email,
    first_name: firstName,
    last_name:  lastName,
    opt_in:     !!data.opt_in,
    // code_public: makeCodePublic(),
  };

  try {
    console.log('[signup] payload envoyé à /api/clients:', payload);

    const res = await fetch(`${API}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const txt = await res.text();
    let j = {};
    try { j = JSON.parse(txt); } catch {}

    if (!res.ok) {
      throw new Error(`API ${res.status}: ${txt}`);
    }

    const code = j.code_public || payload.id;
    window.location.href = `/merci.html?code=${encodeURIComponent(code)}`;
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'error';
    console.error(err);
  }
});
