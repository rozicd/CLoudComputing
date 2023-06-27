import React, { useState } from 'react';
import Register from '../service/registerService';

import {
    TextField,
    Button,
    Card,
    CardContent
} from '@mui/material';

function RegisterPage(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setbirthDate] = useState('');
    const [email, setEmail] = useState('');
    const [referral, setReferral] = useState('');

    const handleSignUp = () => {
        Register(name, surname, birthDate, username, email, password, referral);
    };

    const handleBack = () => {
        props.setSignUpPressed(false);
    };

    return (
        <Card className="register-form-card">
            <CardContent className="login-card-content">
                <h1 className="h1-register">Register</h1>
                <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextField label="Password" fullWidth margin="normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Surname" fullWidth margin="normal" value={surname} onChange={(e) => setSurname(e.target.value)} />
                <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField fullWidth margin="normal" type="date" value={birthDate} onChange={(e) => setbirthDate(e.target.value)} />
                <TextField label="Referral (optional)" fullWidth margin="normal" value={referral} onChange={(e) => setReferral(e.target.value)} />
                <div className="button-container">
                    <Button className="register-button" variant="contained" color="primary" onClick={handleSignUp}>
                        Sign Up
                    </Button>
                    <Button className="register-button" variant="contained" color="secondary" onClick={handleBack}>
                        Back
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default RegisterPage;