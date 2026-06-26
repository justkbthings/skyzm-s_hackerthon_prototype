import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "community_remit_token";

const browserStorage = globalThis as unknown as {
  localStorage?: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
};

const webStorage = {
  getItem: async (key: string) =>
    browserStorage.localStorage?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => {
    browserStorage.localStorage?.setItem(key, value);
  },
  deleteItem: async (key: string) => {
    browserStorage.localStorage?.removeItem(key);
  },
};

const nativeStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  deleteItem: SecureStore.deleteItemAsync,
};

export const tokenStorage = Platform.OS === "web" ? webStorage : nativeStorage;

export { TOKEN_KEY };
