// Slice para gestión del menú de productos
// Slice для управления меню продуктов

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '../../entities/entities';
import { ref, get, update } from 'firebase/database';
import { db } from '../../firebaseConfig';
import logger from '../../services/logging';

// Estado inicial del menú
// Начальное состояние меню
interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
}

// Datos iniciales del menú (fallback si Firebase falla)
// Начальные данные меню (резерв если Firebase не работает)
const initialMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Hamburguesa de Pollo",
    quantity: 40,
    desc: "Hamburguesa de pollo frito - lechuga, tomate, queso y mayonesa",
    price: 24,
    image: "cb.jpeg",
  },
  {
    id: 2,
    name: "Hamburguesa Vegetariana",
    quantity: 30,
    desc: "Hamburguesa verde - lechuga, tomate, queso vegano y mayonesa",
    price: 22,
    image: "vb.jpg",
  },
  {
    id: 3,
    name: "Patatas Fritas",
    quantity: 50,
    desc: "Patatas crujientes con sal y especias",
    price: 8,
    image: "chips.jpeg",
  },
  {
    id: 4,
    name: "Helado",
    quantity: 30,
    desc: "Helado casero de vainilla con toppings",
    price: 6,
    image: "ic.jpeg",
  },
];

const initialState: MenuState = {
  items: initialMenuItems,
  loading: false,
  error: null,
};

// AsyncThunk para cargar el menú desde Firebase
// AsyncThunk для загрузки меню из Firebase
export const fetchMenu = createAsyncThunk(
  'menu/fetchMenu',
  async (_, { rejectWithValue }) => {
    try {
      logger.info('🔄 Iniciando carga de menú desde Firebase');
      
      const menuRef = ref(db, 'menu');
      const snapshot = await get(menuRef);
      
      if (snapshot.exists()) {
        const menuData = snapshot.val();
        const menuArray = Object.entries(menuData).map(([id, data]) => ({
          id: parseInt(id),
          ...(data as Omit<MenuItem, 'id'>)
        }));
        
        logger.info(`✅ Menú cargado exitosamente: ${menuArray.length} productos`);
        return menuArray;
      } else {
        // Si no hay datos en Firebase, inicializamos con datos por defecto
        // Если в Firebase нет данных, инициализируем дефолтными данными
        logger.info('📝 Inicializando menú con datos por defecto');
        await initializeMenuInFirebase();
        return initialMenuItems;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al cargar menú: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncThunk para actualizar stock de un producto
// AsyncThunk для обновления количества продукта
export const updateMenuItemStock = createAsyncThunk(
  'menu/updateStock',
  async ({ id, newQuantity }: { id: number; newQuantity: number }, { rejectWithValue }) => {
    try {
      logger.debug(`🔄 Actualizando stock del producto ${id} a ${newQuantity}`);
      
     // const itemRef = ref(db, `menu/${id}/quantity`);
      await update(ref(db, `menu/${id}`), { quantity: newQuantity });
      
      logger.info(`✅ Stock actualizado para producto ${id}`);
      return { id, newQuantity };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al actualizar stock: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// Función auxiliar para inicializar el menú en Firebase
// Вспомогательная функция для инициализации меню в Firebase
const initializeMenuInFirebase = async () => {
  try {
    const menuRef = ref(db, 'menu');
    const initialData: Record<number, Omit<MenuItem, 'id'>> = {};
    
    initialMenuItems.forEach(item => {
      initialData[item.id] = {
        name: item.name,
        quantity: item.quantity,
        desc: item.desc,
        price: item.price,
        image: item.image
      };
    });
    
    await update(menuRef, initialData);
    logger.info('✅ Menú inicializado en Firebase');
  } catch (error) {
    logger.error(`❌ Error al inicializar menú en Firebase: ${error}`);
  }
};

// Creación del slice
// Создание slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Reducer para disminuir stock localmente (optimistic update)
    // Reducer для уменьшения количества локально (optimistic update)
    decreaseStock: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item && item.quantity >= action.payload.quantity) {
        item.quantity -= action.payload.quantity;
        logger.debug(`📦 Stock local actualizado: producto ${action.payload.id}, nuevo stock: ${item.quantity}`);
      }
    },
    
    // Reducer para aumentar stock localmente (cuando se elimina del carrito)
    // Reducer для увеличения количества локально (когда удаляется из корзины)
    increaseStock: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity += action.payload.quantity;
        logger.debug(`📦 Stock restaurado: producto ${action.payload.id}, nuevo stock: ${item.quantity}`);
      }
    },
    
    // Limpiar errores
    // Очистить ошибки
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchMenu
      // Кейсы для fetchMenu
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al cargar el menú';
      })
      
      // Casos para updateMenuItemStock
      // Кейсы для updateMenuItemStock
      .addCase(updateMenuItemStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMenuItemStock.fulfilled, (state, action) => {
        state.loading = false;
        const item = state.items.find(item => item.id === action.payload.id);
        if (item) {
          item.quantity = action.payload.newQuantity;
        }
      })
      .addCase(updateMenuItemStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error al actualizar stock';
      });
  },
});

// Exportamos las acciones y el reducer
// Экспортируем действия и reducer
export const { decreaseStock, increaseStock, clearError } = menuSlice.actions;
export default menuSlice.reducer;