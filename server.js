const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API endpoint to fetch energy plans
app.get('/api/plans', async (req, res) => {
    try {
        const { postcode } = req.query;
        const response = await axios.get('https://api.energymadeeasy.gov.au/consumerplan/plans', {
            params: {
                usageDataSource: 'noUsageFrontier',
                customerType: 'R',
                distE: '',
                distG: '',
                fuelType: 'E',
                journey: 'E',
                postcode: postcode
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch energy plans' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 