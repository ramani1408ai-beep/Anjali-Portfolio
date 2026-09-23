// Site configuration — fill these in after following README.md's
// "Connect Google Sheets" setup. The site works without them (it falls
// back to sample testimonials), but live testimonials need this filled in.

const SITE_CONFIG = {
  // The Web App URL you get after deploying apps-script/Code.gs.
  // Looks like: https://script.google.com/macros/s/XXXXXXXX/exec
  testimonialsApiUrl: "https://script.google.com/macros/s/AKfycbwdhwgbRj069kyQhgpKXHO_ZZ6giSQRyLGBnDZePAre4WwaTDSYtqxF3oNasu0DNzek/exec",

  // SHA-256 hash of the doctor's admin passcode (NOT the plain passcode).
  // Generate it by opening this site, pressing F12 for the console, and running:
  //   await hashPasscode("your-chosen-passcode")
  // then paste the printed hash below. Change it any time by repeating this.
  adminPasscodeHash: "b99125ddb4eaaf924b577547da8fcf8b07d8fa8c010ef165747cabb5ad0651ac",
};
