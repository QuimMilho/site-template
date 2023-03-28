import React from "react";
import {
    Route,
    BrowserRouter as Router,
    Routes,
    Outlet,
} from "react-router-dom";
import "./styles/global.scss";

export default class extends React.Component {
    constructor(props: {}) {
        super(props);
    }

    render() {
        const apiURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
        return (
            <div className="App">
                <Router>
                    <Routes>
                        <Route path="/" element={<div />}></Route>
                        <Route
                            path="/outlet"
                            element={
                                <div>
                                    <Outlet />
                                </div>
                            }
                        >
                            <Route path="/1" element={<div />}></Route>
                        </Route>

                        <Route path="*"></Route>
                    </Routes>
                </Router>
            </div>
        );
    }
}
