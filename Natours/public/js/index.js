import { login, logout } from './login';
import { updateSettings } from './updateSettings';
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logoutBtn = document.querySelector('.nav__el--logout');
if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
if (logoutBtn)
  logoutBtn.addEventListener('click', () => {
    logout();
  });
if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('#name').value);
    form.append('email', document.querySelector('#email').value);
    form.append('photo', document.querySelector('#photo').files[0]);
    updateSettings(form, 'data');
  });
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.querySelector('#password-current').value;
    const password = document.querySelector('#password').value;
    const passwordConfirm = document.querySelector('#password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('#password-current').textContent = '';
    document.querySelector('#password-confirm').textContent = '';
    document.querySelector('#password').textContent = '';
    document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
  });
