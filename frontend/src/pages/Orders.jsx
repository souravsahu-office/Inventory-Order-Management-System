import { useEffect, useState } from "react";
import api from "../services/api";

function Orders() {

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [form, setForm] = useState({
        customer_id: "",
        product_id: "",
        quantity: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        const customerRes = await api.get("/customers");
        const productRes = await api.get("/products");
        const orderRes = await api.get("/orders");

        setCustomers(customerRes.data);
        setProducts(productRes.data);
        setOrders(orderRes.data);
    };

    const createOrder = async (e) => {

        e.preventDefault();

        try {

            await api.post("/orders", {
                customer_id: Number(form.customer_id),
                items: [
                    {
                        product_id: Number(form.product_id),
                        quantity: Number(form.quantity)
                    }
                ]
            });

            setForm({
                customer_id: "",
                product_id: "",
                quantity: ""
            });

            loadData();

            alert("Order created successfully");

        } catch (err) {

            alert(
                err?.response?.data?.detail ||
                "Order failed"
            );
        }
    };

    return (
        <div>

            <h2 className="mb-4">
                Order Management
            </h2>

            <div className="card p-3 mb-4">

                <form onSubmit={createOrder}>

                    <div className="row">

                        <div className="col-md-4">

                            <select
                                className="form-control"
                                value={form.customer_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        customer_id: e.target.value
                                    })
                                }
                                required
                            >

                                <option value="">
                                    Select Customer
                                </option>

                                {customers.map((c) => (
                                    <option
                                        key={c.id}
                                        value={c.id}
                                    >
                                        {c.full_name}
                                    </option>
                                ))}

                            </select>

                        </div>

                        <div className="col-md-4">

                            <select
                                className="form-control"
                                value={form.product_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        product_id: e.target.value
                                    })
                                }
                                required
                            >

                                <option value="">
                                    Select Product
                                </option>

                                {products.map((p) => (

                                    <option
                                        key={p.id}
                                        value={p.id}
                                    >
                                        {p.name}
                                        {" | Stock: "}
                                        {p.stock_quantity}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="col-md-2">

                            <input
                                type="number"
                                className="form-control"
                                placeholder="Qty"
                                value={form.quantity}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        quantity: e.target.value
                                    })
                                }
                                required
                            />

                        </div>

                        <div className="col-md-2">

                            <button
                                className="btn btn-success w-100"
                            >
                                Create
                            </button>

                        </div>

                    </div>

                </form>

            </div>

            <table className="table table-bordered">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Customer ID</th>
                        <th>Total Amount</th>
                    </tr>

                </thead>

                <tbody>

                    {orders.map((o) => (

                        <tr key={o.id}>

                            <td>{o.id}</td>
                            <td>{o.customer_id}</td>
                            <td>{o.total_amount}</td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default Orders;