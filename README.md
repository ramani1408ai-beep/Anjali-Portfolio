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
directly) and the site's public "Write a review" form write to the **same**
sheet, through one small Google Apps Script backend. Anyone can submit a
review from the site — there's no login, and it publishes immediately.

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
   whether typed in directly or added through the site's review form — must
   live in that exact tab, or they won't show up on the site. If you ever
   change `SHEET_NAME`, you must also redeploy (see the next step's note on
   redeploying after code changes) before it takes effect.

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
   `testimonialsApiUrl`.

That's it. Now:
- **Editing the sheet directly** (typing a new row with `Status = approved`)
  makes a testimonial appear on the site on next load.
- **The "Write a review" button** on the site opens a form (with a star
  picker for the rating) that anyone can submit — it writes to the same
  sheet, auto-marked `approved`, and shows up immediately.

### About moderation

There's no login and no approval step — anything submitted through the site
publishes right away. If you'd rather review submissions before they go
live, change `Status: "approved"` to `Status: "pending"` in `doPost` inside
`apps-script/Code.gs` (redeploy after editing — see the note above), and
update the `doGet` filter or manually flip each row's `Status` to `approved`
in the sheet when you're ready to publish it.

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
js/main.js                  Renders data.js into the page, nav, init
apps-script/Code.gs            Google Apps Script backend (paste into Sheets)
assets/images/                 Drop profile.jpg here
```
