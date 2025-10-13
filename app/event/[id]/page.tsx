"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, MapPin, Clock, Users, Share2, Edit, Plus, ArrowLeft } from "lucide-react"
import GuestList from "@/components/guest-list"
import ItemsList from "@/components/items-list"
import EventGallery from "@/components/event-gallery"
import { useToast } from "@/hooks/use-toast"
import { useEventStore } from "@/stores/event-store"
import { useRouter } from "next/navigation"
import AddItemDialog from "@/components/add-item-dialog"
import AddGuestDialog from "@/components/add-guest-dialog"
import EditEventDialog from "@/components/edit-event-dialog"
import Link from "next/link"

// Adicionar importações para os novos componentes
import EmailPreview from "@/components/email-preview"
import SmsPreview from "@/components/sms-preview"

export default function EventPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const { events, getEventById, updateEvent } = useEventStore()
  const event = getEventById(params.id)

  // Simular carregamento de dados do evento
  useEffect(() => {
    const loadEvent = async () => {
      // Em um app real, você faria uma chamada de API aqui
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsLoading(false)

      // Se o evento não existir, redirecionar para o dashboard
      if (!event && !isLoading) {
        toast({
          title: "Evento não encontrado",
          description: "O evento que você está procurando não existe.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    loadEvent()
  }, [event, isLoading, router, toast])

  const handleShareEvent = () => {
    // Em um app real, você implementaria o compartilhamento
    const url = `${window.location.origin}/confirm-invitation/${params.id}/guest_example`
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copiado!",
      description: "O link do evento foi copiado para a área de transferência.",
    })
  }

  const handleResendInvites = () => {
    toast({
      title: "Convites reenviados",
      description: "Os convites foram reenviados para os convidados pendentes.",
    })
  }

  const handleEditEvent = () => {
    setIsEditEventOpen(true)
  }

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-6xl py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total cost and cost per person
  const totalCost = event.items ? event.items.reduce((sum, item) => sum + item.price, 0) : 0
  const costPerPerson = event.confirmedGuests > 0 ? (totalCost / event.confirmedGuests).toFixed(2) : "0.00"
  const pendingGuests =
    event.totalGuests -
    event.confirmedGuests -
    (event.guests ? event.guests.filter((g) => g.status === "declined").length : 0)
  const declinedGuests = event.guests ? event.guests.filter((g) => g.status === "declined").length : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Badge
                variant="outline"
                className={`${
                  event.type === "Colaborativo"
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                }`}
              >
                {event.type}
              </Badge>
            </div>
            <p className="text-gray-600">{event.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2 bg-transparent" onClick={handleShareEvent}>
              <Share2 className="h-4 w-4" /> Compartilhar
            </Button>
            <Button variant="outline" className="flex gap-2 bg-transparent" onClick={handleEditEvent}>
              <Edit className="h-4 w-4" /> Editar
            </Button>
          </div>
        </div>

        {/* Event Details and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Detalhes do evento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CalendarDays className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Data</p>
                      <p className="text-gray-600">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Horário</p>
                      <p className="text-gray-600">{event.time}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Local</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Convidados</p>
                      <p className="text-gray-600">
                        {event.confirmedGuests} confirmados de {event.totalGuests} convidados
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Confirmações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Confirmados</span>
                    <span className="text-sm text-gray-500">
                      {event.confirmedGuests}/{event.totalGuests}
                    </span>
                  </div>
                  <Progress
                    value={event.totalGuests > 0 ? (event.confirmedGuests / event.totalGuests) * 100 : 0}
                    className="h-2 bg-gray-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-50 p-3 rounded-md">
                    <p className="text-2xl font-bold text-emerald-600">{event.confirmedGuests}</p>
                    <p className="text-xs text-gray-600">Confirmados</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md">
                    <p className="text-2xl font-bold text-amber-600">{pendingGuests}</p>
                    <p className="text-xs text-gray-600">Pendentes</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-2xl font-bold text-red-600">{declinedGuests}</p>
                    <p className="text-xs text-gray-600">Recusados</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={handleResendInvites}>
                  Reenviar convites
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="items">Itens ({event.items?.length || 0})</TabsTrigger>
            <TabsTrigger value="guests">Convidados ({event.guests?.length || 0})</TabsTrigger>
            <TabsTrigger value="photos">Fotos ({event.photos?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Itens do evento</CardTitle>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setIsAddItemOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar item
                </Button>
              </CardHeader>
              <CardContent>
                <ItemsList items={event.items || []} eventId={event.id} />

                {event.type === "Colaborativo" && event.items && event.items.length > 0 && (
                  <div className="mt-6 p-4 bg-emerald-50 rounded-md border border-emerald-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Resumo de custos</h3>
                      <Badge variant="outline" className="bg-white">
                        Colaborativo
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Custo total:</span>
                        <span className="font-medium">R$ {totalCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Número de participantes:</span>
                        <span className="font-medium">{event.confirmedGuests}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-emerald-200 text-emerald-700 font-semibold">
                        <span>Valor por pessoa:</span>
                        <span>R$ {costPerPerson}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Lista de convidados</CardTitle>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setIsAddGuestOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar convidados
                </Button>
              </CardHeader>
              <CardContent>
                <GuestList guests={event.guests || []} eventId={event.id} />
                <div className="flex flex-wrap gap-2 mt-4">
                  <EmailPreview
                    eventId={event.id}
                    guestId={event.guests?.[0]?.id || "example"}
                    eventTitle={event.title}
                    guestName={event.guests?.[0]?.name || "Convidado Exemplo"}
                    eventDate={event.date}
                    eventTime={event.time}
                    eventLocation={event.location}
                  />
                  <SmsPreview
                    eventId={event.id}
                    guestId={event.guests?.[0]?.id || "example"}
                    eventTitle={event.title}
                    guestName={event.guests?.[0]?.name || "Convidado Exemplo"}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <EventGallery eventId={event.id} photos={event.photos || []} canUpload={true} currentUser="Usuário Atual" />
          </TabsContent>
        </Tabs>

        {/* Diálogo para adicionar item */}
        <AddItemDialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen} eventId={event.id} />

        {/* Diálogo para adicionar convidado */}
        <AddGuestDialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen} eventId={event.id} />

        {/* Diálogo para editar evento */}
        <EditEventDialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen} eventId={event.id} />
      </div>
    </div>
  )
}
