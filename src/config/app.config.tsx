import {
  Boxes,
  ClipboardList,
  LayoutGrid,
  LayoutList,
  Package,
  Settings2,
  UsersRound,
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig  = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    children: [
      { title: 'Default', path: '/dashboard' },
      { title: 'Dark Sidebar', path: '/dark-sidebar' },
    ],
  },
  { heading: 'Store Inventory' },

  {
    title: 'Products',
    icon: Package,
    children: [
      
      {
        title: 'Product',
        path: '/products',
      },
      {
        title: 'Categories',
        path: '/products/categories',
      },
      {
        title: 'Brands',
        path: '/products/brands',
      }
 
      
    ],
  },
  {
    title: 'Inventory',
    icon: Boxes,
    children: [
      {
        title: 'All Stock',
        path: '/all-stock',
      },
      {
        title: 'Current Stock',
        path: '/current-stock',
      },
      {
        title: 'Inbound Stock',
        path: '/inbound-stock',
      },
      {
        title: 'Outbound Stock',
        path: '/outbound-stock',
      },
      {
        title: 'Stock Planner',
        path: '/stock-planner',
      },
      {
        title: 'Per Product Stock',
        path: '/per-product-stock',
      },
      {
        title: 'Track Shipping',
        path: '/track-shipping',
      },
      {
        title: 'Create Shipping Label',
        path: '/create-shipping-label',
      },
    ],
  },

  {
    title: 'Categories',
    icon: LayoutList,
    children: [
      {
        title: 'Category List',
        path: '/category-list',
      },
      {
        title: 'Category Details',
        path: '/category-details',
      },
      {
        title: 'Create Category',
        path: '/create-category',
      },
      {
        title: 'Edit Category',
        path: '/edit-category',
      }
    ],
  },
  {
    title: 'Orders',
    icon: ClipboardList,
    children: [
      {
        title: 'Order List',
        path: '/order-list',
      },
      {
        title: 'Order List - Products',
        path: '/order-list-products',
      },
      {
        title: 'Order Details',
        path: '/order-details', 
      },
      {
        title: 'Order Tracking',
        path: '/order-tracking',
      },
    ],
  },
  {
    title: 'Customer',
    icon: UsersRound,
    children: [
      {
        title: 'Customer List',
        path: '/customer-list',
      },
      {
        title: 'Customer Details',
        path: '/customer-list-details',
      },
    ],
  },
  {
    title: 'Settings',
    icon: Settings2,
    children: [
      {
        title: 'Settings(Modal View)',
        path: '/settings-modal',
      } 
    ]
  }
];
