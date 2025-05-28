// App.tsx
// Componente principal de la aplicación usando Redux Toolkit
// Главный компонент приложения использующий Redux Toolkit

import { useEffect, lazy, Suspense } from 'react'
import './App.css'
import FoodOrder from './components/FoodOrder';
import Cart from './components/Cart';
import ErrorBoundary from './components/ErrorBoundary';
import OrdersManager from './components/OrdersManager';
import Notifications from './components/Notifications'; // Añadimos el componente de notificaciones
import logger from './services/logging';

// Importamos los hooks y acciones de Redux
// Импортируем хуки и действия Redux
import { useAppDispatch, useAppSelector, useCartTotalItems, useUI } from './store/hooks';
import { fetchMenu } from './store/slices/menuSlice';
import { fetchOrders } from './store/slices/ordersSlice';
import { 
  toggleChooseFoodPage, 
  toggleCart, 
  toggleOrdersManager,
  setSelectedFood 
} from './store/slices/uiSlice';

// Carga diferida de componentes
// Ленивая загрузка компонентов
const Foods = lazy(() => import('./components/Foods'));

function App() {
  // Redux hooks
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector(state => state.menu.items);
  //const cartItems = useAppSelector(state => state.cart.items);
  const cartTotalItems = useCartTotalItems();
  const uiState = useUI();
  const isLoading = useAppSelector(state => state.menu.loading);

  // Inicialización de la aplicación
  // Инициализация приложения
  useEffect(() => {
    logger.info("🚀 Aplicación Redux iniciada");
    
    // Cargamos el menú inicial desde Firebase
    // Загружаем начальное меню из Firebase
    dispatch(fetchMenu());
    
    return () => {
      logger.info("🔚 Aplicación finalizada");
    };
  }, [dispatch]);

  // Manejadores de eventos
  // Обработчики событий
  const handleToggleFoodPage = () => {
    logger.debug('🔄 Alternando página de comida');
    dispatch(toggleChooseFoodPage());
  };

  const handleToggleCart = () => {
    logger.debug('🛒 Alternando carrito');
    dispatch(toggleCart());
  };

  const handleToggleOrdersManager = () => {
    logger.debug('📋 Alternando gestor de pedidos');
    dispatch(toggleOrdersManager());
    
    // Si abrimos el gestor de pedidos, cargamos los pedidos
    // Если открываем менеджер заказов, загружаем заказы
    if (!uiState.showOrdersManager) {
      dispatch(fetchOrders());
    }
  };

  const handleFoodSelected = (food: any) => {
    logger.debug(`🍽️ Comida seleccionada: ${food.name}`);
    dispatch(setSelectedFood(food));
  };

  const handleReturnToMenu = () => {
    logger.debug('🔙 Regresando al menú');
    dispatch(setSelectedFood(null));
  };

  // UI de respaldo para ErrorBoundary
  // Резервный UI для ErrorBoundary
  const errorFallback = (
    <div className="errorFallback">
      <h2>¡Algo salió mal!</h2>
      <p>Ha ocurrido un error inesperado. Por favor, intenta recargar la página.</p>
      <button onClick={() => window.location.reload()}>Recargar página</button>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      {/* Componente de notificaciones */}
      {/* Компонент уведомлений */}
      <Notifications />
      
      <div className="app-container">
        {/* Botones de navegación principal */}
        {/* Кнопки основной навигации */}
        <div className="header-buttons">
          <button 
            className="toggleButton" 
            onClick={handleToggleFoodPage}
            disabled={isLoading}
          > 
            {uiState.isChooseFoodPage ? "Disponibilidad" : "Pedir Comida"} 
          </button>
          
          <button 
            className="cartButton" 
            onClick={handleToggleCart}
          >
            Carrito ({cartTotalItems})
          </button>
          
          <button
            className="ordersButton"
            onClick={handleToggleOrdersManager}
          >
            {uiState.showOrdersManager ? "Cerrar Pedidos" : "Gestionar Pedidos"}
          </button>
        </div>
        
        <h3 className="title">Comida Rápida Online</h3>
        
        {/* Indicador de carga */}
        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="loading-indicator">
            Cargando menú...
          </div>
        )}
        
        {/* Carrito de compras */}
        {/* Корзина покупок */}
        {uiState.showCart && <Cart />}
        
        {/* Gestor de pedidos o contenido principal */}
        {/* Менеджер заказов или основной контент */}
        {uiState.showOrdersManager ? (
          <OrdersManager />
        ) : (
          <>
            {/* Vista de disponibilidad (menú principal) */}
            {/* Вид доступности (главное меню) */}
            {!uiState.isChooseFoodPage && (       
              <>
                <h4 className="subTitle">Menús</h4> 
                <ul className="ulApp"> 
                  {menuItems.map((item) => ( 
                    <li 
                      key={item.id} 
                      className="liApp" 
                      onClick={() => handleFoodSelected(item)}
                    > 
                      <p>{item.name}</p>
                      <p>#{item.quantity}</p> 
                    </li> 
                  ))} 
                </ul>
              </>
            )} 
          
            {/* Vista de pedido de comida */}
            {/* Вид заказа еды */}
            {uiState.isChooseFoodPage && (
              uiState.selectedFood ? (
                <FoodOrder
                  food={uiState.selectedFood}
                  onReturnToMenu={handleReturnToMenu}
                />
              ) : (
                <Suspense fallback={<div>Cargando detalles…</div>}>
                  <Foods onFoodSelected={handleFoodSelected} />
                </Suspense>
              )
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App