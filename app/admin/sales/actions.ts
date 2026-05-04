'use server';

import { shopifyAdminFetch } from '@/lib/shopify';

export async function getShopifySalesData() {
  try {
    // 1. 최근 주문 50개 가져오기
    const data = await shopifyAdminFetch({
      path: 'orders.json?status=any&limit=50&fields=total_price,created_at,line_items',
    });

    const orders = data.orders || [];
    
    // 2. 오늘 날짜 계산 (UTC 기준)
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 3. 오늘 매출 합산
    let todaySales = 0;
    let todayOrderCount = 0;
    orders.forEach((order: any) => {
      if (order.created_at.startsWith(todayStr)) {
        todaySales += parseFloat(order.total_price);
        todayOrderCount++;
      }
    });

    // 4. 전체 평균 주문 가치 (AOV) 계산
    const totalSales = orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0);
    const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

    // 5. 인기 상품(SKU) 분석 (간단히)
    const skuMap: Record<string, number> = {};
    orders.forEach((order: any) => {
      order.line_items.forEach((item: any) => {
        skuMap[item.title] = (skuMap[item.title] || 0) + item.quantity;
      });
    });
    
    const topSku = Object.entries(skuMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      success: true,
      todaySales: todaySales.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      aov: avgOrderValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      topSku,
      orderCount: orders.length
    };
  } catch (error: any) {
    console.error('Shopify Action Error:', error);
    return { success: false, error: error.message };
  }
}
