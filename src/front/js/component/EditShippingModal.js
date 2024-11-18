import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const EditShippingModal = ({ show, handleClose, customer, updateCustomer }) => {
    const [shippingDetails, setShippingDetails] = useState({
        first_name: customer.shipping.first_name || '',
        last_name: customer.shipping.last_name || '',
        company: customer.shipping.company || '',
        address_1: customer.shipping.address_1 || '',
        address_2: customer.shipping.address_2 || '',
        city: customer.shipping.city || '',
        state: customer.shipping.state || '',
        postcode: customer.shipping.postcode || '',
        phone: customer.shipping.phone || ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails({
            ...shippingDetails,
            [name]: value
        });
    };

    const handleSubmit = () => {
        if (!shippingDetails.first_name || !shippingDetails.last_name || !shippingDetails.address_1 || !shippingDetails.city || !shippingDetails.state || !shippingDetails.postcode || !shippingDetails.phone) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        const updatedCustomer = {
            ...customer,
            shipping: shippingDetails
        };
        updateCustomer(updatedCustomer);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Editar Información de Envío</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group controlId="formShippingFirstName">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="first_name"
                            value={shippingDetails.first_name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingLastName">
                        <Form.Label>Apellidos</Form.Label>
                        <Form.Control
                            type="text"
                            name="last_name"
                            value={shippingDetails.last_name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingCompany">
                        <Form.Label>Nombre comercial</Form.Label>
                        <Form.Control
                            type="text"
                            name="company"
                            value={shippingDetails.company}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingAddress1">
                        <Form.Label>Dirección 1</Form.Label>
                        <Form.Control
                            type="text"
                            name="address_1"
                            value={shippingDetails.address_1}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingAddress2">
                        <Form.Label>Dirección 2</Form.Label>
                        <Form.Control
                            type="text"
                            name="address_2"
                            value={shippingDetails.address_2}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingCity">
                        <Form.Label>Localidad</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={shippingDetails.city}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingState">
                        <Form.Label>Provincia</Form.Label>
                        <Form.Control
                            type="text"
                            name="state"
                            value={shippingDetails.state}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingPostcode">
                        <Form.Label>Código Postal</Form.Label>
                        <Form.Control
                            type="text"
                            name="postcode"
                            value={shippingDetails.postcode}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group controlId="formShippingPhone">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={shippingDetails.phone}
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

export default EditShippingModal;