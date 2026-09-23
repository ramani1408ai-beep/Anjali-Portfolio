# Dr. Anjali C — Portfolio

A static, no-build portfolio site (plain HTML/CSS/JS) built from the CV, with
live testimonials and a booking-request form, both backed by a Google Sheet.

## Run it locally

No build step needed — just serve the folder (opening `index.html` directly
with `file://` will block the Google Fonts/testimonials fetch in some
browsers, so use a local server):

```bash
# Python
python -m http.server 5500

# or Node
npx serve .
```

Then open `http://localhost:5500`.

## Add your photo

Drop a file at `assets/images/Profile.jpeg` (see `assets/images/README.md` for
sizing). Until it exists, a clean placeholder with your initials is shown
instead — nothing breaks. (Her current portrait is already in place.)

## Edit the text

All CV content lives in one place: `js/data.js`. Edit the values there and
refresh the page — no HTML editing required.

## Connect Google Sheets (testimonials + bookings)

Testimonials and consultation-booking requests both live in **one** Google
Sheet, each in its own tab, through one small Google Apps Script backend.
Anyone can submit either from the site — there's no login required.

1. **Create the sheet.** Go to [sheets.google.com](https://sheets.google.com),
   create a new spreadsheet named e.g. "Anjali Portfolio Data". You don't
   need to add headers or share it with anyone — the script sets itself up
   and reads/writes it privately.

2. **Add the script.** In the sheet: `Extensions → Apps Script`. Delete the
   placeholder code and paste in the contents of `apps-script/Code.gs` from
   this repo. Save the project (name it anything).

   The script auto-creates two **tabs** (bottom of the spreadsheet) the
   first time each is used: `Anjali Testimonials` (reviews) and
   `Anjali Appointments` (booking requests) — those tab names are set by the
   `REVIEWS_SHEET_NAME` / `APPOINTMENTS_SHEET_NAME` constants near the top
   of `Code.gs`, unrelated to what you named the spreadsheet **file** in
   step 1. Rows must live in the exact matching tab, or they won't show up.
   If you ever change either constant, you must also redeploy (see the next
   step's note on redeploying after code changes) before it takes effect.

3. **Deploy as a web app.** Back in the Apps Script editor: `Deploy → New
   deployment` → gear icon next to "Select type" → `Web app`. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click `Deploy`, authorize the script when prompted (it's your own script,
   acting on your own sheet), and copy the **Web app URL** it gives you
   (ends in `/exec`).

   **If you edit `Code.gs` later**, saving alone isn't enough — the live
   `/exec` URL keeps serving whatever was deployed. Go to
   `Deploy → Manage deployments`, click the pencil icon on your deployment,
   set Version to **New version**, then `Deploy` again.

4. **Wire it into the site.** Open `js/config.js` and paste the URL into
   `sheetsApiUrl`.

That's it. Now:
- **Editing the `Anjali Testimonials` tab directly** (typing a new row with
  `Status = approved`) makes a testimonial appear on the site on next load.
- **The "Write a review" button** on the site opens a form (with a star
  picker for the rating) that anyone can submit — it writes to that same
  tab, auto-marked `approved`, and shows up immediately.
- **The "Book a Consultation" button** opens a booking form (name, phone,
  optional email/date/time/notes). Submissions append to the
  `Anjali Appointments` tab with `Status = new` — check that tab directly to
  see and manage requests; they aren't shown anywhere on the site.

### About moderation

There's no login and no approval step for either form — anything submitted
publishes (or is added) right away. If you'd rather review testimonials
before they go live, change `Status: "approved"` to `Status: "pending"` in
`handleReview_` inside `apps-script/Code.gs` (redeploy after editing — see
the note above), and manually flip each row's `Status` to `approved` in the
sheet when you're ready to publish it.

## Deploy to GitHub Pages

Once pushed to GitHub: repo `Settings → Pages → Source: Deploy from a
branch → main / (root)`. The site will be live at
`https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Project structure

```
index.html              Page markup (content is injected by js/main.js)
css/style.css            All styling, light + dark mode
js/data.js                CV content — edit this to change any text
js/config.js               Google Sheet connection URL
js/testimonials.js          Fetch/render/add testimonials
js/booking.js                Consultation booking form
js/main.js                  Renders data.js into the page, nav, init
apps-script/Code.gs            Google Apps Script backend (paste into Sheets)
assets/images/                 Drop profile.jpg here
```
