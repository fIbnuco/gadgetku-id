
import os
import sys
import uuid
from werkzeug.security import check_password_hash, generate_password_hash
from flask import session


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.insert(0, BASE_DIR)

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import text
from database import db, init_db
from database.models import (
    
    Admin,
    Product,
    Customer,
    Transaction,
    TransactionDetail,
    CustomerReport
)
from decimal import Decimal


app = Flask(__name__, static_folder="uploads", static_url_path="/uploads")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"]
        }
    },
    supports_credentials=True
)


UPLOAD_FOLDER = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "uploads"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

# Inisialisasi database
init_db(app)


# Halaman utama
@app.route("/")
def home():
    return jsonify({
        "status": "success",
        "message": "API  GadgetKu ID  berhasil dijalankan!"
    })


# Tes koneksi MySQL
@app.route("/api/test-db", methods=["GET"])
def test_database():
    try:
        db.session.execute(text("SELECT 1"))

        return jsonify({
            "status": "success",
            "message": "Koneksi Flask ke MySQL berhasil!"
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# Menampilkan semua produk
@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        products = Product.query.order_by(
            Product.id.desc()
        ).all()

        return jsonify({
            "status": "success",
            "total": len(products),
            "products": [
                product.to_dict() for product in products
            ]
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


    # Mengambil detail satu produk berdasarkan ID

@app.route("/api/products/<int:id>", methods=["GET"])
def get_product_detail(id):
    try:
        product = Product.query.get(id)

        if not product:
            return jsonify({
                "status": "error",
                "message": "Produk tidak ditemukan"
            }), 404

        return jsonify({
            "status": "success",
            "product": product.to_dict()
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# Menambahkan produk

@app.route("/api/products", methods=["POST"])
def add_product():
    try:
        data = request.form

        required_fields = [
            "name", "category", "brand", "price", "stock"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "status": "error",
                    "message": f"Field {field} wajib diisi"
                }), 400

        if data["category"] not in ["Laptop", "HP"]:
            return jsonify({
                "status": "error",
                "message": "Kategori harus Laptop atau HP"
            }), 400

        try:
            price = float(data["price"])
            stock = int(data["stock"])
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Harga atau stok tidak valid"
            }), 400

        if price < 0 or stock < 0:
            return jsonify({
                "status": "error",
                "message": "Harga dan stok tidak boleh negatif"
            }), 400

        image = request.files.get("image")

        filename = None

        if image and image.filename:
            if not allowed_file(image.filename):
                return jsonify({
                    "status": "error",
                    "message": "Format gambar harus JPG, JPEG, PNG, atau WEBP"
                }), 400

            import uuid
            from werkzeug.utils import secure_filename

            extension = secure_filename(image.filename).rsplit(".", 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{extension}"

            image.save(
                os.path.join(app.config["UPLOAD_FOLDER"], filename)
            )

        product = Product(
            name=data["name"],
            category=data["category"],
            brand=data["brand"],
            description=data.get("description"),
            price=price,
            stock=stock,
            image=filename
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Produk berhasil ditambahkan",
            "product": product.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



# Mengedit produk

@app.route("/api/products/<int:id>", methods=["PUT"])
def update_product(id):
    try:
        product = db.session.get(Product, id)

        if product is None:
            return jsonify({
                "status": "error",
                "message": "Produk tidak ditemukan"
            }), 404

        data = request.form

        if "category" in data:
            if data["category"] not in ["Laptop", "HP"]:
                return jsonify({
                    "status": "error",
                    "message": "Kategori harus Laptop atau HP"
                }), 400

        if "price" in data:
            try:
                price = float(data["price"])
                if price < 0:
                    raise ValueError()
                product.price = price
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "message": "Harga tidak valid"
                }), 400

        if "stock" in data:
            try:
                stock = int(data["stock"])
                if stock < 0:
                    raise ValueError()
                product.stock = stock
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "message": "Stok tidak valid"
                }), 400

        if "name" in data:
            product.name = data["name"]

        if "category" in data:
            product.category = data["category"]

        if "brand" in data:
            product.brand = data["brand"]

        if "description" in data:
            product.description = data["description"]

        image = request.files.get("image")

        if image and image.filename:
            if not allowed_file(image.filename):
                return jsonify({
                    "status": "error",
                    "message": "Format gambar tidak valid"
                }), 400

            import uuid
            from werkzeug.utils import secure_filename

            extension = secure_filename(image.filename).rsplit(".", 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{extension}"

            image.save(
                os.path.join(app.config["UPLOAD_FOLDER"], filename)
            )

            product.image = filename

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Produk berhasil diperbarui",
            "product": product.to_dict()
        })

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500





# Menghapus produk
@app.route("/api/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    try:
        product = db.session.get(Product, id)

        if product is None:
            return jsonify({
                "status": "error",
                "message": "Produk tidak ditemukan"
            }), 404

        db.session.delete(product)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Produk berhasil dihapus"
        })

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# Statistik Dashboard
@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    try:
        total_products = Product.query.count()

        total_laptops = Product.query.filter_by(
            category="Laptop"
        ).count()

        total_phones = Product.query.filter_by(
            category="HP"
        ).count()

        total_stock = db.session.query(
            db.func.coalesce(
                db.func.sum(Product.stock), 0
            )
        ).scalar()

        return jsonify({
            "status": "success",
            "stats": {
                "total_products": total_products,
                "total_laptops": total_laptops,
                "total_phones": total_phones,
                "total_stock": total_stock
            }
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    # Menampilkan semua pelanggan
# Menampilkan semua pelanggan
@app.route("/api/customers", methods=["GET"])
def get_customers():
    try:
        customers = Customer.query.order_by(Customer.id.desc()).all()

        return jsonify({
            "status": "success",
            "customers": [customer.to_dict() for customer in customers]
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# Menambahkan pelanggan
@app.route("/api/customers", methods=["POST"])
def add_customer():
    try:
        data = request.get_json()

        customer = Customer(
            name=data.get("name"),
            phone=data.get("phone"),
            email=data.get("email"),
            address=data.get("address")
        )

        db.session.add(customer)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Pelanggan berhasil ditambahkan!",
            "customer": customer.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    # Mengedit pelanggan
@app.route("/api/customers/<int:id>", methods=["PUT"])
def update_customer(id):
    try:
        customer = Customer.query.get_or_404(id)
        data = request.get_json()

        customer.name = data.get("name", customer.name)
        customer.phone = data.get("phone", customer.phone)
        customer.email = data.get("email", customer.email)
        customer.address = data.get("address", customer.address)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Data pelanggan berhasil diperbarui!",
            "customer": customer.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    # Menghapus pelanggan
@app.route("/api/customers/<int:id>", methods=["DELETE"])
def delete_customer(id):
    try:
        customer = Customer.query.get_or_404(id)

        db.session.delete(customer)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Pelanggan berhasil dihapus!"
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/api/checkout", methods=["POST"])
def checkout():
    try:
        data = request.get_json()

        if not data or not isinstance(data.get("items"), list):
            return jsonify({
                "status": "error",
                "message": "Data keranjang tidak valid"
            }), 400

        if not data["items"]:
            return jsonify({
                "status": "error",
                "message": "Keranjang masih kosong"
            }), 400

        # Gabungkan produk yang memiliki ID sama
        quantities = {}

        for item in data["items"]:
            product_id = int(item["id"])
            quantity = int(item["quantity"])

            if quantity <= 0:
                return jsonify({
                    "status": "error",
                    "message": "Jumlah produk tidak valid"
                }), 400

            quantities[product_id] = (
                quantities.get(product_id, 0) + quantity
            )

        total = Decimal("0.00")
        order_details = []

        # Periksa stok produk di database
        for product_id, quantity in quantities.items():
            product = (
                Product.query
                .filter_by(id=product_id)
                .with_for_update()
                .first()
            )

            if not product:
                raise ValueError(
                    f"Produk dengan ID {product_id} tidak ditemukan"
                )

            if product.stock < quantity:
                raise ValueError(
                    f"Stok {product.name} tidak mencukupi"
                )

            price = Decimal(str(product.price))
            subtotal = price * quantity

            total += subtotal

            order_details.append({
                "product": product,
                "quantity": quantity,
                "price": price,
                "subtotal": subtotal
            })

        # Buat transaksi
        transaction = Transaction(
            invoice_number="INV-" + uuid.uuid4().hex[:12].upper(),
            total=total,
            payment_method=data.get("payment_method"),
            status="Pending"
        )

        db.session.add(transaction)
        db.session.flush()

        # Simpan detail dan kurangi stok
        for detail in order_details:
            product = detail["product"]
            quantity = detail["quantity"]

            product.stock -= quantity

            transaction_detail = TransactionDetail(
                transaction_id=transaction.id,
                product_id=product.id,
                quantity=quantity,
                price=detail["price"],
                subtotal=detail["subtotal"]
            )

            db.session.add(transaction_detail)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Pesanan berhasil dikonfirmasi",
            "invoice_number": transaction.invoice_number,
            "total": float(total)
        }), 201

    except (ValueError, KeyError, TypeError) as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 400

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500





    
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    try:
        transactions = Transaction.query.order_by(
            Transaction.created_at.desc()
        ).all()

        result = []

        for transaction in transactions:
            result.append({
                "id": transaction.id,
                "invoice_number": transaction.invoice_number,
                "total": float(transaction.total),
                "payment_method": transaction.payment_method,
                "status": transaction.status,
                "created_at": (
                    transaction.created_at.strftime("%d-%m-%Y %H:%M:%S")
                    if transaction.created_at else None
                )
            })

        return jsonify({
            "status": "success",
            "total": len(result),
            "transactions": result
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    
@app.route("/api/transactions/<int:transaction_id>/status", methods=["PUT"])
def update_transaction_status(transaction_id):
    try:
        data = request.get_json()

        if not data or data.get("status") not in [
            "Pending", "Paid", "Cancelled"
        ]:
            return jsonify({
                "status": "error",
                "message": "Status transaksi tidak valid"
            }), 400

        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return jsonify({
                "status": "error",
                "message": "Transaksi tidak ditemukan"
            }), 404

        transaction.status = data["status"]
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Status transaksi berhasil diperbarui"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500




    
@app.route("/api/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction_detail(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return jsonify({
                "status": "error",
                "message": "Transaksi tidak ditemukan"
            }), 404

        details = TransactionDetail.query.filter_by(
            transaction_id=transaction_id
        ).all()

        items = []

        for detail in details:
            product = Product.query.get(detail.product_id)

            items.append({
                "product_name": product.name if product else "Produk dihapus",
                "category": product.category if product else "-",
                "quantity": detail.quantity,
                "price": float(detail.price),
                "subtotal": float(detail.subtotal)
            })

        return jsonify({
            "status": "success",
            "transaction": {
                "invoice_number": transaction.invoice_number,
                "total": float(transaction.total),
                "payment_method": transaction.payment_method,
                "status": transaction.status,
                "created_at": (
                    transaction.created_at.strftime("%d-%m-%Y %H:%M:%S")
                    if transaction.created_at else None
                ),
                "items": items
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



@app.route("/api/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    try:
        transaction = Transaction.query.get(transaction_id)

        if not transaction:
            return jsonify({
                "status": "error",
                "message": "Transaksi tidak ditemukan"
            }), 404

        # Hapus detail transaksi terlebih dahulu
        TransactionDetail.query.filter_by(
            transaction_id=transaction_id
        ).delete(synchronize_session=False)

        # Hapus catatan transaksi
        db.session.delete(transaction)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Riwayat transaksi berhasil dihapus"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
@app.route("/api/customer-reports", methods=["POST"])
def create_customer_report():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Data laporan tidak ditemukan"
            }), 400

        customer_name = data.get("customer_name", "").strip()
        phone = data.get("phone", "").strip()
        subject = data.get("subject", "").strip()
        message = data.get("message", "").strip()

        if not all([customer_name, phone, subject, message]):
            return jsonify({
                "status": "error",
                "message": "Semua kolom wajib diisi"
            }), 400

        report = CustomerReport(
            customer_name=customer_name,
            phone=phone,
            subject=subject,
            message=message,
            status="Pending"
        )

        db.session.add(report)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Laporan berhasil dikirim"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    # Menampilkan semua laporan Customer Service
@app.route("/api/customer-reports", methods=["GET"])
def get_customer_reports():
    try:
        reports = CustomerReport.query.order_by(
            CustomerReport.created_at.desc()
        ).all()

        return jsonify([
            {
                "id": report.id,
                "customer_name": report.customer_name,
                "phone": report.phone,
                "subject": report.subject,
                "message": report.message,
                "status": report.status,
                "created_at": report.created_at.strftime("%Y-%m-%d %H:%M:%S")
                if report.created_at else None
            }
            for report in reports
        ]), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500





@app.route("/api/customer-reports/<int:report_id>/status", methods=["PUT"])
def update_customer_report_status(report_id):
    try:
        data = request.get_json()
        status = data.get("status") if data else None

        if status not in ["Pending", "Diproses", "Selesai"]:
            return jsonify({
                "status": "error",
                "message": "Status laporan tidak valid"
            }), 400

        report = CustomerReport.query.get(report_id)

        if not report:
            return jsonify({
                "status": "error",
                "message": "Laporan tidak ditemukan"
            }), 404

        report.status = status
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Status laporan berhasil diperbarui"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500




@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    try:
        data = request.get_json() or {}

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "status": "error",
                "message": "Username dan kata sandi wajib diisi"
            }), 400

        admin = Admin.query.filter_by(username=username).first()

        if not admin or not check_password_hash(admin.password, password):
            return jsonify({
                "status": "error",
                "message": "Username atau kata sandi salah"
            }), 401

        session["admin_id"] = admin.id

        return jsonify({
            "status": "success",
            "message": "Login berhasil"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.pop("admin_id", None)

    return jsonify({
        "status": "success",
        "message": "Logout berhasil"
    }), 200

@app.route("/api/admin/register", methods=["POST"])
def admin_register():
    try:
        data = request.get_json() or {}

        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "status": "error",
                "message": "Username dan kata sandi wajib diisi"
            }), 400

        if Admin.query.first():
            return jsonify({
                "status": "error",
                "message": "Akun admin sudah dibuat"
            }), 403

        admin = Admin(
            username=username,
            password=generate_password_hash(password)
        )

        db.session.add(admin)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Akun admin berhasil dibuat"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route("/api/admin/check", methods=["GET"])
def check_admin_login():
    admin_id = session.get("admin_id")

    if not admin_id:
        return jsonify({
            "status": "error",
            "message": "Belum login"
        }), 401

    admin = Admin.query.get(admin_id)

    if not admin:
        session.pop("admin_id", None)
        return jsonify({
            "status": "error",
            "message": "Admin tidak ditemukan"
        }), 401

    return jsonify({
        "status": "success",
        "message": "Admin sudah login",
        "username": admin.username
    }), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
