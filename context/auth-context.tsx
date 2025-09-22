"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  profilePhoto?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  updateUserProfile?: (updatedUser: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulando verificação de autenticação
        const storedUser = localStorage.getItem("planeja_plus_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))

          // Também definir um cookie para o middleware
          document.cookie = `planeja_plus_user=true; path=/; max-age=2592000`
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Função para atualizar o perfil do usuário
  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (!user) return

    const newUserData = { ...user, ...updatedUser }
    setUser(newUserData)
    localStorage.setItem("planeja_plus_user", JSON.stringify(newUserData))
  }

  // Função de login
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulando uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validação simples
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios")
      }

      // Usuário mockado para demonstração
      const mockUser = {
        id: "1",
        name: "Usuário Teste",
        email,
      }

      // Salvar no localStorage para persistência
      localStorage.setItem("planeja_plus_user", JSON.stringify(mockUser))

      // Definir cookie para o middleware
      document.cookie = `planeja_plus_user=true; path=/; max-age=2592000`

      setUser(mockUser)

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      })

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao fazer login",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função de registro
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulando uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validação simples
      if (!name || !email || !password) {
        throw new Error("Todos os campos são obrigatórios")
      }

      // Usuário mockado para demonstração
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
      }

      // Salvar no localStorage para persistência
      localStorage.setItem("planeja_plus_user", JSON.stringify(mockUser))

      // Definir cookie para o middleware
      document.cookie = `planeja_plus_user=true; path=/; max-age=2592000`

      setUser(mockUser)

      toast({
        title: "Registro realizado com sucesso!",
        description: "Sua conta foi criada.",
      })

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao registrar:", error)
      toast({
        title: "Erro ao registrar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao registrar",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const logout = () => {
    localStorage.removeItem("planeja_plus_user")
    // Remover cookie
    document.cookie = "planeja_plus_user=; path=/; max-age=0"
    setUser(null)
    router.push("/")
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta.",
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
