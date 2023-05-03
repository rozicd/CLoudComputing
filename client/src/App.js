import { Routes, Route, Navigate } from "react-router-dom";
import { Auth } from "aws-amplify";
import Login from './components/login';
import Home from './components/home';
import { useState, useEffect } from 'react';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const session = await Auth.currentSession();
                setIsAuthenticated(session.isValid());
            } catch (err) {
                setIsAuthenticated(false);
                console.log(err);
            }
        }

        checkAuth();
    }, []);

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/home" /> : <Login />
                }
            />
            <Route
                path="/home"
                element={
                    isAuthenticated ? <Home /> : <Navigate to="/login" />
                }
            />
        </Routes>
    );
}

export default App;
