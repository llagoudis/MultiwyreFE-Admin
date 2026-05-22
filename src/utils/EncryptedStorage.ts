import { type StateStorage } from "zustand/middleware";

class EncryptedStorage {
  storage: StateStorage;
  constructor(storage: StateStorage) {
    this.storage = storage;
  }

  getItem(key: string) {
    const data = this.storage.getItem(key);
    const stringfied =
      data && typeof data === "string" ? decodeURIComponent(atob(data)) : "";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return stringfied ? JSON.parse(stringfied) : {};
  }
  setItem(key: string, data: unknown) {
    return this.storage.setItem(
      key,
      btoa(encodeURIComponent(JSON.stringify(data))),
    );
  }
  removeItem(key: string) {
    return void this.storage.removeItem(key);
  }
}

export default EncryptedStorage;
