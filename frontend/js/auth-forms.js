/**
 * Authentication forms handler (Login & Register)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if redirected after registration
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    const errorBox = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorBox && errorText) {
      errorBox.style.display = 'block';
      errorBox.style.background = 'rgba(16, 185, 129, 0.15)';
      errorBox.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      errorText.style.color = '#6ee7b7';
      errorText.innerHTML = '<i class="fa-solid fa-circle-check"></i> Account created successfully! Please log in below.';
    }
  }

  // Login Form Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      const button = document.getElementById('loginButton');
      const originalText = button ? button.innerHTML : 'Sign In';
      if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
      }

      const loginInput = (document.getElementById('email') || document.getElementById('loginIdentifier'))?.value?.trim() || '';
      const password = document.getElementById('password')?.value || '';

      const errorBox = document.getElementById('errorMessage');
      const errorText = document.getElementById('errorText');
      if (errorBox) errorBox.style.display = 'none';

      try {
        const result = await api.post('/auth/login', {
          login: loginInput,
          password
        });

        const remember = document.getElementById('remember')?.checked ?? true;
        auth.saveSession(result, remember);

        if (button) button.innerHTML = '<i class="fa-solid fa-check"></i> Success! Redirecting...';

        setTimeout(() => {
          let rawRedirect = urlParams.get('returnUrl') || urlParams.get('redirect') || sessionStorage.getItem('redirect_after_login');
          sessionStorage.removeItem('redirect_after_login');

          let safeUrl = null;
          if (rawRedirect) {
            try {
              rawRedirect = decodeURIComponent(rawRedirect);
              if (!rawRedirect.startsWith('http://') && !rawRedirect.startsWith('https://') && !rawRedirect.startsWith('//')) {
                safeUrl = rawRedirect;
              } else {
                const parsed = new URL(rawRedirect, window.location.origin);
                if (parsed.origin === window.location.origin) {
                  safeUrl = parsed.pathname + parsed.search + parsed.hash;
                }
              }
            } catch (_) {}
          }

          if (safeUrl) {
            location.href = safeUrl;
          } else if (result.user && result.user.role === 'admin') {
            location.href = 'admin-dashboard.html';
          } else {
            location.href = 'dashboard.html';
          }
        }, 500);
      } catch (error) {
        if (button) {
          button.disabled = false;
          button.innerHTML = originalText;
        }
        if (errorBox && errorText) {
          errorBox.style.display = 'block';
          errorBox.style.background = 'rgba(239, 68, 68, 0.15)';
          errorBox.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          errorText.style.color = '#fca5a5';
          errorText.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${error.message || 'Invalid email/username or password.'}`;
        } else {
          alert(error.message || 'Login failed.');
        }
      }
    });
  }

  // Register Form Handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async event => {
      event.preventDefault();
      const get = id => document.getElementById(id)?.value?.trim() || '';

      const fullName = get('fullName');
      const email = get('email');
      const username = get('username') || email.split('@')[0];
      const password = get('password');
      const confirmPassword = get('confirmPassword');
      const phone = get('phone');
      const college = get('college') || get('collegeName');
      const department = get('department');
      const year = get('year');
      const registerNumber = get('studentId') || get('registerNumber') || get('regNumber');
      const state = get('state') || 'Tamil Nadu';
      const city = get('city') || 'Chennai';
      const skills = get('skillInput') || get('skills');

      if (!fullName || !email || !password) {
        if (window.showToast) showToast('Please complete all required fields', 'error');
        else alert('Please complete all required fields.');
        return;
      }

      if (password.length < 8) {
        if (window.showToast) showToast('Password must be at least 8 characters', 'error');
        else alert('Password must be at least 8 characters.');
        return;
      }

      if (confirmPassword && password !== confirmPassword) {
        if (window.showToast) showToast('Passwords do not match', 'error');
        else alert('Passwords do not match.');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Create Account';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registering Account...';
      }

      const payload = {
        fullName,
        email,
        username,
        password,
        phone,
        college,
        department,
        year,
        registerNumber,
        studentId: registerNumber,
        state,
        city,
        skills
      };

      try {
        await api.post('/auth/register', payload);
        if (window.showToast) showToast('Account created! Redirecting to login...', 'success');
        setTimeout(() => {
          location.href = 'login.html?registered=true';
        }, 800);
      } catch (error) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        if (window.showToast) showToast(error.message, 'error');
        else alert(error.message || 'Registration failed.');
      }
    });
  }
});
