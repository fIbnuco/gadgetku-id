
export default function Dashboard({ stats }) {
  return (
    <section className="dashboard-section">
      <h1>Dashboard</h1>
      <p>Selamat datang di GadgetKu ID.</p>

      <div className="stats">
        <div className="stat-card">
          <h3>Total Produk</h3>
          <p>{stats.total_products}</p>
        </div>

        <div className="stat-card">
          <h3>Total Laptop</h3>
          <p>{stats.total_laptops}</p>
        </div>

        <div className="stat-card">
          <h3>Total HP</h3>
          <p>{stats.total_phones}</p>
        </div>

        <div className="stat-card">
          <h3>Total Stok</h3>
          <p>{stats.total_stock}</p>
        </div>
      </div>
    </section>
  );
}
