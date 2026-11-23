
import { useEffect, useState } from "react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
  name: "",
  phone: "",
  email: "",
  address: ""
});


  const fetchCustomers = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/customers"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data pelanggan");
      }

      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://127.0.0.1:5000/api/customers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal menambahkan pelanggan");
    }

    alert("Pelanggan berhasil ditambahkan!");

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: ""
    });

    setShowForm(false);
    fetchCustomers();

  } catch (err) {
    alert(err.message);
  }
};

  return (
    <section className="customer-section">
      <div className="customers-header">
  <div>
    <h1>Manajemen Pelanggan</h1>
    <p>Kelola data pelanggan toko.</p>
  </div>

  <button
    className="customer-add-btn"
    onClick={() => setShowForm(!showForm)}
  >
    {showForm ? "Tutup Form" : "+ Tambah Pelanggan"}
  </button>
</div>


{showForm && (
  <form className="customer-form" onSubmit={handleSubmit}>
    <div>
      <label>Nama Pelanggan</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Masukkan nama pelanggan"
        required
      />
    </div>

    <div>
      <label>No. Telepon</label>
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Masukkan nomor telepon"
        required
      />
    </div>

    <div>
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Masukkan email"
      />
    </div>

    <div>
      <label>Alamat</label>
      <textarea
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Masukkan alamat pelanggan"
      />
    </div>

    <button type="submit">
      Simpan Pelanggan
    </button>
  </form>
)}


      {loading ? (
        <p>Memuat data pelanggan...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
       <div className="customer-table-card">
        <h3>Daftar Pelanggan</h3>

        <p className="customer-total">
          Total Pelanggan: {customers.length}
        </p>

          <table className="customer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>No. Telepon</th>
                <th>Email</th>
                <th>Alamat</th>
              </tr>
            </thead>

            <tbody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || "-"}</td>
                    <td>{customer.address || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Belum ada pelanggan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
