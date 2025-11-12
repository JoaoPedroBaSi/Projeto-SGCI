import emitter from "@adonisjs/core/services/emitter";

emitter.on('inventario:atualizado', () => import('#listeners/notificar_admin_estoque_baixo'))