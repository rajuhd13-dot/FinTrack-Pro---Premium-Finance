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

// Remove file-based token storage for Vercel compatibility
// Tokens should be managed by the frontend and passed in requests
async function getMasterTokens() {
  return null;
}

async function saveMasterTokens(tokens: any) {
  // No-op on Vercel, tokens are returned to frontend
  console.log('Tokens received, returning to frontend');
}

let cachedSheetId: string | null = '1WSq1HV3KvXzckLxIQxUEKWBSzSJi4f7FYOf8WlzQ5nk';

async function getWorkingSheetId(oauth2Client: any) {
  if (cachedSheetId) return cachedSheetId;
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  try {
    // 1. Search for existing sheet by name
    const res = await drive.files.list({
      q: "name='Financier App Data' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name)'
    });

    if (res.data.files && res.data.files.length > 0) {
      cachedSheetId = res.data.files[0].id!;
      return cachedSheetId;
    }

    // 2. Create new sheet if not found
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: 'Financier App Data' },
        sheets: [
          { properties: { title: 'Income' } },
          { properties: { title: 'Users' } }
        ]
      }
    });

    const newSheetId = spreadsheet.data.spreadsheetId;
    if (newSheetId) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: newSheetId,
        range: 'Income!A1:G1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['SL', 'ID', 'Date', 'Type', 'Category', 'Amount', 'Note']] }
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: newSheetId,
        range: 'Users!A1:E1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['SL', 'User Name', 'Password', 'Profile Name', 'Image']] }
      });
      cachedSheetId = newSheetId;
      return newSheetId;
    }
    throw new Error('Failed to create new spreadsheet');
  } catch (e: any) {
    console.error('Error in getWorkingSheetId:', e.message);
    throw e;
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to get OAuth2 client with dynamic redirect URI
function getOAuth2Client(req: express.Request) {
  const host = req.get('host') || 'localhost:3000';
  const protocol = (req.headers['x-forwarded-proto'] as string) || (req.protocol === 'http' && host.includes('localhost') ? 'http' : 'https');
  
  // Use REDIRECT_URI env var if set, otherwise construct it dynamically
  // Vercel apps usually need the full URL
  const redirectUri = process.env.REDIRECT_URI || `${protocol}://${host}/api/auth/callback`;
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  return client;
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    sheetId: cachedSheetId,
    env: { 
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL
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
        'https://www.googleapis.com/auth/drive.file'
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
      range: 'Income!A:G',
    });
    const rows = response.data.values || [];
    
    if (rows.length === 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Income!A:G',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['SL', 'ID', 'Date', 'Type', 'Category', 'Amount', 'Note']]
        }
      });
    }

    const nextSl = rows.length > 0 ? rows.length : 1;

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Income!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          nextSl,
          transaction.id,
          transaction.date,
          transaction.amount > 0 ? 'Income' : 'Expense',
          transaction.category,
          transaction.amount,
          transaction.purpose
        ]]
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error appending to sheet:', error);
    res.status(500).json({ error: 'Failed to sync to Google Sheets' });
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

        const nextSl = rows.length > 0 ? rows.length : 1;

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
      console.error('Error syncing user:', error?.response?.data || error);
      res.status(500).json({ error: 'Failed to sync user to Google Sheets' });
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
      console.error('Error updating profile in sheet:', error?.response?.data || error);
      res.status(500).json({ error: 'Failed to update profile in Google Sheets' });
    }
  });

  app.post('/api/delete-from-sheet', async (req, res) => {
    let { transactionId, tokens } = req.body;
    tokens = await getMasterTokens() || tokens;
    if (!tokens) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const oauth2Client = getOAuth2Client(req);
      oauth2Client.setCredentials(tokens);
      const sheetId = await getWorkingSheetId(oauth2Client);
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      // Find the row with the matching ID
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Income!A:G',
      });

      const rows = response.data.values;
      if (!rows) return res.status(404).json({ error: 'No data found' });

      const rowIndex = rows.findIndex(row => row[1]?.toString() === transactionId?.toString());
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

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting from sheet:', error);
      res.status(500).json({ error: 'Failed to delete from Google Sheets' });
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
        range: 'Income!A:G',
      });

      const rows = response.data.values;
      if (!rows) return res.json({ transactions: [] });

      // Skip header row if it exists
      const transactions = rows.slice(1).map(row => ({
        id: row[1] || '',
        date: row[2] || '',
        type: row[3] || '',
        category: row[4] || '',
        amount: parseFloat(row[5]) || 0,
        purpose: row[6] || ''
      }));

      res.json({ transactions });
    } catch (error) {
      console.error('Error fetching from sheet:', error);
      res.status(500).json({ error: 'Failed to fetch from Google Sheets' });
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
      console.error('Error uploading to drive:', error?.response?.data || error);
      res.status(500).json({ error: error?.message || 'Failed to upload to Google Drive' });
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
