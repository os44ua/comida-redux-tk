// Configuración principal del store Redux Toolkit
// Главная конфигурация store Redux Toolkit

import { configureStore } from '@reduxjs/toolkit';
import menuReducer from './slices/menuSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import uiReducer from './slices/uiSlice';
import { loggerMiddleware } from './middleware/loggerMiddleware';

// Configuración del store con middleware personalizado
// Конфигурация store с кастомным middleware
export const store = configureStore({
  reducer: {
    menu: menuReducer,      // Gestión del menú / Управление меню
    cart: cartReducer,      // Gestión del carrito / Управление корзиной
    orders: ordersReducer,  // Gestión de pedidos / Управление заказами
    ui: uiReducer,         // Estados de UI / UI состояния
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configuración para Firebase serialización
      // Конфигурация для сериализации Firebase
      serializableCheck: {
        ignoredActions: ['orders/fetchOrders/fulfilled'],
      },
    }).concat(loggerMiddleware), // Añadimos nuestro logger / Добавляем наш logger
});

// Tipos TypeScript para el store
// TypeScript типы для store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;