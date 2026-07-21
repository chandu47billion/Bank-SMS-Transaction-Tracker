/**
 * Android SMS inbox bridge. Wraps `react-native-sms` (or an equivalent
 * native module) with a promise-based API and graceful fallbacks so the
 * app doesn't crash in environments where the native module isn't linked
 * (e.g. Metro-only JS bundling, unit tests, or iOS).
 */

import { Platform, NativeModules } from 'react-native';
import { PERMISSIONS, RESULTS, requestMultiple, checkMultiple } from 'react-native-permissions';
import { parseSmsBatch } from './parser';

// react-native-sms exposes a `SmsAndroid`-like native module on Android.
// We resolve it lazily/defensively since it may not be present in every
// environment (e.g. when running JS-only tooling/tests).
function getSmsModule() {
  try {
    // eslint-disable-next-line global-require
    const SmsAndroid = require('react-native-sms').SmsAndroid || NativeModules.SmsAndroid;
    return SmsAndroid || null;
  } catch (e) {
    return NativeModules.SmsAndroid || null;
  }
}

export const SMS_READ_PERMISSION = 'android.permission.READ_SMS';
export const SMS_RECEIVE_PERMISSION = 'android.permission.RECEIVE_SMS';

/**
 * Requests SMS read/receive permissions at runtime (Android only).
 * Returns true if granted.
 */
export async function requestSmsPermission() {
  if (Platform.OS !== 'android') return false;
  try {
    const statuses = await requestMultiple([PERMISSIONS.ANDROID.READ_SMS, PERMISSIONS.ANDROID.RECEIVE_SMS]);
    return (
      statuses[PERMISSIONS.ANDROID.READ_SMS] === RESULTS.GRANTED &&
      statuses[PERMISSIONS.ANDROID.RECEIVE_SMS] === RESULTS.GRANTED
    );
  } catch (e) {
    return false;
  }
}

export async function checkSmsPermission() {
  if (Platform.OS !== 'android') return false;
  try {
    const statuses = await checkMultiple([PERMISSIONS.ANDROID.READ_SMS, PERMISSIONS.ANDROID.RECEIVE_SMS]);
    return (
      statuses[PERMISSIONS.ANDROID.READ_SMS] === RESULTS.GRANTED &&
      statuses[PERMISSIONS.ANDROID.RECEIVE_SMS] === RESULTS.GRANTED
    );
  } catch (e) {
    return false;
  }
}

/**
 * Reads raw SMS messages from the device inbox filtered to known bank
 * sender ids/keywords, then runs them through the parsing pipeline.
 * Resolves to an array of normalized transaction objects.
 */
export function readAndParseInboxSms({ maxCount = 200 } = {}) {
  return new Promise(resolve => {
    const SmsAndroid = getSmsModule();
    if (!SmsAndroid || typeof SmsAndroid.list !== 'function') {
      // Native module unavailable (e.g. dev environment without the
      // module linked) - resolve with an empty list rather than throwing.
      resolve([]);
      return;
    }

    const filter = {
      box: 'inbox',
      maxCount,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      () => resolve([]), // failure callback
      (count, smsListJson) => {
        try {
          const smsArray = JSON.parse(smsListJson);
          const normalized = smsArray.map(sms => ({
            body: sms.body,
            sender: sms.address,
            timestamp: sms.date ? new Date(Number(sms.date)).toISOString() : new Date().toISOString(),
          }));
          resolve(parseSmsBatch(normalized));
        } catch (e) {
          resolve([]);
        }
      },
    );
  });
}

export default {
  requestSmsPermission,
  checkSmsPermission,
  readAndParseInboxSms,
  SMS_READ_PERMISSION,
  SMS_RECEIVE_PERMISSION,
};
