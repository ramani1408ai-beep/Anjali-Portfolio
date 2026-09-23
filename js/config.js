// Site configuration — fill this in after following README.md's
// "Connect Google Sheets" setup. The site works without it (it falls
// back to sample testimonials, and the booking form shows a message
// asking to try again later), but live testimonials and bookings need
// it filled in.

const SITE_CONFIG = {
  // The Web App URL you get after deploying apps-script/Code.gs.
  // Looks like: https://script.google.com/macros/s/XXXXXXXX/exec
  // Backs both the testimonials feed and the booking form — they write
  // to separate tabs in the same Google Sheet through this one endpoint.
  sheetsApiUrl: "https://script.google.com/macros/s/AKfycbwdhwgbRj069kyQhgpKXHO_ZZ6giSQRyLGBnDZePAre4WwaTDSYtqxF3oNasu0DNzek/exec",
};
