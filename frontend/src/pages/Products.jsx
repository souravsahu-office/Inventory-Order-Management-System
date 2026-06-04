import { useEffect, useState } from "react";
import api from "../services/api";

function Products() {

    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: "",
        sku: "",
        price: "",
        stock_quantity: ""
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const res = await api.get("/products");
        setProducts(res.data);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const editProduct = (product) => {

        setEditingId(product.id);

        setForm({
            name: product.name,
            sku: product.sku,
            price: product.price,
            stock_quantity: product.stock_quantity
        });
    };

    const saveProduct = async (e) => {

        e.preventDefault();

        try {

            const payload = {
                ...form,
                price: Number(form.price),
                stock_quantity: Number(form.stock_quantity)
            };

            if (editingId) {

                await api.put(
                    `/products/${editingId}`,
                    payload
                );

            } else {

                await api.post(
                    "/products",
                    payload
                );
            }

            setEditingId(null);

            setForm({
                name: "",
                sku: "",
                price: "",
                stock_quantity: ""
            });

            loadProducts();

        } catch (err) {

            alert(
                err?.response?.data?.detail ||
                "Error"
            );
        }
    };

    const deleteProduct = async (id) => {

        if (!window.confirm("Delete product?"))
            return;

        await api.delete(`/products/${id}`);

        loadProducts();
    };

    return (
        <div>

            <h2 className="mb-4">
                Product Management
            </h2>

            <div className="card p-3 mb-4">

                <form onSubmit={saveProduct}>

                    <div className="row">

                        <div className="col-md-3">
                            <input
                                className="form-control"
                                placeholder="Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-2">
                            <input
                                className="form-control"
                                placeholder="SKU"
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-2">
                            <input
                                className="form-control"
                                placeholder="Price"
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-2">
                            <input
                                className="form-control"
                                placeholder="Stock"
                                name="stock_quantity"
                                type="number"
                                value={form.stock_quantity}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <button
                                className="btn btn-success w-100"
                            >
                                {editingId ? "Update Product" : "Add Product"}
                            </button>
                        </div>

                    </div>

                </form>

            </div>

            <table className="table table-bordered">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>

                    {products.map((p) => (

                        <tr key={p.id}>

                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td>{p.price}</td>
                            <td>{p.stock_quantity}</td>

                            <td>

                                <button
                                    className="btn btn-warning btn-sm me-2"
                                    onClick={() => editProduct(p)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => deleteProduct(p.id)}
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default Products;