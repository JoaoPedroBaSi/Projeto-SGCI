import Inventario from '#models/inventario'
import Reserva from '#models/reserva'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'inventario:atualizado': { inventario: Inventario }
    'reserva:aprovada': { reserva: Reserva }
  }
}