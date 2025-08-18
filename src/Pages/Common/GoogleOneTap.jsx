// import { useEffect } from "react";
// import useAuth from "../../Hooks/useAuth"; // Hook hợp lệ khi gọi ở đây
// import { useNavigate } from "react-router-dom";
// import { getLocalCart, clearLocalCart } from "../../utils/cartStorage";
// import { syncCartToServer, getCartItems } from "../../Service/cartApi";
// import { useCart } from "../../constants/CartContext";
// import { jwtDecode } from "jwt-decode";

// const GoogleOneTap = () => {
//   const { getProfile } = useAuth(); // ✅ gọi trong function component => hợp lệ
//   const { setCartCount } = useCart();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Khai báo trong scope useEffect để tránh lỗi hook
//     const handleCallbackResponse = async (response) => {
//       const id_token = response.credential;

//       try {
//         const res = await fetch("http://localhost:5230/api/Acount/google-login", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ IdToken: id_token }),
//         });

//         const data = await res.json();

//         if (res.ok) {
//           localStorage.setItem("token", data.accessToken);
//           localStorage.setItem("refreshToken", data.refreshToken);

//           await getProfile(data.accessToken);

//           const decoded = jwtDecode(data.accessToken);
//           const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

//           const localCart = getLocalCart();
//           if (localCart.length > 0) {
//             await syncCartToServer(localCart, data.accessToken);
//             clearLocalCart();
//           }

//           const cartResult = await getCartItems(data.accessToken);
//           if (cartResult?.data?.cartItems) {
//             const totalQuantity = cartResult.data.cartItems.reduce((sum, item) => sum + item.SoLuong, 0);
//             setCartCount(totalQuantity);
//           }

//           navigate(role === "Admin" ? "/admin/dashboard" : "/");
//         } else {
//           console.error("Google login failed:", data.message);
//         }
//       } catch (error) {
//         console.error("Error during Google login:", error);
//       }
//     };

//     window.google.accounts.id.initialize({
//       client_id: "722893250907-jmv0hcv6i8hd7a0jl2ggmqp4bs280b17.apps.googleusercontent.com",
//       callback: handleCallbackResponse,
//     });

//     window.google.accounts.id.renderButton(
//       document.getElementById("googleSignInDiv"),
//       { theme: "outline", size: "large" }
//     );

//     // Bật One Tap nếu muốn
//     // window.google.accounts.id.prompt();
//   }, []);

//   return <div id="googleSignInDiv"></div>;
// };

// export default GoogleOneTap;
import { useEffect } from "react";
import useAuth from "../../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getLocalCart, clearLocalCart } from "../../utils/cartStorage";
import { syncCartToServer, getCartItems } from "../../Service/cartApi";
import { useCart } from "../../constants/CartContext";
import { jwtDecode } from "jwt-decode";

const GoogleOneTap = () => {
  const { getProfile } = useAuth();
  const { setCartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Tải Google Script nếu chưa có
    const loadGoogleScript = () => {
      return new Promise((resolve) => {
        const existingScript = document.getElementById("google-client-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.id = "google-client-script";
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          document.body.appendChild(script);
        } else {
          resolve();
        }
      });
    };

    // Hàm xử lý sau khi người dùng đăng nhập bằng Google
    const handleCallbackResponse = async (response) => {
      const id_token = response.credential;

      try {
        const res = await fetch("http://localhost:5230/api/Acount/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ IdToken: id_token }),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          await getProfile(data.accessToken);

          const decoded = jwtDecode(data.accessToken);
          const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

          const localCart = getLocalCart();
          if (localCart.length > 0) {
            await syncCartToServer(localCart, data.accessToken);
            clearLocalCart();
          }

          const cartResult = await getCartItems(data.accessToken);
          if (cartResult?.data?.cartItems) {
            const totalQuantity = cartResult.data.cartItems.reduce(
              (sum, item) => sum + item.SoLuong,
              0
            );
            setCartCount(totalQuantity);
          }

          navigate(role === "Admin" ? "/admin/dashboard" : "/");
        } else {
          console.error("Google login failed:", data.message);
        }
      } catch (error) {
        console.error("Error during Google login:", error);
      }
    };

    // Hàm khởi tạo Google One Tap
    const initializeGoogleOneTap = async () => {
      await loadGoogleScript();

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "722893250907-jmv0hcv6i8hd7a0jl2ggmqp4bs280b17.apps.googleusercontent.com",
          callback: handleCallbackResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large" }
        );

        // Bật One Tap nếu muốn
        // window.google.accounts.id.prompt();
      } else {
        console.error("Google API chưa sẵn sàng.");
      }
    };

    initializeGoogleOneTap();
  }, []);

  return <div id="googleSignInDiv"></div>;
};

export default GoogleOneTap;
