# Contact Form Apps Script Setup

## 1. Create the Apps Script project
1. Open `script.google.com`.
2. Create a new project.
3. Rename the default `Code.gs` file or replace it with the content from `code.gs` in this folder.

## 2. Link to a Google Sheet
1. In Apps Script, click `Project Settings`.
2. Enable `Show "appsscript.json" manifest file` (optional).
3. Create a new Google Sheet for submissions.
4. In Apps Script, click `Resources` or open from the Sheet via `Extensions > Apps Script` so this script is bound to that sheet.

Note:
- If script is bound to a sheet, it can use `SpreadsheetApp.getActiveSpreadsheet()`.
- If script is standalone, set `CONFIG.SPREADSHEET_ID` in `code.gs`.

## 3. Update configuration
In `code.gs`, edit:
- `CONFIG.SPREADSHEET_ID` (recommended for standalone script projects).
- `CONFIG.NOTIFY_EMAIL` to your email.
- `CONFIG.SEND_EMAIL_NOTIFICATION` to `true` or `false`.
- `CONFIG.SHEET_NAME` if you want a different tab name.

## 4. Deploy as a Web App
1. Click `Deploy > New deployment`.
2. Select type: `Web app`.
3. Description: `Contact form endpoint`.
4. Execute as: `Me`.
5. Who has access: `Anyone`.
6. Click `Deploy` and authorize permissions.
7. Copy the Web App URL.

## 5. Connect your frontend form
Set your Apps Script web app URL in `js/main.js`:

```js
const WEB_APP_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

The current frontend uses hidden-form POST submission (no CORS read needed), which is reliable for Apps Script endpoints.

If you redeploy a new version later:
1. Deploy a new web app version.
2. Keep using the latest `/exec` URL.
3. Confirm access is still `Anyone`.

## 6. Test
1. Submit your website contact form.
2. Confirm a new row appears in the sheet tab `Contact Submissions`.
3. Confirm notification email arrives (if enabled).

## 7. Security recommendations
- Add a hidden honeypot field in your form and reject if filled.
- Add rate limiting (store request timestamps in `PropertiesService`).
- Optionally integrate CAPTCHA before sending to Apps Script.
