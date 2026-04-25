# Financier Google Apps Script

Follow these steps to connect your Google Sheet to the **Financier App**.

### 1. Create a New Google Sheet
Create a new Google Spreadsheet and name it `Financier App Data`.

### 2. Add Required Sheets
Create three sheets (tabs) at the bottom with these exact names:
- **Users**
- **Income**
- **Budgets**

### 3. Add Headers
Paste these headers into the first row (**Row 1**) of each sheet:

| Sheet Name | Headers (Row 1) |
|:---|:---|
| **Users** | `SL`, `User Name`, `Password`, `Profile Name`, `Image link 🔗` |
| **Income** | `SL`, `Date`, `Type`, `Category`, `Amount`, `Note` |
| **Budgets** | `SL`, `Date`, `Category`, `Amount` |

---

### 4. Paste the Apps Script Code
1. In your sheet, go to **Extensions** > **Apps Script**.
2. Delete any existing code and paste the following:

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
    headerRange.setBackground("#ecfdf5"); // Light green like your screenshot
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

/**
 * Provides a status report
 */
function syncDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var incomeSheet = ss.getSheetByName('Income');
  var usersSheet = ss.getSheetByName('Users');
  
  var incomeCount = incomeSheet ? incomeSheet.getLastRow() - 1 : 0;
  var userCount = usersSheet ? usersSheet.getLastRow() - 1 : 0;
  
  SpreadsheetApp.getUi().alert(
    'Financier Sync Status\n\n' +
    'Total Transactions: ' + (incomeCount < 0 ? 0 : incomeCount) + '\n' +
    'Registered Users: ' + (userCount < 0 ? 0 : userCount) + '\n\n' +
    'System is healthy.'
  );
}

function clearIncomeData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Confirm', 'Delete all transaction records?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Income');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  }
}

function clearUserData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Confirm', 'Delete all user accounts?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Users');
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }
  }
}
```

### 5. Deployment
- Click **Save** (disk icon).
- Click **Run** on the `onOpen` function to authorize.
- Refresh your Google Sheet.
- Go to the new **Financier Systems** menu and click **Initialize Sheets**.

Your sheet is now ready! 🚀
