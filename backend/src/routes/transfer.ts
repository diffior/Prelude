import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TransferService } from '../services/TransferService';
import { SpotifyService } from '../services/SpotifyService';
import { AppleMusicService } from '../services/AppleMusicService';
import type { TransferProgress, Track, Platform } from '../types';

const router = Router();
const transferService = new TransferService();
const spotifyService = new SpotifyService();
const appleMusicService = new AppleMusicService();

// In-memory storage for transfer progress (in production, use Redis or database)
const transferJobs = new Map<string, TransferProgress>();

// Middleware to extract token
const extractToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  req.token = authHeader.substring(7);
  next();
};

router.post('/playlist', extractToken, async (req: any, res) => {
  try {
    const { tracks, targetPlatform, playlistName } = req.body;
    const transferId = uuidv4();

    // Initialize transfer progress
    const progress: TransferProgress = {
      id: transferId,
      totalTracks: tracks.length,
      processedTracks: 0,
      successfulMatches: 0,
      failedMatches: 0,
      status: 'pending'
    };

    transferJobs.set(transferId, progress);

    // Start transfer in background
    processTransfer(transferId, tracks, targetPlatform, playlistName, req.token).catch(error => {
      console.error('Transfer process error:', error);
      const failedProgress = transferJobs.get(transferId);
      if (failedProgress) {
        failedProgress.status = 'failed';
        transferJobs.set(transferId, failedProgress);
      }
    });

    res.json({ transferId });
  } catch (error) {
    console.error('Transfer initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate transfer' });
  }
});

router.get('/:transferId/progress', (req, res) => {
  const { transferId } = req.params;
  const progress = transferJobs.get(transferId);

  if (!progress) {
    return res.status(404).json({ error: 'Transfer not found' });
  }

  res.json(progress);
});

async function processTransfer(
  transferId: string,
  tracks: Track[],
  targetPlatform: Platform,
  playlistName: string,
  userToken: string
): Promise<void> {
  const progress = transferJobs.get(transferId)!;
  progress.status = 'processing';
  transferJobs.set(transferId, progress);

  const progressCallback = (updatedProgress: TransferProgress) => {
    transferJobs.set(transferId, { ...progress, ...updatedProgress });
  };

  try {
    const results = await transferService.transferPlaylist(
      tracks,
      targetPlatform,
      userToken,
      progressCallback
    );

    // Create the playlist with matched tracks
    const matchedTracks = results.filter(r => r.matchedTrack).map(r => r.matchedTrack!);
    
    if (matchedTracks.length > 0) {
      if (targetPlatform === 'spotify') {
        const playlistId = await spotifyService.createPlaylist(
          playlistName,
          'Transferred playlist',
          userToken
        );
        
        const trackUris = matchedTracks.map(track => track.uri!);
        await spotifyService.addTracksToPlaylist(playlistId, trackUris, userToken);
      } else {
        const trackIds = matchedTracks.map(track => track.id);
        await appleMusicService.createPlaylist(
          playlistName,
          'Transferred playlist',
          trackIds,
          userToken
        );
      }
    }

    // Update final progress
    const finalProgress: TransferProgress = {
      ...progress,
      status: 'completed',
      processedTracks: tracks.length,
      successfulMatches: results.filter(r => r.status === 'matched').length,
      failedMatches: results.filter(r => r.status === 'failed').length,
      results
    };

    transferJobs.set(transferId, finalProgress);
  } catch (error) {
    console.error('Transfer processing error:', error);
    progress.status = 'failed';
    transferJobs.set(transferId, progress);
  }
}

export default router;