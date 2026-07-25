import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const initialState = {
  cartCount: 0,
  cartItems: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART_COUNT":
      return { ...state, cartCount: action.payload };
    case "SET_CART_ITEMS":
      return { ...state, cartItems: action.payload };
    case "INCREMENT_CART":
      return { ...state, cartCount: state.cartCount + action.payload };
    case "DECREMENT_CART":
      return { ...state, cartCount: Math.max(0, state.cartCount - action.payload) };
    case "RESET_CART":
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const value = {
    cartCount: state.cartCount,
    setCartCount: (count) => dispatch({ type: "SET_CART_COUNT", payload: count }),
    cartItems: state.cartItems,
    setCartItems: (items) => dispatch({ type: "SET_CART_ITEMS", payload: items }),
    incrementCart: (n) => dispatch({ type: "INCREMENT_CART", payload: n }),
    decrementCart: (n) => dispatch({ type: "DECREMENT_CART", payload: n }),
    resetCart: () => dispatch({ type: "RESET_CART" }),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
