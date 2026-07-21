/**
 * Key-value settings store backed by the `settings` table.
 * Values are always persisted as strings; helpers below coerce
 * booleans/JSON as needed.
 */

import { getDBConnection } from './db';

export async function getSetting(key, defaultValue = null) {
  const db = await getDBConnection();
  const [result] = await db.executeSql('SELECT value FROM settings WHERE key = ?', [key]);
  if (result.rows.length === 0) return defaultValue;
  return result.rows.item(0).value;
}

export async function setSetting(key, value) {
  const db = await getDBConnection();
  await db.executeSql('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
}

export async function getBoolSetting(key, defaultValue = false) {
  const value = await getSetting(key, null);
  if (value === null) return defaultValue;
  return value === 'true';
}

export async function setBoolSetting(key, value) {
  await setSetting(key, value ? 'true' : 'false');
}

export async function getJSONSetting(key, defaultValue = null) {
  const value = await getSetting(key, null);
  if (value === null) return defaultValue;
  try {
    return JSON.parse(value);
  } catch (e) {
    return defaultValue;
  }
}

export async function setJSONSetting(key, value) {
  await setSetting(key, JSON.stringify(value));
}

export const SETTINGS_KEYS = {
  DARK_MODE: 'dark_mode',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  SMS_PERMISSION_GRANTED: 'sms_permission_granted',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  APP_LOCK_ENABLED: 'app_lock_enabled',
  USER_NAME: 'user_name',
  USER_EMAIL: 'user_email',
  LAST_SMS_SYNC: 'last_sms_sync',
};

export default {
  getSetting,
  setSetting,
  getBoolSetting,
  setBoolSetting,
  getJSONSetting,
  setJSONSetting,
  SETTINGS_KEYS,
};
