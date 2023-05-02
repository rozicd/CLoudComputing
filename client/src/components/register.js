import React, { useState } from 'react';
import loginImage from '../assets/images/loginPhoto.png';
import {
    Grid,
    TextField,
    Button,
    Card,
    CardHeader,
    CardContent
} from '@mui/material';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthDate, setbirthDate] = useState(null);
    const [email, setEmail] = useState('');

    const handleSignUp = () => {
        // code to handle sign up
    };

    return (
        <Card className="register-form-card">
            <CardContent className="login-card-content">
                <h1 className="h1-register">Register</h1>
                <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextField label="Password" fullWidth margin="normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <TextField label="Name" fullWidth margin="normal"  value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Surname" fullWidth margin="normal"  value={surname} onChange={(e) => setSurname(e.target.value)} />
                <TextField label="Email" fullWidth margin="normal"  value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField fullWidth margin="normal" type="date" value={birthDate} onChange={(e) => setbirthDate(e.target.value)} />
                <div className="button-container">
                    <Button className="register-button" variant="contained" color="secondary" onClick={handleSignUp}>
                        Sign Up
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default RegisterPage;
