// File barrel export - tập trung xuất tất cả API service cho tiện import

export { default as axiosClient } from "./axiosClient";
export { updateProfile, changePassword } from "./userApi";
export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./ProductApi";
export { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "./cartApi";
export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categoryApi";
export { createOrder, getOrders, getOrderById } from "./OrderAPI";
export { createPayment, processVnpayReturn } from "./paymentApi";
export { checkout, createCheckoutSession } from "./CheckoutApi";
export { getProvinces, getDistricts, getWards } from "./locationApi";
export { getShippingFee } from "./shippingApi";
export { getUserAddresses, createAddress, updateAddress, deleteAddress } from "./addressApi";
