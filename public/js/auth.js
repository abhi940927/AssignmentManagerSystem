async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('name', data.name);
            localStorage.setItem('userId', data.id);

            if (data.role === 'Faculty') {
                window.location.href = '/faculty/dashboard.html';
            } else {
                window.location.href = '/student/dashboard.html';
            }
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Login failed');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const dob = document.getElementById('reg-dob').value;
    const role = document.getElementById('reg-role').value;
    const password = document.getElementById('reg-password').value;

    try {
        console.log('Sending registration request...');
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, dob, role, password })
        });
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Non-JSON response received:', text);
            throw new Error(`Server error (${response.status}): check Vercel logs for details.`);
        }

        if (response.ok) {
            alert('Registration successful! Please login.');
            toggleAuth();
        } else {
            console.error('Server error:', data);
            alert(data.error || 'Registration failed. Please check Vercel environment variables.');
        }
    } catch (err) {
        console.error('Frontend error:', err);
        alert(err.message || 'Registration failed. Check console for details.');
    }
}

function checkAuth(role) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        window.location.href = '/index.html';
    }

    if (role && userRole !== role) {
        window.location.href = '/index.html';
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}
