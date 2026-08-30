import { GmailMessage, GmailProfile, Trade, User } from '../types';

// Desired scopes requested for Gmail
export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
];

// In-memory token cache (Do NOT store in localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number | null = null;

export const getCachedToken = (): string | null => {
  if (tokenExpiryTime && Date.now() > tokenExpiryTime) {
    cachedAccessToken = null;
    tokenExpiryTime = null;
  }
  return cachedAccessToken;
};

export const setCachedToken = (token: string | null, expiresInSeconds = 3600) => {
  cachedAccessToken = token;
  if (token) {
    tokenExpiryTime = Date.now() + expiresInSeconds * 1000;
  } else {
    tokenExpiryTime = null;
  }
};

export const isGmailConnected = (): boolean => {
  return !!getCachedToken();
};

export const disconnectGmail = () => {
  if (cachedAccessToken && (window as any).google?.accounts?.oauth2) {
    try {
      (window as any).google.accounts.oauth2.revoke(cachedAccessToken, () => {
        console.log('Gmail OAuth token revoked');
      });
    } catch (e) {
      console.warn('Error revoking token:', e);
    }
  }
  cachedAccessToken = null;
  tokenExpiryTime = null;
};

// Request OAuth Token via Google Identity Services (GIS)
export const requestGmailAccessToken = (customClientId?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If we already have a valid token
    const existingToken = getCachedToken();
    if (existingToken) {
      return resolve(existingToken);
    }

    const clientId =
      customClientId ||
      ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) ||
      '';

    const google = (window as any).google;

    if (!google?.accounts?.oauth2) {
      // If GIS library hasn't loaded yet or custom prompt
      const manualToken = window.prompt(
        'กรุณากรอก Google OAuth Access Token (หรือเชื่อมต่อผ่าน Google Sign-In):'
      );
      if (manualToken && manualToken.trim()) {
        setCachedToken(manualToken.trim());
        return resolve(manualToken.trim());
      }
      return reject(new Error('Google Identity Services script not available'));
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId || 'dummy-client-id.apps.googleusercontent.com',
        scope: GMAIL_SCOPES.join(' '),
        callback: (response: any) => {
          if (response.error) {
            console.error('Google OAuth Error:', response);
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            setCachedToken(response.access_token, response.expires_in || 3600);
            resolve(response.access_token);
          } else {
            reject(new Error('No access token returned'));
          }
        },
        error_callback: (nonOAuthError: any) => {
          console.warn('GIS Error:', nonOAuthError);
          // Allow fallback manual token if popup is blocked or client_id is invalid
          const manual = window.prompt(
            'Google OAuth Popup: หากไม่มี Client ID สามารถวาง Access Token ที่นี่เพื่อทดสอบเชื่อมต่อ Gmail:'
          );
          if (manual && manual.trim()) {
            setCachedToken(manual.trim());
            resolve(manual.trim());
          } else {
            reject(new Error(nonOAuthError?.message || 'Authentication cancelled or blocked'));
          }
        },
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      console.error('Failed to initTokenClient:', err);
      const manual = window.prompt('ป้อน Access Token สำหรับ Gmail API:');
      if (manual && manual.trim()) {
        setCachedToken(manual.trim());
        resolve(manual.trim());
      } else {
        reject(err);
      }
    }
  });
};

// 1. Get Gmail User Profile
export const fetchGmailProfile = async (token?: string): Promise<GmailProfile> => {
  const authToken = token || getCachedToken();
  if (!authToken) throw new Error('Gmail is not connected. Please connect with Google first.');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      setCachedToken(null);
      throw new Error('OAuth token expired. Please reconnect Gmail.');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch profile: ${res.statusText}`);
  }

  return await res.json();
};

// 2. List Gmail Messages
export const listGmailMessages = async (
  query = '',
  maxResults = 15,
  token?: string
): Promise<{ messages: { id: string; threadId: string }[]; resultSizeEstimate: number }> => {
  const authToken = token || getCachedToken();
  if (!authToken) throw new Error('Gmail is not connected.');

  const params = new URLSearchParams({
    maxResults: String(maxResults),
  });
  if (query) {
    params.set('q', query);
  }

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      setCachedToken(null);
      throw new Error('OAuth token expired. Please reconnect Gmail.');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list messages');
  }

  const data = await res.json();
  return {
    messages: data.messages || [],
    resultSizeEstimate: data.resultSizeEstimate || 0,
  };
};

// Decode Base64URL
const decodeBase64Url = (str: string): string => {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    try {
      return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return str;
    }
  }
};

// 3. Get Detailed Gmail Message
export const getGmailMessage = async (messageId: string, token?: string): Promise<GmailMessage> => {
  const authToken = token || getCachedToken();
  if (!authToken) throw new Error('Gmail is not connected.');

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to get message details');
  }

  const data = await res.json();
  const headers = data.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || 'Unknown';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || '';

  let bodyText = '';
  let bodyHtml = '';

  const extractBody = (part: any) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyText += decodeBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      bodyHtml += decodeBase64Url(part.body.data);
    }
    if (part.parts && Array.isArray(part.parts)) {
      part.parts.forEach(extractBody);
    }
  };

  if (data.payload) {
    if (data.payload.body?.data) {
      const decoded = decodeBase64Url(data.payload.body.data);
      if (data.payload.mimeType === 'text/html') {
        bodyHtml = decoded;
      } else {
        bodyText = decoded;
      }
    }
    if (data.payload.parts) {
      data.payload.parts.forEach(extractBody);
    }
  }

  const labelIds: string[] = data.labelIds || [];
  const isRead = !labelIds.includes('UNREAD');

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet,
    internalDate: data.internalDate,
    payload: data.payload,
    subject,
    from,
    to,
    date,
    bodyText: bodyText || data.snippet || '',
    bodyHtml: bodyHtml || `<pre style="font-family: inherit;">${bodyText || data.snippet || ''}</pre>`,
    isRead,
  };
};

// Encode UTF-8 string to Base64URL
const encodeBase64Url = (str: string): string => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// 4. Send Email via Gmail API
export interface SendEmailPayload {
  to: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  cc?: string;
}

export const sendGmailEmail = async (
  payload: SendEmailPayload,
  token?: string
): Promise<{ id: string; threadId: string }> => {
  const authToken = token || getCachedToken();
  if (!authToken) throw new Error('Gmail is not connected.');

  if (!payload.to || !payload.to.trim()) {
    throw new Error('Recipient email address (To) is required.');
  }

  const boundary = '===_GhostPhaze_Boundary_' + Date.now();
  const utf8Subject = `=?utf-8?B?${btoa(encodeURIComponent(payload.subject).replace(/%([0-9A-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16))))}?=`;

  const emailLines: string[] = [
    `To: ${payload.to}`,
    payload.cc ? `Cc: ${payload.cc}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    payload.bodyText || 'Trading Journal Report from Ghost Phaze',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    payload.bodyHtml || `<p>${payload.bodyText || 'Ghost Phaze Trading Journal Report'}</p>`,
    '',
    `--${boundary}--`,
  ].filter(Boolean);

  const rawEmail = emailLines.join('\r\n');
  const encodedRaw = encodeBase64Url(rawEmail);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedRaw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email: ${res.statusText}`);
  }

  return await res.json();
};

// 5. Delete Email (Destructive operation)
export const deleteGmailMessage = async (messageId: string, token?: string): Promise<void> => {
  const authToken = token || getCachedToken();
  if (!authToken) throw new Error('Gmail is not connected.');

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete message');
  }
};

// 6. Generate Executive HTML Trade Report for Email
export const generateTradeReportEmail = (
  trades: Trade[],
  user: User,
  dateRangeTitle: string,
  portfolioName?: string
): { subject: string; html: string; text: string } => {
  const wins = trades.filter((t) => t.outcome === 'WIN');
  const losses = trades.filter((t) => t.outcome === 'LOSE');
  const be = trades.filter((t) => t.outcome === 'BE');
  const miss = trades.filter((t) => t.outcome === 'MISS');

  const winRate = trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : '0.0';
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const totalRR = trades.reduce((acc, t) => acc + t.riskReward, 0);

  const formattedPnL = totalPnL >= 0 ? `+$${totalPnL.toLocaleString()}` : `-$${Math.abs(totalPnL).toLocaleString()}`;
  const pnlColor = totalPnL >= 0 ? '#38bdf8' : '#94a3b8';

  const subject = `[Gengar - Wyk Labs] Trading Recap & Journal Report - ${dateRangeTitle} (${formattedPnL})`;

  const tradeRowsHtml = trades
    .map(
      (t, i) => `
    <tr style="border-bottom: 1px solid #222738;">
      <td style="padding: 10px 12px; color: #94a3b8; font-size: 13px;">#${i + 1}</td>
      <td style="padding: 10px 12px; font-weight: bold; color: #ffffff; font-size: 13px;">${t.pair}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: ${t.direction === 'Long' ? '#38bdf8' : '#94a3b8'}; font-weight: 600;">
        ${t.direction}
      </td>
      <td style="padding: 10px 12px; font-size: 13px;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${
          t.outcome === 'WIN' ? '#0369a130; color: #38bdf8; border: 1px solid #0284c760;' :
          t.outcome === 'LOSE' ? '#33415530; color: #94a3b8; border: 1px solid #47556960;' :
          t.outcome === 'BE' ? '#eab30820; color: #eab308; border: 1px solid #eab30840;' :
          '#64748b20; color: #94a3b8; border: 1px solid #64748b40;'
        }">
          ${t.outcome}
        </span>
      </td>
      <td style="padding: 10px 12px; font-size: 13px; color: #cbd5e1;">${t.setupType}</td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: bold; color: ${t.riskReward >= 0 ? '#38bdf8' : '#94a3b8'};">
        ${t.riskReward > 0 ? `+${t.riskReward}R` : `${t.riskReward}R`}
      </td>
      <td style="padding: 10px 12px; font-size: 13px; font-weight: bold; color: ${t.pnl >= 0 ? '#38bdf8' : '#94a3b8'}; text-align: right;">
        ${t.pnl >= 0 ? `+$${t.pnl.toLocaleString()}` : `-$${Math.abs(t.pnl).toLocaleString()}`}
      </td>
    </tr>
    ${
      t.notes || t.setupDescription
        ? `<tr>
            <td colspan="7" style="padding: 6px 12px 12px 12px; font-size: 12px; color: #94a3b8; background: #0c0e15; border-bottom: 1px solid #1a1e2d;">
              ${t.setupDescription ? `<div style="margin-bottom: 4px; color: #38bdf8;"><strong>ท่าเทรด / แผน:</strong> ${t.setupDescription}</div>` : ''}
              ${t.notes ? `<div><strong>บันทึก:</strong> ${t.notes}</div>` : ''}
            </td>
          </tr>`
        : ''
    }
  `
    )
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #050608; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <div style="max-width: 680px; margin: 0 auto; background: #0a0c12; border: 1px solid #1e2230; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      
      <!-- Header Banner -->
      <div style="background: linear-gradient(135deg, #111420 0%, #171c2b 100%); padding: 24px; border-bottom: 1px solid #1e2230;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
              GENGAR - <span style="color: #e2e8f0;">WYK LABS</span>
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">
              Trading Journal & Execution Performance Report
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: bold; color: #f8fafc;">${user.displayName || user.username}</div>
            <div style="font-size: 12px; color: #94a3b8;">${user.title || 'Prop Trader'}</div>
          </div>
        </div>
      </div>

      <!-- Overview Stats -->
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 14px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            ช่วงเวลา: <strong style="color: #ffffff;">${dateRangeTitle}</strong> ${portfolioName ? `• พอร์ต: <strong style="color: #38bdf8;">${portfolioName}</strong>` : ''}
          </span>
          <span style="font-size: 12px; color: #64748b;">
            สร้างเมื่อ ${new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #10131d; padding: 14px; border-radius: 8px; border: 1px solid #1e2230; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Net PnL</div>
            <div style="font-size: 18px; font-weight: 800; color: ${pnlColor};">${formattedPnL}</div>
          </div>
          <div style="background: #10131d; padding: 14px; border-radius: 8px; border: 1px solid #1e2230; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Win Rate</div>
            <div style="font-size: 18px; font-weight: 800; color: #38bdf8;">${winRate}%</div>
          </div>
          <div style="background: #10131d; padding: 14px; border-radius: 8px; border: 1px solid #1e2230; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Total RR</div>
            <div style="font-size: 18px; font-weight: 800; color: ${totalRR >= 0 ? '#38bdf8' : '#94a3b8'};">
              ${totalRR > 0 ? `+${totalRR.toFixed(1)}R` : `${totalRR.toFixed(1)}R`}
            </div>
          </div>
          <div style="background: #10131d; padding: 14px; border-radius: 8px; border: 1px solid #1e2230; text-align: center;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">Total Trades</div>
            <div style="font-size: 18px; font-weight: 800; color: #ffffff;">${trades.length}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; color: #cbd5e1; display: flex; gap: 16px;">
          <span>ชนะ (Wins): <strong style="color: #38bdf8;">${wins.length}</strong></span>
          <span>แพ้ (Losses): <strong style="color: #94a3b8;">${losses.length}</strong></span>
          <span>เสมอทุน (BE): <strong style="color: #eab308;">${be.length}</strong></span>
          <span>ตกรถ (MISS): <strong style="color: #94a3b8;">${miss.length}</strong></span>
        </div>

        <!-- Trades Table -->
        <div style="overflow-x: auto; border: 1px solid #1e2230; border-radius: 8px; background: #0c0e15;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background: #121622; border-bottom: 1px solid #1e2230;">
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">#</th>
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Pair</th>
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Dir</th>
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Result</th>
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Setup</th>
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">RR</th>
                <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: right;">PnL</th>
              </tr>
            </thead>
            <tbody>
              ${trades.length > 0 ? tradeRowsHtml : '<tr><td colspan="7" style="padding: 24px; text-align: center; color: #64748b;">ไม่มีข้อมูลไม้เทรดในช่วงเวลานี้</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #08090d; padding: 16px 24px; border-top: 1px solid #171a26; text-align: center; font-size: 12px; color: #64748b;">
        Ghost Phaze Terminal • Real-Time Trading Journal & Edge Analytics
      </div>
    </div>
  </body>
  </html>
  `;

  const text = `
GHOST PHAZE - Trading Journal & Execution Performance Report
Trader: ${user.displayName || user.username} (${user.title})
ช่วงเวลา: ${dateRangeTitle}
Total Trades: ${trades.length} | Win Rate: ${winRate}% | Net PnL: ${formattedPnL} | Total RR: ${totalRR.toFixed(1)}R

Wins: ${wins.length} | Losses: ${losses.length} | BE: ${be.length} | MISS: ${miss.length}

${trades
  .map(
    (t, i) =>
      `#${i + 1} ${t.pair} [${t.direction}] - ${t.outcome} (${t.setupType}) | RR: ${t.riskReward}R | PnL: $${t.pnl} | Notes: ${t.notes || '-'}`
  )
  .join('\n')}
`;

  return { subject, html, text };
};
