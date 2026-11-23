import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Cart({ cart, setCart, onCheckoutSuccess }) {
  const totalPrice = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
 

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const decreaseQuantity = (productId) => {
  setCart((currentCart) =>
    currentCart
      .map((item) =>
        item.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

  return (
    <div className="cart-page">
      <header className="catalog-header">
        <h1>Keranjang Belanja</h1>
        <p>Daftar produk yang ingin Anda beli.</p>
      </header>

      <main className="catalog-content">
        <h2>Produk Pilihan</h2>

        {cart.length === 0 ? (
          <p>Keranjang belanja Anda masih kosong.</p>
        ) : (
          <div className="cart-summary">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div>
                  <h4>{item.name}</h4>
                  <div className="quantity-control">
                    <button onClick={() => decreaseQuantity(item.id)}>
                        −
                    </button>

                    <span>{item.quantity}</span>

                   <button
                      disabled={item.quantity >= item.stock}
                      onClick={() => {
                        if (item.quantity < item.stock) {
                          setCart((currentCart) =>
                            currentCart.map((product) =>
                              product.id === item.id
                                ? { ...product, quantity: product.quantity + 1 }
                                : product
                            )
                          );
                        }
                      }} >
                      +
                    </button>
                    </div>

                    <p>
                    Harga satuan: Rp{" "}
                    {Number(item.price).toLocaleString("id-ID")}
                    </p>
                </div>

                <strong>
                  Rp{" "}
                  {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                </strong>

                <button onClick={() => removeFromCart(item.id)}>
                  Hapus
                </button>
              </div>
            ))}

            <h3>
              Total Pembayaran: Rp {totalPrice.toLocaleString("id-ID")}
            </h3>
          </div>
        )}
        {!showCheckout && (
  <button
    type="button"
    className="checkout-btn"
    disabled={cart.length === 0}
    onClick={() => setShowCheckout(true)}
  >
    Bayar
  </button>
)}
{showCheckout && (
  <div className="checkout-form">
    <h2>Ringkasan Pesanan</h2>

    {cart.map((item) => (
      <div className="cart-item" key={item.id}>
        <div>
          <h4>{item.name}</h4>
          <p>
            {item.quantity} x Rp{" "}
            {Number(item.price).toLocaleString("id-ID")}
          </p>
        </div>

        <strong>
          Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
        </strong>
      </div>
    ))}

    <h3>
      Total Pembayaran: Rp {totalPrice.toLocaleString("id-ID")}
    </h3>
<button
  className="checkout-btn"
  onClick={async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cart,
            payment_method: "Cash",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Checkout gagal");
        return;
      }

      alert(
        `Pesanan berhasil!\nNomor Invoice: ${data.invoice_number}\nTotal: Rp ${Number(data.total).toLocaleString("id-ID")}`
      );

      setCart([]);
      setShowCheckout(false);
      onCheckoutSuccess?.();
      navigate("/katalog");
    } catch (error) {
      alert("Tidak dapat menghubungi server.");
      console.error(error);
    }
  }}
>
  Konfirmasi Pesanan
</button>
  </div>
)}
         <button
          type="button"
          className="cart-cancel-btn"
          onClick={() => navigate("/katalog")}
        >
          ← Kembali ke Katalog
        </button>
      </main>
    </div>
  );
}
