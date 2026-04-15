import express from 'express';
import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Token storage for persistence across devices
const TOKEN_PATH = path.join(__dirname, 'tokens.json');

async function getMasterTokens() {
  try {
    // Priority 1: Environment Variable (for Vercel)
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      return {
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        access_token: 'dummy', // Will be refreshed by client
        token_type: 'Bearer',
        expiry_date: 0
      };
    }
    // Priority 2: Local file (for AI Studio/Persistent containers)
    const data = await fs.readFile(TOKEN_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

async function saveMasterTokens(tokens: any) {
  try {
    // Only save if we have a refresh token
    const current = await getMasterTokens();
    const updated = { ...(current || {}), ...tokens };
    await fs.writeFile(TOKEN_PATH, JSON.stringify(updated, null, 2));
    console.log('Tokens saved to persistence');
  } catch (e) {
    console.error('Failed to save tokens:', e);
  }
}

const TARGET_SHEET_ID = '1WSq1HV3KvXzckLxIQxUEKWBSzSJi4f7FYOf8WlzQ5nk';

async function ensureSheetsExist(sheets: any, spreadsheetId: string) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets?.map((s: any) => s.properties.title) || [];
    
    const requiredSheets = ['Income', 'Users', 'Budgets'];
    const sheetsToAdd = requiredSheets.filter(s => !existingSheets.includes(s));

    if (sheetsToAdd.length > 0) {
      console.log('Adding missing sheets:', sheetsToAdd);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: sheetsToAdd.map(title => ({
            addSheet: { properties: { title } }
          }))
        }
      });

      // Add headers for new sheets
      for (const title of sheetsToAdd) {
        let headers = [];
        let range = '';
        if (title === 'Income') {
          headers = [['SL', 'Date', 'Type', 'Category', 'Amount', 'Note']];
          range = 'Income!A1:F1';
        } else if (title === 'Users') {
          headers = [['SL', 'User Name', 'Password', 'Profile Name', 'Image link 🔗']];
          range = 'Users!A1:E1';
        } else if (title === 'Budgets') {
          headers = [['SL', 'Date', 'Category', 'Amount']];
          range = 'Budgets!A1:D1';
        }

        if (headers.length > 0) {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: headers }
          });
        }
      }
    }
  } catch (e: any) {
    if (e.response && e.response.status === 401) {
      console.error('Authentication failed: Invalid or expired token.');
      throw new Error('AUTH_FAILED');
    }
    console.error('Error ensuring sheets exist:', e.message);
    throw e;
  }
}

async function getWorkingSheetId(oauth2Client: any) {
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    // 1. Search for existing sheet by name first (more reliable for user-specific data)
    console.log('Searching drive for "Financier App Data"...');
    const res = await drive.files.list({
      q: "name='Financier App Data' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name)'
    });

    if (res.data.files && res.data.files.length > 0) {
      const sheetId = res.data.files[0].id!;
      console.log(`Found existing sheet: ${sheetId}`);
      await ensureSheetsExist(sheets, sheetId);
      return sheetId;
    }

    // 2. Try the hardcoded ID as a fallback
    try {
      console.log('Trying hardcoded sheet ID...');
      await ensureSheetsExist(sheets, TARGET_SHEET_ID);
      return TARGET_SHEET_ID;
    } catch (e) {
      console.log('Hardcoded sheet ID failed or inaccessible.');
    }

    // 3. Create new sheet if not found
    console.log('Creating new spreadsheet: Financier App Data');
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'Financier App Data' },
        sheets: [
          { properties: { title: 'Income' } },
          { properties: { title: 'Users' } },
          { properties: { title: 'Budgets' } }
        ]
      }
    });

    const newSheetId = spreadsheet.data.spreadsheetId;
    if (newSheetId) {
      await ensureSheetsExist(sheets, newSheetId);
      return newSheetId;
    }
    throw new Error('Failed to create or find a working sheet');
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw new Error('AUTH_FAILED');
    }
    console.error('Error in getWorkingSheetId:', error.message);
    throw error;
  }
}

// --- Utility ---
function handleApiError(res: express.Response, error: any, defaultMessage: string) {
  if (error.message === 'AUTH_FAILED') {
    return res.status(401).json({ error: 'Authentication expired. Please log in again.' });
  }
  
  if (error.response && error.response.status === 429) {
    return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED', message: 'Google Sheets rate limit exceeded. Please try again in a few minutes.' });
  }

  console.error('API Error:', error);
  if (error.response) {
    console.error('API Error Details:', JSON.stringify(error.response.data, null, 2));
  }
  res.status(500).json({ error: defaultMessage, details: error.message });
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to get OAuth2 client with dynamic redirect URI
function getOAuth2Client(req: express.Request) {
  const host = req.get('host') || 'localhost:3000';
  const protocol = (req.headers['x-forwarded-proto'] as string) || (req.protocol === 'http' && host.includes('localhost') ? 'http' : 'https');
  
  // Use REDIRECT_URI env var if set, otherwise construct it dynamically
  let redirectUri = process.env.REDIRECT_URI;
  
  if (redirectUri) {
    // Ensure it ends with the callback path if it's just a domain
    if (!redirectUri.includes('/api/auth/callback')) {
      redirectUri = redirectUri.replace(/\/$/, '') + '/api/auth/callback';
    }
  } else if (process.env.APP_URL) {
    // Use APP_URL if available
    let baseUrl = process.env.APP_URL.replace(/\/$/, '');
    redirectUri = `${baseUrl}/api/auth/callback`;
  } else {
    redirectUri = `${protocol}://${host}/api/auth/callback`;
  }
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  // Handle automatic token refresh
  client.on('tokens', async (tokens) => {
    if (tokens.refresh_token || tokens.access_token) {
      console.log('New tokens received from refresh event');
      await saveMasterTokens(tokens);
    }
  });

  return client;
}

app.get('/api/health', (req, res) => {
  const oauth2Client = getOAuth2Client(req);
  const redirectUri = (oauth2Client as any).redirectUri;

  res.json({ 
    status: 'ok', 
    sheetId: TARGET_SHEET_ID,
    constructedRedirectUri: redirectUri,
    env: { 
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      appUrl: process.env.APP_URL,
      redirectUriEnv: process.env.REDIRECT_URI
    }
  });
});

// API Routes
app.get('/api/auth/google/url', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google credentials in environment variables');
    return res.status(500).json({ 
      error: 'MISSING_CREDENTIALS', 
      message: 'Google Client ID or Secret is not configured in Settings.' 
    });
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
      prompt: 'consent'
    });
    res.json({ url });
  } catch (error: any) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
});

app.get(['/api/auth/callback', '/auth/callback'], async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // Save tokens for persistence
    await saveMasterTokens(tokens);
    
    // Return tokens to the opener window
    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f7fe;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #4f46e5;">Authentication Successful!</h2>
            <p style="color: #64748b;">This window will close automatically.</p>
            <script>
              const tokens = ${JSON.stringify(tokens)};
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', tokens: tokens }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                window.location.href = '/';
              }
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Authentication failed: ' + (error.response?.data?.error_description || error.message));
  }
});

app.get('/api/auth/status', async (req, res) => {
  const tokens = await getMasterTokens();
  res.json({ connected: !!tokens });
});

app.post('/api/sync-to-sheet', async (req, res) => {
  let { transaction, tokens } = req.body;
  tokens = await getMasterTokens() || tokens;
  if (!tokens) {
    return res.status(401).json({ error: 'Not authenticated with Google' });
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);
    const sheetId = await getWorkingSheetId(oauth2Client);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Income!A:F',
    });
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Income!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['SL', 'Date', 'Type', 'Category', 'Amount', 'Note']]
        }
      });
    }

    let nextSl = 1;
    if (rows.length > 1) {
      // Find the maximum SL in the first column (skipping header)
      const slValues = rows.slice(1).map(r => parseInt(r[0])).filter(v => !isNaN(v));
      if (slValues.length > 0) {
        nextSl = Math.max(...slValues) + 1;
      } else {
        nextSl = rows.length;
      }
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Income!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          nextSl,
          transaction.date,
          transaction.amount > 0 ? 'Income' : 'Expense',
          transaction.category,
          transaction.amount,
          transaction.purpose
        ]]
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    handleApiError(res, error, 'Failed to sync to Google Sheets');
  }
});


app.post('/api/sync-user', async (req, res) => {
    let { email, password, tokens, name, avatar } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens || !email) {
      return res.status(400).json({ error: 'Missing required information' });
    }

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const sheetId = await getWorkingSheetId(oauth2Client);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      // Check if user already exists
      let rows: any[][] = [];
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'Users!A:E',
        });
        rows = response.data.values || [];
      } catch (e: any) {
        // If sheet doesn't exist, we'll create it by appending
        console.warn('Users sheet might not exist, will attempt to create on append');
      }

      const userIndex = rows.findIndex(row => (row[1]?.toString() || '').toLowerCase() === email.toLowerCase());

      const AUTHORIZED_EMAIL = 'rajuhd13@gmail.com';

      if (email.toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
        return res.status(403).json({ error: 'Unauthorized email' });
      }

      if (userIndex === -1) {
        // New user - Add header if sheet is empty
        if (rows.length === 0) {
          await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Users!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [['SL', 'User Name', 'Password', 'Profile Name', 'Image']]
            }
          });
        }

        let nextSl = 1;
        if (rows.length > 1) {
          const slValues = rows.slice(1).map(r => parseInt(r[0])).filter(v => !isNaN(v));
          if (slValues.length > 0) {
            nextSl = Math.max(...slValues) + 1;
          } else {
            nextSl = rows.length;
          }
        }

        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'Users!A:E',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[nextSl, email, password, name || '', avatar || '']]
          }
        });
        res.json({ success: true, profile: { name, avatar } });
      } else {
        // Existing user - validate password
        const userRow = rows[userIndex];
        const storedPassword = userRow[2];

        if (storedPassword !== password) {
          return res.status(401).json({ error: 'Invalid password' });
        }

        res.json({ 
          success: true, 
          profile: { 
            name: userRow[3] || name, 
            avatar: userRow[4] || avatar 
          } 
        });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Failed to sync user to Google Sheets');
    }
  });

  app.post('/api/update-profile', async (req, res) => {
    let { email, name, avatar, tokens } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens || !email) return res.status(400).json({ error: 'Missing required information' });

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const sheetId = await getWorkingSheetId(oauth2Client);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Users!A:E',
      });

      const rows = response.data.values || [];
      const userIndex = rows.findIndex(row => (row[1]?.toString() || '').toLowerCase() === email.toLowerCase());

      if (userIndex !== -1) {
        // Update existing row
        const existingRow = rows[userIndex];
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `Users!A${userIndex + 1}:E${userIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[existingRow[0], email, existingRow[2] || '', name, avatar]]
          }
        });
      } else {
        // Append if not found
        const nextSl = rows.length > 0 ? rows.length : 1;
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'Users!A:E',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[nextSl, email, '', name, avatar]]
          }
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      handleApiError(res, error, 'Failed to update profile in Google Sheets');
    }
  });

  app.post('/api/reset-password', async (req, res) => {
    let { email, newPassword, tokens } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens || !email || !newPassword) {
      return res.status(400).json({ error: 'Missing required information' });
    }

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const sheetId = await getWorkingSheetId(oauth2Client);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Users!A:E',
      });

      const rows = response.data.values || [];
      const userIndex = rows.findIndex(row => (row[1]?.toString() || '').toLowerCase() === email.toLowerCase());

      if (userIndex !== -1) {
        const existingRow = rows[userIndex];
        console.log(`Resetting password for user: ${email}. Old password will be replaced in Excel.`);
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `Users!C${userIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[newPassword]]
          }
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      handleApiError(res, error, 'Failed to reset password in Google Sheets');
    }
  });

  app.post('/api/delete-from-sheet', async (req, res) => {
    let { transaction, tokens } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const sheetId = await getWorkingSheetId(oauth2Client);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      // Find the row matching all fields since ID is gone
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Income!A:F',
      });

      const rows = response.data.values;
      if (!rows) return res.status(404).json({ error: 'No data found' });

      // Match by Date (index 1), Category (index 3), and Amount (index 4)
      const rowIndex = rows.findIndex(row => 
        row[1] === transaction.date && 
        row[3] === transaction.category && 
        parseFloat(row[4]) === transaction.amount
      );

      if (rowIndex === -1) return res.status(404).json({ error: 'Transaction not found in sheet' });

      // Get the actual sheetId for 'Income'
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === 'Income');
      const actualSheetId = sheet?.properties?.sheetId;

      if (actualSheetId === undefined) {
        return res.status(404).json({ error: 'Income sheet not found' });
      }

      // Delete the row
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: actualSheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1
              }
            }
          }]
        }
      });

      // Re-serial remaining rows
      const updatedResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Income!A:F',
      });
      const updatedRows = updatedResponse.data.values;
      if (updatedRows && updatedRows.length > 1) {
        const reSerialedValues = updatedRows.slice(1).map((row, index) => {
          const newRow = [...row];
          newRow[0] = index + 1; // Set new SL
          return newRow;
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `Income!A2:F${updatedRows.length}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: reSerialedValues }
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      handleApiError(res, error, 'Failed to delete from Google Sheets');
    }
  });

  app.post('/api/fetch-from-sheet', async (req, res) => {
    let { tokens } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const sheetId = await getWorkingSheetId(oauth2Client);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Income!A:F',
      });

      const rows = response.data.values;
      if (!rows) return res.json({ transactions: [] });

      // Skip header row if it exists
      const transactions = rows.slice(1).map((row, index) => ({
        id: `row-${index + 2}`, // Synthetic ID for UI
        date: row[1] || '',
        type: row[2] || '',
        category: row[3] || '',
        amount: parseFloat(row[4]) || 0,
        purpose: row[5] || ''
      }));

      res.json({ transactions });
    } catch (error: any) {
      handleApiError(res, error, 'Failed to fetch from Google Sheets');
    }
  });

  app.post('/api/upload-to-drive', async (req, res) => {
    let { base64Image, fileName, tokens } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });

      const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
      const media = {
        mimeType: 'image/jpeg',
        body: Readable.from(buffer),
      };

      const fileMetadata = {
        name: fileName || 'profile-picture.jpg',
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      // Try to make file public so it can be viewed in the app
      try {
        await drive.permissions.create({
          fileId: file.data.id!,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permError) {
        console.warn('Could not make file public, it might not load in the img tag:', permError);
      }

      res.json({ 
        success: true, 
        fileId: file.data.id,
        link: file.data.webViewLink,
        directLink: `https://lh3.googleusercontent.com/d/${file.data.id}`,
        tokens: oauth2Client.credentials
      });
    } catch (error: any) {
      console.error('Error uploading to drive:', error);
      if (error.response) {
        console.error('Drive API Error Details:', JSON.stringify(error.response.data, null, 2));
      }
      res.status(500).json({ error: error?.message || 'Failed to upload to Google Drive' });
    }
  });

// --- API: Budgets ---
app.get('/api/fetch-budgets', async (req, res) => {
  let tokens = await getMasterTokens();
  
  // Fallback to header if no master tokens
  const authHeader = req.headers.authorization;
  if (!tokens && authHeader) {
    tokens = { access_token: authHeader.split(' ')[1] };
  }

  if (!tokens) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const sheetId = await getWorkingSheetId(oauth2Client);
    
    // Ensure Budgets sheet exists
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const hasBudgetsSheet = spreadsheet.data.sheets?.some(s => s.properties?.title === 'Budgets');
    
    if (!hasBudgetsSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{
            addSheet: { properties: { title: 'Budgets' } }
          }]
        }
      });
      // Add header
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Budgets!A1:C1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['SL', 'Category', 'Amount']] }
      });
      return res.json([]);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Budgets!A2:D',
    });

    const rows = response.data.values || [];
    const budgets = rows.map(row => ({
      date: row[1] || '',
      category: row[2],
      amount: parseFloat(row[3]) || 0
    }));

    res.json(budgets);
  } catch (error: any) {
    if (error.message === 'AUTH_FAILED') {
      return res.status(401).json({ error: 'Authentication expired. Please log in again.' });
    }
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/save-budgets', express.json(), async (req, res) => {
  let tokens = await getMasterTokens();
  
  const authHeader = req.headers.authorization;
  if (!tokens && authHeader) {
    tokens = { access_token: authHeader.split(' ')[1] };
  }
  
  const budgets = req.body.budgets;

  if (!tokens) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    const sheetId = await getWorkingSheetId(oauth2Client);

    // Clear existing budgets and write new ones
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: 'Budgets!A2:D',
    });

    if (budgets.length > 0) {
      const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Budgets!A2:D${budgets.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: budgets.map((b: any, index: number) => [
            index + 1, 
            b.date || today, 
            b.category, 
            b.amount
          ])
        }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    if (error.message === 'AUTH_FAILED') {
      return res.status(401).json({ error: 'Authentication expired. Please log in again.' });
    }
    console.error('Error saving budgets:', error);
    res.status(500).json({ error: 'Failed to save budgets' });
  }
});

// Vite middleware - only in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  (async () => {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  })();
} else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  // Static serving for local production test
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global Error Handler:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
