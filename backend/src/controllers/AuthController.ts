import { Request, Response } from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { AppleMusicService } from '../services/AppleMusicService';

export class AuthController {
  private spotifyService: SpotifyService;
  private appleMusicService: AppleMusicService;

  constructor() {
    this.spotifyService = new SpotifyService();
    this.appleMusicService = new AppleMusicService();
  }

  getSpotifyAuthUrl = (req: Request, res: Response): void => {
    try {
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
        `scope=${encodeURIComponent(scopes)}&` +
        `state=${Math.random().toString(36).substring(2, 15)}`;

      res.json({ url: authUrl });
    } catch (error) {
      console.error('Error generating Spotify auth URL:', error);
      res.status(500).json({ error: 'Failed to generate authorization URL' });
    }
  };

  handleSpotifyCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state } = req.body;
      
      if (!code) {
        res.status(400).json({ error: 'Authorization code is required' });
        return;
      }

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
        res.status(400).json({ error: 'Failed to exchange code for token', details: tokenData });
        return;
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
  };

  getAppleMusicToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const developerToken = await this.appleMusicService.authenticate();
      res.json({ developerToken });
    } catch (error) {
      console.error('Apple Music token generation error:', error);
      res.status(500).json({ error: 'Failed to generate Apple Music developer token' });
    }
  };
}