
import { useState } from "react";

export default function CustomerService() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/customer-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim laporan");
      }

      alert("Laporan berhasil dikirim ke Customer Service.");

      setForm({
        customer_name: "",
        phone: "",
        subject: "",
        message: "",
      });

      setShowForm(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-service">
      <button
        className="cs-button"
        onClick={() => setShowForm(!showForm)}
      >
        🎧 Lapor CS
      </button>

      {showForm && (
  <div className="cs-form">
    <div className="cs-header">
      <div className="cs-header-icon">🎧</div>

      <div className="cs-header-info">
        <h2>Customer Service</h2>
        <span>
          <span className="cs-online-dot"></span>
          CS Online
        </span>
      </div>

      <button
        type="button"
        className="cs-close"
        onClick={() => setShowForm(false)}
      >
        ×
      </button>
    </div>

    <p className="cs-description">
      Halo! Ada yang bisa kami bantu? Silakan kirim pertanyaan atau keluhan Anda.
    </p>

    <form onSubmit={handleSubmit}>
      <label>Nama Pelanggan</label>
      <input
        type="text"
        placeholder="Masukkan nama"
        value={form.customer_name}
        onChange={(e) =>
          setForm({ ...form, customer_name: e.target.value })
        }
        required
      />

      <label>Nomor Telepon</label>
      <input
        type="tel"
        placeholder="Masukkan nomor telepon"
        value={form.phone}
        onChange={(e) =>
          setForm({ ...form, phone: e.target.value })
        }
        required
      />

      <label>Subjek Laporan</label>
      <input
        type="text"
        placeholder="Contoh: Keluhan produk"
        value={form.subject}
        onChange={(e) =>
          setForm({ ...form, subject: e.target.value })
        }
        required
      />

      <label>Pesan atau Keluhan</label>
      <textarea
        placeholder="Tuliskan pesan Anda..."
        value={form.message}
        onChange={(e) =>
          setForm({ ...form, message: e.target.value })
        }
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Pesan"}
      </button>
    </form>
  </div>
)}
    </div>
  );
}
