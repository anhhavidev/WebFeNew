// import React, { useState, useEffect } from "react";
// import { getOrdersBySeller, confirmOrder, assignShipper } from "../Service/Admin/OrderAdminApi";

// const SellerOrders = ({ currentSellerId }) => {
//   const [orders,setOrders] = useState([]);
//   const [loading,setLoading] = useState(true);

//   useEffect(()=>{
//     fetchOrders();
//   },[]);

//   const fetchOrders = async ()=>{
//     setLoading(true);
//     try{
//       const res = await getOrdersBySeller(currentSellerId);
//       setOrders(res.data || []);
//     }catch(err){console.error(err);}
//     finally{setLoading(false);}
//   };

//   const handleConfirm = async (orderId)=>{
//     try{
//       await confirmOrder(orderId);
//       fetchOrders();
//     }catch(err){console.error(err);}
//   };

//   const handleAssignShipper = async(orderId, shipperId)=>{
//     try{
//       await assignShipper(orderId, shipperId);
//       fetchOrders();
//     }catch(err){console.error(err);}
//   };

//   if(loading) return <div>Đang tải đơn hàng...</div>;

//   return (
//     <div className="p-3">
//       <h4>Quản lý đơn hàng</h4>
//       <table className="table table-bordered align-middle">
//         <thead>
//           <tr>
//             <th>Đơn ID</th><th>Khách</th><th>Trạng thái</th><th>Shipper</th><th>Hành động</th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.length ? orders.map(o=>(
//             <tr key={o.orderId}>
//               <td>{o.orderId}</td>
//               <td>{o.customerName}</td>
//               <td>{o.status}</td>
//               <td>{o.shipperName || "Chưa gán"}</td>
//               <td>
//                 {o.status==="Pending" && <button className="btn btn-sm btn-success me-1" onClick={()=>handleConfirm(o.orderId)}>Confirm</button>}
//                 {o.status==="ReadyToShip" && <button className="btn btn-sm btn-primary" onClick={()=>handleAssignShipper(o.orderId, /*shipperId*/1)}>Gán Shipper</button>}
//               </td>
//             </tr>
//           )) : <tr><td colSpan="5" className="text-center">Không có đơn hàng</td></tr>}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default SellerOrders;
