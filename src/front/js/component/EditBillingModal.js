import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditBillingModal = ({ show, handleClose, customer, updateCustomer }) => {
    const [billingDetails, setBillingDetails] = useState({
        first_name: customer.billing.first_name || '',
        last_name: customer.billing.last_name || '',
        company: customer.billing.company || '',
        address_1: customer.billing.address_1 || '',
        address_2: customer.billing.address_2 || '',
        city: customer.billing.city || '',
        state: customer.billing.state || '',
        postcode: customer.billing.postcode || '',
        email: customer.billing.email || '',
        phone: customer.billing.phone || '',
        nif: customer.billing.nif || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBillingDetails({ ...billingDetails, [name]: value });
    };

    const handleSubmit = () => {
        updateCustomer({ ...customer, billing: billingDetails });
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Detalles de Facturación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="billingFirstName">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="first_name"
                            value={billingDetails.first_name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingLastName">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                            type="text"
                            name="last_name"
                            value={billingDetails.last_name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingCompany">
                        <Form.Label>Nombre comercial</Form.Label>
                        <Form.Control
                            type="text"
                            name="company"
                            value={billingDetails.company}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingAddress1">
                        <Form.Label>Dirección 1</Form.Label>
                        <Form.Control
                            type="text"
                            name="address_1"
                            value={billingDetails.address_1}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingAddress2">
                        <Form.Label>Dirección 2</Form.Label>
                        <Form.Control
                            type="text"
                            name="address_2"
                            value={billingDetails.address_2}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingCity">
                        <Form.Label>Localidad</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={billingDetails.city}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingState">
                        <Form.Label>Provincia</Form.Label>
                        <Form.Control
                            type="text"
                            name="state"
                            value={billingDetails.state}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingPostcode">
                        <Form.Label>Código Postal</Form.Label>
                        <Form.Control
                            type="text"
                            name="postcode"
                            value={billingDetails.postcode}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="billingEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={billingDetails.email}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingPhone">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={billingDetails.phone}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingNif">
                        <Form.Label>NIF</Form.Label>
                        <Form.Control
                            type="text"
                            name="nif"
                            value={billingDetails.nif}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="billingNif">
                        <Form.Label>Iban</Form.Label>
                        <Form.Control
                            type="text"
                            name="nif"
                            value={billingDetails.iban}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Guardar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditBillingModal;