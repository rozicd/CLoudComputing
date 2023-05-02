import axios from 'axios';
import Amplify, { Auth } from "aws-amplify";
async function SignIn(username, password) {
    Auth.signIn(username, password)
    .then(user => {
      // Store the user session in sessionStorage
      sessionStorage.setItem('accessToken', user.signInUserSession.accessToken.jwtToken);
      sessionStorage.setItem('idToken', user.signInUserSession.idToken.jwtToken);
      sessionStorage.setItem('refreshToken', user.signInUserSession.refreshToken.token);
    })
    .catch(err => console.log(err));

}

export default SignIn;