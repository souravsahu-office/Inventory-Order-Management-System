from fastapi import FastAPI
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import Base
from app.database import engine
from app.database import get_db

from app.models import Product
from app.models import Customer
from app.models import Order
from app.models import OrderItem

from app.schemas import ProductCreate
from app.schemas import CustomerCreate
from app.schemas import OrderCreate
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management API"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------
# PRODUCTS
# ----------------------

@app.post("/products")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Product).filter(
        Product.sku == product.sku
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="SKU already exists"
        )

    if product.stock_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Stock cannot be negative"
        )

    new_product = Product(**product.dict())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@app.get("/products")
def get_products(
    db: Session = Depends(get_db)
):
    return db.query(Product).all()


@app.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Product).filter(
        Product.id == product_id
    ).first()


@app.put("/products/{product_id}")
def update_product(
    product_id: int,
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    obj = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not obj:
        raise HTTPException(404, "Product not found")
    
    if product.stock_quantity < 0:
        raise HTTPException(
        400,
        "Stock cannot be negative"
    )

    obj.name = product.name
    obj.sku = product.sku
    obj.price = product.price
    obj.stock_quantity = product.stock_quantity

    db.commit()

    return obj


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    obj = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not obj:
        raise HTTPException(404, "Product not found")

    db.delete(obj)
    db.commit()

    return {"message": "deleted"}

# ----------------------
# CUSTOMERS
# ----------------------

@app.post("/customers")
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Customer).filter(
        Customer.email == customer.email
    ).first()

    if existing:
        raise HTTPException(
            400,
            "Email already exists"
        )

    obj = Customer(**customer.dict())

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return obj


@app.get("/customers")
def get_customers(
    db: Session = Depends(get_db)
):
    return db.query(Customer).all()


@app.get("/customers/{customer_id}")
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Customer).filter(
        Customer.id == customer_id
    ).first()


@app.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    obj = db.query(Customer).filter(
        Customer.id == customer_id
    ).first()

    if not obj:
        raise HTTPException(404, "Customer not found")

    db.delete(obj)
    db.commit()

    return {"message": "deleted"}

# ----------------------
# ORDERS
# ----------------------

@app.post("/orders")
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.id == order_data.customer_id
    ).first()

    if not customer:
        raise HTTPException(
            404,
            "Customer not found"
        )

    total = 0

    order = Order(
        customer_id=order_data.customer_id
    )

    db.add(order)

    for item in order_data.items:
        if item.quantity <= 0:
            raise HTTPException(
                400,
                "Quantity must be greater than 0"
            )
        product = db.query(Product).filter(
            Product.id == item.product_id
        ).first()

        if not product:
            raise HTTPException(
                404,
                f"Product {item.product_id} not found"
            )

        if product.stock_quantity < item.quantity:
            raise HTTPException(
                400,
                f"Insufficient stock for {product.name}"
            )

        product.stock_quantity -= item.quantity

        line_total = product.price * item.quantity

        total += line_total

        db.add(
            OrderItem(
                order=order,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
        )

    order.total_amount = total

    db.commit()
    db.refresh(order)

    return order


@app.get("/orders")
def get_orders(
    db: Session = Depends(get_db)
):
    return db.query(Order).all()


@app.get("/orders/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    return db.query(Order).filter(
        Order.id == order_id
    ).first()


@app.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    obj = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not obj:
        raise HTTPException(
            404,
            "Order not found"
        )

    db.delete(obj)
    db.commit()

    return {"message": "deleted"}


@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):

    total_products = db.query(Product).count()

    total_customers = db.query(Customer).count()

    total_orders = db.query(Order).count()

    low_stock_products = db.query(Product).filter(
        Product.stock_quantity < 10
    ).count()

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }