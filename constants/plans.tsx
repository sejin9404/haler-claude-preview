import React from 'react';
import { Package, Truck, Tag, Coins, Crown, RefreshCw, Star } from 'lucide-react';

/**
 * Haler Global Plan Management System
 * Source of Truth: Pass Page Configuration
 */

export const PLAN_LIMITS = {
  light: 2,
  essential: 3,
  daily: 6,
} as const;

export interface PlanFeature {
  icon: React.ReactNode;
  text: string;
}

export interface Plan {
  id: string;
  tag: string;
  title: string;
  boxes: string;
  price: string;
  period: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  { 
    id: 'light', 
    tag: 'Light User', 
    title: 'Light', 
    boxes: '10 xems',
    price: '39',
    period: '/mo',
    features: [
      { icon: <Package className="w-3.5 h-3.5" />, text: '5 xems in a pack × 2' },
      { icon: <Truck className="w-3.5 h-3.5" />, text: 'Free Shipping' },
      { icon: <Tag className="w-3.5 h-3.5" />, text: 'Extra packs for $18' },
      { icon: <Coins className="w-3.5 h-3.5" />, text: 'Upgrade to Daily with credits' }
    ],
    isPopular: false 
  },
  { 
    id: 'essential',
    tag: 'MOST PICK',
    title: 'Ritual',
    boxes: '15 xems',
    price: '49',
    period: '/mo',
    features: [
      { icon: <Package className="w-3.5 h-3.5" />, text: '5 xems in a pack × 3' },
      { icon: <Truck className="w-3.5 h-3.5" />, text: 'Free Shipping' },
      { icon: <Tag className="w-3.5 h-3.5" />, text: 'Extra packs for $15' },
      { icon: <Coins className="w-3.5 h-3.5" />, text: 'Upgrade to Daily with credits' }
    ],
    isPopular: true 
  },
  { 
    id: 'daily', 
    tag: 'BEST VALUE', 
    title: 'Daily', 
    boxes: '30 xems',
    price: '79',
    period: '/mo',
    features: [
      { icon: <Package className="w-3.5 h-3.5" />, text: '5 xems in a pack × 6' },
      { icon: <Truck className="w-3.5 h-3.5" />, text: 'Free Shipping' },
      { icon: <Tag className="w-3.5 h-3.5" />, text: 'Extra packs for $12' },
      { icon: <Crown className="w-3.5 h-3.5" />, text: 'Exclusive Gift' }
    ],
    isPopular: false, 
    isBestValue: true 
  }
];

export const STARTER_KIT = {
  id: 'starter',
  name: 'Starter Kit',
  price: '99',
  period: 'one-time',
  features: [
    'Bliz Device included',
    '15 Flavor Capsules',
    'Charging Cable',
    '30-day Risk-free trial'
  ]
};

export const BENEFIT_PILLS = [
  { icon: <RefreshCw className="w-4 h-4" />, title: 'Pause anytime', description: 'Flexibly manage your pass with one click. Pause or cancel your subscription anytime.' },
  { icon: <Truck className="w-4 h-4" />, title: 'Free shipping', description: 'Free express delivery on all orders. We ensure delivery within 48 hours.' },
  { icon: <Tag className="w-4 h-4" />, title: 'Save up to 34%', description: 'Maximize value with our Daily plan. More hydration leads to bigger savings.' },
  { icon: <Star className="w-4 h-4" />, title: 'Exclusive Gift', description: 'Early access to new flaverages. Exclusive invitations to VIP events.' },
];
