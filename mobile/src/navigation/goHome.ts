type HomeNavigation = {
  navigate: (screen: "MainTabs", params?: { screen: "Home" }) => void;
};

/** Return to the Home tab inside MainTabs (works from stack screens like Deposit, Payment). */
export function goToHome(navigation: HomeNavigation) {
  navigation.navigate("MainTabs", { screen: "Home" });
}
