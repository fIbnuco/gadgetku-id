from .database import db

class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )
class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(
        db.Enum("Laptop", "HP"),
        nullable=False
    )
    brand = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(15, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    image = db.Column(db.String(255))
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )
    updated_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp(),
        onupdate=db.func.current_timestamp()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "brand": self.brand,
            "description": self.description,
            "price": float(self.price),
            "stock": self.stock,
            "image": self.image
        }

class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(100))
    address = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "address": self.address
        }
    


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_id = db.Column(
        db.Integer,
        db.ForeignKey("customers.id"),
        nullable=True
    )
    invoice_number = db.Column(
        db.String(50),
        nullable=False,
        unique=True
    )
    total = db.Column(db.Numeric(15, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=True)
    status = db.Column(
        db.Enum("Pending", "Paid", "Cancelled"),
        default="Pending"
    )
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


class TransactionDetail(db.Model):
    __tablename__ = "transaction_details"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    transaction_id = db.Column(
        db.Integer,
        db.ForeignKey("transactions.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=True
    )

    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(15, 2), nullable=False)
    subtotal = db.Column(db.Numeric(15, 2), nullable=False)



class CustomerReport(db.Model):
    __tablename__ = "customer_reports"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(
        db.Enum("Pending", "Diproses", "Selesai"),
        default="Pending"
    )
    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )
