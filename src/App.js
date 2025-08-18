import React from "react";
// Styles
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import PublicRoutes from "./Routes/PublicRoutes";
import UserRoutes from "./Routes/UserRoutes";
import AdminRoutes from "./Routes/AdminRoutes ";

function App() {
  return (
    <>
      <PublicRoutes />
      <UserRoutes />
      <AdminRoutes />
      
      
    </>
  );
}

export default App;
