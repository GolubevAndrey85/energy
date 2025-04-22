# Energy Plan Comparison

A web application that allows users to compare energy plans in their area using the Energy Made Easy API.

## Features

- Search for energy plans by postcode
- Display plan details including costs, contract length, and features
- Modern, responsive design
- Real-time plan comparison

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:3000`

## Production Deployment

For production deployment:
```bash
npm start
```

## API Integration

The application uses the Energy Made Easy API to fetch plan data. The API endpoint is:
```
https://api.energymadeeasy.gov.au/consumerplan/plans
```

## License

MIT 