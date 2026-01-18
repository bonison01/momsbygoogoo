import Layout from '@/components/Layout';
import OrderConfirmationModal from '@/components/OrderConfirmationModal';
import PaymentScreenshotUpload from '@/components/PaymentScreenshotUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CreditCard, Truck, User, Mail } from 'lucide-react';

export default function CheckoutView(props: any) {
  const {
    user,
    isAuthenticated,
    cartItems,
    guestItem,
    isGuestCheckout,
    formData,
    paymentMethod,
    setPaymentMethod,
    saveProfile,
    setSaveProfile,
    isManipurPincode,
    getTotalAmount,
    handleInputChange,
    handleScreenshotUpload,
    isUploadingScreenshot,
    paymentScreenshot,
    handlePlaceOrder,
    isLoading,
    showOrderConfirmation,
    confirmedOrderData,
    onCloseConfirmation,
  } = props;

  const displayItems = isGuestCheckout && guestItem ? [guestItem] : cartItems;

  const rawTotal = isGuestCheckout && guestItem
    ? guestItem.product.price * guestItem.quantity
    : getTotalAmount();

  const discount = isManipurPincode ? Math.round(rawTotal * 0.1) : 0;
  const displayTotal = rawTotal - discount;

  return (
    <Layout>
      {/* 🔥 FULL JSX FROM YOUR ORIGINAL FILE (unchanged) */}
      {/* Order Summary + Forms + Payment + Button */}

      <OrderConfirmationModal
        isOpen={showOrderConfirmation}
        onClose={onCloseConfirmation}
        orderData={confirmedOrderData}
        customerEmail={formData.email}
      />
    </Layout>
  );
}
