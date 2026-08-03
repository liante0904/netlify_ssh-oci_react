/**
 * share Netlify function URL builder tests
 *
 * Usage:
 *   node test/unit/share-function.test.js
 */

import { buildReportSearchUrl, isSocialPreviewBot } from '../../netlify/functions/share.js';

let passed = 0;
let failed = 0;

function assertEqual(actual, expected, label) {
  if (actual === expected) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.log(`  FAIL: ${label}`);
    console.log(`     expected: ${expected}`);
    console.log(`     actual:   ${actual}`);
    failed++;
  }
}

console.log('\n--- share.js buildReportSearchUrl ---');

assertEqual(
  buildReportSearchUrl('239333230', {}),
  'https://ssh-oci.duckdns.org/external/api/search/?report_id=239333230',
  'default uses /external/api'
);

assertEqual(
  buildReportSearchUrl('123', {
    VITE_API_URL: 'https://ssh-oci.duckdns.org',
    VITE_API_PATH: '/external/api',
  }),
  'https://ssh-oci.duckdns.org/external/api/search/?report_id=123',
  'VITE_API_URL + VITE_API_PATH'
);

assertEqual(
  buildReportSearchUrl('123', {
    VITE_REPORT_API_URL: 'https://ssh-oci.duckdns.org/pub/api',
  }),
  'https://ssh-oci.duckdns.org/pub/api/search/?report_id=123',
  'explicit /pub/api is preserved'
);

assertEqual(
  buildReportSearchUrl('123', {
    VITE_REPORT_API_URL: 'https://ssh-oci.duckdns.org/pub',
    VITE_TABLE_NAME: 'api',
  }),
  'https://ssh-oci.duckdns.org/pub/api/search/?report_id=123',
  'legacy /pub + table name'
);

assertEqual(
  buildReportSearchUrl('123', {
    VITE_API_URL: 'https://ssh-oci.duckdns.org/ords/admin/data_main_daily_send',
  }),
  'https://ssh-oci.duckdns.org/ords/admin/data_main_daily_send/external/api/search/?report_id=123',
  'ORDS path is preserved with FastAPI fallback'
);

assertEqual(
  buildReportSearchUrl('abc 123', {}),
  'https://ssh-oci.duckdns.org/external/api/search/?report_id=abc%20123',
  'report_id is encoded'
);

console.log('\n--- share.js preview crawler detection ---');

assertEqual(isSocialPreviewBot('facebookexternalhit/1.1'), true, 'Facebook crawler receives OG page');
assertEqual(isSocialPreviewBot('TelegramBot (like TwitterBot)'), true, 'Telegram crawler receives OG page');
assertEqual(isSocialPreviewBot('Mozilla/5.0 (Linux; Android 14; KAKAOTALK 25.7.3)'), false, 'Kakao in-app browser receives loading page');
assertEqual(isSocialPreviewBot('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'), false, 'mobile browser receives loading page');

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
