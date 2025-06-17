import { Request, Response, NextFunction } from 'express';

export const validateTransferRequest = (req: Request, res: Response, next: NextFunction) => {
  const { tracks, targetPlatform, playlistName } = req.body;

  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
    return res.status(400).json({ error: 'Tracks array is required and must not be empty' });
  }

  if (!targetPlatform || !['spotify', 'apple'].includes(targetPlatform)) {
    return res.status(400).json({ error: 'Valid target platform is required (spotify or apple)' });
  }

  if (!playlistName || typeof playlistName !== 'string' || playlistName.trim().length === 0) {
    return res.status(400).json({ error: 'Valid playlist name is required' });
  }

  // Validate track structure
  for (const track of tracks) {
    if (!track.id || !track.name || !track.artists || !track.album) {
      return res.status(400).json({ 
        error: 'Each track must have id, name, artists array, and album' 
      });
    }
  }

  next();
};