import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { CartProvider } from './constants/CartContext';
import CartSyncAfterLogin from './constants/CartSyncAfterLogin';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 👉 Thêm dòng này

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="722893250907-jmv0hcv6i8hd7a0jl2ggmqp4bs280b17.apps.googleusercontent.com"> {/* 🔑 Dán ClientId tại đây */}
    <BrowserRouter>
      <CartProvider>
        <CartSyncAfterLogin /> {/* 🔁 Tự động đồng bộ sau khi đăng nhập */}
        <App />
      </CartProvider>
    </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
