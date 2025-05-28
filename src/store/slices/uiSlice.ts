// store/slices/uiSlice.ts
// Slice para gestión de estados de la interfaz de usuario
// Slice для управления состояниями пользовательского интерфейса

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '../../entities/entities';
import logger from '../../services/logging';

// Estado de la interfaz de usuario
// Состояние пользовательского интерфейса
interface UIState {
  isChooseFoodPage: boolean;    // Si estamos en la página de elegir comida / Находимся ли на странице выбора еды
  showCart: boolean;            // Si el carrito está visible / Видна ли корзина
  showOrdersManager: boolean;   // Si el gestor de pedidos está visible / Виден ли менеджер заказов
  selectedFood: MenuItem | null; // Comida seleccionada actualmente / Выбранная в данный момент еда
  notifications: Notification[]; // Notificaciones del sistema / Системные уведомления
}

// Interfaz para notificaciones
// Интерфейс для уведомлений
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
  autoHide?: boolean; // Si se oculta automáticamente / Скрывается ли автоматически
}

// Estado inicial
// Начальное состояние
const initialState: UIState = {
  isChooseFoodPage: false,
  showCart: false,
  showOrdersManager: false,
  selectedFood: null,
  notifications: [],
};

// Creación del slice
// Создание slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Alternar página de elegir comida
    // Переключить страницу выбора еды
    toggleChooseFoodPage: (state) => {
      state.isChooseFoodPage = !state.isChooseFoodPage;
      logger.debug(`🔄 Página de elegir comida: ${state.isChooseFoodPage ? 'activada' : 'desactivada'}`);
      
      // Si salimos de la página de elegir comida, limpiamos la selección
      // Если покидаем страницу выбора еды, очищаем выбор
      if (!state.isChooseFoodPage) {
        state.selectedFood = null;
      }
    },
    
    // Establecer estado de página de elegir comida
    // Установить состояние страницы выбора еды
    setChooseFoodPage: (state, action: PayloadAction<boolean>) => {
      state.isChooseFoodPage = action.payload;
      logger.debug(`📄 Página de elegir comida establecida: ${action.payload}`);
      
      if (!action.payload) {
        state.selectedFood = null;
      }
    },
    
    // Alternar visibilidad del carrito
    // Переключить видимость корзины
    toggleCart: (state) => {
      state.showCart = !state.showCart;
      logger.debug(`🛒 Carrito: ${state.showCart ? 'mostrado' : 'oculto'}`);
    },
    
    // Establecer visibilidad del carrito
    // Установить видимость корзины
    setShowCart: (state, action: PayloadAction<boolean>) => {
      state.showCart = action.payload;
      logger.debug(`🛒 Visibilidad del carrito establecida: ${action.payload}`);
    },
    
    // Alternar gestor de pedidos
    // Переключить менеджер заказов
    toggleOrdersManager: (state) => {
      state.showOrdersManager = !state.showOrdersManager;
      logger.debug(`📋 Gestor de pedidos: ${state.showOrdersManager ? 'mostrado' : 'oculto'}`);
    },
    
    // Establecer visibilidad del gestor de pedidos
    // Установить видимость менеджера заказов
    setShowOrdersManager: (state, action: PayloadAction<boolean>) => {
      state.showOrdersManager = action.payload;
      logger.debug(`📋 Visibilidad del gestor de pedidos establecida: ${action.payload}`);
    },
    
    // Seleccionar comida
    // Выбрать еду
    setSelectedFood: (state, action: PayloadAction<MenuItem | null>) => {
      state.selectedFood = action.payload;
      if (action.payload) {
        logger.debug(`🍽️ Comida seleccionada: ${action.payload.name}`);
      } else {
        logger.debug('🍽️ Selección de comida limpiada');
      }
    },
    
    // Volver al menú (limpiar selección de comida)
    // Вернуться в меню (очистить выбор еды)
    returnToMenu: (state) => {
      state.selectedFood = null;
      logger.debug('🔙 Regresando al menú principal');
    },
    
    // Añadir notificación
    // Добавить уведомление
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      
      state.notifications.push(notification);
      logger.debug(`📢 Nueva notificación añadida: ${notification.type} - ${notification.message}`);
      
      // Limitar el número de notificaciones (máximo 5)
      // Ограничить количество уведомлений (максимум 5)
      if (state.notifications.length > 5) {
        state.notifications.shift();
      }
    },
    
    // Remover notificación por ID
    // Удалить уведомление по ID
    removeNotification: (state, action: PayloadAction<string>) => {
      const initialLength = state.notifications.length;
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      
      if (state.notifications.length < initialLength) {
        logger.debug(`📢 Notificación removida: ${action.payload}`);
      }
    },
    
    // Limpiar todas las notificaciones
    // Очистить все уведомления
    clearNotifications: (state) => {
      const count = state.notifications.length;
      state.notifications = [];
      if (count > 0) {
        logger.debug(`📢 ${count} notificaciones limpiadas`);
      }
    },
    
    // Limpiar notificaciones antiguas (más de 30 segundos)
    // Очистить старые уведомления (старше 30 секунд)
    clearOldNotifications: (state) => {
      const now = Date.now();
      const oldCount = state.notifications.length;
      
      state.notifications = state.notifications.filter(
        notification => now - notification.timestamp < 30000 // 30 segundos / 30 секунд
      );
      
      const removedCount = oldCount - state.notifications.length;
      if (removedCount > 0) {
        logger.debug(`📢 ${removedCount} notificaciones antiguas limpiadas`);
      }
    },
    
    // Resetear toda la UI al estado inicial
    // Сбросить весь UI к начальному состоянию
    resetUI: (_) => { //заменила state в параметре на подчеркивание
      logger.info('🔄 Reseteando interfaz de usuario al estado inicial');
      return initialState;
    },
    
    // Cerrar todos los modales/overlays
    // Закрыть все модальные окна/оверлеи
    closeAllModals: (state) => {
      state.showCart = false;
      state.showOrdersManager = false;
      state.selectedFood = null;
      logger.debug('❌ Todos los modales cerrados');
    }
  },
});

// Exportamos las acciones y el reducer
// Экспортируем действия и reducer
export const {
  toggleChooseFoodPage,
  setChooseFoodPage,
  toggleCart,
  setShowCart,
  toggleOrdersManager,
  setShowOrdersManager,
  setSelectedFood,
  returnToMenu,
  addNotification,
  removeNotification,
  clearNotifications,
  clearOldNotifications,
  resetUI,
  closeAllModals
} = uiSlice.actions;

export default uiSlice.reducer;