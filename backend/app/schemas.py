from pydantic import BaseModel
from pydantic import EmailStr


class ProductCreate(BaseModel):
    name: str
    sku: str
    price: float
    stock_quantity: int


class CustomerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]