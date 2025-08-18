import React from "react";
import { Routes, Route } from "react-router-dom";
import Cart from "../Pages/Common/Cart";
import PrivateRoute from "./PrivateRoute";
import CheckoutPage from "../Pages/Common/CheckoutPage";
import PaymentMethodPage from "../Pages/Common/SelectPaymentMethodPage";
import VnpayResultPage from "../Pages/Common/VnpayResultPage";
import MyOrdersPage from "../Pages/Common/MyOrdersPage";

import RetryPaymentPage from "../Pages/Common/RetryPaymentPage"; // 👈 mới thêm
import OrderDetail from "../Pages/Common/OrderDetail";
import OrderSuccessPage from "../Pages/Common/OrderSuccessPage";

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment-method/:orderId"
        element={
          <PrivateRoute>
            <PaymentMethodPage />
          </PrivateRoute>
        }
      />
      <Route path="/payment-result" element={<VnpayResultPage />} />

      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <MyOrdersPage />
          </PrivateRoute>
        }
      />
      <Route path="/cod-result" element={<OrderSuccessPage />} />

      <Route
        path="/user/orders/:orderId"
        element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/payment/retry/:orderId"
        element={
          <PrivateRoute>
            <RetryPaymentPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default UserRoutes;
