'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Package } from 'lucide-react';

import {
  Order,
  EditingOrder,
  DeliveryAddress,
} from './OrderManagement/types';

import OrderTableHeader from './OrderManagement/OrderTableHeader';
import OrderRow from './OrderManagement/OrderRow';
import SearchBar from './OrderManagement/SearchBar';
import OrderDetailsModal from './OrderManagement/OrderDetailsModal';

const OrderManagement = () => {
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<EditingOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      const s = searchTerm.toLowerCase();
      setFilteredOrders(
        orders.filter(o =>
          o.id.toLowerCase().includes(s) ||
          o.id.slice(0, 8).toLowerCase().includes(s)
        )
      );
    }
  }, [orders, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total_amount,
          status,
          payment_method,
          payment_screenshot_url,
          delivery_address,
          phone,
          shipping_status,
          courier_name,
          courier_contact,
          tracking_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithItems: Order[] = await Promise.all(
        (ordersData || []).map(async (order) => {
          /* ---------- NORMALIZE DELIVERY ADDRESS ---------- */
          const deliveryAddress =
            typeof order.delivery_address === 'object' &&
            order.delivery_address !== null &&
            !Array.isArray(order.delivery_address)
              ? (order.delivery_address as DeliveryAddress)
              : null;

          /* ---------- PROFILE (REGISTERED USERS ONLY) ---------- */
          const { data: userProfile } = order.user_id
            ? await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', order.user_id)
                .maybeSingle()
            : { data: null };

          /* ---------- ORDER ITEMS ---------- */
          const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
              id,
              quantity,
              price,
              product:products ( name )
            `)
            .eq('order_id', order.id);

          /* ---------- CUSTOMER FALLBACK ---------- */
          const customerName =
            userProfile?.full_name ||
            deliveryAddress?.full_name ||
            'Guest Customer';

          return {
            ...order,
            delivery_address: deliveryAddress, // ✅ FIXED
            user_profile: userProfile,
            customer: {
              name: customerName,
              email: userProfile?.email || null,
              phone: order.phone || null, // always from orders table
              is_guest: !userProfile,
            },
            order_items: orderItems || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (order: Order) => {
    setEditingOrder({
      id: order.id,
      status: order.status || 'pending',
      shipping_status: order.shipping_status || 'pending',
      courier_name: order.courier_name || '',
      courier_contact: order.courier_contact || '',
      tracking_id: order.tracking_id || '',
    });
  };

  const handleSave = async () => {
    if (!editingOrder || saving) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: editingOrder.status,
          shipping_status: editingOrder.shipping_status,
          courier_name: editingOrder.courier_name || null,
          courier_contact: editingOrder.courier_contact || null,
          tracking_id: editingOrder.tracking_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingOrder.id);

      if (error) throw error;

      setOrders(prev =>
        prev.map(o =>
          o.id === editingOrder.id
            ? { ...o, ...editingOrder }
            : o
        )
      );

      setEditingOrder(null);
      toast({ title: 'Order updated successfully' });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="text-center py-8">
        <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
        Loading orders...
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Management</span>
          </CardTitle>
          <CardDescription>
            Manage orders and shipping status
          </CardDescription>

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <OrderTableHeader />
              <TableBody>
                {filteredOrders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    editingOrder={editingOrder}
                    saving={saving}
                    onEdit={handleEdit}
                    onSave={handleSave}
                    onCancelEdit={() => setEditingOrder(null)}
                    onFieldChange={(f, v) =>
                      setEditingOrder(prev =>
                        prev ? { ...prev, [f]: v } : prev
                      )
                    }
                    onView={() => setSelectedOrder(order)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </>
  );
};

export default OrderManagement;
