"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PaymentMethod } from "@/lib/orders"
import { getSettings } from "@/lib/settings"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentQRProps {
  total: number
  onMethodChange: (method: PaymentMethod) => void
}

export function PaymentQR({ total, onMethodChange }: PaymentQRProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("binance")
  const [paymentMethods, setPaymentMethods] = useState(getSettings().paymentMethods)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setPaymentMethods(getSettings().paymentMethods)
  }, [])

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method)
    onMethodChange(method)
  }

  const currentMethod = paymentMethods[selectedMethod]
  const enabledMethods = Object.entries(paymentMethods).filter(([_, method]) => method.enabled)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose your preferred payment method and scan the QR code</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedMethod} onValueChange={(value) => handleMethodChange(value as PaymentMethod)}>
            <div className="space-y-3">
              {enabledMethods.map(([key, method]) => (
                <div
                  key={key}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                >
                  <RadioGroupItem value={key} id={key} />
                  <Label htmlFor={key} className="flex-1 cursor-pointer">
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Scan the QR code or use the address below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-64 h-64 bg-white rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setIsModalOpen(true)}
              title="Click to enlarge"
            >
              <Image
                src={currentMethod.qrCode || "/placeholder.svg"}
                alt={`${currentMethod.name} QR Code`}
                fill
                className="object-contain"
              />
            </div>

            <div className="w-full space-y-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Payment Address</p>
                <p className="font-mono text-sm break-all">{currentMethod.address}</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 border-t pt-4">
            <p className="font-semibold">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Scan the QR code with your {currentMethod.name} app</li>
              <li>Send exactly ${total.toFixed(2)} to the address shown</li>
              <li>Take a screenshot of the payment confirmation</li>
              <li>Upload the screenshot below to complete your order</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="relative w-full aspect-square bg-white rounded-lg p-8">
              <Image
                src={currentMethod.qrCode || "/placeholder.svg"}
                alt={`${currentMethod.name} QR Code - Enlarged`}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center text-white">
              <p className="text-lg font-semibold">{currentMethod.name}</p>
              <p className="text-sm opacity-80">Click outside to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
