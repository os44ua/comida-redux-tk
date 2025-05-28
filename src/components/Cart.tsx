/*import React from 'react';
import type { MenuItem } from '../entities/entities';

interface CartProps {
  cartItems: { item: MenuItem; quantity: number }[];
  onRemoveItem: (id: number) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onRemoveItem }) => {
  const total = cartItems.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  return (
    <div className="cart-container">
      <h3>Carrito de compras</h3>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <ul>
          {cartItems.map(({ item, quantity }) => (
            <li key={item.id} className="cart-item">
              {item.name} x{quantity} - {item.price * quantity}€
              <button onClick={() => onRemoveItem(item.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
      <p className="total-price">Total: {total}€</p>
    </div>
  );
};

export default Cart;*/

// components/Cart.tsx
// Componente del carrito de compras usando Redux
// Компонент корзины покупок использующий Redux

import React from 'react';
import { useAppDispatch, useCartItems, useCartTotalAmount } from '../store/hooks';
import { removeItem, incrementQuantity, decrementQuantity } from '../store/slices/cartSlice';
import { increaseStock } from '../store/slices/menuSlice';
import logger from '../services/logging';

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useCartItems();
  const totalAmount = useCartTotalAmount();

  // Manejar eliminación de productos del carrito
  // Обработка удаления продуктов из корзины
  const handleRemoveItem = (id: number) => {
    logger.debug(`🗑️ Eliminando producto del carrito: ID ${id}`);
    
    // Encontramos el item para devolver su cantidad al stock
    // Находим элемент чтобы вернуть его количество в запас
    const itemToRemove = cartItems.find(cartItem => cartItem.item.id === id);
    
    if (itemToRemove) {
      // Devolvemos la cantidad al stock del menú
      // Возвращаем количество в запас меню
      dispatch(increaseStock({ 
        id, 
        quantity: itemToRemove.quantity 
      }));
      
      // Eliminamos el item del carrito
      // Удаляем элемент из корзины
      dispatch(removeItem(id));
      
      logger.info(`✅ Producto eliminado del carrito: ${itemToRemove.item.name}`);
    }
  };

  // Manejar incremento de cantidad
  // Обработка увеличения количества
  const handleIncrementQuantity = (id: number) => {
    logger.debug(`➕ Incrementando cantidad del producto: ID ${id}`);
    dispatch(incrementQuantity(id));
  };

  // Manejar decremento de cantidad
  // Обработка уменьшения количества
  const handleDecrementQuantity = (id: number) => {
    const item = cartItems.find(cartItem => cartItem.item.id === id);
    
    if (item) {
      if (item.quantity === 1) {
        // Si la cantidad es 1 y decrementamos, eliminamos el item
        // Если количество 1 и уменьшаем, удаляем элемент
        handleRemoveItem(id);
      } else {
        logger.debug(`➖ Decrementando cantidad del producto: ID ${id}`);
        dispatch(decrementQuantity(id));
      }
    }
  };

  return (
    <div className="cart-container">
      <h3>🛒 Carrito de compras</h3>
      
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <ul>
            {cartItems.map(({ item, quantity }) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <span className="item-name">{item.name}</span>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleDecrementQuantity(item.id)}
                      className="quantity-btn"
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="quantity">x{quantity}</span>
                    <button 
                      onClick={() => handleIncrementQuantity(item.id)}
                      className="quantity-btn"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <span className="item-total">{item.price * quantity}€</span>
                </div>
                
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="remove-btn"
                  aria-label={`Eliminar ${item.name} del carrito`}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          
          <div className="cart-summary">
            <p className="total-price">
              <strong>Total: {totalAmount.toFixed(2)}€</strong>
            </p>
            
            {/* Botón para proceder al checkout (futuro desarrollo) */}
            {/* Кнопка для перехода к оформлению заказа (будущая разработка) */}
            <button 
              className="checkout-btn"
              onClick={() => {
                logger.info('🛒 Iniciando proceso de checkout');
                // Aquí se podría implementar la lógica de checkout
                // Здесь можно реализовать логику оформления заказа
                alert('Funcionalidad de checkout en desarrollo');
              }}
              disabled={cartItems.length === 0}
            >
              Proceder al pago
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

