import { GoogleApiProvider } from 'react-gapi'

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AutoComplete from "./Components/AutoComplete";
import Table from "./Components/Table";

export default function App() {
    return (
        <GoogleApiProvider clientId={"780707646972-84u3voauonu5f7bs181ho0dl74955u49.apps.googleusercontent.com"}>
            <Router>
                <div className="d-flex flex-column justify-content-md-center align-items-center vh-100">
                    <Routes>
                        <Route path="/" element={<AutoComplete />} />
                        <Route path="/table" element={<Table />} />
                    </Routes>
                </div>
            </Router>
        </GoogleApiProvider>
    );
}
