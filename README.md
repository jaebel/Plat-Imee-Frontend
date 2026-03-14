# Plat-Imee — Frontend

The React-based frontend for Plat-Imee. It provides a clean, minimalist interface for browsing anime, managing watchlists, and viewing personalised recommendations — intentionally designed to reduce the visual clutter found in platforms like MyAnimeList.

📄 **[Read the Full Project Report](./Plat-Imee_Final_Report.docx)**

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React | UI framework |
| JavaScript / HTML / CSS | Core web technologies |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client (centralised with JWT auto-attachment) |
| React Router | Client-side routing and navigation |
| Jikan API | Fetching anime metadata, images, and details |

---

## Project Structure

```
platimee-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── Plat-Imee-Logo-v3.png
│   └── manifest.json
├── src/
│   ├── api/
│   │   └── axiosInstance.js          # Centralised Axios config + JWT interceptor
│   ├── components/
│   │   ├── AnimeCard.js              # Reusable anime card component
│   │   ├── Navbar.js                 # Persistent navigation header
│   │   └── PrivateRoute.js           # Restricts pages to authenticated users
│   ├── context/
│   │   ├── AuthContext.js            # Global JWT authentication state
│   │   ├── AnimeListContext.js       # Global anime list state
│   │   └── RecommendationsContext.js # Global recommendations state
│   ├── hooks/
│   │   └── useAutoMessageClear.js    # Clears status messages automatically
│   ├── pages/
│   │   ├── Home.js                   # Homepage with trending/seasonal anime
│   │   ├── Login.js                  # Login form
│   │   ├── SignUp.js                 # Registration form
│   │   ├── VerifyAccount.js          # Account email verification
│   │   ├── EmailVerificationNotice.js
│   │   ├── ForgotPassword.js         # Password reset request
│   │   ├── ResetPassword.js          # Password reset form
│   │   ├── Profile.js                # User profile view
│   │   ├── EditProfile.js            # Edit user account details
│   │   ├── MyAnimeList.js            # Personal watchlist with tabs by status
│   │   ├── Recommendations.js        # On-demand personalised recommendations
│   │   ├── AnimeDetails.js           # Individual anime detail page
│   │   ├── AnimeList.js              # Anime list page
│   │   ├── AllAnime.js               # Browse all anime in the database
│   │   ├── TopAnime.js               # Top rated anime
│   │   ├── SeasonalAnime.js          # Currently airing seasonal anime
│   │   ├── UpcomingAnime.js          # Upcoming anime releases
│   │   ├── SearchAnime.js            # Search results page
│   │   ├── GenrePicker.js            # Browse anime by genre
│   │   └── GenreResults.js           # Results for a selected genre
│   ├── services/
│   │   └── JikanService.js           # Jikan API helper methods
│   ├── styles/
│   │   └── MyAnimeList.css
│   ├── utils/
│   │   ├── handleAddToList.js        # Reusable add-to-watchlist logic
│   │   └── handleViewDetails.js      # Navigation to anime detail page + DB sync
│   ├── App.js                        # Root component and route definitions
│   ├── App.css
│   └── index.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [backend server](https://github.com/YOUR_USERNAME/Plat-Imee) running on `http://localhost:8080`

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Plat-Imee-Frontend.git
   cd platimee-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   The app opens at `http://localhost:3000`.

---

## 📄 Pages

| Page | Route | Auth Required |
|---|---|---|
| Home | `/` | No |
| Login | `/login` | No |
| Sign Up | `/signup` | No |
| Anime List | `/anime` | No |
| All Anime | `/all-anime` | No |
| Anime Detail | `/anime/:id` | No |
| Top Anime | `/top` | No |
| Seasonal Anime | `/seasonal` | No |
| Upcoming Anime | `/upcoming` | No |
| Search | `/search` | No |
| Genre Picker | `/genre-picker` | No |
| Genre Results | `/genre-results` | No |
| Email Verification Notice | `/verify-email` | No |
| Forgot Password | `/forgot-password` | No |
| Reset Password | `/reset-password` | No |
| Verify Account | `/verify` | No |
| Profile | `/profile` | ✅ Yes |
| Edit Profile | `/edit-profile` | ✅ Yes |
| My Anime List | `/my-anime` | ✅ Yes |
| Recommendations | `/recommendations` | ✅ Yes |

---

## Authentication

Authentication is managed through a global `AuthContext`. On login, a JWT token is stored in `localStorage` and attached to every outgoing request automatically via an Axios interceptor in `axiosInstance.js`. Protected routes redirect unauthenticated users to `/login`.

---

## Recommendations Flow

Recommendations are **not generated automatically** — users click "Generate Recommendations" on the `/recommendations` page to trigger a fetch. This gives users explicit control and allows them to toggle the safe search filter beforehand.

The frontend sends a `GET` request to `/api/v1/recs/me` (backend), which internally calls the Python microservice. The returned MAL IDs are then individually enriched with metadata (images, titles, type) from the Jikan API before being displayed.

---

## Watchlist

The `MyAnimeList` page displays all of a user's watchlist entries, filterable by status tab (Watching, Completed, On Hold, Plan to Watch, Dropped). Each entry supports:

- **Inline editing** of rating, status, and episodes watched
- **Save** via `PATCH /api/v1/user-anime/{id}`
- **Delete** via `DELETE /api/v1/user-anime/{id}` with a confirmation prompt
