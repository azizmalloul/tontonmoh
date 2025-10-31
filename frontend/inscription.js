const form = document.getElementById('signupForm');
const msg  = document.getElementById('formMsg');

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

  const payload = {
    id: 'cli_' + Math.random().toString(36).slice(2, 6).padStart(4, '0'),
    phone_e164: toE164FR(data.phone),
    email:      (data.email || '').trim(),
    first_name: (data.first_name || '').trim(),
    last_name:  (data.last_name || '').trim(),
    opt_in:     !!data.opt_in,

    // décommente si ton API exige code_public à l’insert
    // code_public: makeCodePublic(),
  };

  if (!payload.first_name || !payload.phone_e164 || !payload.email) {
    msg.textContent = 'Merci de remplir tous les champs obligatoires.';
    msg.className = 'error';
    return;
  }

  try {
    console.log('[signup] payload envoyé à /api/clients:', payload);
    // 👉 ici on appelle la bonne route :
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

    // si le Worker renvoie { code_public } on l’utilise, sinon on retombe sur l’id
    const code = j.code_public || payload.id;

    window.location.href = `/merci.html?code=${encodeURIComponent(code)}`;
  } catch (err) {
    msg.textContent = err.message;
    msg.className = 'error';
    console.error(err);
  }
});
