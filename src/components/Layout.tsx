import { ReactNode, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import CartSidebar from "./CartSidebar"; 
import { useCart } from "@/hooks/useCartContext";  // <-- IMPORTANT

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { cartCount } = useCart();       // <-- GET CART COUNT
  const [cartOpen, setCartOpen] = useState(false);  // <-- OPEN SIDEBAR

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />

      <main className="flex-grow w-full">{children}</main>

      <Footer />

      {/* CART SIDEBAR */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.aisensy.com/aaasob"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          className="fixed bottom-6 right-6 z-40 rounded-full h-14 w-14 bg-[#14710F] text-white hover:bg-[#0f5c0c] shadow-lg flex items-center justify-center"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </Button>
      </a>

      {/* Floating Cart Button */}
      <Button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-24 right-6 z-40 rounded-full h-14 w-14 bg-[#14710F] text-white hover:bg-[#0f5c0c] shadow-lg flex items-center justify-center"
      >
        <ShoppingCart className="h-6 w-6" />

        {/* ⭐ CART COUNT BADGE (same style as Shop page) */}
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Button>
    </div>
  );
};

export default Layout;
