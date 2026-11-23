
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import Catalog from "./pages/Catalog.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function Root() {
  const [cart, setCart] = useState([]);
  const [catalogRefresh, setCatalogRefresh] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/katalog" replace />}
        />

        <Route
          path="/katalog"
          element={
            <Catalog
              key={catalogRefresh}
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route
          path="/produk/:id"
          element={
            <ProductDetail
              cart={cart}
              setCart={setCart}
            />
          }
        />

        <Route
          path="/keranjang"
          element={
            <Cart
              cart={cart}
              setCart={setCart}
              onCheckoutSuccess={() =>
                setCatalogRefresh((prev) => prev + 1)
              }
            />
          }
        />

        <Route path="/login" element={<Login />} />

       
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/katalog" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
