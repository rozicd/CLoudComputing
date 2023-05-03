import React, { useState } from 'react';
import SignIn from '../service/authService'
import loginImage from '../assets/images/loginPhoto.png'
import {
    TextField,
    Button,
    Card,
    CardContent,
} from '@mui/material';
import {useNavigate} from "react-router-dom";

function SignInPage({ signUpPressed, setSignUpPressed }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();

    function success() {


        navigate("/home")


    }

    const handleLogin = async () => {
        if(await SignIn(username, password))
        {
            success()
        }
    }

    const handleSignUp = () => {
        setSignUpPressed(true);
    }

    return (
        <Card className="login-form-card">
            <CardContent className="login-card-content">
                <h1 className="h1-login">Login</h1>
                <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextField label="Password" fullWidth margin="normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="button-container">
                    <Button  className="login-button" variant="contained" color="primary" onClick={handleLogin}>
                        Login
                    </Button>
                    <Button className="register-button" variant="contained" color="secondary" onClick={handleSignUp}>
                        Sign Up
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default SignInPage;
