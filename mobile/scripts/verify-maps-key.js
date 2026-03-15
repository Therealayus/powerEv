/**
 * Verify Google Maps API key (basic check).
 * Run from repo root: node mobile/scripts/verify-maps-key.js
 * 
 * If the key is restricted to "Maps SDK for Android" only, this script
 * may get REQUEST_DENIED - the key can still work in the app.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const xmlPath = path.join(__dirname, '../android/app/src/main/res/values/google_maps_api.xml');
let key;
try {
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const m = xml.match(/google_maps_key[^>]*>([^<]+)</);
  key = m ? m[1].trim() : null;
} catch (e) {
  console.error('Could not read google_maps_api.xml:', e.message);
  process.exit(1);
}

if (!key || key.length < 20) {
  console.error('No valid key found in google_maps_api.xml');
  process.exit(1);
}

console.log('Key prefix:', key.substring(0, 10) + '...');
console.log('Testing key with Geocoding API...\n');

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=1+Main+St&key=${key}`;
https.get(url, (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const status = data.status;
      const err = data.error_message;

      if (status === 'OK') {
        console.log('Result: Key is valid and accepted by Google (Geocoding API).');
        console.log('For the map in the app, ensure "Maps SDK for Android" is enabled for this key in Google Cloud Console.');
        return;
      }
      if (status === 'REQUEST_DENIED') {
        console.log('Result: REQUEST_DENIED -', err || 'Key may be restricted.');
        console.log('');
        console.log('This often means:');
        console.log('  1. Key is restricted to "Maps SDK for Android" only (then it will still work in the app).');
        console.log('  2. Or "Maps SDK for Android" / Geocoding is not enabled in Google Cloud Console.');
        console.log('');
        console.log('To confirm the key works in the app: run the app, open the Map tab. If the map loads, the key is fine.');
        return;
      }
      if (status === 'INVALID_REQUEST' || status === 'UNKNOWN_ERROR') {
        console.log('Result:', status, err || '');
        return;
      }
      console.log('Result:', status, err || '');
    } catch (e) {
      console.error('Parse error:', e.message);
    }
});
}).on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});
