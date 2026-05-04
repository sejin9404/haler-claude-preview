/**
 * Shopify API Library (2024+ Client Credentials Flow)
 * This logic exchanges Client ID/Secret for a temporary access token programmatically.
 */

const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;

export async function getShopifyAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !SHOP_DOMAIN) {
    throw new Error('Missing Shopify environment variables');
  }

  const response = await fetch(`https://${SHOP_DOMAIN}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Shopify Token Exchange Error:', data);
    throw new Error(data.error_description || 'Failed to get Shopify access token');
  }

  return data.access_token;
}

/**
 * Generic Shopify Admin API fetcher
 */
export async function shopifyAdminFetch({
  path,
  method = 'GET',
  body,
}: {
  path: string;
  method?: string;
  body?: any;
}) {
  const token = await getShopifyAccessToken();
  const url = `https://${SHOP_DOMAIN}/admin/api/2024-04/${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Shopify API Error (${path}):`, errorData);
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  return response.json();
}
