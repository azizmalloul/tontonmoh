const form = document.getElementById('signupForm');
const msg = document.getElementById('formMsg');

function toE164FR(phone){
  const d = (phone||'').replace(/\D/g,'');
  if(!d) return null;
  if(d.startsWith('0')) return '+33'+d.slice(1);
  if(d.startsWith('33')) return '+'+d;
  if(d.startsWith('6') || d.startsWith('7')) return '+33'+d;
  if(d.startsWith('+')) return d;
  return '+33'+d;
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  msg.textContent = '';
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = {
    first_name: (data.first_name||'').trim(),
    last_name: (data.last_name||'').trim(),
    phone: toE164FR(data.phone),
    email: (data.email||'').trim(),
    opt_in: !!data.opt_in
  };
  if(!payload.first_name || !payload.phone || !payload.email){
    msg.textContent = 'Merci de remplir tous les champs obligatoires.';
    msg.className = 'error';
    return;
  }
  try{
    const res = await fetch('/api/register', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    const j = await res.json();
    if(!res.ok) throw new Error(j.error || 'Erreur serveur');
    const url = new URL('/merci.html', window.location.origin);
    url.searchParams.set('code', j.code_public);
    window.location.href = url.toString();
  }catch(err){
    msg.textContent = err.message;
    msg.className = 'error';
  }
});
