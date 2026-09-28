/**
 * Unique Client/Device Identifier for persisting Radars and Push Subscriptions per browser
 */

const STORAGE_KEY = 'seatscout_client_id';

export function getClientId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'default_client_id';
  }
}
