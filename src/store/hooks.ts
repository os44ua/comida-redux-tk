// store/hooks.ts
// Hooks tipados para usar con Redux Toolkit
// Типизированные хуки для использования с Redux Toolkit

//import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
//import type { AppDispatch, RootState } from '.';
import type { RootState, AppDispatch } from './index';

// Hook tipado para useDispatch
// Типизированный хук для useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook tipado para useSelector
// Типизированный хук для useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Hooks especializados para facilitar el acceso a estados específicos
// Специализированные хуки для упрощения доступа к конкретным состояниям

// Hook para obtener el estado del menú
// Хук для получения состояния меню
export const useMenu = () => {
  return useAppSelector((state) => state.menu);
};

// Hook para obtener solo los items del menú
// Хук для получения только элементов меню
export const useMenuItems = () => {
  return useAppSelector((state) => state.menu.items);
};

// Hook para obtener el estado del carrito
// Хук для получения состояния корзины
export const useCart = () => {
  return useAppSelector((state) => state.cart);
};

// Hook para obtener solo los items del carrito
// Хук для получения только элементов корзины
export const useCartItems = () => {
  return useAppSelector((state) => state.cart.items);
};

// Hook para obtener el número total de items en el carrito
// Хук для получения общего количества элементов в корзине
export const useCartTotalItems = () => {
  return useAppSelector((state) => state.cart.totalItems);
};

// Hook para obtener el precio total del carrito
// Хук для получения общей стоимости корзины
export const useCartTotalAmount = () => {
  return useAppSelector((state) => state.cart.totalAmount);
};

// Hook para obtener el estado de los pedidos
// Хук для получения состояния заказов
export const useOrders = () => {
  return useAppSelector((state) => state.orders);
};

// Hook para obtener solo la lista de pedidos
// Хук для получения только списка заказов
export const useOrdersList = () => {
  return useAppSelector((state) => state.orders.orders);
};

// Hook para obtener el estado de la UI
// Хук для получения состояния UI
export const useUI = () => {
  return useAppSelector((state) => state.ui);
};

// Hook para obtener la comida seleccionada
// Хук для получения выбранной еды
export const useSelectedFood = () => {
  return useAppSelector((state) => state.ui.selectedFood);
};

// Hook para obtener las notificaciones
// Хук для получения уведомлений
export const useNotifications = () => {
  return useAppSelector((state) => state.ui.notifications);
};

// Hook personalizado para verificar si hay operaciones de carga
// Кастомный хук для проверки наличия операций загрузки
export const useIsLoading = () => {
  return useAppSelector((state) => ({
    menu: state.menu.loading,
    orders: state.orders.loading,
    submittingOrder: state.orders.submittingOrder,
  }));
};

// Hook personalizado para obtener todos los errores del estado
// Кастомный хук для получения всех ошибок из состояния
export const useErrors = () => {
  return useAppSelector((state) => ({
    menuError: state.menu.error,
    ordersError: state.orders.error,
  }));
};