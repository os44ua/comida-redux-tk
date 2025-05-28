// Slice para gestión de pedidos con operaciones CRUD en Firebase
// Slice для управления заказами с CRUD операциями в Firebase

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, push, update, remove, get } from 'firebase/database';
import { db } from '../../firebaseConfig';
import logger from '../../services/logging';

// Interfaz para pedidos
// Интерфейс для заказов
export interface Order {
  id: string;
  foodId: number;
  foodName: string;
  customerName: string;
  phone: string;
  quantity: number;
  totalAmount: number;
  timestamp: string;
}

// Interfaz para crear un nuevo pedido
// Интерфейс для создания нового заказа
export interface CreateOrderData {
  foodId: number;
  foodName: string;
  customerName: string;
  phone: string;
  quantity: number;
  totalAmount: number;
}

// Estado de los pedidos
// Состояние заказов
interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  submittingOrder: boolean; // Para el estado de envío de pedidos / Для состояния отправки заказов
}

// Estado inicial
// Начальное состояние
const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
  submittingOrder: false,
};

// AsyncThunk para crear un nuevo pedido
// AsyncThunk для создания нового заказа
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: CreateOrderData, { rejectWithValue }) => {
    try {
      logger.info(`📝 Iniciando creación de pedido para ${orderData.customerName}`);
      
      const orderWithTimestamp = {
        ...orderData,
        timestamp: new Date().toISOString()
      };
      
      const ordersRef = ref(db, 'orders');
      const newOrderRef = await push(ordersRef, orderWithTimestamp);
      
      // Devolvemos el pedido con su ID generado
      // Возвращаем заказ с сгенерированным ID
      const createdOrder: Order = {
        id: newOrderRef.key!,
        ...orderWithTimestamp
      };
      
      logger.info(`✅ Pedido creado exitosamente con ID: ${createdOrder.id}`);
      return createdOrder;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al crear pedido: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncThunk para obtener todos los pedidos
// AsyncThunk для получения всех заказов
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('🔄 Iniciando carga de pedidos desde Firebase');
      
      const ordersRef = ref(db, 'orders');
      const snapshot = await get(ordersRef);
      
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const ordersArray: Order[] = Object.entries(ordersData).map(([id, data]) => ({
          id,
          ...(data as Omit<Order, 'id'>)
        }));
        
        // Ordenamos por timestamp (más recientes primero)
        // Сортируем по timestamp (новые сначала)
        ordersArray.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        logger.info(`✅ ${ordersArray.length} pedidos cargados exitosamente`);
        return ordersArray;
      } else {
        logger.info('📭 No hay pedidos disponibles');
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al cargar pedidos: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncThunk para actualizar un pedido
// AsyncThunk для обновления заказа
export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, updates }: { id: string; updates: Partial<Order> }, { rejectWithValue }) => {
    try {
      logger.debug(`🔄 Actualizando pedido: ${id}`);
      
      const orderRef = ref(db, `orders/${id}`);
      await update(orderRef, updates);
      
      logger.info(`✅ Pedido ${id} actualizado exitosamente`);
      return { id, updates };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al actualizar pedido: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncThunk para eliminar un pedido
// AsyncThunk для удаления заказа
export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (orderId: string, { rejectWithValue }) => {
    try {
      logger.debug(`🗑️ Eliminando pedido: ${orderId}`);
      
      const orderRef = ref(db, `orders/${orderId}`);
      await remove(orderRef);
      
      logger.info(`✅ Pedido ${orderId} eliminado exitosamente`);
      return orderId;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al eliminar pedido: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// Creación del slice
// Создание slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Limpiar errores
    // Очистить ошибки
    clearError: (state) => {
      state.error = null;
    },
    
    // Limpiar todos los pedidos (para testing o reset)
    // Очистить все заказы (для тестирования или сброса)
    clearOrders: (state) => {
      state.orders = [];
      logger.info('🧹 Todos los pedidos han sido limpiados del estado');
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para createOrder
      // Кейсы для createOrder
      .addCase(createOrder.pending, (state) => {
        state.submittingOrder = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.submittingOrder = false;
        // Añadimos el nuevo pedido al principio de la lista
        // Добавляем новый заказ в начало списка
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.submittingOrder = false;
        state.error = action.payload as string || 'Error al crear el pedido';
      })
      
      // Casos para fetchOrders
      // Кейсы для fetchOrders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al cargar pedidos';
      })
      
      // Casos para updateOrder
      // Кейсы для updateOrder
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const { id, updates } = action.payload;
        
        // Encontramos y actualizamos el pedido en el estado
        // Находим и обновляем заказ в состоянии
        const orderIndex = state.orders.findIndex(order => order.id === id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = { ...state.orders[orderIndex], ...updates };
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al actualizar pedido';
      })
      
      // Casos para deleteOrder
      // Кейсы для deleteOrder
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Removemos el pedido eliminado del estado
        // Удаляем удаленный заказ из состояния
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al eliminar pedido';
      });
  },
});

// Exportamos las acciones y el reducer
// Экспортируем действия и reducer
export const { clearError, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;