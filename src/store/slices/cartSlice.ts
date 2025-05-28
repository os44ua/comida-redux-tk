// store/slices/cartSlice.ts
// Slice para gestión del carrito de compras
// Slice для управления корзиной покупок

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '../../entities/entities';
import logger from '../../services/logging';

// Interfaz para elementos del carrito
// Интерфейс для элементов корзины
export interface CartItem {
  item: MenuItem;
  quantity: number;
}

// Estado del carrito
// Состояние корзины
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

// Estado inicial
// Начальное состояние
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

// Función auxiliar para calcular totales
// Вспомогательная функция для подсчета итогов
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, cartItem) => total + cartItem.quantity, 0);
  const totalAmount = items.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0);
  
  return { totalItems, totalAmount };
};

// Creación del slice
// Создание slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Añadir producto al carrito
    // Добавить продукт в корзину
    addItem: (state, action: PayloadAction<{ item: MenuItem; quantity: number }>) => {
      const { item, quantity } = action.payload;
      
      // Verificamos si el producto ya existe en el carrito
      // Проверяем существует ли продукт в корзине
      const existingItem = state.items.find(cartItem => cartItem.item.id === item.id);
      
      if (existingItem) {
        // Si existe, aumentamos la cantidad
        // Если существует, увеличиваем количество
        existingItem.quantity += quantity;
        logger.info(`🛒 Cantidad actualizada en carrito: ${item.name}, nueva cantidad: ${existingItem.quantity}`);
      } else {
        // Si no existe, lo añadimos como nuevo elemento
        // Если не существует, добавляем как новый элемент
        state.items.push({ item, quantity });
        logger.info(`🛒 Nuevo producto añadido al carrito: ${item.name}, cantidad: ${quantity}`);
      }
      
      // Recalculamos los totales
      // Пересчитываем итоги
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
    },
    
    // Remover producto del carrito completamente
    // Полностью удалить продукт из корзины
    removeItem: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const itemToRemove = state.items.find(cartItem => cartItem.item.id === itemId);
      
      if (itemToRemove) {
        logger.info(`🗑️ Producto eliminado del carrito: ${itemToRemove.item.name}`);
        
        // Filtramos el elemento eliminado
        // Фильтруем удаленный элемент
        state.items = state.items.filter(cartItem => cartItem.item.id !== itemId);
        
        // Recalculamos los totales
        // Пересчитываем итоги
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      }
    },
    
    // Actualizar cantidad de un producto específico
    // Обновить количество конкретного продукта
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(cartItem => cartItem.item.id === id);
      
      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
          logger.debug(`🔄 Cantidad actualizada en carrito: producto ${id}, nueva cantidad: ${quantity}`);
        } else {
          // Si la cantidad es 0, eliminamos el elemento
          // Если количество 0, удаляем элемент
          state.items = state.items.filter(cartItem => cartItem.item.id !== id);
          logger.info(`🗑️ Producto eliminado por cantidad 0: ${item.item.name}`);
        }
        
        // Recalculamos los totales
        // Пересчитываем итоги
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      }
    },
    
    // Limpiar todo el carrito
    // Очистить всю корзину
    clearCart: (state) => {
      logger.info('🧹 Carrito limpiado completamente');
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
    },
    
    // Aumentar cantidad de un producto en 1
    // Увеличить количество продукта на 1
    incrementQuantity: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const item = state.items.find(cartItem => cartItem.item.id === itemId);
      
      if (item) {
        item.quantity += 1;
        logger.debug(`➕ Cantidad incrementada: producto ${itemId}, nueva cantidad: ${item.quantity}`);
        
        // Recalculamos los totales
        // Пересчитываем итоги
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      }
    },
    
    // Disminuir cantidad de un producto en 1
    // Уменьшить количество продукта на 1
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      const item = state.items.find(cartItem => cartItem.item.id === itemId);
      
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
          logger.debug(`➖ Cantidad decrementada: producto ${itemId}, nueva cantidad: ${item.quantity}`);
        } else {
          // Si la cantidad llega a 1 y decrementamos, eliminamos el elemento
          // Если количество достигает 1 и уменьшаем, удаляем элемент
          state.items = state.items.filter(cartItem => cartItem.item.id !== itemId);
          logger.info(`🗑️ Producto eliminado por decremento: ${item.item.name}`);
        }
        
        // Recalculamos los totales
        // Пересчитываем итоги
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
      }
    }
  },
});

// Exportamos las acciones y el reducer
// Экспортируем действия и reducer
export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  incrementQuantity,
  decrementQuantity
} = cartSlice.actions;

export default cartSlice.reducer;