const VelvoraxAuth = {

    init() {
        // Lazy init only
    },

    async login(email, password, selectedRole) {

        try {

            // LOGIN URL BASED ON ROLE
            let loginUrl = '/api/auth/login';

            if (selectedRole === 'staff') {
                loginUrl = '/api/user-auth/login';
            }

            const response = await fetch(
                CONFIG.API_BASE_URL + loginUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const result = await response.json();

            console.log('LOGIN RESULT:', result);

            if (response.ok) {

                // SAVE USER
                localStorage.setItem(
                    'velvorax_session',
                    JSON.stringify(result.user)
                );

                // SAVE TOKEN
                localStorage.setItem(
                    'token',
                    result.token
                );

                return {
                    success: true,
                    user: result.user
                };

            }

            return {
                success: false,
                message: result.msg || 'Invalid credentials.'
            };

        } catch (err) {

            console.error('Login error:', err);

            return {
                success: false,
                message: 'Server connection failed.'
            };

        }

    },

    getUser() {

        const user =
            localStorage.getItem('velvorax_session');

        return user
            ? JSON.parse(user)
            : null;

    },

    getCurrentUser() {

        return this.getUser();

    },

    isAuthenticated(requiredRole) {

        const authenticated =
            !!localStorage.getItem('token');

        if (!authenticated)
            return false;

        if (!requiredRole)
            return true;

        return this.hasRole(requiredRole);

    },

    hasRole(requiredRole) {

        const user = this.getUser();

        if (!user)
            return false;

        if (Array.isArray(requiredRole)) {

            return requiredRole.includes(user.role);

        }

        return user.role === requiredRole;

    },

    async clearSessions(email, password, selectedRole) {
        try {
            let clearUrl = '/api/auth/clear-sessions';
            if (selectedRole === 'staff') {
                clearUrl = '/api/user-auth/clear-sessions';
            }

            const response = await fetch(
                CONFIG.API_BASE_URL + clearUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const result = await response.json();

            if (response.ok) {
                return { success: true, message: result.msg };
            }

            return { success: false, message: result.msg || 'Failed to clear sessions.' };
        } catch (err) {
            console.error('Clear sessions error:', err);
            return { success: false, message: 'Server connection failed.' };
        }
    },

    logout() {

        localStorage.clear();

        window.location.href = 'login.html';

    }

};

// INITIALIZE
VelvoraxAuth.init();