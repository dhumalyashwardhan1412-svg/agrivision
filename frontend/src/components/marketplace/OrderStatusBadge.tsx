import React from 'react';
import { OrderStatus } from '../../types';
import { Badge } from '../ui/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="amber">PENDING CONFIRMATION</Badge>;
    case 'CONFIRMED':
      return <Badge variant="blue">ORDER CONFIRMED</Badge>;
    case 'PACKED':
      return <Badge variant="purple">HARVESTED & PACKED</Badge>;
    case 'IN_TRANSIT':
      return <Badge variant="amber">IN TRANSIT 🚚</Badge>;
    case 'DELIVERED':
      return <Badge variant="green">DELIVERED ✅</Badge>;
    case 'CANCELLED':
      return <Badge variant="red">CANCELLED</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};
