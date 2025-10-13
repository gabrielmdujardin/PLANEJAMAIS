"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, Play, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@supabase/supabase-js"
import { toast } from "@/hooks/use-toast"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface JobRun {
  id: string
  job_name: string
  status: "running" | "completed" | "failed"
  started_at: string
  completed_at?: string
  duration_ms?: number
  error_message?: string
  metadata: Record<string, any>
}

interface JobLog {
  id: string
  job_run_id: string
  level: "info" | "warn" | "error"
  message: string
  metadata: Record<string, any>
  created_at: string
}

interface JobStats {
  total: number
  completed: number
  failed: number
  running: number
  avgDuration: number
}

export default function MonitorPage() {
  const [jobRuns, setJobRuns] = useState<JobRun[]>([])
  const [jobStats, setJobStats] = useState<JobStats>({
    total: 0,
    completed: 0,
    failed: 0,
    running: 0,
    avgDuration: 0,
  })
  const [selectedJobLogs, setSelectedJobLogs] = useState<JobLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadJobRuns()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("job_runs_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "job_runs" }, () => {
        loadJobRuns()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const loadJobRuns = async () => {
    try {
      // Mock data for demonstration
      const mockJobRuns: JobRun[] = [
        {
          id: "1",
          job_name: "daily-aggregate",
          status: "completed",
          started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(),
          duration_ms: 45000,
          metadata: { events_processed: 25 },
        },
        {
          id: "2",
          job_name: "pending-invites",
          status: "completed",
          started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 12000).toISOString(),
          duration_ms: 12000,
          metadata: { invites_sent: 8 },
        },
        {
          id: "3",
          job_name: "calendar-sync",
          status: "failed",
          started_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 6 * 60 * 60 * 1000 + 5000).toISOString(),
          duration_ms: 5000,
          error_message: "Failed to connect to external calendar service",
          metadata: { users_processed: 0 },
        },
        {
          id: "4",
          job_name: "cleanup",
          status: "running",
          started_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          metadata: { tables_cleaned: 2 },
        },
        {
          id: "5",
          job_name: "daily-aggregate",
          status: "completed",
          started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completed_at: new Date(Date.now() - 24 * 60 * 60 * 1000 + 38000).toISOString(),
          duration_ms: 38000,
          metadata: { events_processed: 22 },
        },
      ]

      setJobRuns(mockJobRuns)

      // Calculate stats
      const stats: JobStats = {
        total: mockJobRuns.length,
        completed: mockJobRuns.filter((j) => j.status === "completed").length,
        failed: mockJobRuns.filter((j) => j.status === "failed").length,
        running: mockJobRuns.filter((j) => j.status === "running").length,
        avgDuration:
          mockJobRuns.filter((j) => j.duration_ms).reduce((sum, j) => sum + (j.duration_ms || 0), 0) /
            mockJobRuns.filter((j) => j.duration_ms).length || 0,
      }

      setJobStats(stats)
    } catch (error) {
      console.error("Failed to load job runs:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar jobs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadJobLogs = async (jobRunId: string) => {
    try {
      // Mock logs for demonstration
      const mockLogs: JobLog[] = [
        {
          id: "1",
          job_run_id: jobRunId,
          level: "info",
          message: "Job started successfully",
          metadata: {},
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: "2",
          job_run_id: jobRunId,
          level: "info",
          message: "Processing events...",
          metadata: { count: 25 },
          created_at: new Date(Date.now() - 45000).toISOString(),
        },
        {
          id: "3",
          job_run_id: jobRunId,
          level: "info",
          message: "Materialized views refreshed",
          metadata: {},
          created_at: new Date(Date.now() - 30000).toISOString(),
        },
        {
          id: "4",
          job_run_id: jobRunId,
          level: "info",
          message: "Job completed successfully",
          metadata: { duration: "45s" },
          created_at: new Date(Date.now() - 15000).toISOString(),
        },
      ]

      setSelectedJobLogs(mockLogs)
    } catch (error) {
      console.error("Failed to load job logs:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar logs do job",
        variant: "destructive",
      })
    }
  }

  const runJob = async (jobName: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.JOBS_SECRET_TOKEN}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Job ${jobName} executado com sucesso`,
        })
        loadJobRuns()
      } else {
        throw new Error("Failed to run job")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao executar job ${jobName}`,
        variant: "destructive",
      })
    }
  }

  const refresh = () => {
    setRefreshing(true)
    loadJobRuns()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      running: "secondary",
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status === "completed"
          ? "Concluído"
          : status === "failed"
            ? "Falhou"
            : status === "running"
              ? "Executando"
              : status}
      </Badge>
    )
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return "-"
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatJobName = (jobName: string) => {
    const names = {
      "daily-aggregate": "Agregação Diária",
      "pending-invites": "Convites Pendentes",
      "calendar-sync": "Sincronização de Calendário",
      cleanup: "Limpeza",
    }
    return names[jobName as keyof typeof names] || jobName
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitor de Jobs</h1>
          <p className="text-muted-foreground">Acompanhe a execução dos jobs agendados em tempo real</p>
        </div>
        <Button onClick={refresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{jobStats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falharam</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{jobStats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(jobStats.avgDuration)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Jobs Recentes</TabsTrigger>
          <TabsTrigger value="manual">Execução Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execuções Recentes</CardTitle>
              <CardDescription>Últimas execuções de jobs com status e duração</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {jobRuns.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(job.status)}
                        <div>
                          <div className="font-medium">{formatJobName(job.job_name)}</div>
                          <div className="text-sm text-muted-foreground">
                            Iniciado: {new Date(job.started_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div>{getStatusBadge(job.status)}</div>
                          <div className="text-sm text-muted-foreground">{formatDuration(job.duration_ms)}</div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => loadJobLogs(job.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Logs do Job: {formatJobName(job.job_name)}</DialogTitle>
                              <DialogDescription>Detalhes da execução do job</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[400px] w-full">
                              <div className="space-y-2">
                                {selectedJobLogs.map((log) => (
                                  <div key={log.id} className="p-3 border rounded text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                      <Badge
                                        variant={
                                          log.level === "error"
                                            ? "destructive"
                                            : log.level === "warn"
                                              ? "secondary"
                                              : "outline"
                                        }
                                      >
                                        {log.level.toUpperCase()}
                                      </Badge>
                                      <span className="text-muted-foreground text-xs">
                                        {new Date(log.created_at).toLocaleTimeString("pt-BR")}
                                      </span>
                                    </div>
                                    <div>{log.message}</div>
                                    {Object.keys(log.metadata).length > 0 && (
                                      <pre className="mt-2 text-xs bg-muted p-2 rounded">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execução Manual de Jobs</CardTitle>
              <CardDescription>Execute jobs manualmente para testes ou correções</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Agregação Diária</CardTitle>
                    <CardDescription>Atualiza materialized views e consolida dados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => runJob("daily-aggregate")} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Executar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Convites Pendentes</CardTitle>
                    <CardDescription>Envia lembretes para convidados pendentes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => runJob("pending-invites")} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Executar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sincronização de Calendário</CardTitle>
                    <CardDescription>Gera feeds ICS para integração externa</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => runJob("calendar-sync")} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Executar
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Limpeza</CardTitle>
                    <CardDescription>Remove dados antigos e otimiza tabelas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => runJob("cleanup")} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Executar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
