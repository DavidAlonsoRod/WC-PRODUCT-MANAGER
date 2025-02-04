import React, { useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import { Context } from "./store/appContext";

import { Home } from "./pages/home";
import { Demo } from "./pages/demo";
import { Single } from "./pages/single";
import injectContext from "./store/appContext";

import { Navbar } from "./component/navbar";
import { Footer } from "./component/footer";
import Orders from "./pages/orderlist";
import Customers from "./pages/customerlist";
import CustomerView from "./pages/customerview";
import LineItems from "./pages/lineitems";
import OrderView from "./pages/orderview";
import OrdersInProgress from "./pages/orderlistInProgress";
import Settings from "./pages/settings";
import Invoices from "./pages/invoices";
import ScanQR from "./pages/scanqr";
// import CustomerForm from "./pages/customerform"; 

const Layout = () => {
    const { actions } = useContext(Context);
    const basename = process.env.BASENAME || "";

    useEffect(() => {
        // actions.verifyToken();
    }, []);

    if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "") return <BackendURL />;

    return (
        <div>
            <BrowserRouter basename={basename}>
                <ScrollToTop>
                    <Navbar />
                    <div className="content">
                        <Routes>
                            <Route element={<Home />} path="/" />
                            <Route element={<Demo />} path="/demo" />
                            <Route element={<Single />} path="/single/:theid" />
                            <Route element={<Orders />} path="/orders" />
                            <Route element={<OrdersInProgress />} path="/orders-in-progress" />
                            <Route element={<Customers />} path="/customers" />
                            <Route element={<LineItems />} path="/lineitems" />
                            <Route element={<OrderView />} path="/orders/:orderId" />
                            <Route element={<CustomerView />} path="/customer/:customerId" />
                            <Route element={<Settings />} path="/settings" />
                            <Route element={<Invoices />} path="/invoices" />
                            <Route element={<ScanQR />} path="/scanqr" />
                            {/* <Route element={<CustomerForm />} path="/customerform" />  */}
                            <Route element={<h1>Not found!</h1>} />
                        </Routes>
                    </div>
                    <Footer />
                </ScrollToTop>
            </BrowserRouter>
        </div>
    );
};

export default injectContext(Layout);