/*
  Contact Form Backend (Google Apps Script)
  - Accepts POST from your website
  - Stores submissions in Google Sheet
  - Sends optional email notification
*/

const CONFIG = {
  // Optional but recommended for standalone scripts:
  // put your Google Sheet ID here (the long ID from the sheet URL).
  SPREADSHEET_ID: 'https://docs.google.com/spreadsheets/d/14aU36FU0yfLkWntSk8lv_wjdBlQVyi7liNelsW8RZ90/edit?gid=0#gid=0',
  SHEET_NAME: 'Contact Submissions',
  NOTIFY_EMAIL: 'dineshmuppidi13@gmail.com',
  SEND_EMAIL_NOTIFICATION: true
};

function doGet() {
  return jsonResponse_({
    status: 'ok',
    message: 'Contact form endpoint is live.'
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const errors = validatePayload_(payload);

    if (errors.length) {
      return jsonResponse_({
        status: 'error',
        message: 'Validation failed.',
        errors: errors
      });
    }

    const cleanData = {
      name: payload.name.trim(),
      email: payload.email.trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim()
    };

    const rowNumber = saveSubmission_(cleanData);

    if (CONFIG.SEND_EMAIL_NOTIFICATION) {
      sendNotification_(cleanData, rowNumber);
    }

    return jsonResponse_({
      status: 'success',
      message: 'Message received.'
    });
  } catch (error) {
    return jsonResponse_({
      status: 'error',
      message: 'Server error.',
      detail: String(error && error.message ? error.message : error)
    });
  }
}

function parsePayload_(e) {
  if (!e) return {};

  // If request body is JSON.
  if (e.postData && e.postData.contents) {
    const body = String(e.postData.contents || '').trim();
    if (body) {
      try {
        return JSON.parse(body);
      } catch (error) {
        // Ignore parse errors and fall back to form params.
      }
    }
  }

  // If request body is form-urlencoded or multipart/form-data.
  if (e.parameter || e.parameters) {
    const params = e.parameter || {};
    const multiParams = e.parameters || {};

    const pick = (key) => {
      if (params[key] !== undefined && params[key] !== null) return params[key];
      if (Array.isArray(multiParams[key]) && multiParams[key].length) return multiParams[key][0];
      return '';
    };

    return {
      name: pick('name'),
      email: pick('email'),
      subject: pick('subject'),
      message: pick('message')
    };
  }

  return {};
}

function validatePayload_(data) {
  const errors = [];
  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const subject = String(data.subject || '').trim();
  const message = String(data.message || '').trim();

  if (name.length < 2) errors.push('Name must be at least 2 characters.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email address.');
  if (subject.length < 3) errors.push('Subject must be at least 3 characters.');
  if (message.length < 20) errors.push('Message must be at least 20 characters.');

  return errors;
}

function saveSubmission_(data) {
  const sheet = getOrCreateSheet_();
  const now = new Date();
  const formattedTime = Utilities.formatDate(
    now,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd HH:mm:ss'
  );

  sheet.appendRow([
    formattedTime,
    data.name,
    data.email,
    data.subject,
    data.message
  ]);

  return sheet.getLastRow();
}

function getOrCreateSheet_() {
  const spreadsheetId = normalizeSpreadsheetId_(CONFIG.SPREADSHEET_ID);
  const ss = spreadsheetId
    ? SpreadsheetApp.openById(spreadsheetId)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      'No spreadsheet found. Bind this script to a Google Sheet or set CONFIG.SPREADSHEET_ID.'
    );
  }

  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Subject', 'Message']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function normalizeSpreadsheetId_(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  // Accept either a plain spreadsheet ID or a full Google Sheets URL.
  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];

  return raw;
}

function sendNotification_(data, rowNumber) {
  if (!CONFIG.NOTIFY_EMAIL) return;

  const subjectLine = 'New portfolio contact message';
  const body = [
    'You received a new contact form submission.',
    '',
    'Row: ' + rowNumber,
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Subject: ' + data.subject,
    '',
    'Message:',
    data.message
  ].join('\n');

  MailApp.sendEmail(CONFIG.NOTIFY_EMAIL, subjectLine, body, {
    replyTo: data.email,
    name: 'Portfolio Contact Form'
  });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testInsert() {
  const sample = {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Manual test',
    message: 'This is a manual test message from Apps Script editor.'
  };
  const rowNumber = saveSubmission_(sample);
  Logger.log('Inserted test row: ' + rowNumber);
}
