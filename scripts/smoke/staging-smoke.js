#!/usr/bin/env node
/* eslint-disable no-console */

const baseUrl = process.env.STAGING_API_BASE_URL;

if (!baseUrl) {
  console.error('STAGING_API_BASE_URL is required');
  process.exit(1);
}

async function checkJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${url} failed (${res.status}): ${text}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    const contentType = res.headers.get('content-type') || 'unknown content-type';
    const preview = text.replace(/\s+/g, ' ').slice(0, 200);
    throw new Error(`${url} did not return JSON (${contentType}): ${preview}`);
  }
}

function apiUrl(path) {
  return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
}

(async () => {
  try {
    const menu = await checkJson(apiUrl('api/menu?outletId=outlet-b6-chicken-rice'));
    if (!Array.isArray(menu.items) || menu.items.length === 0) {
      throw new Error('Menu smoke check failed: no items returned');
    }

    const slots = await checkJson(
      apiUrl('api/pickup-slots?outletId=outlet-b6-chicken-rice&date=2099-01-01'),
    );
    if (!Array.isArray(slots) || slots.length === 0) {
      throw new Error('Slots smoke check failed: no slots returned');
    }

    const orderPayload = {
      outletId: 'outlet-b6-chicken-rice',
      slotDate: '2099-01-01',
      slotId: slots[0].slotId,
      items: [{ itemId: menu.items[0].itemId, quantity: 1 }],
      customerId: 'smoke-customer',
    };

    const order = await checkJson(apiUrl('api/orders'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'customer',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!order.orderId) {
      throw new Error('Order smoke check failed: missing orderId');
    }

    const vendorOrders = await checkJson(
      apiUrl('api/vendor/orders?vendorOutletId=outlet-b6-chicken-rice&slotDate=2099-01-01'),
      {
        headers: {
          'x-user-role': 'vendor',
          'x-vendor-outlet-id': 'outlet-b6-chicken-rice',
        },
      },
    );

    if (!Array.isArray(vendorOrders)) {
      throw new Error('Vendor smoke check failed: invalid payload');
    }

    console.log('✅ Staging smoke checks passed');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Staging smoke checks failed: ${error.message}`);
    process.exit(1);
  }
})();
