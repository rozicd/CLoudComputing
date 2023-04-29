import React, { useState } from 'react';
import SignIn from '../service/authService'
import loginImage from '../assets/images/loginPhoto.png'
import {
    Grid,
    TextField,
    Button,
    Card,
    CardHeader,
    CardContent,
} from '@mui/material';
import './login.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        SignIn(username,password)
    }

    return (
        <Grid container className="login-page">
            <Grid container className="login-page-left">
                <Card className="login-form-card">
                    <CardContent className="login-card-content">
                        <h1 className="h1-login">Login</h1>
                        <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <TextField label="Password" fullWidth margin="normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <div className="button-container">
                            <Button  className="login-button" variant="contained" color="primary" onClick={handleLogin}>
                                Login
                            </Button>
                            <Button className="register-button" variant="contained" color="secondary" >
                                Sing Up
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
            <Grid container className="login-page-right">
                <Card className="login-image-card">
                    <CardContent>
                        <img src={loginImage} alt="Login" className="login-image" />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}

export default LoginPage;
