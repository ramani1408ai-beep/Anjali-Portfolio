/**
 * Google Apps Script backend for Dr. Anjali's portfolio site.
 *
 * Handles two independent things in the same spreadsheet, each in its own
 * tab:
 *  - Testimonials: reads approved rows from the REVIEWS_SHEET_NAME tab and
 *    serves them as JSON (this is what the website calls to display
 *    reviews). Accepts new ones from the site's public "Write a review"
 *    form — no login required, they publish immediately. Anyone can also
 *    add a row by typing directly into that tab.
 *  - Appointments: accepts consultation requests from the site's "Book a
 *    consultation" form and appends them to the APPOINTMENTS_SHEET_NAME tab.
 *    Not read back by the site — check that tab directly to see requests.
 *
 * Tab names below are sheet TABS, not the spreadsheet FILE's name — those
 * are two different things.
 *
 * Setup: see README.md in the project root ("Connect Google Sheets").
 */

const REVIEWS_SHEET_NAME = "Anjali Testimonials";
const REVIEWS_HEADERS = ["Timestamp", "Name", "Role", "Rating", "Text", "Status"];

const APPOINTMENTS_SHEET_NAME = "Anjali Appointments";
const APPOINTMENTS_HEADERS = ["Timestamp", "Name", "Phone", "Email", "Preferred Date", "Preferred Time", "Notes", "Status"];

function getSheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/** GET ?action=list — returns approved testimonials as JSON. */
function doGet(e) {
  const sheet = getSheet_(REVIEWS_SHEET_NAME, REVIEWS_HEADERS);
  const rows = sheet.getDataRange().getValues();
  const [header, ...data] = rows;
  const idx = {
    timestamp: header.indexOf("Timestamp"),
    name: header.indexOf("Name"),
    role: header.indexOf("Role"),
    rating: header.indexOf("Rating"),
    text: header.indexOf("Text"),
    status: header.indexOf("Status"),
  };

  const testimonials = data
    .filter((row) => String(row[idx.status]).trim().toLowerCase() === "approved")
    .filter((row) => String(row[idx.text]).trim().length > 0)
    .map((row) => ({
      name: String(row[idx.name] || "Anonymous"),
      role: String(row[idx.role] || ""),
      rating: Number(row[idx.rating]) || 5,
      text: String(row[idx.text] || ""),
      timestamp: row[idx.timestamp] instanceof Date ? row[idx.timestamp].toISOString() : "",
    }))
    .reverse(); // newest first

  return jsonOut_({ ok: true, testimonials });
}

/**
 * POST body (as text/plain JSON, to avoid CORS preflight — see README):
 *   Review:      { "type": "review", "name", "role", "rating", "text" }
 *   Appointment: { "type": "appointment", "name", "phone", "email", "date", "time", "notes" }
 * Open to anyone — no login required.
 */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: "Invalid request body." });
  }

  return body.type === "appointment" ? handleAppointment_(body) : handleReview_(body);
}

function handleReview_(body) {
  const name = String(body.name || "").trim().slice(0, 80);
  const text = String(body.text || "").trim().slice(0, 1000);
  if (!name || !text) {
    return jsonOut_({ ok: false, error: "Name and review text are required." });
  }

  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
  const role = String(body.role || "").trim().slice(0, 80);

  const sheet = getSheet_(REVIEWS_SHEET_NAME, REVIEWS_HEADERS);
  sheet.appendRow([new Date(), name, role, rating, text, "approved"]);

  return jsonOut_({ ok: true });
}

function handleAppointment_(body) {
  const name = String(body.name || "").trim().slice(0, 80);
  const phone = String(body.phone || "").trim().slice(0, 40);
  if (!name || !phone) {
    return jsonOut_({ ok: false, error: "Name and phone number are required." });
  }

  const email = String(body.email || "").trim().slice(0, 120);
  const date = String(body.date || "").trim().slice(0, 40);
  const time = String(body.time || "").trim().slice(0, 40);
  const notes = String(body.notes || "").trim().slice(0, 500);

  const sheet = getSheet_(APPOINTMENTS_SHEET_NAME, APPOINTMENTS_HEADERS);
  sheet.appendRow([new Date(), name, phone, email, date, time, notes, "new"]);

  return jsonOut_({ ok: true });
}
