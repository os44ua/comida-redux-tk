// Componente de pedido de comida usando Redux
// Компонент заказа еды использующий Redux

import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../entities/entities';
import './FoodOrder.css';
import logger from '../services/logging';

// Importamos Redux hooks y acciones
// Импортируем Redux хуки и действия
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createOrder } from '../store/slices/ordersSlice';
import { addItem } from '../store/slices/cartSlice';
import { decreaseStock } from '../store/slices/menuSlice';
import { addNotification } from '../store/slices/uiSlice';

interface FoodOrderProps {
  food: MenuItem;
  onReturnToMenu: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const FoodOrder = ({ food, onReturnToMenu }: FoodOrderProps) => {
  // Estados locales del componente
  // Локальные состояния компонента
  const [totalAmount, setTotalAmount] = useState(food.price);
  const [quantity, setQuantity] = useState(1);
  const [isOrdered, setIsOrdered] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redux hooks
  const dispatch = useAppDispatch();
  const { submittingOrder } = useAppSelector(state => state.orders);

  // Función para guardar pedido en Firebase usando Redux
  // Функция для сохранения заказа в Firebase используя Redux
  const saveOrderToFirebase = async () => {
    try {
      logger.info(`📝 Iniciando guardado de pedido para ${customerName}`);
      
      // Creamos el objeto de datos del pedido
      // Создаем объект данных заказа
      const orderData = {
        foodId: food.id,
        foodName: food.name,
        quantity,
        totalAmount,
        customerName,
        phone,
      };
      
      // Despachamos la acción de crear pedido
      // Отправляем действие создания заказа
      const result = await dispatch(createOrder(orderData));
      
      if (createOrder.fulfilled.match(result)) {
        // Si el pedido se creó exitosamente
        // Если заказ создан успешно
        logger.info(`✅ Pedido guardado exitosamente para ${customerName}`);
        setIsOrdered(true);
        
        // Actualizamos el stock del producto
        // Обновляем запас продукта
        dispatch(decreaseStock({ id: food.id, quantity }));
        
        // Añadimos el producto al carrito
        // Добавляем продукт в корзину
        dispatch(addItem({ item: food, quantity }));
        
        // Mostramos notificación de éxito
        // Показываем уведомление об успехе
        dispatch(addNotification({
          type: 'success',
          message: `¡Pedido de ${food.name} enviado con éxito!`,
          autoHide: true
        }));
        
      } else {
        // Si hubo un error
        // Если произошла ошибка
        throw new Error(result.payload as string || 'Error al crear pedido');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`❌ Error al guardar pedido: ${errorMessage}`);
      setError('Ha ocurrido un error al procesar tu pedido. Por favor, inténtalo de nuevo.');
      
      // Mostramos notificación de error
      // Показываем уведомление об ошибке
      dispatch(addNotification({
        type: 'error',
        message: 'Error al procesar el pedido',
        autoHide: true
      }));
    }
  };

  // Manejador del envío del pedido
  // Обработчик отправки заказа
  const handleClick = () => {
    // Validación del formulario
    // Валидация формы
    if (!customerName.trim()) {
      setError('Por favor, introduce tu nombre');
      return;
    }
    
    if (!phone.trim()) {
      setError('Por favor, introduce tu número de teléfono');
      return;
    }
    
    // Verificamos que hay suficiente stock
    // Проверяем достаточность запаса
    if (quantity > food.quantity) {
      setError(`Solo quedan ${food.quantity} unidades disponibles`);
      return;
    }
    
    // Si todo está bien, limpiamos errores y guardamos el pedido
    // Если все в порядке, очищаем ошибки и сохраняем заказ
    setError(null);
    saveOrderToFirebase();
  };

  // Actualizar el precio total cuando cambia la cantidad
  // Обновить общую стоимость при изменении количества
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number(e.target.value);
    setQuantity(newQuantity);
    setTotalAmount(food.price * newQuantity);
  };

  // Logging del ciclo de vida del componente
  // Логирование жизненного цикла компонента
  useEffect(() => {
    logger.debug(`🍽️ Componente FoodOrder montado para ${food.name}`);
    
    return () => {
      logger.debug(`🍽️ Componente FoodOrder desmontado para ${food.name}`);
    };
  }, [food.name]);

  return (
    <div className="foodOrderContainer">
      <p className="foodOrderTitle">Comida Rápida Online</p>
      <h2>{food.name}</h2>

      <img 
        src={`${import.meta.env.VITE_APP_BASE_URL || '/'}images/${food.image}`} 
        alt={food.name} 
        className="foodOrderImg" 
      />

      <p className="foodOrderDesc">{food.desc}</p>
      <p className="foodOrderPrice">{food.price}€ por unidad</p>
      <p>Disponible: {food.quantity} unidades</p>
      <p><strong>Total: {totalAmount}€</strong></p>

      <div className="foodOrderForm">
        <label>
          Cantidad:
          <input
            className="foodOrderInput"
            type="number"
            value={quantity}
            min={1}
            max={food.quantity}
            onChange={handleQuantityChange}
            disabled={submittingOrder}
          />
        </label>

        <input
          className="foodOrderInput"
          type="text"
          placeholder="Tu nombre"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={submittingOrder}
        />

        <input
          className="foodOrderInput"
          type="tel"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={submittingOrder}
        />
      </div>

      {/* Mostrar mensaje de error si existe */}
      {/* Показать сообщение об ошибке если есть */}
      {error && (
        <div className="errorMessage" style={{color: 'red', marginTop: '10px'}}>
          {error}
        </div>
      )}

      <div className="foodOrderButtons">
        <button 
          className="btnConfirm" 
          onClick={handleClick}  
          disabled={submittingOrder || food.quantity === 0}
        >
          {submittingOrder ? 'Procesando...' : 'Enviar pedido'}
        </button>
        
        <button 
          className="btnBack" 
          onClick={onReturnToMenu} 
          disabled={submittingOrder}
        >
          Volver al menú
        </button>
      </div>

      {/* Indicador de carga */}
      {/* Индикатор загрузки */}
      {submittingOrder && (
        <div className="loadingIndicator" style={{marginTop: '15px', color: '#007bff'}}>
          Procesando tu pedido, por favor espera...
        </div>
      )}

      {/* Mensaje de confirmación */}
      {/* Сообщение подтверждения */}
      {isOrdered && (
        <div className="confirmationBox">
          ✅ Pedido enviado exitosamente. 
          <strong> Recibirás un SMS una vez esté listo para recoger.</strong>
        </div>
      )}
    </div>
  );
};

export default FoodOrder;