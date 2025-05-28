// tests/App.test.tsx
// Tests actualizados para la aplicación con Redux Toolkit
// Обновленные тесты для приложения с Redux Toolkit

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';

// Importamos los reducers para crear un store de prueba
// Импортируем reducers для создания тестового store
import menuReducer from '../store/slices/menuSlice';
import cartReducer from '../store/slices/cartSlice';
import ordersReducer from '../store/slices/ordersSlice';
import uiReducer from '../store/slices/uiSlice';

// Función para crear un store de prueba
// Функция для создания тестового store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      menu: menuReducer,
      cart: cartReducer,
      orders: ordersReducer,
      ui: uiReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Deshabilitamos para tests / Отключаем для тестов
      }),
  });
};

// Componente wrapper para tests con Redux Provider
// Компонент обертка для тестов с Redux Provider
const renderWithRedux = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('Comida Rápida App Tests con Redux', () => {
  // Limpiar después de cada test
  // Очистка после каждого теста
  afterEach(() => {
    cleanup();
  });

  // Test 1: Verificar que el menú inicial muestra cuatro productos
  // Test 1: Проверить что начальное меню показывает четыре продукта
  it('muestra cuatro productos en la carta inicial con Redux', async () => {
    renderWithRedux(<App />);
    
    // Verificamos que el título principal está presente
    // Проверяем что основной заголовок присутствует
    expect(screen.getByText('Comida Rápida Online')).toBeInTheDocument();
    
    // Esperamos a que cargue el menú
    // Ждем загрузки меню
    await waitFor(() => {
      const menuItems = screen.getAllByRole('listitem');
      expect(menuItems.length).toBe(4);
    });
    
    // Verificamos que cada elemento tiene un nombre y cantidad
    // Проверяем что у каждого элемента есть название и количество
    expect(screen.getByText('Hamburguesa de Pollo')).toBeInTheDocument();
    expect(screen.getByText('#40')).toBeInTheDocument();
    
    const vegBurgerItem = screen.getByText('Hamburguesa Vegetariana').closest('li');
    expect(vegBurgerItem).not.toBeNull();
    if (vegBurgerItem) {
      expect(within(vegBurgerItem).getByText(/#30/)).toBeInTheDocument();
    }
        
    expect(screen.getByText('Patatas Fritas')).toBeInTheDocument();
    expect(screen.getByText('#50')).toBeInTheDocument();
    
    const iceCreamItem = screen.getByText('Helado').closest('li');
    expect(iceCreamItem).not.toBeNull();
    if (iceCreamItem) {
      expect(within(iceCreamItem).getByText(/#30/)).toBeInTheDocument();
    }
  });

  // Test 2: Verificar la funcionalidad del carrito con Redux
  // Test 2: Проверить функциональность корзины с Redux
  it('muestra el carrito con cantidad correcta usando Redux', async () => {
    renderWithRedux(<App />);
    
    const user = userEvent.setup();
    
    // Verificamos que el carrito inicialmente está vacío
    // Проверяем что корзина изначально пуста
    expect(screen.getByText('Carrito (0)')).toBeInTheDocument();
    
    // Intentamos mostrar el carrito
    // Пытаемся показать корзину
    await user.click(screen.getByText('Carrito (0)'));
    
    // Verificamos que aparece el mensaje de carrito vacío
    // Проверяем что появляется сообщение о пустой корзине
    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    });
  });

  // Test 3: Verificar la página de pedir comida con Redux
  // Test 3: Проверить страницу заказа еды с Redux
  it('muestra cuatro productos y sus precios en la pantalla de Pedir Comida con Redux', async () => {
    renderWithRedux(<App />);
    
    const user = userEvent.setup();
    
    // Hacer clic en "Pedir Comida"
    // Кликнуть на "Pedir Comida"
    await user.click(screen.getByText('Pedir Comida'));
    
    // Esperar a que aparezca la carta con carga diferida
    // Ждать появления меню с ленивой загрузкой
    await waitFor(() => {
      expect(screen.getByText('Carta')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verificar que todos los productos están mostrados
    // Проверить что все продукты отображены
    const productDescriptions = [
      'Hamburguesa de pollo frito - lechuga, tomate, queso y mayonesa',
      'Hamburguesa verde - lechuga, tomate, queso vegano y mayonesa',
      'Patatas crujientes con sal y especias',
      'Helado casero de vainilla con toppings'
    ];
    
    for (const desc of productDescriptions) {
      expect(screen.getByText(desc)).toBeInTheDocument();
    }
    
    // Verificar los precios
    // Проверить цены
    expect(screen.getByText('24€')).toBeInTheDocument();
    expect(screen.getByText('22€')).toBeInTheDocument();
    expect(screen.getByText('8€')).toBeInTheDocument();
    expect(screen.getByText('6€')).toBeInTheDocument();
    
    // Verificar las imágenes
    // Проверить изображения
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(4);
  });

  // Test 4: Verificar la funcionalidad de alternar UI
  // Test 4: Проверить функциональность переключения UI
  it('alterna correctamente entre las diferentes vistas usando Redux', async () => {
    renderWithRedux(<App />);
    
    const user = userEvent.setup();
    
    // Estado inicial: debería mostrar "Pedir Comida"
    // Начальное состояние: должно показывать "Pedir Comida"
    expect(screen.getByText('Pedir Comida')).toBeInTheDocument();
    expect(screen.getByText('Menús')).toBeInTheDocument();
    
    // Hacer clic en "Pedir Comida"
    // Кликнуть на "Pedir Comida"
    await user.click(screen.getByText('Pedir Comida'));
    
    // Debería cambiar a "Disponibilidad"
    // Должно измениться на "Disponibilidad"
    await waitFor(() => {
      expect(screen.getByText('Disponibilidad')).toBeInTheDocument();
    });
    
    // Hacer clic en "Disponibilidad"
    // Кликнуть на "Disponibilidad"
    await user.click(screen.getByText('Disponibilidad'));
    
    // Debería volver a "Pedir Comida"
    // Должно вернуться к "Pedir Comida"
    await waitFor(() => {
      expect(screen.getByText('Pedir Comida')).toBeInTheDocument();
      expect(screen.getByText('Menús')).toBeInTheDocument();
    });
  });

  // Test 5: Verificar que Redux store funciona correctamente
  // Test 5: Проверить что Redux store работает корректно
  it('inicializa correctamente el estado de Redux', () => {
    const { store } = renderWithRedux(<App />);
    
    const state = store.getState();
    
    // Verificar estado inicial del menú
    // Проверить начальное состояние меню
    expect(state.menu.items).toHaveLength(4);
    expect(state.menu.loading).toBe(false);
    expect(state.menu.error).toBeNull();
    
    // Verificar estado inicial del carrito
    // Проверить начальное состояние корзины
    expect(state.cart.items).toHaveLength(0);
    expect(state.cart.totalItems).toBe(0);
    expect(state.cart.totalAmount).toBe(0);
    
    // Verificar estado inicial de UI
    // Проверить начальное состояние UI
    expect(state.ui.isChooseFoodPage).toBe(false);
    expect(state.ui.showCart).toBe(false);
    expect(state.ui.showOrdersManager).toBe(false);
    expect(state.ui.selectedFood).toBeNull();
    
    // Verificar estado inicial de pedidos
    // Проверить начальное состояние заказов
    expect(state.orders.orders).toHaveLength(0);
    expect(state.orders.loading).toBe(false);
    expect(state.orders.submittingOrder).toBe(false);
  });

  // Test 6: Verificar el gestor de pedidos
  // Test 6: Проверить менеджер заказов
  it('puede abrir y cerrar el gestor de pedidos', async () => {
    renderWithRedux(<App />);
    
    const user = userEvent.setup();
    
    // Hacer clic en "Gestionar Pedidos"
    // Кликнуть на "Gestionar Pedidos"
    await user.click(screen.getByText('Gestionar Pedidos'));
    
    // Verificar que se abre el gestor
    // Проверить что менеджер открылся
    await waitFor(() => {
      expect(screen.getByText('📋 Gestión de Pedidos')).toBeInTheDocument();
      expect(screen.getByText('Cerrar Pedidos')).toBeInTheDocument();
    });
    
    // Hacer clic en "Cerrar Pedidos"
    // Кликнуть на "Cerrar Pedidos"
    await user.click(screen.getByText('Cerrar Pedidos'));
    
    // Verificar que se cierra el gestor
    // Проверить что менеджер закрылся
    await waitFor(() => {
      expect(screen.getByText('Gestionar Pedidos')).toBeInTheDocument();
      expect(screen.queryByText('📋 Gestión de Pedidos')).not.toBeInTheDocument();
    });
  });
});