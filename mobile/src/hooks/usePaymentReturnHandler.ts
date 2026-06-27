import { useEffect, type RefObject } from "react";
import { Platform } from "react-native";
import type { NavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";

export const PAYMENT_RETURN_MESSAGE = "community-remit-payment";

function navigateToPaymentStatus(
  navigationRef: RefObject<NavigationContainerRef<RootStackParamList> | null>,
  transactionId: string
) {
  const tryNavigate = () => {
    if (navigationRef.current?.isReady()) {
      navigationRef.current.navigate("PaymentStatus", { transactionId });
      return true;
    }
    return false;
  };

  if (tryNavigate()) return;

  const interval = setInterval(() => {
    if (tryNavigate()) clearInterval(interval);
  }, 100);
  setTimeout(() => clearInterval(interval), 3000);
}

export function usePaymentReturnHandler(
  navigationRef: RefObject<NavigationContainerRef<RootStackParamList> | null>,
  isAuthenticated: boolean
) {
  useEffect(() => {
    if (!isAuthenticated || Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        transactionId?: string;
      };
      if (data?.type !== PAYMENT_RETURN_MESSAGE || !data.transactionId) return;
      navigateToPaymentStatus(navigationRef, data.transactionId);
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get("paymentReturn") === "1") {
      const transactionId = params.get("transactionId");
      if (transactionId) {
        navigateToPaymentStatus(navigationRef, transactionId);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isAuthenticated, navigationRef]);
}
