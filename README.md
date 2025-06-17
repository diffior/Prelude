# Prelude

Making an open source and free application to transfer music from different streaming platforms
A free, open-source service to transfer playlists between Spotify and Apple Music using TypeScript, Node.js, and Vue.js.

## Features

- Transfer playlists from Spotify to Apple Music and vice versa
- Enhanced matching using artist + album + track validation
- Real-time transfer progress tracking
- Free and open source
- Privacy-focused (no data storage)

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Spotify Developer Account
- Apple Developer Account (for Apple Music integration)
- Redis (optional, for production scaling)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
PORT=3000
NODE_ENV=development

# Spotify API (get from https://developer.spotify.com)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/spotify/callback

# Apple Music API (get from Apple Developer)
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY_PATH=./keys/AuthKey_YOUR_KEY_ID.p8

FRONTEND_URL=http://localhost:5173
```

4. For Apple Music, download your private key (.p8 file) and place it in `backend/keys/`

5. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

### Apple Music Integration

1. Add MusicKit script to `frontend/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Music Transfer Service</title>
    <script src="https://js-cdn.music.apple.com/musickit/v1/musickit.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

## API Endpoints

### Authentication
- `GET /api/auth/spotify/url` - Get Spotify authorization URL
- `POST /api/auth/spotify/callback` - Handle Spotify OAuth callback
- `GET /api/auth/apple/token` - Get Apple Music developer token

### Music
- `GET /api/music/spotify/playlists` - Get user's Spotify playlists
- `GET /api/music/spotify/playlists/:id/tracks` - Get playlist tracks
- `GET /api/music/apple/playlists` - Get user's Apple Music playlists
- `GET /api/music/apple/playlists/:id/tracks` - Get playlist tracks

### Transfer
- `POST /api/transfer/playlist` - Start playlist transfer
- `GET /api/transfer/:id/progress` - Get transfer progress

## Development

### Building for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

### Testing

Backend:
```bash
cd backend
npm test
```

### Contributing(To be continuted)

~~1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request~~

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Roadmap

- [ ] Add support for YouTube Music
- [ ] Add support for Tidal
- [ ] Implement playlist collaboration features
- [ ] Make a time-capsule Cloud Platform to save personal playlist
- [ ] Add batch processing for large libraries
- [ ] Add Docker containerization
- [ ] Add comprehensive test suite
- [ ] Add CI/CD pipeline