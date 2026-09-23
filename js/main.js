const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function staggerAttr(i, step = 60, cap = 8) {
  return `style="transition-delay:${Math.min(i, cap) * step}ms"`;
}

function renderHero() {
  const p = SITE_DATA.person;
  document.getElementById("heroName").textContent = `${p.name}, ${p.credentials}`;
  document.getElementById("heroRole").textContent = `${p.title} · ${p.focus}`;
  document.getElementById("heroTagline").textContent = p.tagline;

  const satStat = SITE_DATA.stats.find((s) => /satisfaction/i.test(s.label));
  if (satStat) {
    const badge = document.getElementById("heroRatingBadge");
    badge.innerHTML = `<strong>${satStat.value}</strong><span>${satStat.label}</span>`;
  }

  const meta = document.getElementById("heroMeta");
  meta.innerHTML = `
    <span>${icon("pin")} ${p.location}</span>
    <span>${icon("phone")} ${p.phone}</span>
    <span>${icon("mail")} <a href="mailto:${p.email}">${p.email}</a></span>
  `;
}

function renderStats() {
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = SITE_DATA.stats
    .map((s, i) => {
      const match = s.value.match(/^(\d+)(.*)$/);
      const start = match ? "0" + match[2] : s.value;
      return `
      <div class="stat reveal" ${staggerAttr(i, 90)}>
        <div class="value mono" data-target="${s.value}">${start}</div>
        <div class="label">${s.label}</div>
      </div>`;
    })
    .join("");
}

function renderAbout() {
  document.getElementById("profileText").textContent = SITE_DATA.profile;

  const list = document.getElementById("competencyList");
  list.innerHTML = SITE_DATA.competencies
    .map(
      (c, i) => `
      <div class="competency-card reveal" ${staggerAttr(i, 100)}>
        <h3>${c.group}</h3>
        <div class="pill-row">
          ${c.items.map((it) => `<span class="pill">${it}</span>`).join("")}
        </div>
      </div>`
    )
    .join("");
}

function timelineHtml(items) {
  return items
    .map(
      (item, i) => `
      <div class="timeline-item reveal" ${staggerAttr(i, 90)}>
        <div class="dates mono">${item.dates}</div>
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <h3>${item.role}</h3>
          <span class="org">${item.org}</span>
          <span class="loc">${item.location}</span>
          <ul>${item.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
        </div>
      </div>`
    )
    .join("");
}

function renderExperience() {
  document.getElementById("experienceTimeline").innerHTML = timelineHtml(SITE_DATA.experience);
  document.getElementById("attachmentsTimeline").innerHTML = timelineHtml(SITE_DATA.attachments);
}

function renderAchievements() {
  document.getElementById("achvGrid").innerHTML = SITE_DATA.achievements
    .map(
      (a, i) => `<div class="achv-card reveal" ${staggerAttr(i, 80)}><span class="mark">${icon("sparkle")}</span><p>${a}</p></div>`
    )
    .join("");
}

function renderCredentials() {
  document.getElementById("educationList").innerHTML = SITE_DATA.education
    .map((e) => `<li><span class="t">${e.title}</span><span class="o">${e.org}</span></li>`)
    .join("");

  document.getElementById("licensingList").innerHTML = SITE_DATA.licensing
    .map((l) => `<li>${l}</li>`)
    .join("");

  document.getElementById("cmeList").innerHTML = SITE_DATA.cme
    .map((c) => `<li>${c}</li>`)
    .join("");

  document.getElementById("langRow").innerHTML = SITE_DATA.languages
    .map((l) => `<span class="pill">${l}</span>`)
    .join("");
}

function renderContact() {
  const p = SITE_DATA.person;
  document.getElementById("contactList").innerHTML = `
    <li>${icon("phone")} <a href="tel:${p.phone.replace(/[^+\d]/g, "")}">${p.phone}</a></li>
    <li>${icon("mail")} <a href="mailto:${p.email}">${p.email}</a></li>
    <li>${icon("pin")} ${p.location}</li>
    <li>${icon("link")} <a href="${p.linkedin}" target="_blank" rel="noopener">LinkedIn Profile</a></li>
  `;
}

function setupNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

function setupHeaderScroll() {
  const header = document.querySelector("header.site");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

let revealObserver = null;

function initRevealObserver() {
  if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  observeReveal(document);
}

function observeReveal(root) {
  const els = root.querySelectorAll(".reveal:not(.in-view)");
  if (!revealObserver) {
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }
  els.forEach((el) => revealObserver.observe(el));
}
window.observeReveal = observeReveal;

function animateCount(el, target, suffix, duration = 1100) {
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function setupCountUp() {
  const statEls = document.querySelectorAll(".stat .value[data-target]");
  if (!statEls.length) return;

  if (REDUCED_MOTION || !("IntersectionObserver" in window)) {
    statEls.forEach((el) => (el.textContent = el.dataset.target));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.dataset.target;
        const match = raw.match(/^(\d+)(.*)$/);
        if (match) {
          animateCount(el, parseInt(match[1], 10), match[2]);
        } else {
          el.textContent = raw;
        }
        obs.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach((el) => obs.observe(el));
}

function setupParallax() {
  const stage = document.querySelector(".hero-stage");
  if (!stage) return;
  if (REDUCED_MOTION || window.matchMedia("(hover: none)").matches) return;

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty("--mx", px.toFixed(3));
    stage.style.setProperty("--my", py.toFixed(3));
  });
  stage.addEventListener("mouseleave", () => {
    stage.style.setProperty("--mx", 0);
    stage.style.setProperty("--my", 0);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHero();
  renderStats();
  renderAbout();
  renderExperience();
  renderAchievements();
  renderCredentials();
  renderContact();
  setupNav();
  setupHeaderScroll();
  setupReviewUI();
  setupParallax();
  loadTestimonials();
  initRevealObserver();
  setupCountUp();
  document.getElementById("year").textContent = new Date().getFullYear();
});
