# Google Apps Script for Financier App

Follow the instructions in **Appscript.md** for the full setup.

### The Script Code
Paste this into your Google Sheet's script editor (**Extensions** > **Apps Script**):

```javascript
/**
 * Financier App Helper Script
 * Version: 2.1.0
 */

function doGet() {
  return HtmlService.createHtmlOutput("<b>Financier App Script is active.</b><br>You don't need to 'Deploy as Web App' for this to work. The app connects via Sheets API directly.");
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Financier Systems')
      .addItem('🎨 Initialize Sheets', 'setupFormatting')
      .addSeparator()
      .addItem('🚀 Sync Dashboard', 'syncDashboard')
      .addSeparator()
      .addItem('🧹 Clean Income Data', 'clearIncomeData')
      .addItem('👤 Reset User Cache', 'clearUserData')
      .addToUi();
}

/**
 * Automatically formats headers to match the app design
 */
function setupFormatting() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsConfig = {
    'Users': ['SL', 'User Name', 'Password', 'Profile Name', 'Image link 🔗'],
    'Income': ['SL', 'Date', 'Type', 'Category', 'Amount', 'Note'],
    'Budgets': ['SL', 'Date', 'Category', 'Amount']
  };
  
  Object.keys(sheetsConfig).forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    
    // Set Headers
    var headers = sheetsConfig[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Styling
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#ecfdf5"); // Light green
    headerRange.setFontColor("#065f46"); // Dark green text
    headerRange.setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  });
  
  SpreadsheetApp.getUi().alert('Success', 'Sheets initialized and formatted successfully!', SpreadsheetApp.getUi().ButtonSet.OK);
}

function syncDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var incomeSheet = ss.getSheetByName('Income');
  var usersSheet = ss.getSheetByName('Users');
  var incomeCount = incomeSheet ? incomeSheet.getLastRow() - 1 : 0;
  var userCount = usersSheet ? usersSheet.getLastRow() - 1 : 0;
  SpreadsheetApp.getUi().alert('Transactions: ' + (incomeCount < 0 ? 0 : incomeCount) + '\nUsers: ' + (userCount < 0 ? 0 : userCount));
}

function clearIncomeData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Confirm Deletion', 'Are you sure?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Income');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  }
}

function clearUserData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Confirm Deletion', 'Delete all users?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  }
}
```
