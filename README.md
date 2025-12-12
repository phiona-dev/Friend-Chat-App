# Friend Chat App

A privacy-first anonymous chat and matching platform for USIU students to connect based on shared interests.

## 📋 Overview

Friend Chat App enables students to:
- Create anonymous profiles with pseudonyms
- Discover and match with other students based on shared interests
- Chat with matched connections in real-time
- Browse and create "Lost & Found" listings
- Navigate seamlessly across a mobile-friendly interface

All interactions are anonymous—your real identity is protected while building authentic connections based on shared interests.

---

## 🚀 Features

### Authentication & Profiles
- **Email Verification**: USIU email-based signup with verification code via email
- **Anonymous Pseudonyms**: Create a fun, anonymous identity
- **Interest Selection**: Pick from 16+ interest categories to define your profile
- **Profile Management**: View and edit your profile anytime

### Matching & Discovery
- **Smart Matching Algorithm**: Profiles ranked by shared interests and bio similarity
- **Card-based UI**: Swipe, Accept, Reject, or go Back through potential matches
- **Real-time Matching**: See profiles of compatible students
- **Match History**: Track accepted and rejected matches in localStorage

### Messaging
- **Real-time Chat**: Socket.io-powered instant messaging
- **Chat History**: Persistent message storage with pagination
- **Unread Badge**: See conversation status at a glance
- **Last Message Preview**: Quick recap of recent chats

### Lost & Found
- **Create Listings**: Post items lost or found on campus
- **Browse Items**: Search and filter lost/found postings
- **Item Details**: Full descriptions and contact info

### Navigation
- **Bottom Navbar**: Quick access to Chats, Matches, Lost & Found
- **Session Persistence**: Automatic redirect to /chats on returning visits
- **Mobile Responsive**: Optimized for all screen sizes

---

## 🏗️ Tech Stack

### Frontend
- **React** 19.2.0 with React Router v7.9.6
- **Firebase**: Authentication and Firestore (user data, verification codes)
- **Socket.io Client**: Real-time messaging
- **EmailJS**: Verification code delivery
- **UUID**: Anonymous user ID generation
- **CSS**: Custom styling with responsive design

### Backend
- **Node.js** with Express 5.1.0
- **MongoDB** (Atlas): Persistent data storage
- **Mongoose** 8.19.3: Database schema management
- **Socket.io** 4.8.1: Real-time WebSocket support
- **Dotenv**: Environment configuration

### Database Collections
- **Users**: Profile data (pseudonym, email, interests, avatar, about)
- **Chats**: Conversation records with participants
- **Messages**: Chat messages with timestamps and read status
- **LostFoundItems**: Lost & found postings
- **VerificationCodes**: Temporary email verification codes (Firestore)
- **UserMap**: Mapping Firebase UIDs to anonymous IDs (Firestore)

---

## 📦 Installation

### Prerequisites
- **Node.js** (v16+) and npm
- **MongoDB Atlas** account (or local MongoDB)
- **Firebase** project (for auth and Firestore)
- **EmailJS** account (for sending verification emails)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/test?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
```

Update `frontend/src/firebase.js` with your Firebase credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

Configure EmailJS in `frontend/src/components/login/login.js`:
- Update `emailjs.send()` calls with your Service ID, Template ID, and Public Key

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
node server.js
```
Backend runs on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

### Seed Demo Data (Optional)
```bash
cd backend
node populate-test-data.js
```
Creates demo users (user2–user7) and test chats for development.

---

## 📁 Project Structure

```
Friend-Chat-App/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection config
│   ├── controllers/
│   │   ├── authController.js    # Auth logic (placeholder)
│   │   └── userController.js    # Profile CRUD operations
│   ├── models/
│   │   ├── User.js              # User schema (profile, interests)
│   │   ├── Chat.js              # Chat schema
│   │   ├── Message.js           # Message schema
│   │   └── LostFoundItem.js      # Lost & Found schema
│   ├── routes/
│   │   ├── user.js              # User profile endpoints
│   │   ├── matches.js           # Matching logic endpoints
│   │   ├── chats.js             # Chat endpoints
│   │   └── lostfound.js         # Lost & Found endpoints
│   ├── utils/
│   │   └── matchingAlgorithm.js # Profile similarity scoring
│   ├── server.js                # Express server setup
│   ├── populate-test-data.js    # Seed script
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── StartupRedirect.js      # Auto-login redirect
│   │   │   ├── login/
│   │   │   │   ├── login.js                # USIU email signup
│   │   │   │   ├── verification.js         # Email verification
│   │   │   │   └── login.css
│   │   │   ├── create-profile/
│   │   │   │   ├── createProfile.js        # Pseudonym + interests
│   │   │   │   ├── profilePage.js          # Profile view/edit
│   │   │   │   └── createProfile.css
│   │   │   ├── match/
│   │   │   │   ├── match.js                # Card-based matching UI
│   │   │   │   └── match.css               # Swipe animations
│   │   │   ├── chat/
│   │   │   │   ├── chat-list/              # Chat conversations list
│   │   │   │   ├── chat-window/            # Active chat interface
│   │   │   │   └── message/                # Individual message component
│   │   │   ├── lostfound/
│   │   │   │   ├── LostFoundList.js        # Browse listings
│   │   │   │   ├── LostFoundForm.js        # Create posting
│   │   │   │   └── LostFoundDetail.js      # Item details
│   │   │   └── navigation/
│   │   │       └── bottom-navbar.js        # Bottom navigation
│   │   ├── pages/
│   │   │   └── ChatPage.js                 # Main chat container
│   │   ├── Services/
│   │   │   ├── api.js                      # API wrapper (fetch)
│   │   │   └── socket.js                   # Socket.io setup
│   │   ├── App.js                          # Routes + StartupRedirect
│   │   ├── firebase.js                     # Firebase config
│   │   └── index.js
│   ├── public/
│   │   ├── avatars/                        # User avatar images
│   │   └── index.html
│   └── package.json
│
└── README.md
```

---

## 🔄 User Flow

### First-Time Users
1. **Login**: Sign up with USIU email (`@usiu.ac.ke`)
2. **Verify**: Enter verification code sent to email
3. **Create Profile**: Choose pseudonym and interests
4. **Explore**: Automatically redirected to `/chats`

### Returning Users
- App detects saved profile in localStorage
- **Automatically redirected to `/chats`** (no re-login needed)
- Can navigate to `/matching` to see new profiles

### Matching Flow
- View one profile card at a time
- **Back**: Go to previous profile
- **Reject**: Skip without processing
- **Swiping**: Animate to next profile without marking
- **Accept**: Create chat and mark as processed
- Profile history persists in `processedMatches` (localStorage)

---

## 🔐 Privacy & Security

- **Anonymous Profiles**: Real identity (Firebase UID) never exposed to other users
- **Email Verification**: Ensures real USIU students only
- **Local-Only Tracking**: Match history stored in browser localStorage (not sent to server)
- **No Password Storage**: Firebase Auth handles credentials securely
- **CORS Protected**: Backend restricts requests to allowed origins

---

## 🎨 Matching Algorithm

Profiles are ranked by **similarity score** (0-100):

1. **Shared Interests** (up to 60 points): Percentage of user A's interests that user B also has
2. **Interest Depth Bonus** (20 points): Both users have 3+ shared interests
3. **Bio Quality** (20 points): Both users have substantial bios (>20 characters)

**Example**: User with interests `[Coding, AI, Gaming]` viewing user with `[Coding, AI, Photography]`:
- 2 shared interests ÷ 3 total = 67% → ~40 points
- 2 shared < 3 → no bonus
- Both have bios → +20 points
- **Total: 60 points**

---

## 🛠️ API Endpoints

### Users
- `POST /api/users` — Create or update profile
- `GET /api/users/:userId` — Fetch user profile

### Matches
- `GET /api/matches/:userId` — Get ranked list of match profiles
- `POST /api/matches/:matchId/accept` — Accept a match (creates chat)
- `POST /api/matches/:matchId/reject` — Reject a match

### Chats
- `GET /api/chats/:userId` — Get all chats for user
- `GET /api/chats/messages/:chatId` — Fetch chat messages (paginated)
- `POST /api/chats/:chatId/messages` — Send message
- `PUT /api/chats/:chatId/read` — Mark messages as read

### Lost & Found
- `GET /api/lostfound` — List all items
- `POST /api/lostfound` — Create new posting
- `GET /api/lostfound/:id` — Get item details
- `PUT /api/lostfound/:id` — Update item
- `DELETE /api/lostfound/:id` — Delete item

### Health Check
- `GET /api/health` — Server status

---

## 📝 Environment Variables

### Backend `.env`
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>
PORT=5000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend (Firebase config in `src/firebase.js`)
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

### EmailJS (in `src/components/login/login.js`)
Update `emailjs.send()` with your:
- Service ID
- Template ID
- Public Key

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up → verify → create profile (first-time flow)
- [ ] Close and reopen app (returning user auto-redirect)
- [ ] View profiles and test Back/Reject/Swiping/Accept
- [ ] Open matched chat and send messages
- [ ] Create Lost & Found listing
- [ ] Test on mobile (responsive design)

### Seed Data
Run `node populate-test-data.js` in `backend/` to load demo users and chats.

---

## 🚀 Deployment

### Backend (Node.js + MongoDB)
1. Push code to GitHub
2. Deploy to **Heroku**, **Railway**, **Render**, or **AWS EC2**
3. Set environment variables in hosting platform
4. Update `FRONTEND_ORIGIN` in `.env` for production URL

### Frontend (React)
1. Update API base URL in `src/Services/api.js` to production backend
2. Update Firebase config for production
3. Run `npm run build`
4. Deploy to **Vercel**, **Netlify**, or static hosting

### MongoDB
Use **MongoDB Atlas** (cloud-hosted); no additional setup needed beyond connection string in `.env`.

---

## 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI framework |
| React Router | 7.9.6 | Client-side routing |
| Firebase | Latest | Auth + Firestore |
| Socket.io | 4.8.1 | Real-time messaging |
| Mongoose | 8.19.3 | MongoDB ODM |
| Express | 5.1.0 | Backend framework |
| EmailJS | Latest | Email delivery |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Open a pull request

---

## 📄 License

This project is private and for USIU use only.

---

## 💡 Future Enhancements

- [ ] Video/voice calling
- [ ] Group chats
- [ ] User blocking/reporting
- [ ] Dark mode
- [ ] Push notifications
- [ ] Advanced search filters
- [ ] Profile verification badges
- [ ] In-app image uploads

---

## 🐛 Troubleshooting

### "Failed to fetch" error on `/api/matches`
- Confirm backend is running on port 5000
- Check `FRONTEND_ORIGIN` in backend `.env`
- Verify MongoDB connection string

### Messages disappearing after send
- Ensure Socket.io is connected
- Check browser console for Socket errors
- Restart backend and frontend

### Verification code not received
- Check EmailJS Service ID, Template ID, and Public Key
- Verify sender email is correct in template
- Check spam folder

### "User not found" on first login
- Re-run `populate-test-data.js` or manually create a user via API
- Ensure verification creates the user record in Firestore

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend console logs for error stacktraces
3. Inspect browser DevTools for frontend errors

---

**Happy chatting! 🎉**
