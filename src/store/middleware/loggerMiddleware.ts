// ПРОСТАЯ версия middleware без сложной типизации
// Versión SIMPLE sin tipado complejo

import type { Middleware } from '@reduxjs/toolkit';

// Простой объект логгера
const logger = {
  debug: (message: string, data?: any) => console.log(`🟢 DEBUG: ${message}`, data || ''),
  info: (message: string, data?: any) => console.log(`🔵 INFO: ${message}`, data || ''),
  warn: (message: string, data?: any) => console.warn(`🟠 WARN: ${message}`, data || ''),
  error: (message: string, data?: any) => console.error(`❌ ERROR: ${message}`, data || ''),
};

// Простой middleware без использования AnyAction
export const loggerMiddleware: Middleware = store => next => action => {
  // Проверяем, что действие — это объект с полем type
  if (typeof action === 'object' && action !== null && 'type' in action) {
    const type = (action as any).type;
    const payload = (action as any).payload;

    logger.debug(`🚀 Ejecutando acción: ${type}`);

    // Логгируем специальные статусы (fulfilled, rejected, pending)
    if (type.includes('fulfilled')) {
      logger.info(`✅ Acción completada exitosamente: ${type}`);
    } else if (type.includes('rejected')) {
      logger.error(`❌ Acción falló: ${type}`, payload);
    } else if (type.includes('pending')) {
      logger.info(`⏳ Acción iniciada: ${type}`);
    }
  }

  // Сохраняем предыдущее состояние
  const prevState = store.getState();

  // Выполняем действие
  const result = next(action);

  // Сохраняем новое состояние
  const nextState = store.getState();

  logger.debug('🧾 Cambio de estado:', { prevState, nextState });

  return result;
};
