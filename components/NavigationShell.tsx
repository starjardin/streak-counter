"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  Users,
  Menu,
  X,
  Settings,
  CreditCard,
  Shield,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { logout } from "@/app/actions/auth"

const MAIN_TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
]

const SECONDARY_LINKS = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
]

interface NavigationShellProps {
  displayName: string
  isAdmin: boolean
  children: React.ReactNode
}

export function NavigationShell({
  displayName,
  isAdmin,
  children,
}: NavigationShellProps) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [dropdownOpen])

  const isStreakDetail = /^\/dashboard\/[^\/]+$/.test(pathname)

  const activeIndex = MAIN_TABS.findIndex((t) => {
    if (t.href === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname === "/dashboard/journal" ||
        isStreakDetail
      )
    }
    return pathname.startsWith(t.href)
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop top bar */}
      <header className="hidden lg:flex sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-gray-900 shrink-0"
              >
                Streak Counter
              </Link>
              <nav className="flex items-center gap-1">
                {MAIN_TABS.map((tab) => {
                  const isActive =
                    tab.href === "/dashboard"
                      ? pathname === "/dashboard" ||
                        pathname.startsWith("/dashboard/")
                      : pathname.startsWith(tab.href)
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                title={`Logged in as ${displayName}`}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayName}
                    </p>
                  </div>
                  {SECONDARY_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <link.icon size={16} className="text-gray-400" />
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Shield size={16} />
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <form action={logout}>
                      <button
                        type="submit"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full cursor-pointer"
                      >
                        <LogOut size={16} className="text-gray-400" />
                        Log out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: thin top bar for streak detail */}
      {isStreakDetail && (
        <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center h-12 px-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              Dashboard
            </Link>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      {/* Bottom tab bar (mobile only, hidden on streak detail) */}
      {!isStreakDetail && (
        <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden">
          <div className="bg-white border-t border-gray-200">
            <div className="flex items-center">
              {MAIN_TABS.map((tab, i) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                    i === activeIndex
                      ? "text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon size={20} />
                  <span
                    className={`text-[10px] font-medium ${
                      i === activeIndex ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {tab.label}
                  </span>
                </Link>
              ))}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <Menu size={20} />
                <span className="text-[10px] font-medium text-gray-500">
                  More
                </span>
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
              <span className="text-lg font-bold text-gray-900">
                Streak Counter
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {displayName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 py-2">
              {SECONDARY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  <link.icon size={18} className="text-gray-400" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setDrawerOpen(false)}
                >
                  <Shield size={18} />
                  Admin
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100 py-2">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full cursor-pointer"
                >
                  <LogOut size={18} className="text-gray-400" />
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
