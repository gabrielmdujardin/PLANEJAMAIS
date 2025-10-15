"use client"

import { useState } from "react"
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
import { CalendarIcon, Users, DollarSign, Activity, Download, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/back-button"

const eventsByMonth = [
  { month: "Jan", events: 12, guests: 145, revenue: 15400 },
  { month: "Fev", events: 18, guests: 210, revenue: 22300 },
  { month: "Mar", events: 15, guests: 180, revenue: 19200 },
  { month: "Abr", events: 22, guests: 265, revenue: 28100 },
  { month: "Mai", events: 20, guests: 240, revenue: 25600 },
  { month: "Jun", events: 25, guests: 300, revenue: 32000 },
]

const eventsByType = [
  { name: "Festas", value: 45, color: "#3b82f6" },
  { name: "Casamentos", value: 28, color: "#ef4444" },
  { name: "Corporativo", value: 35, color: "#10b981" },
  { name: "Aniversários", value: 52, color: "#f59e0b" },
  { name: "Outros", value: 20, color: "#8b5cf6" },
]

const rsvpTrend = [
  { date: "01/06", confirmed: 120, pending: 45, declined: 15 },
  { date: "05/06", confirmed: 145, pending: 38, declined: 18 },
  { date: "10/06", confirmed: 168, pending: 32, declined: 22 },
  { date: "15/06", confirmed: 195, pending: 25, declined: 25 },
  { date: "20/06", confirmed: 220, pending: 18, declined: 28 },
  { date: "25/06", confirmed: 245, pending: 12, declined: 30 },
]

const topEvents = [
  { id: "1", name: "Casamento João & Maria", guests: 250, revenue: 35000, status: "confirmed", date: "15/07/2025" },
  { id: "2", name: "Festa Corporativa Tech", guests: 180, revenue: 28000, status: "confirmed", date: "22/07/2025" },
  { id: "3", name: "Aniversário 50 anos", guests: 120, revenue: 18500, status: "pending", date: "30/07/2025" },
  { id: "4", name: "Formatura 2025", guests: 200, revenue: 32000, status: "confirmed", date: "05/08/2025" },
  { id: "5", name: "Festa Junina", guests: 300, revenue: 22000, status: "confirmed", date: "28/06/2025" },
]

const guestEngagement = [
  { metric: "Taxa de Confirmação", value: 78, change: 5.2 },
  { metric: "Taxa de Resposta", value: 92, change: 3.1 },
  { metric: "Tempo Médio Resposta", value: 2.3, unit: "dias", change: -0.5 },
  { metric: "Satisfação Geral", value: 4.6, unit: "/5", change: 0.3 },
]

const costAnalysis = [
  { category: "Alimentação", value: 45000, percentage: 42 },
  { category: "Decoração", value: 25000, percentage: 23 },
  { category: "Entretenimento", value: 18000, percentage: 17 },
  { category: "Espaço", value: 12000, percentage: 11 },
  { category: "Outros", value: 8000, percentage: 7 },
]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(false)

  const refreshData = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  const exportData = () => {
    const data = { eventsByMonth, eventsByType, rsvpTrend, topEvents, guestEngagement, costAnalysis }
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Visualize e analise dados em tempo real</p>
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
            <div className="text-2xl font-bold">112</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.2%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convidados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,340</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 142.7K</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+25.3%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Confirmação</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="guests">Convidados</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Mês</CardTitle>
                <CardDescription>Evolução mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={eventsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="events" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="guests" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos por Tipo</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Confirmações</CardTitle>
                <CardDescription>Evolução de confirmações e recusas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rsvpTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="confirmed" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="declined" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Eventos</CardTitle>
              <CardDescription>Maiores eventos por convidados e receita</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">{event.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{event.guests} convidados</div>
                        <div className="text-sm text-muted-foreground">R$ {event.revenue.toLocaleString("pt-BR")}</div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento</CardTitle>
                <CardDescription>Métricas de interação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guestEngagement.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">
                            {metric.value}
                            {metric.unit || ""}
                          </span>
                          <Badge variant={metric.change > 0 ? "default" : "secondary"}>
                            {metric.change > 0 ? "+" : ""}
                            {metric.change}
                            {metric.unit === "dias" ? " dias" : "%"}
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${metric.unit === "/5" ? (metric.value / 5) * 100 : metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Atual</CardTitle>
                <CardDescription>Distribuição de respostas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rsvpTrend.slice(-3)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="confirmed" fill="#10b981" name="Confirmados" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pendentes" />
                      <Bar dataKey="declined" fill="#ef4444" name="Recusados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Custos</CardTitle>
                <CardDescription>Distribuição por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costAnalysis.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          R$ {item.value.toLocaleString("pt-BR")} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>Evolução de receita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10b981" name="Receita (R$)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
