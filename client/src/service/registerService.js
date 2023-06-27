import axios from 'axios';
import { Auth } from 'aws-amplify';


async function Register(firstName, lastName, birthdate, username, email, password) {
  try {
    const { user } = await Auth.signUp({
      username: username,
      password: password,
      attributes: {
        email:email, 
        family_name:lastName,
        given_name:firstName,
        birthdate:birthdate
          },
      autoVerify: true,
      autoSignIn: { // optional - enables auto sign in after user is confirmed
        enabled: true,
      }
    });
    console.log(user);


    

  } catch (error) {
    console.log('error signing up:', error);
  }
}


export default Register;