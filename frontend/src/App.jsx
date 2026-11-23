
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Products from "./components/Products";
import Dashboard from "./components/Dashboard";
import Customers from "./components/Customers";
import Transactions from "./components/Transactions.jsx";
// import Reports from "./components/Reports.jsx";
import CustomerReports from "./components/CustomerReports.jsx";


function App() {
  const [stats, setStats] = useState({
  total_products: 0,
  total_laptops: 0,
  total_phones: 0,
  total_stock: 0
});
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
 


 const fetchStats = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/dashboard/stats"
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengambil statistik");
    }

    setStats(data.stats);
  } catch (err) {
    console.error("Gagal mengambil statistik:", err);
  }
};

const navigate = useNavigate();

const handleLogout = async () => {
  const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");

  if (!confirmLogout) return;

  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/logout",
      {
        method: "POST",
        credentials: "include"
      }
    );

    if (!response.ok) {
      alert("Logout gagal. Silakan coba lagi.");
      return;
    }

    sessionStorage.removeItem("adminLoggedIn");
    navigate("/login", { replace: true });

  } catch (error) {
    alert("Tidak dapat terhubung ke server.");
  }
};

useEffect(() => {
  fetchStats();
}, []);
  return (
  <div className="app">
   <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
  <div className="sidebar-header">
    <h2>GadgetKu ID</h2>

    
  </div>

      <nav>
        <button onClick={() => setActivePage("Dashboard")}>
          Dashboard
        </button>

        <button onClick={() => setActivePage("Produk")}>
          Produk
        </button>

        <button onClick={() => setActivePage("Pelanggan")}>
          Pelanggan
        </button>

        <button onClick={() => setActivePage("Transaksi")}>
          Transaksi
        </button>

        <button onClick={() => setActivePage("Riwayat Penjualan")}>
          Riwayat Penjualan
        </button>
        <button
        onClick={() => setActivePage("Laporan CS")}
        className={activePage === "Laporan CS" ? "active" : ""}>
        📩 Laporan CS
      </button>
      </nav>
      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>
      </div>
    </aside>

    <button
      type="button"
      className="sidebar-toggle"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      ☰
    </button>

    <div className="main-content">
      
     

    <main className="container">

  {activePage === "Dashboard" && (
    <Dashboard stats={stats} />
  )}
  {activePage === "Produk" && (
    <Products onDataChange={fetchStats} />
  )}
  {activePage === "Pelanggan" && (
  <Customers />
)}
{activePage === "Riwayat Penjualan" && (
  <Transactions showDelete={true} />
)}
{/* {activePage === "Laporan" && (
  <Reports />
)} */}
{activePage === "Laporan CS" && <CustomerReports />}


        
      </main>
    </div>
</div>
  );
}

export default App;
