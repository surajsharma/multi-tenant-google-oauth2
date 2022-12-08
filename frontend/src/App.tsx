import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { Auth } from "./Components/AuthContext";

import SignUp from "./Components/Signup";
import Dashboard from "./Components/Dashboard";
import Subscriptions from "./Components/Subscriptions";
import React from "react";

export default function App() {
    return (
        <Auth>
            <Router>
                <Routes>
                    <Route path="/" element={<SignUp />} />
                    <Route path="/login" element={<SignUp />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </Router>
        </Auth>
    );
}
