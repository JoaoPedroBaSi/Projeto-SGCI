import scheduler from 'adonisjs-scheduler/services/main'
import logger from '@adonisjs/core/services/logger'

scheduler.command("inspire").everyFiveSeconds();

scheduler.call(() => {
    logger.info("Iniciando limpeza semanal do Banco de Dados...");
}).weekly();

scheduler.command('verificar:reservas-expiradas').everyMinute();

scheduler.call(async () => {
    logger.info("Verificando validade de itens no inventário...");
}).dailyAt('03:00');