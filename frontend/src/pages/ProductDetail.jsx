import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProductDetail({ cart, setCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const addToCart = () => {
  if (product.stock <= 0) {
    alert("Stok produk habis!");
    return;
  }

  setCart((currentCart) => {
    const existingProduct = currentCart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
      if (existingProduct.quantity >= product.stock) {
        alert("Jumlah melebihi stok tersedia!");
        return currentCart;
      }

      return currentCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...currentCart, { ...product, quantity: 1 }];
  });

  alert(`${product.name} berhasil ditambahkan ke keranjang!`);
};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/products/${id}`
        );

        const data = await response.json();

        if (response.ok) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Memuat produk...</p>;
  if (!product) return <p>Produk tidak ditemukan.</p>;

  return (
    <div className="product-detail-page">
      <button onClick={() => navigate("/katalog")}>
        ← Kembali ke Katalog
      </button>

      <div className="product-detail-card">
        <img
          src={`http://127.0.0.1:5000/uploads/${product.image}`}
          alt={product.name}
        />

        <div>
          <span>{product.category}</span>
          <h1>{product.name}</h1>
          <h3>{product.brand}</h3>
          <h2>Rp {Number(product.price).toLocaleString("id-ID")}</h2>
          <p>{product.description || "Deskripsi belum tersedia."}</p>
          <p>Stok: {product.stock}</p>

          <button
            className="detail-add-btn"
            onClick={addToCart}
            disabled={product.stock <= 0}>
            {product.stock > 0 ? "🛒 Pilih Produk" : "Stok Habis"}
            </button>

            <button
            className="detail-cart-btn"
            onClick={() => navigate("/keranjang")}>
            Lihat Keranjang
            </button>

        </div>
      </div>
    </div>
  );
}