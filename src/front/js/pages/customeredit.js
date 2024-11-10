import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const CustomerEdit = () => {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState({ firstName: "", lastName: "", username: "", email: "", phone: "", city: "", state: "", zip: "" });

    useEffect(() => {
        // Fetch customer data from the backend
        fetch(`/api/customers/${customerId}`)
            .then(response => response.json())
            .then(data => setCustomer(data));
    }, [customerId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer({ ...customer, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Update customer data in the backend
        fetch(`/api/customers/${customerId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customer)
        })
            .then(response => response.json())
            .then(data => {
                // Handle response
            });
    };

    return (
        <form className="needs-validation m-5" noValidate onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="col-md-4 mb-3">
                    <label htmlFor="validationCustom01">Nombre</label>
                    <input type="text" className="form-control" id="validationCustom01" placeholder={customer.firstName} name="firstName" value={customer.firstName} onChange={handleChange} required />
                    <div className="valid-feedback">
                        Bonito Nombre!
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <label htmlFor="validationCustom02">Apellidos</label>
                    <input type="text" className="form-control" id="validationCustom02" placeholder="Last name" name="lastName" value={customer.lastName} onChange={handleChange} required />
                    <div className="valid-feedback">
                        Pareces de buena familia!
                    </div>
                </div>
                
            </div>
            <div className="form-row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="validationCustomEmail">Email</label>
                    <input type="email" className="form-control" id="validationCustomEmail" placeholder="Email" name="email" value={customer.email} onChange={handleChange} required />
                    <div className="invalid-feedback">
                        Ingresa un mail válido.
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <label htmlFor="validationCustomPhone">Tfno</label>
                    <input type="text" className="form-control" id="validationCustomPhone" placeholder="Phone" name="phone" value={customer.phone} onChange={handleChange} required />
                    <div className="invalid-feedback">
                        Introduce un número válido.
                    </div>
                </div>
            </div>
            <div className="form-row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="validationCustom03">Ciudad</label>
                    <input type="text" className="form-control" id="validationCustom03" placeholder="City" name="city" value={customer.city} onChange={handleChange} required />
                    <div className="invalid-feedback">
                        Ingresa tu ciudad
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <label htmlFor="validationCustom04">State</label>
                    <input type="text" className="form-control" id="validationCustom04" placeholder="State" name="state" value={customer.state} onChange={handleChange} required />
                    <div className="invalid-feedback">
                        Ingresa tu provincia
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <label htmlFor="validationCustom05">Zip</label>
                    <input type="text" className="form-control" id="validationCustom05" placeholder="Zip" name="zip" value={customer.zip} onChange={handleChange} required />
                    <div className="invalid-feedback">
                        Ingresa tu código postal
                    </div>
                </div>
            </div>
            <div className="form-group">
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="" id="invalidCheck" required />
                    <label className="form-check-label" htmlFor="invalidCheck">
                        Aceptar términos y condiciones              
                    </label>
                    <div className="invalid-feedback">
                        Debes aceptar antes de enviar.
                    </div>
                </div>
            </div>
            <button className="btn btn-primary" type="submit"> Enviar</button>
        </form>
    );
};

export default CustomerEdit;