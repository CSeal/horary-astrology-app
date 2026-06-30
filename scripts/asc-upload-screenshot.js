#!/usr/bin/env node
// Direct App Store Connect screenshot uploader (reserve → PUT parts → commit).
// Node built-in crypto signs the ES256 JWT; Node 18+ fetch does the HTTP.
// Usage: node asc-upload.js <screenshotSetId> <filePath> <fileName>
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const KID = '8NQS9JA767';
const ISS = '5726f3a0-ca34-4403-a767-3dae735b72bc';
const P8 = path.join(os.homedir(), '.expo/AuthKey_8NQS9JA767.p8');
const BASE = 'https://api.appstoreconnect.apple.com';

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function jwt() {
  const header = { alg: 'ES256', kid: KID, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: ISS, iat: now, exp: now + 1100, aud: 'appstoreconnect-v1' };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = crypto.createSign('SHA256').update(signingInput).sign({ key: fs.readFileSync(P8), dsaEncoding: 'ieee-p1363' });
  return `${signingInput}.${b64url(sig)}`;
}

async function main() {
  const [setId, filePath, fileName] = process.argv.slice(2);
  const token = jwt();
  const data = fs.readFileSync(filePath);
  const fileSize = data.length;
  const md5 = crypto.createHash('md5').update(data).digest('hex');
  const auth = { Authorization: `Bearer ${token}` };

  // 1. reserve
  const reserve = await fetch(`${BASE}/v1/appScreenshots`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: {
        type: 'appScreenshots',
        attributes: { fileName, fileSize },
        relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } } },
      },
    }),
  });
  const reserveJson = await reserve.json();
  if (!reserve.ok) { console.error('RESERVE FAILED', reserve.status, JSON.stringify(reserveJson)); process.exit(1); }
  const id = reserveJson.data.id;
  const ops = reserveJson.data.attributes.uploadOperations;

  // 2. upload each part
  for (const op of ops) {
    const part = data.subarray(op.offset, op.offset + op.length);
    const headers = {};
    for (const h of op.requestHeaders || []) headers[h.name] = h.value;
    const put = await fetch(op.url, { method: op.method, headers, body: part });
    if (!put.ok) { console.error('PART FAILED', put.status, await put.text()); process.exit(1); }
  }

  // 3. commit
  const commit = await fetch(`${BASE}/v1/appScreenshots/${id}`, {
    method: 'PATCH',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { type: 'appScreenshots', id, attributes: { uploaded: true, sourceFileChecksum: md5 } } }),
  });
  const commitJson = await commit.json();
  if (!commit.ok) { console.error('COMMIT FAILED', commit.status, JSON.stringify(commitJson)); process.exit(1); }
  console.log(`OK ${fileName} → ${id} (state: ${commitJson.data.attributes.assetDeliveryState?.state || '?'})`);
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
