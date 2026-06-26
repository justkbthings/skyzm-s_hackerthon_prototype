import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "community_remit_token";

const webStorage = {
  getItem: async (key: string) =>
    typeof localStorage !== "undefined" ? localStorage.getItem(key) : null,
  setItem: async (key: string, value: string) => {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  },
  deleteItem: async (key: string) => {
    if (typeof localStorage !== "undefined") localStorage.removeItem(key);
  },
};

export const tokenStorage = Platform.OS === "web" ? webStorage : SecureStore;

export { TOKEN_KEY };
