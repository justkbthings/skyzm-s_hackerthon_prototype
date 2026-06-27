import { Linking, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

/**
 * Opens the GNAP wallet authorization page.
 * On web, pass a window opened synchronously from the button press so popup
 * blockers do not reject the redirect after the consent API call.
 */
export async function openAuthorizationUrl(
  url: string,
  preOpenedWindow?: Window | null
): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return;

    if (preOpenedWindow && !preOpenedWindow.closed) {
      preOpenedWindow.location.href = url;
      preOpenedWindow.focus();
      return;
    }

    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.assign(url);
    }
    return;
  }

  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      throw new Error("Could not open wallet authorization page");
    }
  }
}
