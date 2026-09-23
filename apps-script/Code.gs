/**
 * Google Apps Script backend for the testimonials on Dr. Anjali's portfolio.
 *
 * What this does:
 *  - Reads approved rows from the sheet TAB named by SHEET_NAME below (not
 *    the spreadsheet FILE's name — those are two different things) and
 *    serves them as JSON (this is what the website calls to display reviews).
 *  - Accepts new testimonials posted from the site's admin panel, but only
 *    when the request carries the correct ADMIN_TOKEN — so only the doctor,
 *    who knows the token, can add one this way. Anyone can still add a row
 *    by typing directly into the Google Sheet itself, in that same tab.
 *
 * Setup: see README.md in the project root ("Connect Google Sheets").
 */

const SHEET_NAME = "Anjali Testimonials";
const HEADERS = ["Timestamp", "Name", "Role", "Rating", "Text", "Status"];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
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
  const sheet = getSheet_();
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
 *   { "token": "...", "name": "...", "role": "...", "rating": 5, "text": "..." }
 * Row is appended with Status "approved" only when the token matches.
 */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: "Invalid request body." });
  }

  const adminToken = PropertiesService.getScriptProperties().getProperty("ADMIN_TOKEN");
  if (!adminToken || body.token !== adminToken) {
    return jsonOut_({ ok: false, error: "Unauthorized." });
  }

  const name = String(body.name || "").trim();
  const text = String(body.text || "").trim();
  if (!name || !text) {
    return jsonOut_({ ok: false, error: "Name and testimonial text are required." });
  }

  const rating = Math.max(1, Math.min(5, Number(body.rating) || 5));
  const role = String(body.role || "").trim();

  const sheet = getSheet_();
  sheet.appendRow([new Date(), name, role, rating, text, "approved"]);

  return jsonOut_({ ok: true });
}
