import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Eye } from 'lucide-react';
import { Order, EditingOrder } from './types';

interface Props {
  order: Order;
  editingOrder: EditingOrder | null;
  saving: boolean;
  onEdit: (order: Order) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onFieldChange: (field: keyof EditingOrder, value: string) => void;
  onView: () => void;
}

const OrderRow = ({
  order,
  editingOrder,
  saving,
  onEdit,
  onSave,
  onCancelEdit,
  onFieldChange,
  onView,
}: Props) => {
  const isEditing = editingOrder?.id === order.id;

  const itemCount = order.order_items.length;

  const itemNames = order.order_items
    .map(item => item.product?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <TableRow>
      {/* Order ID */}
      <TableCell>#{order.id.slice(0, 8)}</TableCell>

      {/* Customer */}
      <TableCell>
        <div className="flex flex-col">
          <p className="font-medium">{order.customer.name}</p>

          {order.customer.email && (
            <p className="text-sm text-muted-foreground">
              {order.customer.email}
            </p>
          )}

          {order.customer.phone && (
            <p className="text-sm text-muted-foreground">
              📞 {order.customer.phone}
            </p>
          )}

          {order.customer.is_guest && (
            <span className="text-xs font-medium text-orange-600">
              Guest Order
            </span>
          )}
        </div>
      </TableCell>

      {/* Items */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">
            {itemCount} item{itemCount > 1 ? 's' : ''}
          </span>

          {itemNames && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {itemNames}
            </span>
          )}
        </div>
      </TableCell>

      {/* Amount */}
      <TableCell>₹{order.total_amount}</TableCell>

      {/* Payment */}
      <TableCell>{order.payment_method}</TableCell>

      {/* Order Status */}
      <TableCell>{order.status}</TableCell>

      {/* Shipping Status */}
      <TableCell>{order.shipping_status}</TableCell>

      {/* Courier Info */}
      <TableCell>
        {order.courier_name ? (
          <>
            <p>{order.courier_name}</p>
            <p className="text-sm text-muted-foreground">
              {order.courier_contact}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.tracking_id}
            </p>
          </>
        ) : (
          '—'
        )}
      </TableCell>

      {/* Actions */}
      <TableCell className="space-x-1">
        <Button size="sm" variant="outline" onClick={onView}>
          <Eye className="h-4 w-4" />
        </Button>

        {isEditing ? (
          <>
            <Button size="sm" onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onEdit(order)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default OrderRow;
