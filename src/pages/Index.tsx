import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCartContext";

import Layout from "../components/Layout";
import BannerCarousel from "../components/BannerCarousel";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ⭐ Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------
interface Product {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
  image_url: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean;
  stock_quantity: number | null;
}

// -----------------------------------------------------
// MAIN PAGE
// -----------------------------------------------------
const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart, refreshCart } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Instagram Feed
  const [instagramImages, setInstagramImages] = useState<any[]>([]);

  // ⭐ FALLBACK IMAGES (in case API fails)
  const fallbackInstagram = [
    "/insta/1.jpg",
    "/insta/2.jpg",
    "/insta/3.jpg",
    "/insta/4.jpg",
    "/insta/5.jpg",
    "/insta/6.jpg",
  ];

  // -----------------------------------------------------
  // FETCH DATA
  // -----------------------------------------------------
  useEffect(() => {
    fetchFeaturedProducts();
    fetchInstagramPosts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("featured", true)
      .limit(12);

    if (!error) setFeaturedProducts(data || []);
  };

  // ⭐ Fully working Instagram feed WITH FALLBACK
  const fetchInstagramPosts = async () => {
    try {
      const res = await fetch(
        "https://instafeed.mouadalam.com/api?username=momsbygoogoofoods"
      );
      const json = await res.json();

      if (json?.data?.length > 0) {
        setInstagramImages(json.data.slice(0, 9));
      } else {
        setInstagramImages(
          fallbackInstagram.map((url) => ({
            media_url: url,
            permalink: "#",
          }))
        );
      }
    } catch (err) {
      console.error("Instagram Fetch Error:", err);

      setInstagramImages(
        fallbackInstagram.map((url) => ({
          media_url: url,
          permalink: "#",
        }))
      );
    }
  };

  // -----------------------------------------------------
  // CART HANDLERS
  // -----------------------------------------------------
  const handleAddToCart = async (product: Product, e?: any) => {
    if (e) e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      toast({ title: "Added!", description: `${product.name} added to cart.` });
      await refreshCart();
    } catch {
      toast({
        title: "Error",
        description: "Failed to add.",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      await refreshCart();
      navigate("/checkout");
    } catch {
      toast({
        title: "Error",
        description: "Unable to proceed.",
        variant: "destructive",
      });
    }
  };

  // -----------------------------------------------------
  // PRODUCT CARD
  // -----------------------------------------------------
  const BestSellingCard = ({ product }: { product: Product }) => {
    const price = product.offer_price ?? product.price;
    const discount = product.offer_price
      ? Math.round(((product.price - product.offer_price) / product.price) * 100)
      : null;

    return (
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
      >
        <div className="relative aspect-square bg-gray-50">
          <img
            src={product.image_url || "/placeholder.svg"}
            className="w-full h-full object-cover"
          />

          {discount && (
            <div className="absolute left-2 top-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}

          <button
            onClick={(e) => handleAddToCart(product, e)}
            className="hidden group-hover:flex sm:flex absolute bottom-2 right-2 bg-white border border-[#14710F] text-[#14710F] px-3 py-1.5 rounded-lg text-sm shadow-sm hover:bg-[#14710F] hover:text-white transition"
          >
            Add
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold">₹{price}</span>
            {product.offer_price && (
              <span className="text-xs line-through text-gray-400">
                ₹{product.price}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow(product);
            }}
            className="w-full mt-3 bg-[#14710F] text-white py-2 rounded-lg hover:bg-[#0f5c0c] transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  };

  // -----------------------------------------------------
  // FILTERED PRODUCTS
  // -----------------------------------------------------
  const visibleProducts =
    selectedCategory === "All"
      ? featuredProducts
      : featuredProducts.filter((p) =>
          (p.category || "")
            .toLowerCase()
            .includes(selectedCategory.toLowerCase())
        );

  // -----------------------------------------------------
  // RENDER PAGE
  // -----------------------------------------------------
  return (
    <Layout>
      {/* HERO BANNER */}
      <section className="pt-6 pb-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hidden md:flex bg-gradient-to-br from-pink-200 to-pink-100 rounded-2xl shadow-md p-6 flex-col justify-center h-[380px]">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Authentic Manipuri Pickles
            </h2>
            <p className="text-gray-700 mb-6">
              Fresh, traditional, and made with love using age-old recipes.
            </p>
            <Link
              to="/shop"
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold w-fit hover:bg-gray-800 transition shadow-md"
            >
              Order Now
            </Link>
          </div>

          <div className="col-span-1 md:col-span-2 relative rounded-2xl shadow-xl overflow-hidden w-full h-[260px] md:h-[380px]">
            <BannerCarousel />
          </div>
        </div>
      </section>

      {/* CATEGORY PANEL */}
      <section className="py-4 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
            {[
              { label: "All", value: "all", img: "/all.png" },
              { label: "Chicken", value: "chicken", img: "/chicken.jpg" },
              { label: "Red Meat", value: "red_meat", img: "/red.jpg" },
              { label: "Chilli Condiments", value: "chilli_condiments", img: "/chilli.jpg" },
            ].map((cat, i) => (
              <button
                key={i}
                onClick={() => navigate(`/shop?category=${cat.value}`)}
                className="flex flex-col items-center transition active:scale-95"
              >
                <div
                  className={`h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-[3px] shadow-md transition-all duration-300 bg-white ${
                    selectedCategory === cat.value
                      ? "border-[#14710F] scale-110"
                      : "border-gray-300"
                  }`}
                >
                  <img src={cat.img} className="w-full h-full object-cover" />
                </div>

                <span
                  className={`mt-2 text-xs md:text-sm font-semibold ${
                    selectedCategory === cat.value
                      ? "text-[#14710F]"
                      : "text-gray-700"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">
              Our Best Selling Products
            </h2>
            <button
              onClick={() => navigate("/shop")}
              className="text-blue-600 font-medium flex items-center gap-1"
            >
              See All <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <BestSellingCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* STORY + INSTAGRAM CAROUSEL */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN */}
          <div>
            <h2 className="text-4xl font-bold mb-6">The GooGoo Foods Story</h2>

            <p className="text-lg text-gray-600 mb-6">
              Mom’s by Goo Goo Foods is a mom-daughter venture serving ready-to-eat
              side dishes inspired by traditional Manipuri recipes.
            </p>

            <p className="text-lg text-gray-600 mb-8">
              Crafted with indigenous spices and herbs from Manipur, our dishes
              celebrate regional taste while supporting local communities.
            </p>

            <Link
              to="/about"
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition inline-block"
            >
              Learn More About Us
            </Link>

            {/* ⭐ MOBILE VIEW IMAGE */}
            <div className="lg:hidden mt-8">
              <img
                src="/lovable-uploads/4bc6545c-7534-4226-a449-57d2a1ba0aba.png"
                className="rounded-2xl shadow-xl w-full h-72 object-cover"
              />
            </div>

            {/* INSTAGRAM SECTION */}
            <div className="mt-14">
              <h3 className="text-2xl font-bold mb-3">Follow Us on Instagram</h3>

              <p className="text-gray-600 mb-6">
                Fresh updates from <strong>@momsbygoogoofoods</strong>
              </p>

              {/* ⭐ Instagram Carousel */}
              <div className="w-full min-h-[150px]">
                <Swiper
                  modules={[Pagination, Autoplay]}
                  slidesPerView={2}
                  spaceBetween={14}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 1800, disableOnInteraction: false }}
                  breakpoints={{
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 3 },
                  }}
                  className="w-full"
                >
                  {instagramImages.map((post, index) => (
                    <SwiperSlide key={index}>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group overflow-hidden rounded-xl shadow-md block"
                      >
                        <img
                          src={post.media_url}
                          className="w-full h-32 md:h-40 object-cover transition duration-300 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition"></div>
                      </a>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <a
                href="https://www.instagram.com/momsbygoogoofoods/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black mt-6 inline-block text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition shadow"
              >
                Visit Instagram →
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN — Story Image (Desktop Only) */}
          <div className="lg:pl-8 hidden lg:block">
            <img
              src="/lovable-uploads/4bc6545c-7534-4226-a449-57d2a1ba0aba.png"
              className="rounded-2xl shadow-xl w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
