// Entry point của ứng dụng React - khởi tạo root component và các provider
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

import ErrorBoundary from './Components/ErrorBoundary';
import { CartProvider } from './constants/CartContext';
import CartSyncAfterLogin from './constants/CartSyncAfterLogin';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="722893250907-jmv0hcv6i8hd7a0jl2ggmqp4bs280b17.apps.googleusercontent.com">
    <BrowserRouter>
      <ErrorBoundary>
      <CartProvider>
        <CartSyncAfterLogin />
        <App />
      </CartProvider>
      </ErrorBoundary>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
