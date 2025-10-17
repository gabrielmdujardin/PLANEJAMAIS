"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { CalendarIcon, Users, DollarSign, Activity, Download, RefreshCw, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/back-button"
import { useEventStore } from "@/stores/event-store"

function parseEventDate(dateString: string | undefined): Date {
  if (!dateString) return new Date()
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return new Date()
    return date
  } catch {
    return new Date()
  }
}

export default function AnalyticsPage() {
  const { events } = useEventStore()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const analytics = useMemo(() => {
    if (!events || events.length === 0) {
      return {
        totalEvents: 0,
        totalGuests: 0,
        totalRevenue: 0,
        confirmationRate: 0,
        eventsByMonth: [],
        eventsByType: [],
        rsvpTrend: [],
        topEvents: [],
        guestEngagement: [],
        costAnalysis: [],
      }
    }

    const totalEvents = events.length
    const totalGuests = events.reduce((sum, event) => sum + (event.totalGuests || 0), 0)
    const totalRevenue = events.reduce((sum, event) => {
      const eventRevenue = (event.items || []).reduce((itemSum, item) => itemSum + (item.price || 0), 0)
      return sum + eventRevenue
    }, 0)

    const totalConfirmed = events.reduce((sum, event) => sum + (event.confirmedGuests || 0), 0)
    const confirmationRate = totalGuests > 0 ? Math.round((totalConfirmed / totalGuests) * 100) : 0

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const eventsByMonthMap = new Map<number, { events: number; guests: number; revenue: number }>()

    events.forEach((event) => {
      const date = parseEventDate(event.fullDate || event.date)
      const month = date.getMonth()
      const current = eventsByMonthMap.get(month) || { events: 0, guests: 0, revenue: 0 }
      const eventRevenue = (event.items || []).reduce((sum, item) => sum + (item.price || 0), 0)

      eventsByMonthMap.set(month, {
        events: current.events + 1,
        guests: current.guests + (event.totalGuests || 0),
        revenue: current.revenue + eventRevenue,
      })
    })

    const eventsByMonth = Array.from(eventsByMonthMap.entries())
      .map(([month, data]) => ({
        month: monthNames[month],
        events: data.events,
        guests: data.guests,
        revenue: data.revenue,
      }))
      .sort((a, b) => monthNames.indexOf(a.month) - monthNames.indexOf(b.month))

    const eventsByTypeMap = new Map<string, number>()
    events.forEach((event) => {
      const type = event.category || event.type || "Outros"
      eventsByTypeMap.set(type, (eventsByTypeMap.get(type) || 0) + 1)
    })

    const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"]
    const eventsByType = Array.from(eventsByTypeMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))

    const rsvpTrend = events.slice(-6).map((event) => {
      const date = parseEventDate(event.fullDate || event.date)
      return {
        date: format(date, "dd/MM"),
        confirmed: event.confirmedGuests || 0,
        pending:
          (event.totalGuests || 0) -
          (event.confirmedGuests || 0) -
          (event.guests?.filter((g) => g.status === "declined").length || 0),
        declined: event.guests?.filter((g) => g.status === "declined").length || 0,
      }
    })

    const topEvents = [...events]
      .sort((a, b) => (b.totalGuests || 0) - (a.totalGuests || 0))
      .slice(0, 5)
      .map((event) => {
        const revenue = (event.items || []).reduce((sum, item) => sum + (item.price || 0), 0)
        return {
          id: event.id,
          name: event.title,
          guests: event.totalGuests || 0,
          revenue,
          status: event.confirmedGuests === event.totalGuests ? "confirmed" : "pending",
          date: event.date || "N/A",
        }
      })

    const guestEngagement = [
      { metric: "Taxa de Confirmação", value: confirmationRate, change: 5.2, unit: "%" },
      {
        metric: "Taxa de Resposta",
        value: totalGuests > 0 ? Math.round((totalConfirmed / totalGuests) * 100) : 0,
        change: 3.1,
        unit: "%",
      },
      { metric: "Eventos Ativos", value: events.length, change: 2, unit: "" },
      {
        metric: "Média de Convidados",
        value: totalEvents > 0 ? Math.round(totalGuests / totalEvents) : 0,
        change: 0.3,
        unit: "",
      },
    ]

    const costByCategory = new Map<string, number>()
    events.forEach((event) => {
      event.items?.forEach((item) => {
        const category = item.category || "Itens do Evento"
        costByCategory.set(category, (costByCategory.get(category) || 0) + (item.price || 0))
      })
    })

    const totalCost = Array.from(costByCategory.values()).reduce((sum, val) => sum + val, 0)
    const costAnalysis = Array.from(costByCategory.entries()).map(([category, value]) => ({
      category,
      value,
      percentage: totalCost > 0 ? Math.round((value / totalCost) * 100) : 0,
    }))

    return {
      totalEvents,
      totalGuests,
      totalRevenue,
      confirmationRate,
      eventsByMonth,
      eventsByType,
      rsvpTrend,
      topEvents,
      guestEngagement,
      costAnalysis,
    }
  }, [events])

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
  }

  if (!mounted) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Dados baseados nos seus eventos reais</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Eventos criados</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGuests}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Convidados totais</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R${" "}
              {analytics.totalRevenue >= 1000
                ? `${(analytics.totalRevenue / 1000).toFixed(1)}K`
                : analytics.totalRevenue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Soma dos itens</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Confirmação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.confirmationRate}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Taxa atual</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {analytics.totalEvents === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento criado ainda</h3>
              <p className="text-muted-foreground mb-4">Crie seu primeiro evento para ver as análises aqui</p>
              <Button onClick={() => (window.location.href = "/create-event")}>Criar Evento</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="guests">Convidados</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analytics.eventsByMonth.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos por Mês</CardTitle>
                    <CardDescription>Evolução mensal de eventos e convidados</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.eventsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="events"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorEvents)"
                          name="Eventos"
                        />
                        <Area
                          type="monotone"
                          dataKey="guests"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorGuests)"
                          name="Convidados"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analytics.eventsByType.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Eventos por Tipo</CardTitle>
                    <CardDescription>Distribuição por categoria de evento</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.eventsByType}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.eventsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {analytics.rsvpTrend.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tendência de Confirmações</CardTitle>
                    <CardDescription>Evolução de confirmações nos últimos eventos</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.rsvpTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="confirmed"
                          stroke="#10b981"
                          strokeWidth={3}
                          name="Confirmados"
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pending"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          name="Pendentes"
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="declined"
                          stroke="#ef4444"
                          strokeWidth={3}
                          name="Recusados"
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Eventos</CardTitle>
                <CardDescription>Eventos com maior número de convidados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{event.name}</div>
                          <div className="text-sm text-muted-foreground">{event.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{event.guests} convidados</div>
                          <div className="text-sm text-muted-foreground">
                            R$ {event.revenue.toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <Badge variant={event.status === "confirmed" ? "default" : "secondary"}>
                          {event.status === "confirmed" ? "Confirmado" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
                <CardDescription>Indicadores de interação dos convidados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.guestEngagement.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {metric.value}
                            {metric.unit}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${Math.min(metric.value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {analytics.rsvpTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status de Respostas</CardTitle>
                  <CardDescription>Distribuição atual de confirmações</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.rsvpTrend.slice(-3)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="confirmed" fill="#10b981" name="Confirmados" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pendentes" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="declined" fill="#ef4444" name="Recusados" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {analytics.costAnalysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Custos</CardTitle>
                    <CardDescription>Distribuição de gastos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {analytics.costAnalysis.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.category}</span>
                            <span className="text-sm text-muted-foreground">
                              R$ {item.value.toLocaleString("pt-BR")} ({item.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analytics.eventsByMonth.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                    <CardDescription>Evolução da receita</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.eventsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Receita (R$)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
