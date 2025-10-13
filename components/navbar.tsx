"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Calendar, Users, Home, BarChart3 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { Logo } from "@/components/logo"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const isHomePage = pathname === "/"

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm"
          : isHomePage
            ? "bg-transparent"
            : "bg-white dark:bg-gray-900"
      }`}
      aria-label="Navegação principal"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Logo size="md" animated={false} />

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/calendar"
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Calendário
                </Link>
                <Link
                  href="/dashboard/visualization"
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Análise
                </Link>
                <Link
                  href="/contacts"
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Contatos
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {user.name || "Usuário"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sobre
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Preços
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AccessibilityMenu />
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <AccessibilityMenu />
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu" aria-expanded={isMenuOpen}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 py-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 space-y-1">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    href="/calendar"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Calendário
                  </Link>
                  <Link
                    href="/dashboard/visualization"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Análise
                  </Link>
                  <Link
                    href="/contacts"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Contatos
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    <User className="h-5 w-5 mr-2" />
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      toggleMenu()
                    }}
                    className="flex w-full items-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/about"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    Sobre
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    Preços
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={toggleMenu}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
