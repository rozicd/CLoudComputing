import axios from 'axios';

const Register = (firstName, lastName, birthdate, username, email, password) => {
    axios.post('http://localhost:8000/auth/register', {
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: birthdate,
        username: username,
        email: email,
        password: password
    })
        .then(response => {
            window.alert("Registration succesfull")
        })
        .catch(error => {
            console.log(error);
            // Handle the error
        });
};

export default Register;