import axios from 'axios';
import Amplify, { Auth } from "aws-amplify";
async function SignIn(username, password,) {
    await Auth.signIn(username, password)
    .then(user => {
      // Store the user session in sessionStorage
      console.log("  ")
      console.log(user)
        window.location.reload();

    })
    .catch(err => console.log(err));

}

export default SignIn;