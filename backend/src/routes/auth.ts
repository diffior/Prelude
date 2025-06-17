import { Router } from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { AppleMusicService } from '../services/AppleMusicService';

const router = Router();
const spotifyService = new SpotifyService();
const appleMusicService = new AppleMusicService();

// Spotify OAuth routes
router.get('/spotify/url', (req, res) => {
  const scopes = [
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-read',
    'user-library-modify'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${process.env.SPOTIFY_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI!)}&` +
    `scope=${encodeURIComponent(scopes)}`;

  res.json({ url: authUrl });
});

router.post('/spotify/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json({ error: 'Failed to exchange code for token', details: tokenData });
    }

    res.json({ 
      token: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });
  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apple Music routes
router.get('/apple/token', async (req, res) => {
  try {
    const developerToken = await appleMusicService.authenticate();
    res.json({ developerToken });
  } catch (error) {
    console.error('Apple Music token generation error:', error);
    res.status(500).json({ error: 'Failed to generate Apple Music developer token' });
  }
});

export default router;