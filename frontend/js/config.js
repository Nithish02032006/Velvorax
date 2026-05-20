const CONFIG = {
    // Replace with your Render backend URL after deployment
    // Example: API_BASE_URL: 'https://velvorax-api.onrender.com'
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000'
        : '' 
};

window.CONFIG = CONFIG;
