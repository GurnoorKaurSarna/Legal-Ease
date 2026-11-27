// Demo credentials are checked in the browser for this college project only.
const DEMO_EMAIL = 'vijaygupta@legalease.com';
const DEMO_PASSWORD = 'vg_123';
const LOGIN_SESSION_KEY = 'lexflow-demo-session';
const REMEMBER_SESSION_KEY = 'lexflow-remember-session';

const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const loginButton = document.querySelector('#loginSubmit');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loginError.hidden = true;
  loginButton.disabled = true;
  loginButton.querySelector('span').textContent = 'Signing in…';

  // A short pause gives the button a simple loading state.
  setTimeout(() => {
    const email = document.querySelector('#loginEmail').value.trim().toLowerCase();
    const password = document.querySelector('#loginPassword').value;

    loginButton.disabled = false;
    loginButton.querySelector('span').textContent = 'Login';

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      if (document.querySelector('#rememberMe').checked) {
        localStorage.setItem(REMEMBER_SESSION_KEY, 'active');
        sessionStorage.removeItem(LOGIN_SESSION_KEY);
      } else {
        sessionStorage.setItem(LOGIN_SESSION_KEY, 'active');
        localStorage.removeItem(REMEMBER_SESSION_KEY);
      }
      window.location.href = 'index.html?workspace=1';
    } else {
      loginError.textContent = 'Email or password is incorrect. Please try again.';
      loginError.hidden = false;
      document.querySelector('#loginPassword').focus();
    }
  }, 450);
});

document.querySelector('#togglePassword').addEventListener('click', () => {
  const password = document.querySelector('#loginPassword');
  const showPassword = password.type === 'password';
  password.type = showPassword ? 'text' : 'password';
  document.querySelector('#togglePassword').textContent = showPassword ? 'Hide' : 'Show';
});

document.querySelector('#forgotPassword').addEventListener('click', () => {
  document.querySelector('#recoveryEmail').value = document.querySelector('#loginEmail').value;
  document.querySelector('#recoveryDialog').hidden = false;
});

document.querySelector('#closeRecovery').addEventListener('click', closeRecovery);
document.querySelector('#recoveryOkay').addEventListener('click', closeRecovery);
document.querySelector('#recoveryDialog').addEventListener('click', (event) => {
  if (event.target.id === 'recoveryDialog') closeRecovery();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeRecovery();
});
function closeRecovery() {
  document.querySelector('#recoveryDialog').hidden = true;
}
