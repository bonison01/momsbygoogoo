// src/pages/CheckoutFormPage.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PaymentScreenshotUpload from '@/components/PaymentScreenshotUpload';
import { CreditCard, Truck } from 'lucide-react';

interface CheckoutFormPageProps {
  isAuthenticated: boolean;
  user: any;
  profile: any;
  cartItems: any[];
  guestItem: any;
  getTotalAmount: () => number;
  isLoading: boolean;
  onPlaceOrder: (payload: any) => void;
}

const CheckoutFormPage = ({
  isAuthenticated,
  user,
  profile,
  cartItems,
  guestItem,
  getTotalAmount,
  isLoading,
  onPlaceOrder,
}: CheckoutFormPageProps) => {
  /* ---------------- STATE ---------------- */
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
  });

  /* ---------------- PREFILL PROFILE ---------------- */
  useEffect(() => {
    if (!profile) return;

    setFormData((prev) => ({
      ...prev,
      full_name: profile.full_name || '',
      email: user?.email || '',
      address_line_1: profile.address_line_1 || '',
      address_line_2: profile.address_line_2 || '',
      city: profile.city || '',
      state: profile.state || '',
      postal_code: profile.postal_code || '',
      phone: profile.phone || '',
    }));
  }, [profile, user]);

  /* ---------------- HELPERS ---------------- */
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScreenshotUpload = (file: File) => {
    setIsUploading(true);
    setPaymentScreenshot(file);
    setIsUploading(false);
  };

  const isManipurPincode = formData.postal_code.startsWith('795');

  const rawTotal = guestItem
    ? guestItem.product.price * guestItem.quantity
    : getTotalAmount();

  const discount = isManipurPincode ? Math.round(rawTotal * 0.1) : 0;
  const displayTotal = rawTotal - discount;

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = () => {
    onPlaceOrder({
      formData,
      paymentMethod,
      paymentScreenshot,
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ================= ORDER SUMMARY ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(guestItem ? [guestItem] : cartItems).map((item, index) => (
            <div key={index} className="flex justify-between">
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>₹{item.product.price * item.quantity}</span>
            </div>
          ))}

          <div className="border-t pt-4 space-y-1">
            {discount > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>Manipur Discount (10%)</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{displayTotal}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= CHECKOUT FORM ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CUSTOMER INFO */}
          <div>
            <Label>Full Name *</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
            />
          </div>

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <Label>Phone *</Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          {/* ADDRESS */}
          <div>
            <Label>Address Line 1 *</Label>
            <Input
              value={formData.address_line_1}
              onChange={(e) =>
                handleInputChange('address_line_1', e.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            <div>
              <Label>State *</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Postal Code *</Label>
            <Input
              value={formData.postal_code}
              onChange={(e) =>
                handleInputChange('postal_code', e.target.value)
              }
            />
          </div>

          {/* PAYMENT METHOD */}
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as any)}
          >
            <div
              className={`flex items-center gap-2 p-3 border rounded-lg ${
                !isManipurPincode ? 'opacity-50' : ''
              }`}
            >
              <RadioGroupItem
                value="cod"
                disabled={!isManipurPincode}
              />
              <Truck className="h-5 w-5" />
              <span>Cash on Delivery</span>
            </div>

            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <RadioGroupItem value="online" />
              <CreditCard className="h-5 w-5" />
              <span>Online Payment (UPI)</span>
            </div>
          </RadioGroup>

          {/* PAYMENT SCREENSHOT */}
          {paymentMethod === 'online' && (
            <PaymentScreenshotUpload
              uploadedFile={paymentScreenshot}
              onScreenshotUpload={handleScreenshotUpload}
              isUploading={isUploading}
            />
          )}

          {/* SUBMIT */}
          <Button
            className="w-full bg-black text-white"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading
              ? 'Processing Order...'
              : `Place Order – ₹${displayTotal}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutFormPage;
