"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { PaymentQR } from "@/components/payment-qr"
import { FileUpload } from "@/components/file-upload"
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart"
import { getCurrentUser } from "@/lib/auth"
import { createOrder, type PaymentMethod } from "@/lib/orders"
import { calculateDiscount } from "@/lib/settings"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [finalTotal, setFinalTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("binance")
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth")
      return
    }

    const items = getCart()
    if (items.length === 0) {
      router.push("/")
      return
    }

    const cartTotal = getCartTotal()
    setCartItems(items)
    setTotal(cartTotal)

    const { discountAmount: discount, finalTotal: final } = calculateDiscount(cartTotal)
    setDiscountAmount(discount)
    setFinalTotal(final)
  }, [router])

  const handleFileSelect = (file: File) => {
    setPaymentProof(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = () => {
    setPaymentProof(null)
    setPaymentProofPreview("")
  }

  const handleSubmitOrder = async () => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/auth")
      return
    }

    if (!paymentProof) {
      toast({
        title: "Payment Proof Required",
        description: "Please upload a screenshot of your payment confirmation",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const order = createOrder(user, cartItems, finalTotal, paymentMethod, paymentProofPreview)

      clearCart()

      toast({
        title: "Order Submitted",
        description: "Your order has been submitted and is pending confirmation",
      })

      router.push(`/dashboard?order=${order.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your items before payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Discount:</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Payment Proof</CardTitle>
                <CardDescription>Upload a screenshot of your payment confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFileSelect={handleFileSelect} preview={paymentProofPreview} onRemove={handleRemoveFile} />
              </CardContent>
            </Card>

            <Button onClick={handleSubmitOrder} disabled={!paymentProof || loading} size="lg" className="w-full">
              {loading ? "Submitting Order..." : "Submit Order"}
            </Button>
          </div>

          <div>
            <PaymentQR total={finalTotal} onMethodChange={setPaymentMethod} />
          </div>
        </div>
      </main>
    </div>
  )
}
