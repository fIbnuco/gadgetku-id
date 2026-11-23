import { useEffect, useState } from "react";

export default function CustomerReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/customer-reports"
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data laporan CS");
      }

      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, newStatus) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/api/customer-reports/${reportId}/status`,
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

    alert("Status laporan berhasil diperbarui!");
    fetchReports();
  } catch (error) {
    alert(error.message);
  }
};

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <section className="customer-reports">
      <h1>Laporan Customer Service</h1>
      <p>Daftar pertanyaan dan keluhan dari pelanggan.</p>

      <button onClick={fetchReports}>
        🔄 Muat Ulang
      </button>

      {loading && <p>Memuat laporan...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p>Belum ada laporan dari pelanggan.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <div className="customer-reports-list">
          {reports.map((report) => (
            <div className="customer-report-card" key={report.id}>
              <div className="customer-report-header">
                <h3>{report.subject}</h3>
                <span className="customer-report-status">
                  {report.status}
                </span>
              </div>

              <p><strong>Nama:</strong> {report.customer_name}</p>
              <p><strong>Telepon:</strong> {report.phone}</p>
              <p><strong>Pesan:</strong></p>
              <p>{report.message}</p>

              <small>
                Tanggal: {report.created_at}
              </small>

              <div className="report-status-control">
            <label>Status Penanganan:</label>

            <select
                value={report.status}
                onChange={(e) =>
                updateStatus(report.id, e.target.value)
                }
            >
                <option value="Pending">Pending</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
            </select>
            </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}