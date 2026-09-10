/**
 * YouTube OAuth2 Authorization Script
 *
 * Run this ONCE to authorize the app with your YouTube/Google account.
 * It will open a browser window for you to sign in and grant permissions.
 * The refresh token is saved to token.json for reuse by schedule.js.
 *
 * Usage:
 *   npm run auth
 *
 * Prerequisites:
 *   - client_secret.json must exist in this directory
 *     (download from Google Cloud Console → APIs & Services → Credentials)
 */

import { google } from 'googleapis';
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { URL } from 'node:url';
import open from 'open';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLIENT_SECRET_PATH = join(__dirname, 'client_secret.json');
const TOKEN_PATH = join(__dirname, 'token.json');

const SCOPES = ['https://www.googleapis.com/auth/youtube'];

// ─── Validate Prerequisites ────────────────────────────────────────

if (!existsSync(CLIENT_SECRET_PATH)) {
  console.error('\n❌ client_secret.json not found!\n');
  console.error('To create it:');
  console.error('  1. Go to https://console.cloud.google.com/apis/credentials');
  console.error('  2. Create an OAuth 2.0 Client ID (Desktop app)');
  console.error('  3. Download the JSON and save it as:');
  console.error(`     ${CLIENT_SECRET_PATH}\n`);
  process.exit(1);
}

if (existsSync(TOKEN_PATH)) {
  console.log('\n⚠️  token.json already exists. Re-authorizing will overwrite it.');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

// ─── Load Client Credentials ───────────────────────────────────────

const credentials = JSON.parse(readFileSync(CLIENT_SECRET_PATH, 'utf8'));
const { client_id, client_secret } = credentials.installed || credentials.web;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  'http://localhost:3456/oauth2callback'
);

// ─── Start Local Server for OAuth Callback ─────────────────────────

async function authorize() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:3456');

        if (url.pathname === '/oauth2callback') {
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<html><body><h1>❌ Authorization Failed</h1><p>${error}</p></body></html>`);
            reject(new Error(`Authorization denied: ${error}`));
            server.close();
            return;
          }

          if (!code) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<html><body><h1>❌ No authorization code received</h1></body></html>');
            reject(new Error('No authorization code'));
            server.close();
            return;
          }

          // Exchange code for tokens
          const { tokens } = await oauth2Client.getToken(code);

          // Save tokens
          writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
          console.log('\n✅ Authorization successful!');
          console.log(`   Token saved to: ${TOKEN_PATH}\n`);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0;">
                <div style="text-align: center;">
                  <h1 style="color: #22c55e;">✅ Authorization Successful!</h1>
                  <p>You can close this window and return to the terminal.</p>
                  <p style="color: #94a3b8; margin-top: 1rem;">Token saved — the scheduler is ready to use.</p>
                </div>
              </body>
            </html>
          `);

          resolve(tokens);
          server.close();
        }
      } catch (err) {
        reject(err);
        server.close();
      }
    });

    server.listen(3456, () => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Force consent to get refresh_token
      });

      console.log('\n🔑 Opening browser for Google authorization...\n');
      console.log(`   If the browser doesn't open, visit this URL:\n   ${authUrl}\n`);

      open(authUrl);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('\n❌ Port 3456 is already in use. Close other servers and try again.\n');
      }
      reject(err);
    });
  });
}

// ─── Run ────────────────────────────────────────────────────────────

try {
  await authorize();
  console.log('🎉 You can now run: npm run schedule\n');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Authorization failed:', err.message);
  process.exit(1);
}
