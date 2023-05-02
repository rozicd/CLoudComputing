import React, { useState } from 'react';
import SignIn from '../service/authService'
import loginImage from '../assets/images/loginPhoto.png'

import {
    Grid,
    Card,
    CardContent,
} from '@mui/material';
import './login.css';
import SignInPage from './signin';
import RegisterPage from './register';


function LoginPage() {

    const [signUpPressed, setSignUpPressed] = useState(false);

    return (
        <Grid container className="login-page">
            <Grid container className="login-page-left">
               {!signUpPressed &&<SignInPage setSignUpPressed={setSignUpPressed} ></SignInPage>}
               {signUpPressed && <RegisterPage></RegisterPage>}
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
