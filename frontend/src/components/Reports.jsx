
import { useEffect, useState } from "react";

export default function Reports() {
  const [report, setReport] = useState({
    total_transactions: 0,
    paid_transactions: 0,
    pending_transactions: 0,
    cancelled_transactions: 0,
    total_revenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/reports")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil laporan penjualan");
        }
        return response.json();
      })
      .then((data) => {
        setReport(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Memuat laporan...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="report-section">
      <h1>Laporan Penjualan</h1>
      <p>Ringkasan transaksi dan pendapatan GadgetKu ID.</p>

      <div className="report-grid">
        <div className="report-card">
          <h3>Total Transaksi</h3>
          <h2>{report.total_transactions}</h2>
        </div>

        <div className="report-card revenue">
          <h3>Total Pendapatan</h3>
          <h2>
            Rp {Number(report.total_revenue).toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="report-card paid">
          <h3>Transaksi Paid</h3>
          <h2>{report.paid_transactions}</h2>
        </div>

        <div className="report-card pending">
          <h3>Transaksi Pending</h3>
          <h2>{report.pending_transactions}</h2>
        </div>

        <div className="report-card cancelled">
          <h3>Transaksi Cancelled</h3>
          <h2>{report.cancelled_transactions}</h2>
        </div>
      </div>
    </section>
  );
}
