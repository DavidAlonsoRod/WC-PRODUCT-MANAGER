import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Orders from './pages/orderlist';
import OrdersInProgress from './pages/orderlistInProgress';
// ...existing code...

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders-in-progress" element={<OrdersInProgress />} />
                {/* ...otras rutas... */}
            </Routes>
        </Router>
    );
};

export default App;