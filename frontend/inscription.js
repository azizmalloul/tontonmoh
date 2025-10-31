
const form = document.getElementById('signupForm');
const msg  = document.getElementById('formMsg');

const API = 'https://tontonmoh-api.azizekarma.workers.dev';

// ====== AJOUTE CETTE LIGNE : TON API WORKER
const API_BASE = 'https://tontonmoh-api.azizekarma.workers.dev';

function toE164FR(phone){
  const d = (phone||'').replace(/\D/g,'');
  if(!d) return null;
  if(d.startsWith('0'))  return '+33'+d.slice(1);
  if(d.startsWith('33')) return '+'+d;
  if(d.startsWith('6') || d.startsWith('7')) return '+33'+d;
  if(d.startsWith('+'))  return d;
  return '+33'+d;
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  msg.textContent = '';

  const data = Object.fromEntries(new FormData(form).entries());

  // ====== GÉNÈRE UN ID CLIENT LOCAL
  const id = 'cli_' + Math.random().toString(36).slice(2, 6).padStart(4, '0');

  // ====== ADAPTE LES CHAMPS À L’API /api/clients
  const payload = {
    id,                                 // requis par l’API
    phone_e164: toE164FR(data.phone),   // nom attendu côté API
    email:      (data.email||'').trim(),
    first_name: (data.first_name||'').trim(),
    last_name:  (data.last_name||'').trim(),
    opt_in:     !!data.opt_in           // 0/1 géré côté API
    // code_public : créé côté serveur (pas besoin de l’envoyer)
  };

  if(!payload.first_name || !payload.phone_e164 || !payload.email){
    msg.textContent = 'Merci de remplir tous les champs obligatoires.';
    msg.className = 'error';
    return;
  }

  try{
    
    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if(!res.ok){
      const txt = await res.text();
      throw new Error(`API ${res.status}: ${txt}`);
    }

    // ====== REDIRIGE VERS LA PAGE MERCI AVEC L'ID (le QR sera généré à partir de l'id)
    window.location.href = `/merci.html?id=${encodeURIComponent(id)}`;

  }catch(err){
    msg.textContent = err.message;
    msg.className = 'error';
    console.error(err);
  }
});
