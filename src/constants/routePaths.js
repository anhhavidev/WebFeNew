// Constants chứa tất cả đường dẫn (route paths) của ứng dụng
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  ACTIVATE_ACCOUNT: "/activate",
  PRODUCT_DETAIL: "/product/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PAYMENT: "/payment",
  VNPAY_RESULT: "/vnpay-return",
  ORDER_SUCCESS: "/order-success",
  MY_ORDERS: "/my-orders",
  ORDER_DETAIL: "/my-orders/:id",
  USER_PROFILE: "/profile",
  DASHBOARD: "/dashboard",

  // Admin
  ADMIN_OVERVIEW: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCT_CREATE: "/admin/products/create",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: "/admin/orders/:id",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_USERS: "/admin/users",
  ADMIN_SELLERS: "/admin/sellers",

  // Seller
  SELLER_PRODUCTS: "/seller/products",
  SELLER_ORDERS: "/seller/orders",

  // Shipper
  SHIPPER_ORDERS: "/shipper/orders",
  SHIPPER_DASHBOARD: "/shipper/dashboard",
  ADMIN_DASHBOARD: "/admin/dashboard",
  SELLER_DASHBOARD: "/seller/dashboard",
  ORDERS: "/orders",
  GETINFOR: "/getinfor",
  COD_RESULT: "/cod-result",

  // Dashboard sub-paths
  ADMIN_DASHBOARD_PROFILE: "/admin/dashboard/profile",
  SELLER_DASHBOARD_PRODUCTS: "/seller/dashboard/products",
  SELLER_DASHBOARD_ORDERS: "/seller/dashboard/orders",
  SELLER_DASHBOARD_PROFILE: "/seller/dashboard/profile",
  SHIPPER_DASHBOARD_ORDERS: "/shipper/dashboard/orders",
  SHIPPER_DASHBOARD_PROFILE: "/shipper/dashboard/profile",
};
