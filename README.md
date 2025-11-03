# Vendor Payout System

A React-based vendor payout management system with PHP backend integration.

## Features

- 🎨 Modern, responsive UI with Tailwind CSS
- 💰 Fund transfer management (UPI, IMPS, NEFT)
- 📊 Dashboard with statistics
- 👥 Vendor and beneficiary management
- 💳 Wallet balance tracking
- 📝 Transaction history

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: PHP (separate backend server)
- **Routing**: React Router DOM

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL

Update the backend URL in `src/lib/config.js`:

```javascript
export const BACKEND_API_URL = 'http://localhost/backend/api/payout'
```

For production, you can also set it via environment variable:
```bash
# .env file
VITE_BACKEND_URL=https://your-domain.com/backend/api/payout
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173` (or similar port).

### 4. Backend Requirements

Make sure your PHP backend is running on `http://localhost/backend/` with the following endpoints:

- `POST /backend/api/payout/initiate.php` - Initiate fund transfer
- `POST /backend/api/payout/status.php` - Check transaction status
- `GET /backend/api/payout/balance.php` - Get account balance

## Project Structure

```
src/
├── components/      # Reusable React components
├── lib/            # API clients and utilities
│   ├── config.js   # Configuration (backend URL)
│   ├── payment-api.js  # Payment API functions
│   └── supabase.js # Supabase client (mock)
├── pages/          # Page components
└── App.jsx         # Main app component
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL=http://localhost/backend/api/payout
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Production Deployment

1. Update `src/lib/config.js` with your production backend URL
2. Build the project: `npm run build`
3. Deploy the `dist/` folder to your hosting provider
4. Configure your backend server endpoints

## API Endpoints

The React app calls these backend endpoints:

- **Initiate Transfer**: `POST /backend/api/payout/initiate.php`
- **Check Status**: `POST /backend/api/payout/status.php`
- **Get Balance**: `GET /backend/api/payout/balance.php`

Make sure CORS is properly configured on your backend server.

## Development Notes

- The app uses mock data for Supabase (authentication, database)
- For production, replace mock implementations with real API calls
- Update `src/lib/supabase.js` when integrating real authentication

## License

Private project
