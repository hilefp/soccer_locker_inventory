import {
  BarChart,
  Boxes,
  ClipboardList,
  ClubIcon,
  LayoutGrid,
  Package,
  Settings2,
  ShoppingCart,
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  {
    title: 'Dashboards',
    icon: LayoutGrid,
    path: '/dashboard',
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
      },
    ],
  },
  {
    title: 'Inventory',
    icon: Boxes,
    children: [
      { title: 'Inventory', path: '/inventory' },
      { title: 'Stock Entries', path: '/inventory/stock-entries/new' },
      {
        title: 'Warehouse Management',
        path: '/inventory/warehouses',
      },
      {
        title: 'Stock Movements',
        path: '/inventory/stock-movements',
      },
    ],
  },
  {
    title: 'Orders',
    icon: ClipboardList,
    children: [
      { title: 'Order List', path: '/orders' },
      { title: 'Order Tracking', path: '/orders/tracking' },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart,
    children: [
      { title: 'Products Report', path: '/reports/products' },
      { title: 'Stock Report', path: '/reports/stock' },
      { title: 'General Sales', path: '/reports/sales/general' },
      { title: 'Club Sales', path: '/reports/sales/club' },
    ],
  },
  // {
  //   title: 'Inventory Template',
  //   icon: Boxes,
  //   children: [
  //     {
  //       title: 'All Stock',
  //       path: '/all-stock',
  //     },
  //     {
  //       title: 'Current Stock',
  //       path: '/current-stock',
  //     },
  //     {
  //       title: 'Inbound Stock',
  //       path: '/inbound-stock',
  //     },
  //     {
  //       title: 'Outbound Stock',
  //       path: '/outbound-stock',
  //     },
  //     {
  //       title: 'Stock Planner',
  //       path: '/stock-planner',
  //     },
  //     {
  //       title: 'Per Product Stock',
  //       path: '/per-product-stock',
  //     },
  //     {
  //       title: 'Track Shipping',
  //       path: '/track-shipping',
  //     },
  //     {
  //       title: 'Create Shipping Label',
  //       path: '/create-shipping-label',
  //     },
  //   ],
  // },
  // {
  //   title: 'Orders',
  //   icon: ClipboardList,
  //   children: [
  //     {
  //       title: 'Order List',
  //       path: '/order-list',
  //     },
  //     {
  //       title: 'Order List - Products',
  //       path: '/order-list-products',
  //     },
  //     {
  //       title: 'Order Details',
  //       path: '/order-details',
  //     },
  //     {
  //       title: 'Order Tracking',
  //       path: '/order-tracking',
  //     },
  //   ],
  // },
  // {
  //   title: 'Customer',
  //   icon: UsersRound,
  //   children: [
  //     {
  //       title: 'Customer List',
  //       path: '/customer-list',
  //     },
  //     {
  //       title: 'Customer Details',
  //       path: '/customer-list-details',
  //     },
  //   ],
  // },
  {
    title: 'Clubs',
    icon: ClubIcon,
    children: [
      {
        title: 'All clubs',
        path: '/clubs',
      },
    ],
  },
  {
    title: 'Shop',
    icon: ShoppingCart,
    children: [
      {
        title: 'Customers',
        path: '/shop/customers',
      },
    ],
  },
  {
    title: 'Settings',
    icon: Settings2,
    children: [
      {
        title: 'Users',
        path: '/settings/users',
      },
    ],
  },
];
