import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
import { Navigate } from "react-router-dom";

const Form = () => {
    const { store, actions } = useContext(Context);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function sendData(e) {
        e.preventDefault();
        const response = await actions.login(email, password);
        if (!response.ok) {
            setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.');
        }
    }

    return (
        <>
            {store.auth === true ? <Navigate to="/demo" /> :
                <div style={{ width: '400px', margin: '60px', padding: '15px' }}>
                    <form className="w-50 mx-auto" onSubmit={sendData}>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" id="exampleInputEmail1" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="form-control" id="exampleInputPassword1" />
                        </div>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                </div>
            }
        </>
    );
}
export default Form;