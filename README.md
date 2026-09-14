# TPGamesPlus_FE

React frontend for the TPGamesPlus assignment. Consumes the Django API in `TPGamesPlus_BE` and provides a simple shopping flow:

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

## Prerequisites

- Node.js 18+ and npm
- The `TPGamesPlus_BE` Django API running locally (see that repo's README)

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
   The app runs at `http://localhost:5173`.

## CORS / dev-port note

The backend's `CORS_ALLOWED_ORIGINS` defaults to `http://localhost:3000`, but Vite's default dev port is `5173`. Before logging in, either:

- add `http://localhost:5173` to the backend's `.env` `CORS_ALLOWED_ORIGINS`, **or**
- run this app on port 3000 instead: `npm run dev -- --port 3000`.

Without one of these, login requests will fail with a CORS error in the browser console rather than a normal 401/400 response.

## Authentication & token storage

- `AuthContext` ([src/context/AuthContext.jsx](src/context/AuthContext.jsx)) exposes `{ accessToken, login, logout }`. `login()` posts to `/auth/login/` and stores both the returned `access` and `refresh` tokens in `localStorage` (`access_token` / `refresh_token`).
- The axios client ([src/api/client.js](src/api/client.js)) attaches `Authorization: Bearer <access_token>` to every request via a request interceptor.
- Access tokens expire after 30 minutes. Rather than forcing a re-login on every 401, the response interceptor automatically calls `POST /auth/refresh/` with the stored refresh token, stores the new access token, and retries the original request. Only if the refresh itself fails (e.g. the refresh token has expired, after 1 day) are both tokens cleared and the user redirected to `/login`.
- `ProtectedRoute` ([src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)) redirects to `/login` whenever there is no access token, guarding `/products`, `/products/:id`, and `/orders/:id`.

### `localStorage` vs. `httpOnly` cookies

Storing tokens in `localStorage` is simple and sufficient for this assignment, but it means any script running on the page (e.g. via an XSS vulnerability) can read the tokens. A production app would instead have the backend set the tokens as `httpOnly` (and `Secure`, `SameSite`) cookies, which JavaScript cannot read, trading a bit of backend complexity (CSRF protection, cookie-based auth middleware) for meaningfully better protection against token theft.

## Pages

- `/login` - sign in form
- `/products` - product listing (grid, pagination, JO/SA location filter)
- `/products/:id` - product details + Buy button
- `/orders/:id` - receipt page 
