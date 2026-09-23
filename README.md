# Dr. Anjali C — Portfolio

A static, no-build portfolio site (plain HTML/CSS/JS) built from the CV, with a
live testimonials section backed by a Google Sheet.

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

## Connect Google Sheets (testimonials)

Testimonials are stored in a Google Sheet. Both the sheet itself (typed in
directly) and the site's doctor-only "Manage testimonials" panel write to the
**same** sheet, through one small Google Apps Script backend.

1. **Create the sheet.** Go to [sheets.google.com](https://sheets.google.com),
   create a new spreadsheet named e.g. "Anjali Portfolio Testimonials". You
   don't need to add headers or share it with anyone — the script sets itself
   up and reads/writes it privately.

2. **Add the script.** In the sheet: `Extensions → Apps Script`. Delete the
   placeholder code and paste in the contents of `apps-script/Code.gs` from
   this repo. Save the project (name it anything).

   The script will auto-create a **tab** (bottom of the spreadsheet) called
   `Anjali Testimonials` the first time it runs — that tab name is set by the
   `SHEET_NAME` constant near the top of `Code.gs`, and is unrelated to what
   you named the spreadsheet **file** in step 1. All testimonial rows —
   whether typed in directly or added through the site's admin panel — must
   live in that exact tab, or they won't show up on the site. If you ever
   change `SHEET_NAME`, you must also redeploy (see step 4's note on
   redeploying after code changes) before it takes effect.

3. **Set your admin passcode.** Pick one passcode (e.g. a short phrase only
   you know). In the Apps Script editor: `Project Settings` (gear icon, left
   sidebar) → `Script Properties` → `Add script property` → name it
   `ADMIN_TOKEN`, value = your passcode, exactly as you'll type it on the
   site. Save.

4. **Deploy as a web app.** Back in the Apps Script editor: `Deploy → New
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

5. **Wire it into the site.** Open `js/config.js` and paste the URL into
   `testimonialsApiUrl`.

6. **Hash your passcode for the site.** Open the site in a browser, press
   `F12` to open the console, and run:

   ```js
   await hashPasscode("your-chosen-passcode")
   ```

   Copy the printed hash into `js/config.js` → `adminPasscodeHash`.

That's it. Now:
- **Editing the sheet directly** (typing a new row with `Status = approved`)
  makes a testimonial appear on the site on next load.
- **The "Doctor: manage testimonials" button** on the site (also in the
  footer as "Doctor login") lets you add one from the UI — it's the same
  sheet, entries are auto-marked `approved`.

### About the doctor-only gate

The site's passcode prompt is a convenience gate, not a security system — it
runs entirely in the visitor's browser, so treat it as "keeps casual visitors
out," not "cryptographically secure." The part that actually protects your
data is server-side: the Apps Script `doPost` function only accepts new
testimonials when the request includes the exact `ADMIN_TOKEN` you set in
step 3 — a stranger can't write to your sheet even if they inspect the
site's code. Change the passcode any time by repeating steps 3 and 6 with a
new value.

## Deploy to GitHub Pages

Once pushed to GitHub: repo `Settings → Pages → Source: Deploy from a
branch → main / (root)`. The site will be live at
`https://<your-username>.github.io/<repo-name>/` within a minute or two.

## Project structure

```
index.html              Page markup (content is injected by js/main.js)
css/style.css            All styling, light + dark mode
js/data.js                CV content — edit this to change any text
js/config.js               Google Sheet connection + admin passcode hash
js/testimonials.js          Fetch/render/add testimonials
js/main.js                  Renders data.js into the page, nav, init
apps-script/Code.gs            Google Apps Script backend (paste into Sheets)
assets/images/                 Drop profile.jpg here
```
