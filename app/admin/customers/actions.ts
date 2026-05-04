'use server';

import { shopifyAdminFetch } from '@/lib/shopify';

export async function getShopifyCustomerData() {
  try {
    // 1. 고객 리스트 가져오기 (최신 50명)
    const customerData = await shopifyAdminFetch({
      path: 'customers.json?limit=50',
    });
    const customers = customerData.customers || [];

    // 2. 주문 리스트 가져오기 (LTV 및 구독 분석용)
    const orderData = await shopifyAdminFetch({
      path: 'orders.json?status=any&limit=250',
    });
    const orders = orderData.orders || [];

    // 3. 지표 계산
    let totalSubscriptionRevenue = 0;
    let subscriptionCount = 0;
    const customerStats: Record<number, any> = {};

    orders.forEach((order: any) => {
      const cid = order.customer?.id;
      if (!cid) return;

      if (!customerStats[cid]) {
        customerStats[cid] = { totalSpent: 0, orderCount: 0, firstOrder: order.created_at, lastOrder: order.created_at };
      }

      const orderTotal = parseFloat(order.total_price);
      customerStats[cid].totalSpent += orderTotal;
      customerStats[cid].orderCount += 1;
      
      if (new Date(order.created_at) < new Date(customerStats[cid].firstOrder)) customerStats[cid].firstOrder = order.created_at;
      if (new Date(order.created_at) > new Date(customerStats[cid].lastOrder)) customerStats[cid].lastOrder = order.created_at;

      // 구독 주문 판별 (예: 'Subscription' 태그나 특정 상품명 포함 여부 - 여기선 예시로 모든 주문 합산)
      totalSubscriptionRevenue += orderTotal;
    });

    // 4. 최종 데이터 매핑
    const formattedCustomers = customers.map((c: any) => {
      const stats = customerStats[c.id] || { totalSpent: 0, orderCount: 0, firstOrder: '-', lastOrder: '-' };
      return {
        id: c.id,
        name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
        email: c.email,
        totalSpent: stats.totalSpent,
        orderCount: stats.orderCount,
        lastOrder: stats.lastOrder,
        status: c.state === 'disabled' ? 'Inactive' : 'Active',
        tags: c.tags || ''
      };
    });

    // 5. 지표 합계 계산
    const totalSpentSum = Object.values(customerStats).reduce((sum, s) => sum + s.totalSpent, 0);
    const avgLTV = customers.length > 0 ? totalSpentSum / customers.length : 0;
    const avgSubRev = orders.length > 0 ? totalSpentSum / orders.length : 0;

    return {
      success: true,
      customers: formattedCustomers,
      metrics: {
        totalCustomers: customers.length,
        avgLTV: avgLTV.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        avgSubRevenue: avgSubRev.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
        subRatios: null, 
        avgDuration: null 
      }
    };
  } catch (error: any) {
    console.error('Shopify Customer Action Error:', error);
    return { success: false, error: error.message };
  }
}
