import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './global.css';
import './rtl.css';
import { Toaster } from '@/components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
