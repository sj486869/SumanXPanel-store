"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingBag, Users, MessageCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTotalUnreadForAdmin } from "@/lib/chat"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Chat",
    href: "/admin/chat",
    icon: MessageCircle,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const updateUnread = () => {
      setUnreadCount(getTotalUnreadForAdmin())
    }
    updateUnread()
    const interval = setInterval(updateUnread, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="flex gap-2 border-b mb-6 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        const showBadge = item.href === "/admin/chat" && unreadCount > 0

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
            {showBadge && (
              <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center px-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
