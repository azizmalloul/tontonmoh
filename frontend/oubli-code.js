const API = "https://tontonmoh-api.azizekarma.workers.dev";

const form = document.getElementById("forgotForm");
const msg = document.getElementById("forgotMsg");

const firstNameInput = document.getElementById("first_name");
const lastNameInput  = document.getElementById("last_name");
const phoneInput     = document.getElementById("phone");
const emailInput     = document.getElementById("email");

function isValidEmail(email) {
  email = (email || "").trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";
  msg.className = "muted";

  const first_name = firstNameInput.value.trim();
  const last_name  = lastNameInput.value.trim();
  const phone      = phoneInput.value.trim();
  const email      = emailInput.value.trim().toLowerCase();

  if (!first_name || !last_name || !phone || !email) {
    msg.textContent = "Merci de remplir tous les champs.";
    msg.className = "error";
    return;
  }

  if (!isValidEmail(email)) {
    msg.textContent = "Merci de saisir un email valide.";
    msg.className = "error";
    return;
  }

  try {
    msg.textContent = "Envoi en cours…";

    const res = await fetch(`${API}/api/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, phone, email }),
    });

    // Anti-enumération : on reste volontairement vague
    msg.textContent =
      "Si les informations correspondent à un compte, un email vient d’être envoyé.";
    msg.className = "success";

    if (!res.ok) {
      const txt = await res.text();
      console.warn("API send-code error:", res.status, txt);
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Erreur lors de l’envoi. Réessayez plus tard.";
    msg.className = "error";
  }
});

// petit effet "flash / écrasement" comme ailleurs
function addButtonPressFlash(el) {
  if (!el) return;
  el.addEventListener('click', () => {
    el.classList.add('pressed');
    setTimeout(() => {
      el.classList.remove('pressed');
    }, 100); // ~0.1s
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const forgotBtn = document.getElementById('forgotBtn');
  addButtonPressFlash(forgotBtn);
});

