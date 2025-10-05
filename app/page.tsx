"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart } from "lucide-react"
import { SimpleParticles } from "@/components/simple-particles"
import { ProductCard } from "@/components/product-card"
import { CartDrawer } from "@/components/cart-drawer"
import { ChatWidget } from "@/components/chat-widget"
import { DiscountBanner } from "@/components/discount-banner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getProducts, searchProducts, type Product } from "@/lib/products"
import { addToCart, getCart, updateCartQuantity, removeFromCart, getCartCount, type CartItem } from "@/lib/cart"
import { getCurrentUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(getCurrentUser())
  const [cartAnimation, setCartAnimation] = useState(false)

  useEffect(() => {
    const loadedProducts = getProducts()
    setProducts(loadedProducts)
    setCartItems(getCart())
    setCartCount(getCartCount())
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setProducts(searchProducts(query))
    } else {
      setProducts(getProducts())
    }
  }

  const handleAddToCart = (product: Product) => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }

    const updatedCart = addToCart(product)
    setCartItems(updatedCart)
    setCartCount(getCartCount())
    setCartAnimation(true)
    setTimeout(() => setCartAnimation(false), 600)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updatedCart = updateCartQuantity(productId, quantity)
    setCartItems(updatedCart)
    setCartCount(getCartCount())
  }

  const handleRemove = (productId: string) => {
    const updatedCart = removeFromCart(productId)
    setCartItems(updatedCart)
    setCartCount(getCartCount())
  }

  const handleCheckout = () => {
    setCartOpen(false)
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen relative">
      <SimpleParticles />

      {/* Header */}
      <header className="flex items-center justify-between mb-6 max-w-6xl mx-auto p-6 relative z-10">
        <div className="flex items-center gap-2 cursor-pointer hover-3d" onClick={() => router.push("/")}>
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur logo-3d">
            <span className="text-white font-bold text-lg">SS</span>
          </div>
          <h1 className="text-2xl font-bold text-white neon-text">SUMAN STORE</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/10 border-white/30 text-white placeholder:text-white/70 input-3d"
            />
          </div>
          <Button
            onClick={() => setCartOpen(true)}
            className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 relative button-3d ${cartAnimation ? "cart-bounce" : ""}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Open Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center neon-glow pulse-glow">
                {cartCount}
              </span>
            )}
          </Button>
          {user && (
            <Button
              onClick={() => router.push(user.role === "admin" ? "/admin" : "/dashboard")}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 button-3d"
            >
              {user.role === "admin" ? "Admin Panel" : "Dashboard"}
            </Button>
          )}
          {!user && (
            <Button onClick={() => router.push("/auth")} className="bg-red-600 hover:bg-red-700 button-3d">
              Login
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-12 relative z-10">
        <DiscountBanner />

        {/* Products Grid - Now full width */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-white/70">No products found</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="glass-card rounded-2xl shadow p-4 flex flex-col card-3d product-hover">
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="mt-12 text-center pb-6 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a
            href="https://discord.gg/Mn6MsY4uuS"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2 hover-3d"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Discord
          </a>
          <a
            href="https://www.youtube.com/@SumanPanel"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2 hover-3d"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube
          </a>
        </div>
        <p className="text-white/70">Made By Suman</p>
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onCheckout={handleCheckout}
      />

      <ChatWidget />
    </div>
  )
}
