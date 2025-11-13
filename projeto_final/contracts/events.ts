import Inventario from "#models/inventario";

declare module '@adonisjs/core/types' {
    interface EventsList {
        'inventario:atualizado': { item: Inventario}
    }
}