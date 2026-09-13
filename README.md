# TPGamesPlus_FE

React frontend for the TPGamesPlus assignment. This app is planned to consume the Django API in `TPGamesPlus_BE` and provide a simple shopping flow:

- Login with username and password
- Browse products with pagination and location filtering
- View product details
- Buy a product and see a receipt

## Tech Stack

- Vite
- React
- React Router
- Axios
- Plain CSS with theme variables

## Setup

1. Install dependencies.
   ```bash
   npm install
   ```

2. Create a `.env` file from `.env.example` and set the API URL.
   ```bash
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

3. Start the dev server.
   ```bash
   npm run dev
   ```

## Notes

- The backend must allow the frontend dev origin in `CORS_ALLOWED_ORIGINS`.
- Vite uses port `5173` by default, while the backend example allows `3000`, so make sure those values match.
- Authentication will store access and refresh tokens in `localStorage` and use silent refresh before forcing logout.
- Using `localStorage` is simple for the assignment, but an `httpOnly` cookie approach would be safer in a production app.

## Planned Pages

- `/login` - sign in form
- `/products` - product listing
- `/products/:id` - product details
- `/orders/:id` - receipt page
