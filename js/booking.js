// Booking: sends consultation requests to the same Google Sheet as
// testimonials, via the same Apps Script Web App — into a separate
// "Anjali Appointments" tab. See README.md → "Connect Google Sheets".

const bookingModal = () => document.getElementById("bookingModal");

function setupBookingUI() {
  document.getElementById("openBookingBtn").addEventListener("click", () => openModal(bookingModal()));

  bookingModal().addEventListener("click", (e) => {
    if (e.target === bookingModal()) closeModal(bookingModal());
  });

  document.getElementById("bSubmit").addEventListener("click", async () => {
    const status = document.getElementById("bookingStatus");
    const name = document.getElementById("bName").value.trim();
    const phone = document.getElementById("bPhone").value.trim();
    const email = document.getElementById("bEmail").value.trim();
    const date = document.getElementById("bDate").value;
    const time = document.getElementById("bTime").value;
    const notes = document.getElementById("bNotes").value.trim();

    if (!SITE_CONFIG.sheetsApiUrl) {
      status.textContent = "Booking isn't connected yet — see README.md → 'Connect Google Sheets'.";
      status.className = "modal-status error";
      return;
    }
    if (!name || !phone) {
      status.textContent = "Please fill in your name and phone number.";
      status.className = "modal-status error";
      return;
    }

    status.textContent = "Sending…";
    status.className = "modal-status";
    try {
      // text/plain avoids a CORS preflight against the Apps Script endpoint.
      const res = await fetch(SITE_CONFIG.sheetsApiUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "appointment", name, phone, email, date, time, notes }),
      });
      const data = await res.json();
      if (data.ok) {
        status.textContent = "Request sent — the clinic will contact you to confirm.";
        status.className = "modal-status success";
        ["bName", "bPhone", "bEmail", "bDate", "bNotes"].forEach((id) => (document.getElementById(id).value = ""));
        document.getElementById("bTime").value = "";
      } else {
        status.textContent = data.error || "Couldn't send — please try again.";
        status.className = "modal-status error";
      }
    } catch (err) {
      status.textContent = "Network error — please try again.";
      status.className = "modal-status error";
    }
  });
}
