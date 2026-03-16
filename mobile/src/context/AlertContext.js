import React, { createContext, useContext, useState } from 'react';
import AppAlert from '../components/AppAlert';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    variant: 'error',
    onDismiss: null,
  });

  const showAlert = (title, message, variant = 'error', onDismiss) => {
    setAlert({ visible: true, title, message: message || '', variant, onDismiss: onDismiss || null });
  };

  const hideAlert = () => {
    setAlert((a) => {
      if (typeof a.onDismiss === 'function') a.onDismiss();
      return { ...a, visible: false, onDismiss: null };
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AppAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
}
