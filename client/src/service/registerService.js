import axios from 'axios';
import { Auth } from 'aws-amplify';


async function Register(firstName, lastName, birthdate, username, email, password,referral) {
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
    console.log(referral);
    console.log("ASFLKPASFKASOP")
    if(referral != ''){
      try{
        const endpoint = 'https://nr9rkx23s6.execute-api.eu-central-1.amazonaws.com/dev/lambda-trigger/'+referral+"-"+username
  
      const response = await axios.get(endpoint);
  
      if (response.status === 200) {
        console.log('Referral process started');
      } else {
        console.error('Error updating file');
      }
      }catch(error){
        console.error(error)
      }
    }

    

  } catch (error) {
    console.log('error signing up:', error);
  }
}


export default Register;