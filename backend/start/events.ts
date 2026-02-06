import emitter from '@adonisjs/core/services/emitter'

emitter.on('inventario:atualizado', () => import('#listeners/notificar_admin_estoque_baixo'))
emitter.on('reserva:aprovada', () => import('#listeners/atualizar_status_sala'))