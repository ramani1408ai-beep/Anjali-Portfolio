// Testimonials: reads from the Google Sheet (via the Apps Script Web App
// configured in config.js) and lets any visitor add one from the UI —
// submissions publish immediately, no login required.
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
    text: "Once connected, testimonials added in the spreadsheet or through the review form below will appear here automatically.",
    example: true,
  },
];

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
  if (!SITE_CONFIG.sheetsApiUrl) {
    renderTestimonials(SAMPLE_TESTIMONIALS);
    return;
  }
  try {
    const res = await fetch(`${SITE_CONFIG.sheetsApiUrl}?action=list`);
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

// ---------- Write a review ----------

const reviewModal = () => document.getElementById("reviewModal");

function openModal(el) { el.hidden = false; }
function closeModal(el) { el.hidden = true; }

function setupStarPicker() {
  const picker = document.getElementById("tRatingPicker");
  const hiddenInput = document.getElementById("tRating");
  const buttons = [...picker.querySelectorAll(".star-btn")];

  function setSelected(val) {
    buttons.forEach((b) => {
      const selected = Number(b.dataset.value) === val;
      b.classList.toggle("selected", selected);
      b.setAttribute("aria-checked", String(selected));
    });
    hiddenInput.value = val;
  }

  buttons.forEach((b) => {
    b.addEventListener("click", () => setSelected(Number(b.dataset.value)));
  });

  setSelected(Number(hiddenInput.value) || 5);
}

function setupReviewUI() {
  setupStarPicker();

  document.getElementById("openReviewBtn").addEventListener("click", () => openModal(reviewModal()));

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", (e) => closeModal(e.target.closest(".modal-backdrop")));
  });
  reviewModal().addEventListener("click", (e) => {
    if (e.target === reviewModal()) closeModal(reviewModal());
  });

  document.getElementById("tSubmit").addEventListener("click", async () => {
    const status = document.getElementById("adminStatus");
    const name = document.getElementById("tName").value.trim();
    const role = document.getElementById("tRole").value.trim();
    const rating = document.getElementById("tRating").value;
    const text = document.getElementById("tText").value.trim();

    if (!SITE_CONFIG.sheetsApiUrl) {
      status.textContent = "Google Sheets isn't connected yet — see README.md → 'Connect Google Sheets'.";
      status.className = "modal-status error";
      return;
    }
    if (!name || !text) {
      status.textContent = "Please fill in your name and a review.";
      status.className = "modal-status error";
      return;
    }

    status.textContent = "Saving…";
    status.className = "modal-status";
    try {
      // text/plain avoids a CORS preflight against the Apps Script endpoint.
      const res = await fetch(SITE_CONFIG.sheetsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "review", name, role, rating, text }),
      });
      const data = await res.json();
      if (data.ok) {
        status.textContent = "Thank you — your review is live!";
        status.className = "modal-status success";
        document.getElementById("tName").value = "";
        document.getElementById("tRole").value = "";
        document.getElementById("tText").value = "";
        await loadTestimonials();
      } else {
        status.textContent = data.error || "Couldn't save — please try again.";
        status.className = "modal-status error";
      }
    } catch (err) {
      status.textContent = "Network error — please try again.";
      status.className = "modal-status error";
    }
  });
}
