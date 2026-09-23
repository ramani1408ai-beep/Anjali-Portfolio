function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function renderHero() {
  const p = SITE_DATA.person;
  document.getElementById("heroName").textContent = `${p.name}, ${p.credentials}`;
  document.getElementById("heroRole").textContent = `${p.title} · ${p.focus}`;
  document.getElementById("heroTagline").textContent = p.tagline;

  const meta = document.getElementById("heroMeta");
  meta.innerHTML = `
    <span>📍 ${p.location}</span>
    <span>📞 ${p.phone}</span>
    <span>✉️ <a href="mailto:${p.email}">${p.email}</a></span>
  `;
}

function renderStats() {
  const grid = document.getElementById("statsGrid");
  grid.innerHTML = SITE_DATA.stats
    .map(
      (s) => `
      <div class="stat">
        <div class="value mono">${s.value}</div>
        <div class="label">${s.label}</div>
      </div>`
    )
    .join("");
}

function renderAbout() {
  document.getElementById("profileText").textContent = SITE_DATA.profile;

  const list = document.getElementById("competencyList");
  list.innerHTML = SITE_DATA.competencies
    .map(
      (c) => `
      <div class="competency-card">
        <h3>${c.group}</h3>
        <div class="pill-row">
          ${c.items.map((i) => `<span class="pill">${i}</span>`).join("")}
        </div>
      </div>`
    )
    .join("");
}

function timelineHtml(items) {
  return items
    .map(
      (item) => `
      <div class="timeline-item">
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
    .map((a) => `<div class="achv-card"><span class="mark">✦</span><p>${a}</p></div>`)
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
    <li>📞 <a href="tel:${p.phone.replace(/[^+\d]/g, "")}">${p.phone}</a></li>
    <li>✉️ <a href="mailto:${p.email}">${p.email}</a></li>
    <li>📍 ${p.location}</li>
    <li>🔗 <a href="${p.linkedin}" target="_blank" rel="noopener">LinkedIn Profile</a></li>
  `;
}

function setupNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
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
  setupAdminUI();
  loadTestimonials();
  document.getElementById("year").textContent = new Date().getFullYear();
});
