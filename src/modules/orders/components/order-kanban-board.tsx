'use client';

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Package,
  Printer,
  ShoppingBag,
  Cog,
  Truck,
  CheckCircle,
  Eye,
  User,
  Clock,
} from 'lucide-react';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import {
  Order,
  OrderStatus,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_FLOW,
  KANBAN_STATUS_ORDER,
} from '@/modules/orders/types';
import { useUpdateOrderStatus } from '@/modules/orders/hooks/use-orders';
import { formatDate, timeAgo } from '@/shared/lib/helpers';
import { cn } from '@/shared/lib/utils';

// Status icons mapping
const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  NEW: Package,
  PRINT: Printer,
  PICKING_UP: ShoppingBag,
  PROCESSING: Cog,
  SHIPPING: Truck,
  DELIVERED: CheckCircle,
  MISSING: Package,
  REFUND: Package,
};

// Status colors for columns
const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: 'border-blue-500',
  PRINT: 'border-gray-500',
  PICKING_UP: 'border-yellow-500',
  PROCESSING: 'border-purple-500',
  SHIPPING: 'border-cyan-500',
  DELIVERED: 'border-green-500',
  MISSING: 'border-red-500',
  REFUND: 'border-red-500',
};

interface OrderCardProps {
  order: Order;
  isDragging?: boolean;
  onViewDetails: (order: Order) => void;
}

function OrderCard({ order, isDragging, onViewDetails }: OrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const itemCount = order._count?.items || order.items?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      <div className="space-y-2">
        {/* Order Number & Time */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {order.orderNumber}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {timeAgo(order.createdAt)}
                </span>
              </TooltipTrigger>
              <TooltipContent>{formatDate(new Date(order.createdAt))}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-accent/50 h-6 w-6 shrink-0">
            <User className="size-3 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground truncate">
            {order.shippingName || order.customerUser?.email || 'N/A'}
          </span>
        </div>

        {/* Items & Total */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" appearance="outline" size="sm">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Badge>
          <span className="text-sm font-medium text-foreground">
            ${order.total.toFixed(2)} {order.currency}
          </span>
        </div>

        {/* Club Badge */}
        {order.club && (
          <Badge variant="info" appearance="light" size="sm" className="rounded-full">
            {order.club.name}
          </Badge>
        )}

        {/* View Details Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order);
          }}
        >
          <Eye className="size-3.5 mr-1" />
          View Details
        </Button>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  status: OrderStatus;
  orders: Order[];
  onViewDetails: (order: Order) => void;
}

function KanbanColumn({ status, orders, onViewDetails }: KanbanColumnProps) {
  const Icon = STATUS_ICONS[status];
  const borderColor = STATUS_COLORS[status];

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg border-t-4',
        borderColor
      )}
    >
      <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{ORDER_STATUS_LABELS[status]}</span>
        </div>
        <Badge variant="secondary" size="sm" className="rounded-full">
          {orders.length}
        </Badge>
      </CardHeader>

      <ScrollArea className="flex-1 p-2" style={{ height: 'calc(100vh - 280px)' }}>
        <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onViewDetails={onViewDetails} />
            ))}
            {orders.length === 0 && (
              <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                No orders
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

interface OrderKanbanBoardProps {
  orders: Order[];
  isLoading?: boolean;
  statuses?: OrderStatus[];
}

export function OrderKanbanBoard({
  orders,
  isLoading,
  statuses = KANBAN_STATUS_ORDER,
}: OrderKanbanBoardProps) {
  const navigate = useNavigate();
  const updateStatusMutation = useUpdateOrderStatus();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, Order[]> = {} as Record<OrderStatus, Order[]>;
    statuses.forEach((status) => {
      grouped[status] = orders.filter((order) => order.status === status);
    });
    return grouped;
  }, [orders, statuses]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const order = orders.find((o) => o.id === active.id);
    setActiveOrder(order || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;

    const orderId = active.id as string;
    const order = orders.find((o) => o.id === orderId);

    if (!order) return;

    // Find the target column (status) based on where the item was dropped
    const targetOrderId = over.id as string;
    const targetOrder = orders.find((o) => o.id === targetOrderId);

    if (targetOrder && targetOrder.status !== order.status) {
      // Check if transition is valid
      const validTransitions = ORDER_STATUS_FLOW[order.status];
      if (validTransitions.includes(targetOrder.status)) {
        updateStatusMutation.mutate({
          id: orderId,
          status: targetOrder.status,
          note: `Status changed from ${ORDER_STATUS_LABELS[order.status]} to ${ORDER_STATUS_LABELS[targetOrder.status]} via drag and drop`,
        });
      }
    }
  };

  const handleViewDetails = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            orders={ordersByStatus[status]}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOrder && (
          <OrderCard order={activeOrder} isDragging onViewDetails={() => {}} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
