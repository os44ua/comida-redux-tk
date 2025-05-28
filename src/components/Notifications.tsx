// components/Notifications.tsx
// Componente para mostrar notificaciones del sistema
// Компонент для отображения системных уведомлений

import React, { useEffect } from 'react';
import { useAppDispatch, useNotifications } from '../store/hooks';
import { removeNotification, clearOldNotifications } from '../store/slices/uiSlice';

const Notifications: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useNotifications();

  // Limpiamos notificaciones antiguas cada 30 segundos
  // Очищаем старые уведомления каждые 30 секунд
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(clearOldNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  // Auto-hide para notificaciones marcadas como autoHide
  // Автоскрытие для уведомлений помеченных как autoHide
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoHide) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 5000); // 5 segundos / 5 секунд

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  // Obtener el icono según el tipo de notificación
  // Получить иконку в зависимости от типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  // Manejar clic para cerrar notificación
  // Обработка клика для закрытия уведомления
  const handleCloseNotification = (id: string) => {
    dispatch(removeNotification(id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification ${notification.type}`}
          onClick={() => handleCloseNotification(notification.id)}
          style={{ cursor: 'pointer' }}
          title="Haz clic para cerrar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{getNotificationIcon(notification.type)}</span>
            <span>{notification.message}</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✖</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;