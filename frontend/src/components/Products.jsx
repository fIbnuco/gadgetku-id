
import { useEffect, useState } from "react";

export default function Products({ onDataChange }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "Laptop",
    brand: "",
    description: "",
    price: "",
    stock: ""
  });

  // Mengambil data produk dari backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/products"
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Mengubah nilai input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Memilih dan memeriksa foto produk
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Format foto harus JPG, PNG, atau WEBP");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5 MB");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Mengosongkan form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "Laptop",
      brand: "",
      description: "",
      price: "",
      stock: ""
    });

    setImageFile(null);
    setImagePreview("");
    setEditId(null);
    setShowForm(false);
  };

  // Menambah dan memperbarui produk
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);

      if (imageFile) {
        data.append("image", imageFile);
      }

      const url = editId
        ? `http://127.0.0.1:5000/api/products/${editId}`
        : "http://127.0.0.1:5000/api/products";

      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan produk"
        );
      }

      alert(
        editId
          ? "Produk berhasil diperbarui!"
          : "Produk berhasil ditambahkan!"
      );

      resetForm();
      await fetchProducts();

      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Mengisi form ketika tombol Edit diklik
  const handleEdit = (product) => {
    setEditId(product.id);

    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      description: product.description || "",
      price: product.price,
      stock: product.stock
    });

    setImageFile(null);

    setImagePreview(
      product.image
        ? `http://127.0.0.1:5000/uploads/${product.image}`
        : ""
    );

    setShowForm(true);
  };

  // Menghapus produk
  const handleDelete = async (id) => {
    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus produk ini?"
    );

    if (!yakin) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/products/${id}`,
        {
          method: "DELETE"
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menghapus produk"
        );
      }

      alert("Produk berhasil dihapus!");

      await fetchProducts();

      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Manajemen Produk</h1>
          <p>Kelola produk laptop dan handphone.</p>
        </div>

        <button
          className="add-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Batal" : "+ Tambah Produk"}
        </button>
      </div>

      {showForm && (
        <section className="product-section">
          <h2>
            {editId ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label>Nama Produk</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama produk"
                required
              />
            </div>

            <div>
              <label>Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Laptop">Laptop</option>
                <option value="HP">HP</option>
              </select>
            </div>

            <div>
              <label>Brand</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Contoh: ASUS"
                required
              />
            </div>

            <div>
              <label>Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Deskripsi produk"
              />
            </div>

            <div>
              <label>Harga</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Masukkan harga"
                min="0"
                required
              />
            </div>

            <div>
              <label>Stok</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Masukkan jumlah stok"
                min="0"
                required
              />
            </div>

            <div>
              <label>Foto Produk</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview produk"
                  style={{
                    width: "150px",
                    height: "120px",
                    objectFit: "cover",
                    marginTop: "10px",
                    borderRadius: "8px"
                  }}
                />
              )}
            </div>

            <button type="submit" className="add-button">
              Simpan Produk
            </button>
          </form>
        </section>
      )}

      <section className="product-section">
        <h2>Daftar Produk</h2>

        {loading && <p>Memuat data produk...</p>}

        {error && (
          <div className="error">
            {error}
            <button onClick={fetchProducts}>
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Foto</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Brand</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      <td>
                        {product.image ? (
                          <img
                            src={`http://127.0.0.1:5000/uploads/${product.image}`}
                            alt={product.name}
                            style={{
                              width: "70px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px"
                            }}
                          />
                        ) : (
                          <span>Tidak ada foto</span>
                        )}
                      </td>

                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>

                      <td>
                        {Number(product.price).toLocaleString(
                          "id-ID",
                          {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0
                          }
                        )}
                      </td>

                      <td>{product.stock}</td>

                      <td>
                        <button
                          onClick={() => handleEdit(product)}
                          className="edit-button"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="delete-button"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      Belum ada produk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
