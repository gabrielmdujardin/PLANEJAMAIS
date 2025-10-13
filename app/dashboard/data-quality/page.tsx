"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  TrendingUp,
  Database,
  AlertTriangle,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface QualityMetric {
  dimension: string
  score: number
  status: "excellent" | "good" | "warning" | "critical"
  issues: number
  description: string
}

interface TableStats {
  tableName: string
  totalRecords: number
  validRecords: number
  invalidRecords: number
  completeness: number
  consistency: number
}

export default function DataQualityPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [overallScore, setOverallScore] = useState(87)
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([
    {
      dimension: "Completude",
      score: 92,
      status: "excellent",
      issues: 12,
      description: "Percentual de campos preenchidos",
    },
    {
      dimension: "Consistência",
      score: 85,
      status: "good",
      issues: 23,
      description: "Coerência entre dados relacionados",
    },
    {
      dimension: "Integridade",
      score: 88,
      status: "good",
      issues: 18,
      description: "Respeito às restrições do banco",
    },
    {
      dimension: "Validade",
      score: 90,
      status: "excellent",
      issues: 15,
      description: "Conformidade com regras de negócio",
    },
    {
      dimension: "Unicidade",
      score: 95,
      status: "excellent",
      issues: 8,
      description: "Ausência de duplicatas",
    },
    {
      dimension: "Pontualidade",
      score: 72,
      status: "warning",
      issues: 45,
      description: "Atualização de dados em tempo",
    },
  ])
  const [tableStats, setTableStats] = useState<TableStats[]>([])

  const analyzeDataQuality = async () => {
    try {
      setLoading(true)

      // Analisar tabela de eventos
      const { data: events, error: eventsError } = await supabase.from("events").select("*")

      if (eventsError) throw eventsError

      // Calcular estatísticas
      const eventsStats = {
        tableName: "events",
        totalRecords: events?.length || 0,
        validRecords: 0,
        invalidRecords: 0,
        completeness: 0,
        consistency: 0,
      }

      if (events) {
        // Validar completude
        events.forEach((event) => {
          const requiredFields = ["title", "date", "time", "location", "type", "status"]
          const completedFields = requiredFields.filter((field) => event[field]).length
          const completeness = (completedFields / requiredFields.length) * 100

          if (completeness >= 80) {
            eventsStats.validRecords++
          } else {
            eventsStats.invalidRecords++
          }

          eventsStats.completeness += completeness
        })

        eventsStats.completeness = eventsStats.completeness / events.length

        // Validar consistência
        const validStatuses = ["confirmed", "pending", "cancelled"]
        const consistentRecords = events.filter((e) => validStatuses.includes(e.status)).length
        eventsStats.consistency = (consistentRecords / events.length) * 100
      }

      setTableStats([eventsStats])

      // Recalcular score geral
      const avgScore = qualityMetrics.reduce((acc, m) => acc + m.score, 0) / qualityMetrics.length
      setOverallScore(Math.round(avgScore))

      toast({
        title: "Análise concluída",
        description: "Relatório de qualidade de dados atualizado com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao analisar qualidade:", error)
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a qualidade dos dados.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    analyzeDataQuality()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50"
      case "good":
        return "text-blue-600 bg-blue-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "critical":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "good":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      overallScore,
      metrics: qualityMetrics,
      tables: tableStats,
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `data-quality-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Qualidade de Dados</h1>
          <p className="text-muted-foreground">Monitoramento e análise da integridade dos dados do sistema</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={analyzeDataQuality} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Analisar
          </Button>

          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Score Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Score Geral de Qualidade
          </CardTitle>
          <CardDescription>Indicador consolidado de todas as dimensões de qualidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallScore / 100)}`}
                  className={
                    overallScore >= 90
                      ? "text-green-600"
                      : overallScore >= 70
                        ? "text-blue-600"
                        : overallScore >= 50
                          ? "text-yellow-600"
                          : "text-red-600"
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">{overallScore}%</div>
                  <div className="text-sm text-muted-foreground">Qualidade</div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Status Geral</div>
                  <Badge
                    className={
                      overallScore >= 90
                        ? "bg-green-100 text-green-800"
                        : overallScore >= 70
                          ? "bg-blue-100 text-blue-800"
                          : overallScore >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                    }
                  >
                    {overallScore >= 90
                      ? "Excelente"
                      : overallScore >= 70
                        ? "Bom"
                        : overallScore >= 50
                          ? "Atenção"
                          : "Crítico"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Total de Issues</div>
                  <div className="text-2xl font-bold">{qualityMetrics.reduce((acc, m) => acc + m.issues, 0)}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                +3.2% em relação ao mês anterior
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Análise */}
      <Tabs defaultValue="dimensions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dimensions">Dimensões</TabsTrigger>
          <TabsTrigger value="tables">Por Tabela</TabsTrigger>
          <TabsTrigger value="issues">Issues Detectados</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="dimensions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qualityMetrics.map((metric) => (
              <Card key={metric.dimension}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.dimension}</CardTitle>
                    {getStatusIcon(metric.status)}
                  </div>
                  <CardDescription>{metric.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">{metric.score}%</span>
                      <Badge variant="outline" className={getStatusColor(metric.status)}>
                        {metric.issues} issues
                      </Badge>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas por Tabela</CardTitle>
              <CardDescription>Análise detalhada de cada tabela do banco de dados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Total de Registros</TableHead>
                    <TableHead>Válidos</TableHead>
                    <TableHead>Inválidos</TableHead>
                    <TableHead>Completude</TableHead>
                    <TableHead>Consistência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableStats.map((stat) => (
                    <TableRow key={stat.tableName}>
                      <TableCell className="font-medium">{stat.tableName}</TableCell>
                      <TableCell>{stat.totalRecords}</TableCell>
                      <TableCell className="text-green-600">{stat.validRecords}</TableCell>
                      <TableCell className="text-red-600">{stat.invalidRecords}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stat.completeness} className="h-2 w-20" />
                          <span className="text-sm">{stat.completeness.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={stat.consistency} className="h-2 w-20" />
                          <span className="text-sm">{stat.consistency.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issues Detectados</CardTitle>
              <CardDescription>Problemas identificados na última análise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    severity: "high",
                    title: "Campos obrigatórios vazios",
                    description: "12 eventos sem descrição preenchida",
                    table: "events",
                  },
                  {
                    severity: "medium",
                    title: "Formato de data inconsistente",
                    description: "8 registros com formato de data inválido",
                    table: "events",
                  },
                  {
                    severity: "low",
                    title: "Duplicatas potenciais",
                    description: "3 eventos com títulos muito similares",
                    table: "events",
                  },
                ].map((issue, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div
                      className={`p-2 rounded-full ${
                        issue.severity === "high"
                          ? "bg-red-100"
                          : issue.severity === "medium"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {issue.severity === "high" ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : issue.severity === "medium" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{issue.title}</h4>
                        <Badge variant="outline">{issue.table}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
              <CardDescription>Ações sugeridas para melhorar a qualidade dos dados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    priority: "high",
                    title: "Implementar validação de campos obrigatórios",
                    description:
                      "Adicionar validação no front-end e back-end para garantir preenchimento de campos essenciais.",
                    impact: "Alta",
                  },
                  {
                    priority: "medium",
                    title: "Criar rotina de limpeza de dados",
                    description: "Automatizar identificação e correção de inconsistências nos dados existentes.",
                    impact: "Média",
                  },
                  {
                    priority: "low",
                    title: "Implementar auditoria de alterações",
                    description: "Registrar histórico de modificações para rastreabilidade.",
                    impact: "Baixa",
                  },
                ].map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : rec.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {rec.priority.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Impacto:</span>
                        <Badge variant="outline">{rec.impact}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
