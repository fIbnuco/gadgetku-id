
import { useEffect, useState } from "react";

export default function Transactions({ showDelete = false }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const deleteTransaction = async (id) => {
  const confirmDelete = window.confirm(
    "Apakah Anda yakin ingin menghapus riwayat transaksi ini?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/transactions/${id}`,
      {
        method: "DELETE",
      }
    );
    console.log("Status penghapusan:", response.status);
    console.log("ID transaksi:", id);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal menghapus transaksi");
    }

    alert("Riwayat transaksi berhasil dihapus!");

    fetchTransactions();
  } catch (error) {
    alert(error.message);
  }
};
const fetchTransactions = async () => {
  try {
    setLoading(true);

    const response = await fetch(
      "http://127.0.0.1:5000/api/transactions"
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data transaksi");
    }

    const data = await response.json();

    setTransactions(data.transactions || []);
    setError("");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/transactions")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil data transaksi");
        }
        return response.json();
      })
      .then((data) => {
        setTransactions(data.transactions || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);



const updateStatus = async (id, newStatus) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/transactions/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal memperbarui status");
    }

    setTransactions((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    alert("Status transaksi berhasil diperbarui.");
  } catch (err) {
    alert(err.message);
  }
};



const showDetail = async (id) => {
  try {
    setDetailLoading(true);

    const response = await fetch(
      `http://127.0.0.1:5000/api/transactions/${id}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengambil detail transaksi");
    }

    setSelectedTransaction(data.transaction);
  } catch (err) {
    alert(err.message);
  } finally {
    setDetailLoading(false);
  }
};


  return (
    <section>
      <h1>Riwayat Penjualan</h1>
      <p>Daftar transaksi penjualan pelanggan.</p>

      {loading && <p>Memuat data transaksi...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nomor Invoice</th>
                <th>Total</th>
                <th>Metode Pembayaran</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Detail</th>
              </tr>
            </thead>

           
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.invoice_number}</td>
                  <td>
                    Rp {Number(item.total).toLocaleString("id-ID")}
                  </td>
                  <td>{item.payment_method || "-"}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{item.created_at || "-"}</td>
                  <td>
                    <button onClick={() => showDetail(item.id)}>
                      Lihat Detail
                    </button>
                   <button
                    className="delete-transaction-btn"
                    onClick={() => deleteTransaction(item.id)}
                  >
                    🗑️ Hapus
                  </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Belum ada transaksi.</td>
              </tr>
            )}
          </tbody>

          </table>
        </div>
      )}

{detailLoading && <p>Memuat detail transaksi...</p>}

{selectedTransaction && (
  <div className="transaction-detail">
    <h2>Detail Transaksi</h2>

    <p>
      <strong>Nomor Invoice:</strong>{" "}
      {selectedTransaction.invoice_number}
    </p>

    <p>
      <strong>Tanggal:</strong>{" "}
      {selectedTransaction.created_at}
    </p>

    <p>
      <strong>Status:</strong>{" "}
      {selectedTransaction.status}
    </p>

    <h3>Daftar Produk</h3>

    <table>
      <thead>
        <tr>
          <th>Nama Produk</th>
          <th>Kategori</th>
          <th>Jumlah</th>
          <th>Harga</th>
          <th>Subtotal</th>
        </tr>
      </thead>

      <tbody>
        {selectedTransaction.items.map((item, index) => (
          <tr key={index}>
            <td>{item.product_name}</td>
            <td>{item.category}</td>
            <td>{item.quantity}</td>
            <td>
              Rp {item.price.toLocaleString("id-ID")}
            </td>
            <td>
              Rp {item.subtotal.toLocaleString("id-ID")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3>
      Total Pembayaran: Rp{" "}
      {selectedTransaction.total.toLocaleString("id-ID")}
    </h3>

    <button onClick={() => setSelectedTransaction(null)}>
      Tutup Detail
    </button>
  </div>
)}

    </section>
  );
}
