const CONFIG = {
    // FORCE RELATIVE PATHS TO PREVENT CORS AND CACHE ISSUES
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : ''
};

window.CONFIG = CONFIG;
console.log("Velvorax API Config Loaded: Relative Mode");
