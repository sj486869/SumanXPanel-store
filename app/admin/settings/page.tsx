"use client"

import { useState, useEffect } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { AdminHeader } from "@/components/admin-header"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSettings, updateSettings, type SiteSettings } from "@/lib/settings"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import Image from "next/image"

export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <SettingsContent />
    </AdminGuard>
  )
}

function SettingsContent() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSettings>(getSettings())
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({})

  useEffect(() => {
    const currentSettings = getSettings()
    setSettings(currentSettings)

    // Set initial preview images
    const previews: Record<string, string> = {}
    Object.entries(currentSettings.paymentMethods).forEach(([key, method]) => {
      previews[key] = method.qrCode
    })
    setPreviewImages(previews)
  }, [])

  const handleSaveSettings = () => {
    updateSettings(settings)
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully",
    })
  }

  const handleQRUpload = (method: keyof SiteSettings["paymentMethods"], file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setSettings((prev) => ({
        ...prev,
        paymentMethods: {
          ...prev.paymentMethods,
          [method]: {
            ...prev.paymentMethods[method],
            qrCode: base64,
          },
        },
      }))
      setPreviewImages((prev) => ({
        ...prev,
        [method]: base64,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveQR = (method: keyof SiteSettings["paymentMethods"]) => {
    setSettings((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [method]: {
          ...prev.paymentMethods[method],
          qrCode: "",
        },
      },
    }))
    setPreviewImages((prev) => ({
      ...prev,
      [method]: "",
    }))
  }

  return (
    <div className="min-h-screen">
      <AdminHeader />

      <main className="container py-8">
        <AdminNav />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage discounts, sales, and payment methods</p>
          </div>

          <Tabs defaultValue="discount" className="space-y-6">
            <TabsList>
              <TabsTrigger value="discount">Discount & Sales</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            </TabsList>

            <TabsContent value="discount" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Discount Settings</CardTitle>
                  <CardDescription>Configure site-wide discounts and sales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Discount</Label>
                      <p className="text-sm text-muted-foreground">Apply discount to all orders</p>
                    </div>
                    <Switch
                      checked={settings.discount.enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          discount: { ...prev.discount, enabled: checked },
                        }))
                      }
                    />
                  </div>

                  {settings.discount.enabled && (
                    <>
                      <div className="space-y-3">
                        <Label>Discount Type</Label>
                        <RadioGroup
                          value={settings.discount.type}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              discount: { ...prev.discount, type: value as "percentage" | "fixed" },
                            }))
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage">Percentage (%)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label htmlFor="fixed">Fixed Amount ($)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>Discount Value</Label>
                        <Input
                          type="number"
                          min="0"
                          step={settings.discount.type === "percentage" ? "1" : "0.01"}
                          max={settings.discount.type === "percentage" ? "100" : undefined}
                          value={settings.discount.value}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              discount: { ...prev.discount, value: Number.parseFloat(e.target.value) || 0 },
                            }))
                          }
                          placeholder={settings.discount.type === "percentage" ? "Enter percentage" : "Enter amount"}
                        />
                        <p className="text-sm text-muted-foreground">
                          {settings.discount.type === "percentage"
                            ? `Customers will get ${settings.discount.value}% off their orders`
                            : `Customers will get $${settings.discount.value} off their orders`}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              {Object.entries(settings.paymentMethods).map(([key, method]) => (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{method.name}</CardTitle>
                        <CardDescription>Configure {method.name} payment settings</CardDescription>
                      </div>
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            paymentMethods: {
                              ...prev.paymentMethods,
                              [key]: {
                                ...prev.paymentMethods[key as keyof typeof prev.paymentMethods],
                                enabled: checked,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Payment Method Name</Label>
                          <Input
                            value={method.name}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                paymentMethods: {
                                  ...prev.paymentMethods,
                                  [key]: {
                                    ...prev.paymentMethods[key as keyof typeof prev.paymentMethods],
                                    name: e.target.value,
                                  },
                                },
                              }))
                            }
                            placeholder="Enter payment method name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={method.description}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                paymentMethods: {
                                  ...prev.paymentMethods,
                                  [key]: {
                                    ...prev.paymentMethods[key as keyof typeof prev.paymentMethods],
                                    description: e.target.value,
                                  },
                                },
                              }))
                            }
                            placeholder="Enter description"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Payment Address</Label>
                          <Input
                            value={method.address}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                paymentMethods: {
                                  ...prev.paymentMethods,
                                  [key]: {
                                    ...prev.paymentMethods[key as keyof typeof prev.paymentMethods],
                                    address: e.target.value,
                                  },
                                },
                              }))
                            }
                            placeholder="Enter payment address"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>QR Code</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                          {previewImages[key] ? (
                            <div className="relative">
                              <div className="relative w-full h-48 bg-white rounded-lg p-2">
                                <Image
                                  src={previewImages[key] || "/placeholder.svg"}
                                  alt={`${method.name} QR Code`}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="mt-2"
                                onClick={() => handleRemoveQR(key as keyof SiteSettings["paymentMethods"])}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Remove QR Code
                              </Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleQRUpload(key as keyof SiteSettings["paymentMethods"], file)
                                  }
                                }}
                              />
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to upload QR code</p>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} size="lg">
              Save All Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
