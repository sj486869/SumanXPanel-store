"use client"

import { useState } from "react"
import { Check, X, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { updateOrderStatus, type Order } from "@/lib/orders"
import { useToast } from "@/hooks/use-toast"

interface OrderManagementCardProps {
  order: Order
  onUpdate: () => void
}

export function OrderManagementCard({ order, onUpdate }: OrderManagementCardProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(order.notes || "")
  const [showProof, setShowProof] = useState(false)

  const handleStatusUpdate = (status: "confirmed" | "cancelled", adminNotes?: string) => {
    const success = updateOrderStatus(order.id, status, adminNotes)

    if (success) {
      toast({
        title: "Order Updated",
        description: `Order has been ${status}`,
      })
      onUpdate()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">Order {order.id}</CardTitle>
            <div className="space-y-1 mt-2">
              <p className="text-sm text-muted-foreground">Customer: {order.userName}</p>
              <p className="text-sm text-muted-foreground">Email: {order.userEmail}</p>
              <p className="text-sm text-muted-foreground">Date: {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <p className="font-semibold capitalize">{order.paymentMethod}</p>
          </div>
        </div>

        <div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="w-full">
            {expanded ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {expanded ? "Hide Items" : `Show Items (${order.items.length})`}
          </Button>

          {expanded && (
            <div className="space-y-2 mt-4 p-4 border rounded-lg">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start pb-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.product.price} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {order.paymentProof && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Payment Proof</Label>
              <Button variant="ghost" size="sm" onClick={() => setShowProof(!showProof)}>
                {showProof ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showProof ? "Hide" : "Show"}
              </Button>
            </div>

            {showProof && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                <img
                  src={order.paymentProof || "/placeholder.svg"}
                  alt="Payment proof"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}

        {order.status === "pending" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor={`notes-${order.id}`}>Admin Notes (Optional)</Label>
              <Textarea
                id={`notes-${order.id}`}
                placeholder="Add notes for the customer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleStatusUpdate("confirmed", notes)} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Confirm Order
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("cancelled", notes || "Order cancelled by admin")}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Reject Order
              </Button>
            </div>
          </div>
        )}

        {order.notes && order.status !== "pending" && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-1">Admin Notes:</p>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
