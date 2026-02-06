import { BaseEvent } from '@adonisjs/core/events'
import Inventario from '#models/inventario'

export default class EstoqueAtualizado extends BaseEvent {
  
  constructor(public inventario: Inventario) {
    super()
  }
}