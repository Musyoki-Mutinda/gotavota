import { connect, keyStores, WalletConnection } from "near-api-js";

const nearConfig = {
  networkId: "testnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  contractName: "musyoki_mutinda.testnet", // Replace with your actual contract name
};

let wallet = null;

/**
 * Initialize NEAR Wallet and connection
 */
export async function initNear() {
  if (typeof window === "undefined") {
    // Ensure this function is only run on the client side
    console.error("Window is not defined. Ensure this function runs only on the client side.");
    return null;
  }

  try {
    const near = await connect(nearConfig);
    wallet = new WalletConnection(near, "my-app");

    if (wallet.isSignedIn()) {
      // Store wallet in the window object if logged in
      window.walletConnection = wallet;
      window.accountId = wallet.getAccountId(); // Save account ID for quick access
    }

    return wallet;
  } catch (error) {
    console.error("Error initializing NEAR wallet:", error);
    throw error;
  }
}

/**
 * Login function to authenticate the user and redirect them back
 */
export function login() {
  if (typeof window === "undefined" || !wallet) {
    console.error("Window or wallet is not initialized.");
    return;
  }

  try {
    // Redirect the user to the NEAR Wallet for login
    wallet.requestSignIn({
      contractId: nearConfig.contractName, // Smart contract to interact with
      successUrl: `${window.location.origin}`, // Redirect to the app after successful login
      failureUrl: `${window.location.origin}/login-failed`, // Redirect if login fails
    });
  } catch (error) {
    console.error("Error during login:", error);
  }
}

/**
 * Logout function to sign the user out
 */
export function logout() {
  if (typeof window !== "undefined" && wallet) {
    try {
      wallet.signOut();
      window.walletConnection = null; // Clear the global wallet reference
      window.accountId = null; // Clear the global account ID
      window.location.replace(window.location.origin); // Reload the page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  } else {
    console.error("Window or wallet is not initialized.");
  }
}

/**
 * Helper function to get the current logged-in account ID
 * @returns {string|null} Account ID or null if not signed in
 */
export function getAccountId() {
  if (typeof window !== "undefined" && wallet && wallet.isSignedIn()) {
    return wallet.getAccountId();
  }
  return null;
}
