const SS = SpreadsheetApp.getActiveSpreadsheet();

/**
 * Handle GET requests
 * NOTE: Do not run this function manually in the editor!
 */
function doGet(e) {
  // Check if e exists (it won't exist if you click "Run" in the editor)
  if (!e || !e.parameter) {
    return createResponse({ 
      error: "This function must be called as a Web App. Please deploy it and use the URL.",
      status: "error"
    }, 400);
  }

  const action = e.parameter.action;
  try {
    if (action === 'health') return createResponse({ status: 'ok', message: 'GAS Backend is running' });
    if (action === 'fetchTransactions') return fetchTransactions();
    if (action === 'fetchBudgets') return fetchBudgets();
    return createResponse({ error: 'Invalid action: ' + action }, 400);
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

/**
 * Handle POST requests
 * NOTE: Do not run this function manually in the editor!
 */
function doPost(e) {
  if (!e || !e.postData) {
    return createResponse({ error: "No post data found. Call this from the app." }, 400);
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return createResponse({ error: 'Invalid JSON' }, 400);
  }
  
  const action = data.action;
  try {
    switch (action) {
      case 'syncTransaction': return syncTransaction(data.transaction);
      case 'deleteTransaction': return deleteTransaction(data.transaction);
      case 'syncUser': return syncUser(data.email, data.password, data.name, data.avatar);
      case 'updateProfile': return updateProfile(data.email, data.name, data.avatar);
      case 'resetPassword': return resetPassword(data.email, data.newPassword);
      case 'fetchTransactions': return fetchTransactions();
      case 'saveBudgets': return saveBudgets(data.budgets);
      case 'fetchBudgets': return fetchBudgets();
      default: return createResponse({ error: 'Invalid action: ' + action }, 400);
    }
  } catch (err) {
    return createResponse({ error: err.toString() }, 500);
  }
}

function createResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureSheet(name, headers) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) {
    sheet = SS.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function fetchTransactions() {
  const sheet = ensureSheet('Income', ['SL', 'Date', 'Type', 'Category', 'Amount', 'Note']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return createResponse({ transactions: [] });
  const transactions = values.slice(1).map((row, index) => ({
    id: 'row-' + (index + 2),
    date: row[1],
    type: row[2],
    category: row[3],
    amount: parseFloat(row[4]) || 0,
    purpose: row[5]
  }));
  return createResponse({ transactions });
}

function syncTransaction(t) {
  const sheet = ensureSheet('Income', ['SL', 'Date', 'Type', 'Category', 'Amount', 'Note']);
  const lastRow = sheet.getLastRow();
  const nextSl = lastRow > 0 ? (sheet.getRange(lastRow, 1).getValue() || 0) + 1 : 1;
  sheet.appendRow([nextSl, t.date, t.amount > 0 ? 'Income' : 'Expense', t.category, t.amount, t.purpose]);
  return createResponse({ success: true });
}

function deleteTransaction(t) {
  const sheet = SS.getSheetByName('Income');
  if (!sheet) return createResponse({ error: 'Income sheet not found' }, 404);
  const values = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (String(row[1]) === String(t.date) && row[3] === t.category && parseFloat(row[4]) === parseFloat(t.amount)) {
      rowIndex = i + 1; break;
    }
  }
  if (rowIndex === -1) return createResponse({ error: 'Transaction not found' }, 404);
  sheet.deleteRow(rowIndex);
  const remainingValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < remainingValues.length; i++) sheet.getRange(i + 2, 1).setValue(i + 1);
  return createResponse({ success: true });
}

function syncUser(email, password, name, avatar) {
  const sheet = ensureSheet('Users', ['SL', 'User Name', 'Password', 'Profile Name', 'Image']);
  const values = sheet.getDataRange().getValues();
  const AUTHORIZED_EMAIL = 'rajuhd13@gmail.com';
  if (email.toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) return createResponse({ error: 'Unauthorized email' }, 403);
  let userIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][1].toString().toLowerCase() === email.toLowerCase()) { userIndex = i; break; }
  }
  if (userIndex === -1) {
    sheet.appendRow([values.length, email, password, name || '', avatar || '']);
    return createResponse({ success: true, profile: { name, avatar } });
  } else {
    const userRow = values[userIndex];
    if (userRow[2].toString().trim() !== password.toString().trim()) return createResponse({ error: 'Invalid password' }, 401);
    return createResponse({ success: true, profile: { name: userRow[3] || name, avatar: userRow[4] || avatar } });
  }
}

function updateProfile(email, name, avatar) {
  const sheet = ensureSheet('Users', ['SL', 'User Name', 'Password', 'Profile Name', 'Image']);
  const values = sheet.getDataRange().getValues();
  let userIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][1].toString().toLowerCase() === email.toLowerCase()) { userIndex = i; break; }
  }
  if (userIndex !== -1) {
    sheet.getRange(userIndex + 1, 4).setValue(name);
    sheet.getRange(userIndex + 1, 5).setValue(avatar);
  } else {
    sheet.appendRow([values.length, email, '', name, avatar]);
  }
  return createResponse({ success: true });
}

function resetPassword(email, newPassword) {
  const sheet = ensureSheet('Users', ['SL', 'User Name', 'Password', 'Profile Name', 'Image']);
  const values = sheet.getDataRange().getValues();
  let userIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][1].toString().toLowerCase() === email.toLowerCase()) { userIndex = i; break; }
  }
  if (userIndex !== -1) {
    sheet.getRange(userIndex + 1, 3).setValue(newPassword);
    return createResponse({ success: true });
  }
  return createResponse({ error: 'User not found' }, 404);
}

function fetchBudgets() {
  const sheet = ensureSheet('Budgets', ['SL', 'Date', 'Category', 'Amount']);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return createResponse({ budgets: [] });
  const budgets = values.slice(1).map(row => ({ category: row[2], amount: parseFloat(row[3]) || 0 }));
  return createResponse({ budgets });
}

function saveBudgets(budgets) {
  const sheet = ensureSheet('Budgets', ['SL', 'Date', 'Category', 'Amount']);
  sheet.clearContents();
  sheet.appendRow(['SL', 'Date', 'Category', 'Amount']);
  const now = new Date().toLocaleDateString();
  budgets.forEach((b, i) => sheet.appendRow([i + 1, now, b.category, b.amount]));
  return createResponse({ success: true });
}
