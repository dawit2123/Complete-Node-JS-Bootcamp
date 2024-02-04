export const hideAlert = () => {
  const el = document.querySelector('.alert');
  //going one level up from the element and delete the child
  if (el) el.parentElement.removeChild(el);
};
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
