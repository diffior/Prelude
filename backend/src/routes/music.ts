import { Router } from 'express';
import { SpotifyService } from '../services/SpotifyService';
import { AppleMusicService } from '../services/AppleMusicService';

const router = Router();
const spotifyService = new SpotifyService();
const appleMusicService = new AppleMusicService();

// Middleware to extract token from Authorization header
const extractToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  req.token = authHeader.substring(7);
  next();
};

// Spotify routes
router.get('/spotify/playlists', extractToken, async (req: any, res) => {
  try {
    const playlists = await spotifyService.getUserPlaylists(req.token);
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching Spotify playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

router.get('/spotify/playlists/:playlistId/tracks', extractToken, async (req: any, res) => {
  try {
    const { playlistId } = req.params;
    const tracks = await spotifyService.getPlaylistTracks(playlistId, req.token);
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching Spotify playlist tracks:', error);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

// Apple Music routes (simplified for now)
router.get('/apple/playlists', extractToken, async (req: any, res) => {
  try {
    // Apple Music playlist fetching would require additional implementation
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching Apple Music playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

router.get('/apple/playlists/:playlistId/tracks', extractToken, async (req: any, res) => {
  try {
    // Apple Music track fetching would require additional implementation
    res.json([]);
  } catch (error) {
    console.error('Error fetching Apple Music playlist tracks:', error);
    res.status(500).json({ error: 'Failed to fetch playlist tracks' });
  }
});

export default router;