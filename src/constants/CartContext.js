// context/CartContext.js
import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]); // thêm moi 
  return (
    <CartContext.Provider value={{ cartCount, setCartCount, cartItems, setCartItems  }}> 
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
