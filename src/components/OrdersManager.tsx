// components/OrdersManager.tsx
// Gestor de pedidos usando Redux para operaciones CRUD
// Менеджер заказов использующий Redux для CRUD операций

import React, { useState, useEffect } from 'react';
import './OrdersManager.css';
import logger from '../services/logging';

// Importamos Redux hooks y acciones
// Импортируем Redux хуки и действия
import { useAppDispatch, useOrders } from '../store/hooks';
import { fetchOrders, updateOrder, deleteOrder } from '../store/slices/ordersSlice';
import { addNotification } from '../store/slices/uiSlice';
import type { Order } from '../store/slices/ordersSlice';

const OrdersManager: React.FC = () => {
  // Estados locales para la edición
  // Локальные состояния для редактирования
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(1);
  
  // Redux hooks
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useOrders();

  // Cargar pedidos al montar el componente
  // Загрузить заказы при монтировании компонента
  useEffect(() => {
    logger.info('📋 Iniciando OrdersManager');
    dispatch(fetchOrders());
    
    return () => {
      logger.debug('📋 OrdersManager desmontado');
    };
  }, [dispatch]);

  // Manejar actualización de pedido
  // Обработка обновления заказа
  const handleUpdateOrder = async () => {
    if (!editingOrder || !newQuantity) return;
    
    logger.debug(`🔄 Iniciando actualización del pedido: ${editingOrder.id}`);
    
    // Calculamos el nuevo precio total
    // Вычисляем новую общую стоимость
    const unitPrice = editingOrder.totalAmount / editingOrder.quantity;
    const newTotalAmount = unitPrice * newQuantity;
    
    try {
      const result = await dispatch(updateOrder({
        id: editingOrder.id,
        updates: {
          quantity: newQuantity,
          totalAmount: newTotalAmount
        }
      }));
      
      if (updateOrder.fulfilled.match(result)) {
        logger.info(`✅ Pedido ${editingOrder.id} actualizado con éxito`);
        
        // Mostramos notificación de éxito
        // Показываем уведомление об успехе
        dispatch(addNotification({
          type: 'success',
          message: 'Pedido actualizado correctamente',
          autoHide: true
        }));
        
        setEditingOrder(null);
      } else {
        throw new Error(result.payload as string);
      }
    } catch (error) {
      logger.error(`❌ Error al actualizar pedido: ${error}`);
      
      // Mostramos notificación de error
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: 'Error al actualizar el pedido',
        autoHide: true
      }));
    }
  };
  
  // Manejar eliminación de pedido
  // Обработка удаления заказа
  const handleDeleteOrder = async (orderId: string, orderName: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) return;
    
    logger.debug(`🗑️ Iniciando eliminación del pedido: ${orderId}`);
    
    try {
      const result = await dispatch(deleteOrder(orderId));
      
      if (deleteOrder.fulfilled.match(result)) {
        logger.info(`✅ Pedido ${orderId} eliminado con éxito`);
        
        // Mostramos notificación de éxito
        // Показываем уведомление об успехе
        dispatch(addNotification({
          type: 'success',
          message: `Pedido de ${orderName} eliminado`,
          autoHide: true
        }));
      } else {
        throw new Error(result.payload as string);
      }
    } catch (error) {
      logger.error(`❌ Error al eliminar pedido: ${error}`);
      
      // Mostramos notificación de error
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: 'Error al eliminar el pedido',
        autoHide: true
      }));
    }
  };
  
  // Función para formatear fecha
  // Функция для форматирования даты
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Manejar el botón de recargar pedidos
  // Обработка кнопки перезагрузки заказов
  const handleRefreshOrders = () => {
    logger.debug('🔄 Recargando pedidos manualmente');
    dispatch(fetchOrders());
  };
  
  return (
    <div className="orders-manager">
      <div className="orders-header">
        <h2>📋 Gestión de Pedidos</h2>
        <button 
          onClick={handleRefreshOrders}
          disabled={loading}
          className="refresh-button"
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Cargando...' : '🔄 Actualizar'}
        </button>
      </div>
      
      {/* Indicador de carga */}
      {/* Индикатор загрузки */}
      {loading && (
        <div className="loading-indicator">
          Cargando pedidos...
        </div>
      )}
      
      {/* Mensaje de error */}
      {/* Сообщение об ошибке */}
      {error && (
        <div className="error-message">
          ❌ {error}
          <button 
            onClick={() => dispatch(fetchOrders())}
            style={{marginLeft: '10px'}}
          >
            Reintentar
          </button>
        </div>
      )}
      
      {/* Lista de pedidos */}
      {/* Список заказов */}
      {orders.length === 0 && !loading ? (
        <div className="empty-message">
          📭 No hay pedidos disponibles
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Pedido #{order.id.substring(0, 6)}</h3>
                <span className="order-date">{formatDate(order.timestamp)}</span>
              </div>
              
              <div className="order-details">
                <p><strong>👤 Cliente:</strong> {order.customerName}</p>
                <p><strong>📞 Teléfono:</strong> {order.phone}</p>
                <p><strong>🍽️ Producto:</strong> {order.foodName}</p>
                <p><strong>📦 Cantidad:</strong> {order.quantity}</p>
                <p><strong>💰 Total:</strong> {order.totalAmount.toFixed(2)}€</p>
              </div>
              
              <div className="order-actions">
                <button
                  className="edit-button"
                  onClick={() => {
                    setEditingOrder(order);
                    setNewQuantity(order.quantity);
                  }}
                  disabled={loading}
                >
                  ✏️ Editar
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteOrder(order.id, order.foodName)}
                  disabled={loading}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de edición */}
      {/* Модальное окно редактирования */}
      {editingOrder && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>✏️ Editar Pedido</h3>
            
            <div className="order-info">
              <p><strong>Cliente:</strong> {editingOrder.customerName}</p>
              <p><strong>Producto:</strong> {editingOrder.foodName}</p>
              <p><strong>Precio unitario:</strong> {(editingOrder.totalAmount / editingOrder.quantity).toFixed(2)}€</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Nueva cantidad:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
              />
              <p><strong>Nuevo total:</strong> {((editingOrder.totalAmount / editingOrder.quantity) * newQuantity).toFixed(2)}€</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => setEditingOrder(null)}
                disabled={loading}
              >
                ❌ Cancelar
              </button>
              <button 
                className="save-button" 
                onClick={handleUpdateOrder}
                disabled={loading}
              >
                {loading ? 'Guardando...' : '✅ Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;