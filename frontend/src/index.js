import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProductDetail from "./pages/product/ProductDetail";
import Cart from "./pages/cart/page";
import Checkout from "./pages/checkout/page";
import Orders from "./pages/orders/page";
import ListCategory from "./pages/listCategory/page";
import Wishlist from "./pages/wishlist/page";
import Sell from "./pages/sell/page";
import CreateStore from "./pages/sell/createStore";

import TotalSell from "./pages/totalSell/page";
import Success from "./pages/success/page";
import AuthPage from "./pages/auth/page";
import AdminDashboard from "./pages/admin/page";
import AuctionProductDetail from "./pages/auction/page";
import OrderHistory from "./pages/OrderHistory/page";
import SearchResults from "./pages/SearchResults/SearchResults";
import SellerProducts from "./pages/sellerProduct/page";
import DailyDeals from "./pages/dailyDeal/page";
import HelpContact from "./pages/help/page";
import ProductList from "./pages/product/ProductList";
import InventoryList from "./pages/inventory/InventoryList";
import DisputeManage from "./pages/sellerProduct/disputeManage";
import SuccessPay from "./pages/checkout/checkoutsuccess";
import CancelPay from "./pages/checkout/checkoutcancel";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
 
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>

    <PayPalScriptProvider options={{
      "client-id": "AR5FvA5Q8e6U5wa9aKkNlb8Y6TMpCYgLypQpVmZiAfRkFEujP3Gk5XP-_qYSfRjMylB9kwPNVkldfq0Z", // Replace with your actual PayPal client ID
      currency: "USD",
      intent: "capture",
    }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart/" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/list-category/:categoryId" element={<ListCategory />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/sellerProduct" element={<SellerProducts />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/totalSell" element={<TotalSell />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/auction-product" element={<AuctionProductDetail />} />
          <Route path="/daily-deals" element={<DailyDeals />} />
          <Route path="/help" element={<HelpContact />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/create-store" element={<CreateStore />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/disputes" element={<DisputeManage />} />
          <Route path="/successpay" element={<SuccessPay/>}/>
          <Route path="/cancelpay" element={<CancelPay/>}/>
     
     
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  </React.StrictMode>
);


reportWebVitals();
