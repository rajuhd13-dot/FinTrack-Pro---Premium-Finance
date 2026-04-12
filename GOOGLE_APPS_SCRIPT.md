# Google Apps Script (gs.code)
Paste this code into your Google Sheet's Script Editor (Extensions > App Script).

```javascript
/**
 * Google Apps Script for Financier App
 * This script can be used to add custom buttons or logic to your sheet.
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Financier App')
      .addItem('Sync Status', 'checkStatus')
      .addItem('Clear All Data', 'clearData')
      .addToUi();
}

function checkStatus() {
  SpreadsheetApp.getUi().alert('The sheet is connected to the FinTrack Pro app.');
}

function clearData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Are you sure?', 'This will clear all Income and User data.', ui.ButtonSet.YES_NO);
  
  if (response == ui.Button.YES) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var incomeSheet = ss.getSheetByName('Income');
    var usersSheet = ss.getSheetByName('Users');
    
    if (incomeSheet) {
      var lastRow = incomeSheet.getLastRow();
      if (lastRow > 1) incomeSheet.deleteRows(2, lastRow - 1);
    }
    
    if (usersSheet) {
      var lastRow = usersSheet.getLastRow();
      if (lastRow > 1) usersSheet.deleteRows(2, lastRow - 1);
    }
    
    ui.alert('Data cleared successfully.');
  }
}
```

# Main Data Structure (md.code)
This is the structure your app uses to communicate with Google Sheets.

### Sheet Name: Income
| Column | Header | Description |
| :--- | :--- | :--- |
| A | SL | Serial Number |
| B | ID | Transaction ID |
| C | Date | Date of Transaction |
| D | Type | Income or Expense |
| E | Category | Category Name |
| F | Amount | Numeric Amount |
| G | Note | Additional Details |

### Sheet Name: Users
| Column | Header | Description |
| :--- | :--- | :--- |
| A | SL | Serial Number |
| B | User Name | Login Username |
| C | Password | User Password |
| D | Profile Name | Display Name |
| E | Image | Profile Image URL |
