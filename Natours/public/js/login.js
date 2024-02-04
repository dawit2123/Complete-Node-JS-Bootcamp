//importing the axious http request sender package
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async function(email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      console.log('here from data status');
      showAlert('success', 'Logged in successfully');
      window.setTimeout(function() {
        location.assign('/');
      }, 1500);
    } else if (res.data.status === 'fail') {
      showAlert('error', 'Incorrect username or password');
    }
  } catch (err) {
    showAlert('error', 'Error occured');
  }
};
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error occured in logging out');
  }
};
