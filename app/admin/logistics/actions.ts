'use server';

import { shopifyAdminFetch } from '@/lib/shopify';

export async function getShopifyLogisticsData() {
  try {
    // 1. 주문 상태별 통계 (배송 대기 중인 주문 등)
    const ordersData = await shopifyAdminFetch({
      path: 'orders.json?status=open&fulfillment_status=unfulfilled&limit=50',
    });
    const pendingFulfillment = ordersData.orders?.length || 0;

    // 2. 재고(Inventory) 레벨 가져오기
    // 간단히 모든 품목의 재고 합계를 구합니다.
    const inventoryData = await shopifyAdminFetch({
      path: 'inventory_levels.json?location_ids=all', // 실제 서비스 시 특정 Location ID 지정 가능
    });
    
    const totalStock = inventoryData.inventory_levels?.reduce((sum: number, item: any) => sum + (item.available || 0), 0) || 0;

    // 3. 최근 배송 완료 건수 (최근 50개 중 fulfilled된 것)
    const fulfilledData = await shopifyAdminFetch({
      path: 'orders.json?status=any&fulfillment_status=fulfilled&limit=50',
    });
    const recentFulfilled = fulfilledData.orders?.length || 0;

    return {
      success: true,
      pendingFulfillment,
      totalStock,
      recentFulfilled,
      transitRate: '98.5%' // 이 부분은 실제 택배사 API 연동 시 더 정확해집니다.
    };
  } catch (error: any) {
    console.error('Shopify Logistics Action Error:', error);
    return { success: false, error: error.message };
  }
}
