import axios from 'axios';

const SignIn = (username, password) => {
    axios.post('http://localhost:8000/auth/login', {
        username: username,
        password: password
    })
        .then(response => {
            const token = response.data.accessToken;
            // save token to local storage
            localStorage.setItem('token', token);
            console.log('Token saved to localStorage.');
            // Do something with the response data
        })
        .catch(error => {
            console.log(error);
            // Handle the error
        });
};

export default SignIn;
