import { useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from './types';

interface Props {
  order: Order;
  onClose: () => void;
}

const GST_RATE = 0.18;

const OrderDetailsModal = ({ order, onClose }: Props) => {
  /* ================= ESC CLOSE ================= */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  /* ================= ADDRESS FORMAT ================= */
  const address =
    order.delivery_address
      ? [
          order.delivery_address.address_line_1,
          order.delivery_address.address_line_2,
          order.delivery_address.city,
          order.delivery_address.state,
          order.delivery_address.postal_code,
        ]
          .filter(Boolean)
          .join(', ')
      : '';

  /* ================= PRICE CALC ================= */
  const subTotal = useMemo(
    () =>
      order.order_items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.price),
        0
      ),
    [order]
  );

  const gst = subTotal * GST_RATE;
  const halfGST = gst / 2;
  const total = subTotal + gst;

  /* ================= PDF ================= */
  const downloadInvoice = () => {
    const doc = new jsPDF('p', 'mm', 'a4');

    const invoiceNo = `INV-${order.id.slice(0, 8).toUpperCase()}`;
    const date = new Date(order.created_at).toLocaleDateString('en-IN');

    /* ---------- HEADER ---------- */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Moms by Goo Goo Foods', 14, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // doc.text('Logistics • Delivery • Commerce Enablement', 14, 24);
    // doc.text('GSTIN: 14XXXXX1234X1Z5', 14, 29);

    doc.text(`Invoice No: ${invoiceNo}`, 140, 18);
    doc.text(`Invoice Date: ${date}`, 140, 24);

    doc.setDrawColor(220);
    doc.line(14, 34, 196, 34);

    /* ---------- CUSTOMER ---------- */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Billed To', 14, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.customer.name, 14, 50);

    if (order.customer.email) {
      doc.text(order.customer.email, 14, 56);
    }

    if (order.customer.phone) {
      doc.text(`Phone: ${order.customer.phone}`, 14, 62);
    }

    doc.text(`Address: ${address}`, 14, 68, { maxWidth: 110 });

    /* ---------- ITEMS TABLE ---------- */
    autoTable(doc, {
      startY: 80,
      tableWidth: 160,
      margin: { left: 25 },

      head: [[
        'Item Description',
        'Qty',
        'Unit Price (INR)',
        'Amount (INR)',
      ]],

      body: order.order_items.map(item => {
        const qty = Number(item.quantity);
        const price = Number(item.price);
        return [
          item.product?.name || '',
          qty.toString(),
          price.toFixed(2),
          (qty * price).toFixed(2),
        ];
      }),

      theme: 'plain',

      styles: {
        fontSize: 10,
        cellPadding: 6,
        textColor: 30,
      },

      headStyles: {
        fillColor: [245, 247, 250],
        textColor: 20,
        fontStyle: 'bold',
      },

      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
    });

    const y = (doc as any).lastAutoTable.finalY + 10;

    /* ---------- TOTAL BOX ---------- */
    doc.setDrawColor(220);
    doc.rect(120, y, 70, 40);

    doc.setFontSize(10);
    doc.text('Subtotal (INR)', 125, y + 8);
    doc.text(subTotal.toFixed(2), 185, y + 8, { align: 'right' });

    doc.text('CGST (9%)', 125, y + 16);
    doc.text(halfGST.toFixed(2), 185, y + 16, { align: 'right' });

    doc.text('SGST (9%)', 125, y + 24);
    doc.text(halfGST.toFixed(2), 185, y + 24, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount (INR)', 125, y + 34);
    doc.text(total.toFixed(2), 185, y + 34, { align: 'right' });

    /* ---------- FOOTER ---------- */
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      'This is a computer-generated invoice. No signature required.',
      14,
      285
    );

    doc.save(`${invoiceNo}.pdf`);
  };

  /* ================= UI ================= */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}               // 👈 close on backdrop click
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 👈 prevent close inside
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              Order #{order.id.slice(0, 8)}
            </h2>
            <div className="flex gap-4 mt-1 text-sm text-gray-500">
              <span>Status: <b>{order.status}</b></span>
              <span>Shipping: <b>{order.shipping_status}</b></span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* CUSTOMER */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Customer Details
            </h3>
            <p className="font-medium">{order.customer.name}</p>

            {order.customer.email && (
              <p className="text-sm text-gray-600">
                {order.customer.email}
              </p>
            )}

            {order.customer.phone && (
              <p className="text-sm">
                📞 {order.customer.phone}
              </p>
            )}

            {order.customer.is_guest && (
              <p className="text-xs font-medium text-orange-600">
                Guest Order
              </p>
            )}
          </section>

          {/* ITEMS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
            <div className="border rounded-lg divide-y">
              {order.order_items.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between px-4 py-3 text-sm"
                >
                  <span>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(Number(item.quantity) * Number(item.price)).toFixed(2)} INR
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* TOTALS */}
          <section className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{subTotal.toFixed(2)} INR</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>GST (18%)</span>
              <span>{gst.toFixed(2)} INR</span>
            </div>
            <div className="flex justify-between font-semibold text-base mt-2">
              <span>Total</span>
              <span>{total.toFixed(2)} INR</span>
            </div>
          </section>

          {/* ADDRESS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Delivery Address
            </h3>
            <p className="text-sm text-gray-600">{address}</p>
          </section>

          {/* COURIER */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Courier Information
            </h3>
            {order.courier_name ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.courier_name}</p>
                <p>{order.courier_contact}</p>
                <p>Tracking ID: {order.tracking_id}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Not assigned</p>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <Button onClick={downloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download Invoice (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
