# 🏠 Flex Living Reviews Dashboard

A comprehensive reviews management system for property managers to fetch, normalize, analyze, and approve guest reviews from multiple channels including Hostaway, Airbnb, Booking.com, and more.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Google Reviews Integration](#google-reviews-integration)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

The Flex Living Reviews Dashboard is a full-stack application that:

- **Fetches** mocked reviews from Hostaway API endpoints
- **Normalizes** review data from various sources into a consistent format
- **Displays** reviews in an intuitive manager dashboard with filtering capabilities
- **Manages** review approval workflow
- **Publishes** approved reviews on public property pages
- **Supports** future integration with Google Reviews API

## ⚙️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Data Storage:** JSON files (easily replaceable with SQLite/MongoDB)
- **API:** RESTful endpoints

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** TailwindCSS
- **UI Components:** Custom components with modern design

## 🏗️ Project Architecture

```
flexliving-reviews/
│
├── backend/
│   ├── package.json
│   ├── server.js                    # Express server setup
│   ├── routes/
│   │   └── reviews.js               # Review API routes
│   ├── services/
│   │   └── hostawayService.js       # Hostaway data fetching logic
│   ├── data/
│   │   ├── mockReviews.json         # Mock review data
│   │   └── approvedReviews.json     # Approved reviews storage
│   └── utils/
│       └── normalizeReviews.js      # Review normalization logic
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # TailwindCSS config
│   ├── postcss.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx                 # App entry point
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── index.css                # Global styles
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Main dashboard container
│   │   │   ├── ReviewTable.jsx      # Reviews table with actions
│   │   │   ├── Filters.jsx          # Filter controls
│   │   │   └── ReviewCard.jsx       # Individual review display
│   │   └── pages/
│   │       ├── DashboardPage.jsx    # Manager dashboard page
│   │       └── PropertyPage.jsx     # Public property page
│
└── README.md
```

## ✨ Features

### Manager Dashboard
- **📊 Statistics Overview:** Total reviews, average rating, 5-star count, property count
- **🔍 Advanced Filtering:** Filter by rating, property, channel, date range
- **📋 Reviews Table:** Sortable, expandable table with all review details
- **✅ Approval Workflow:** One-click review approval
- **📱 Responsive Design:** Works on desktop, tablet, and mobile

### Public Property Page
- **🏡 Property Display:** Shows property information and overall ratings
- **⭐ Approved Reviews:** Displays only approved reviews
- **🌟 Rating Breakdown:** Visual star ratings and review counts
- **💬 Detailed Reviews:** Full review text, category ratings, dates

### Review Data Normalization
- Consolidates data from multiple channels
- Calculates overall ratings from category scores
- Handles missing fields gracefully
- Provides consistent data structure

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm installed
- Git (optional, for cloning)

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd flex

# Or simply navigate to your project folder
cd c:\Users\marwe\Desktop\flex
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🚀 Usage

### Running the Application Locally

You'll need two terminal windows:

#### Terminal 1 - Start Backend Server

```powershell
cd backend
npm start
```

The backend will run on `http://localhost:5000`

#### Terminal 2 - Start Frontend Development Server

```powershell
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Accessing the Application

1. **Manager Dashboard:** Navigate to `http://localhost:3000`
   - View all reviews
   - Apply filters
   - Approve reviews

2. **Public Property Page:** Navigate to `http://localhost:3000/property/101`
   - View approved reviews for a specific property
   - See average ratings and review counts

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/reviews
```

### Endpoints

#### GET /hostaway
Fetches all normalized reviews from mock Hostaway data.

**Response:**
```json
[
  {
    "id": 1,
    "type": "guest",
    "status": "submitted",
    "overallRating": 4.8,
    "categories": [...],
    "reviewText": "Amazing stay!...",
    "privateReview": "Great guests...",
    "guestName": "Sarah Johnson",
    "listingName": "Downtown Loft - 2BR",
    "listingId": 101,
    "channelName": "Airbnb",
    "submittedAt": "2025-10-20T14:30:00Z",
    "checkInDate": "2025-10-10",
    "checkOutDate": "2025-10-15"
  }
]
```

#### GET /approved
Fetches all approved reviews.

**Response:**
```json
[
  {
    "id": 1,
    "overallRating": 4.8,
    "reviewText": "Amazing stay!...",
    "guestName": "Sarah Johnson",
    "listingName": "Downtown Loft - 2BR",
    "approvedAt": "2025-10-25T10:30:00Z",
    ...
  }
]
```

#### POST /approve
Approves a review and adds it to the approved list.

**Request Body:**
```json
{
  "reviewId": 1
}
```

**Response:**
```json
{
  "message": "Review approved successfully",
  "review": { ... }
}
```

#### DELETE /approve/:reviewId
Removes approval from a review.

**Response:**
```json
{
  "message": "Approval removed successfully"
}
```

## 🔗 Google Reviews Integration

### Current Status
The application is structured to support Google Reviews integration. Currently, it uses mock data, but can be extended to fetch real Google reviews.

### Implementation Steps

#### 1. Set Up Google Cloud Project
```bash
# Visit Google Cloud Console
https://console.cloud.google.com

# Create a new project
# Enable the Places API
# Create API credentials (API Key)
```

#### 2. Install Google Maps Library

```bash
cd backend
npm install @googlemaps/google-maps-services-js
```

#### 3. Create Google Service

```javascript
// backend/services/googleReviewsService.js
const { Client } = require("@googlemaps/google-maps-services-js");

const client = new Client({});

exports.getPlaceReviews = async (placeId) => {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['reviews', 'rating', 'user_ratings_total'],
        key: process.env.GOOGLE_PLACES_API_KEY,
      }
    });
    
    return response.data.result;
  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    throw error;
  }
};
```

#### 4. Add Environment Variable

```bash
# backend/.env
GOOGLE_PLACES_API_KEY=your_api_key_here
```

#### 5. Add Route

```javascript
// In backend/routes/reviews.js
router.get("/google/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const data = await googleReviewsService.getPlaceReviews(placeId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Limitations
- **API Costs:** Google Places API charges per request
- **Rate Limits:** Limited number of requests per day
- **Review Permissions:** Can only fetch public reviews
- **Billing Required:** Must set up billing in Google Cloud

### Alternative: Google My Business API
For property managers with Google My Business accounts, the GMB API provides:
- More detailed review data
- Ability to respond to reviews
- Better rate limits for business owners

## 🛠️ Development

### Project Scripts

#### Backend
```bash
npm start      # Start production server
npm run dev    # Start with nodemon (auto-restart)
```

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Adding Mock Reviews

Edit `backend/data/mockReviews.json`:

```json
{
  "result": [
    {
      "id": 11,
      "guestName": "New Guest",
      "listingName": "New Property",
      "listingId": 105,
      "channelName": "Airbnb",
      "publicReview": "Great place!",
      "reviewCategory": [
        { "name": "Cleanliness", "rating": 5 }
      ],
      "submittedAt": "2025-10-25T12:00:00Z"
    }
  ]
}
```

### Customizing Filters

Edit `frontend/src/components/Filters.jsx` to add new filter options:

```javascript
// Add a new filter
<div>
  <label>Status</label>
  <select onChange={...}>
    <option>All</option>
    <option>Approved</option>
    <option>Pending</option>
  </select>
</div>
```

## 🚢 Deployment

### Using Docker

Create `Dockerfile` in backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Create `Dockerfile` in frontend:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

Run:
```bash
docker-compose up -d
```

### Manual Deployment

#### Backend (Node.js hosting)
- Deploy to Heroku, Railway, Render, or AWS
- Set environment variables
- Configure build command: `npm install`
- Configure start command: `npm start`

#### Frontend (Static hosting)
- Build: `npm run build`
- Deploy `dist` folder to Netlify, Vercel, or Cloudflare Pages
- Configure proxy/rewrites to backend API

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎉 Acknowledgments

- Built with GitHub Copilot assistance
- Inspired by property management platforms like Airbnb and Booking.com
- Uses mock data structure based on Hostaway API format

---

**Happy Review Management! 🏠⭐**
#   f l e x  
 #   f l e x  
 