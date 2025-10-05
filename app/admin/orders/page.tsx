"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminNav } from "@/components/admin-nav"
import { AdminGuard } from "@/components/admin-guard"
import { OrderManagementCard } from "@/components/order-management-card"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllOrdersForAdmin, type Order } from "@/lib/orders"
import { Package } from "lucide-react"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  const loadOrders = () => {
    setOrders(getAllOrdersForAdmin())
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const pendingOrders = orders.filter((o) => o.status === "pending")
  const confirmedOrders = orders.filter((o) => o.status === "confirmed" || o.status === "processing")
  const completedOrders = orders.filter((o) => o.status === "completed")
  const cancelledOrders = orders.filter((o) => o.status === "cancelled")

  return (
    <AdminGuard>
      <div className="min-h-screen">
        <AdminHeader />

        <main className="container py-8">
          <AdminNav />

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed ({confirmedOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
              <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending orders</p>
                  </CardContent>
                </Card>
              ) : (
                pendingOrders.map((order) => <OrderManagementCard key={order.id} order={order} onUpdate={loadOrders} />)
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="space-y-4">
              {confirmedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No confirmed orders</p>
                  </CardContent>
                </Card>
              ) : (
                confirmedOrders.map((order) => (
                  <OrderManagementCard key={order.id} order={order} onUpdate={loadOrders} />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed orders</p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map((order) => (
                  <OrderManagementCard key={order.id} order={order} onUpdate={loadOrders} />
                ))
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No cancelled orders</p>
                  </CardContent>
                </Card>
              ) : (
                cancelledOrders.map((order) => (
                  <OrderManagementCard key={order.id} order={order} onUpdate={loadOrders} />
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => <OrderManagementCard key={order.id} order={order} onUpdate={loadOrders} />)
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminGuard>
  )
}
