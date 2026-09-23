// Testimonials: reads from the Google Sheet (via the Apps Script Web App
// configured in config.js) and lets the doctor add new ones from the UI.
// See README.md → "Connect Google Sheets" for setup.

const SAMPLE_TESTIMONIALS = [
  {
    name: "Sample patient",
    role: "Example — replace by connecting Google Sheets",
    rating: 5,
    text: "This is a sample testimonial so you can see the layout. Follow README.md to connect your Google Sheet and this card will be replaced by real reviews.",
    example: true,
  },
  {
    name: "Sample patient",
    role: "Example — replace by connecting Google Sheets",
    rating: 5,
    text: "Once connected, testimonials added in the spreadsheet or through the doctor-only panel below will appear here automatically.",
    example: true,
  },
];

async function hashPasscode(text) {
  const enc = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
window.hashPasscode = hashPasscode;

function starRow(rating) {
  const n = Math.max(1, Math.min(5, Math.round(rating || 5)));
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += i < n ? icon("star", "star-filled") : icon("starOutline", "star-empty");
  }
  return out;
}

function renderTestimonials(list) {
  const grid = document.getElementById("testiGrid");
  if (!list.length) {
    grid.innerHTML = '<div class="testi-empty">No testimonials yet.</div>';
    return;
  }
  grid.innerHTML = list
    .map(
      (t, i) => `
      <div class="testi-card reveal" style="transition-delay:${Math.min(i, 8) * 80}ms">
        <div class="testi-stars">${starRow(t.rating)}</div>
        <p class="testi-text">"${escapeHtml(t.text)}"</p>
        <p class="testi-who"><b>${escapeHtml(t.name)}</b>${t.role ? " — " + escapeHtml(t.role) : ""}${t.example ? " (example)" : ""}</p>
      </div>`
    )
    .join("");
  if (window.observeReveal) window.observeReveal(grid);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function loadTestimonials() {
  const grid = document.getElementById("testiGrid");
  if (!SITE_CONFIG.testimonialsApiUrl) {
    renderTestimonials(SAMPLE_TESTIMONIALS);
    return;
  }
  try {
    const res = await fetch(`${SITE_CONFIG.testimonialsApiUrl}?action=list`);
    const data = await res.json();
    if (data.ok && Array.isArray(data.testimonials) && data.testimonials.length) {
      renderTestimonials(data.testimonials);
    } else {
      renderTestimonials([]);
    }
  } catch (err) {
    grid.innerHTML = '<div class="testi-empty">Couldn\'t load testimonials right now. Please refresh in a moment.</div>';
  }
}

// ---------- Admin panel ----------

const passcodeModal = () => document.getElementById("passcodeModal");
const adminModal = () => document.getElementById("adminModal");

function openModal(el) { el.hidden = false; }
function closeModal(el) { el.hidden = true; }

function setupAdminUI() {
  document.getElementById("openAdminBtn").addEventListener("click", () => openModal(passcodeModal()));
  document.getElementById("openAdminLinkBtn").addEventListener("click", () => openModal(passcodeModal()));

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal-backdrop")));
  });
  [passcodeModal(), adminModal()].forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  document.getElementById("passcodeSubmit").addEventListener("click", async () => {
    const status = document.getElementById("passcodeStatus");
    const entered = document.getElementById("passcodeInput").value;

    if (!SITE_CONFIG.adminPasscodeHash) {
      status.textContent = "Admin passcode isn't set up yet — see README.md → 'Connect Google Sheets'.";
      status.className = "modal-status error";
      return;
    }
    const hash = await hashPasscode(entered);
    if (hash === SITE_CONFIG.adminPasscodeHash) {
      sessionStorage.setItem("adminToken", entered);
      status.textContent = "";
      status.className = "modal-status";
      document.getElementById("passcodeInput").value = "";
      closeModal(passcodeModal());
      openModal(adminModal());
    } else {
      status.textContent = "Incorrect passcode.";
      status.className = "modal-status error";
    }
  });

  document.getElementById("passcodeInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("passcodeSubmit").click();
  });

  document.getElementById("tSubmit").addEventListener("click", async () => {
    const status = document.getElementById("adminStatus");
    const token = sessionStorage.getItem("adminToken");
    const name = document.getElementById("tName").value.trim();
    const role = document.getElementById("tRole").value.trim();
    const rating = document.getElementById("tRating").value;
    const text = document.getElementById("tText").value.trim();

    if (!SITE_CONFIG.testimonialsApiUrl) {
      status.textContent = "Google Sheets isn't connected yet — see README.md → 'Connect Google Sheets'.";
      status.className = "modal-status error";
      return;
    }
    if (!name || !text) {
      status.textContent = "Please fill in a name and the testimonial text.";
      status.className = "modal-status error";
      return;
    }

    status.textContent = "Saving…";
    status.className = "modal-status";
    try {
      // text/plain avoids a CORS preflight against the Apps Script endpoint.
      const res = await fetch(SITE_CONFIG.testimonialsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ token, name, role, rating, text }),
      });
      const data = await res.json();
      if (data.ok) {
        status.textContent = "Testimonial added.";
        status.className = "modal-status success";
        document.getElementById("tName").value = "";
        document.getElementById("tRole").value = "";
        document.getElementById("tText").value = "";
        await loadTestimonials();
      } else {
        status.textContent = data.error || "Couldn't save — check your passcode/token setup.";
        status.className = "modal-status error";
      }
    } catch (err) {
      status.textContent = "Network error — please try again.";
      status.className = "modal-status error";
    }
  });
}
