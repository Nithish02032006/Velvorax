const axios = require('axios');

const testRegistration = async () => {
    const data = {
        name: "Test Client",
        email: `test_${Date.now()}@example.com`,
        password: "Password123",
        companyName: "Test Corporation",
        industry: "Technology",
        employeesCount: "10 – 25",
        servicesNeeded: ["Web Development", "AI Automation"],
        budgetRange: "₹50,000 – ₹1,00,000 ($600 – $1,200)",
        projectTimeline: "Immediate",
        roleInCompany: "CEO"
    };

    try {
        console.log('Attempting to register a test account...');
        const response = await axios.post('http://localhost:3000/api/auth/register', data);
        console.log('Registration Success:', response.data.user.name);
        console.log('Check your Ethereal inbox at: https://ethereal.email/messages');
    } catch (error) {
        console.error('Registration Failed:', error.response ? error.response.data : error.message);
    }
};

// Start the server first if it's not running
// Since I can't easily start and wait for the server in a single script here without complexity,
// I'll just assume it's running or tell the user to run it.
// Actually, I'll just check if it's reachable.

testRegistration();
