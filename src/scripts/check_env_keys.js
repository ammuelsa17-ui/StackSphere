const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../../.env.local");
let localEnv = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (key && val) {
        localEnv[key] = true;
      }
    }
  }
}

const smtpPassExists = Boolean(process.env.SMTP_PASS || localEnv.SMTP_PASS);
const emailPassExists = Boolean(process.env.EMAIL_PASS || localEnv.EMAIL_PASS);
const emailPasswordExists = Boolean(process.env.EMAIL_PASSWORD || localEnv.EMAIL_PASSWORD);

console.log(`SMTP_PASS exists       : ${smtpPassExists ? "YES" : "NO"}`);
console.log(`EMAIL_PASS exists      : ${emailPassExists ? "YES" : "NO"}`);
console.log(`EMAIL_PASSWORD exists  : ${emailPasswordExists ? "YES" : "NO"}`);

let effectiveKey = "NONE";
if (process.env.EMAIL_PASS || localEnv.EMAIL_PASS) {
  effectiveKey = "EMAIL_PASS";
} else if (process.env.SMTP_PASS || localEnv.SMTP_PASS) {
  effectiveKey = "SMTP_PASS";
} else if (process.env.EMAIL_PASSWORD || localEnv.EMAIL_PASSWORD) {
  effectiveKey = "EMAIL_PASSWORD";
}

console.log(`Effective password key selected: ${effectiveKey}`);
