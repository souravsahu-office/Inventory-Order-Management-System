import { useEffect, useState } from "react";
import api from "../services/api";

function Customers() {

    const [customers, setCustomers] = useState([]);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        const res = await api.get("/customers");
        setCustomers(res.data);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const createCustomer = async (e) => {

        e.preventDefault();

        try {

            await api.post("/customers", form);

            setForm({
                full_name: "",
                email: "",
                phone: ""
            });

            loadCustomers();

        } catch (err) {

            console.log(err);

            alert(
                err?.response?.data?.detail ||
                "Error creating customer"
            );
        }
    };

    const deleteCustomer = async (id) => {

        if (!window.confirm("Delete customer?"))
            return;

        await api.delete(`/customers/${id}`);

        loadCustomers();
    };

    return (
        <div>

            <h2 className="mb-4">
                Customer Management
            </h2>

            <div className="card p-3 mb-4">

                <form onSubmit={createCustomer}>

                    <div className="row">

                        <div className="col-md-3">
                            <input
                                className="form-control"
                                placeholder="Full Name"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <input
                                className="form-control"
                                placeholder="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <input
                                className="form-control"
                                placeholder="Phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-md-3">
                            <button
                                className="btn btn-primary w-100"
                            >
                                Add Customer
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
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>

                    {customers.map((customer) => (

                        <tr key={customer.id}>

                            <td>{customer.id}</td>
                            <td>{customer.full_name}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>

                            <td>

                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                        deleteCustomer(customer.id)
                                    }
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

export default Customers;