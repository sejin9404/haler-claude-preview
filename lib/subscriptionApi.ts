/**
 * Haler Shopify Subscription API Service (Mock)
 * 
 * This service handles communication between the Haler Boarding Pass and 
 * the external Shopify Subscription management app.
 */

export interface SubscriptionConfig {
  planId: string;
  flavors: Array<{ name: string; qty: number }>;
}

export const subscriptionService = {
  /**
   * Updates the subscription configuration on the Shopify server.
   */
  async updateSubscription(config: SubscriptionConfig): Promise<{ success: boolean; data?: any }> {
    console.log("[Shopify API] Updating subscription configuration...", config);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[Shopify API] Update successful.");
        resolve({ success: true, data: config });
      }, 1500);
    });
  },

  /**
   * Skips the next delivery for the user.
   */
  async skipSubscription(nextDate: string): Promise<{ success: boolean }> {
    console.log(`[Shopify API] Skipping next delivery. New date: ${nextDate}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[Shopify API] Skip successful.");
        resolve({ success: true });
      }, 1500);
    });
  },

  /**
   * Cancels/Stops the subscription plan.
   */
  async cancelSubscription(): Promise<{ success: boolean }> {
    console.log("[Shopify API] Stopping subscription plan...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[Shopify API] Cancellation successful.");
        resolve({ success: true });
      }, 1500);
    });
  },

  /**
   * Restarts the subscription plan.
   */
  async restartSubscription(): Promise<{ success: boolean }> {
    console.log("[Shopify API] Restarting subscription plan...");
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("[Shopify API] Restart successful.");
        resolve({ success: true });
      }, 1500);
    });
  },

  /**
   * Returns the URL for the external subscription management portal.
   */
  getPortalUrl(): string {
    return "https://shopify-app-portal.haler.com/account";
  },

  /**
   * Redirects the user to the external shipping/payment management portal.
   */
  redirectToPortal(): void {
    const url = this.getPortalUrl();
    console.log(`[Shopify Redirect] Navigating to: ${url}`);
    alert(`[Integration Ready]\nRedirecting to Shopify Portal:\n${url}`);
  },

  /**
   * Redirects the user to the general purchase/store page.
   */
  redirectToStore(): void {
    const url = "https://haler.com/collections/all";
    console.log(`[Shopify Redirect] Navigating to Store: ${url}`);
    alert(`[Integration Ready]\nRedirecting to Haler Store:\n${url}`);
  }
};
