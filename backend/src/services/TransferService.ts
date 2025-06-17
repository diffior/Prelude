import { SpotifyService } from './SpotifyService';
import { AppleMusicService } from './AppleMusicService';
import { Track, MatchResult, Platform, TransferProgress } from '../types';

export class TransferService {
  private spotifyService: SpotifyService;
  private appleMusicService: AppleMusicService;

  constructor() {
    this.spotifyService = new SpotifyService();
    this.appleMusicService = new AppleMusicService();
  }

  async transferPlaylist(
    tracks: Track[],
    targetPlatform: Platform,
    userToken: string,
    progressCallback?: (progress: TransferProgress) => void
  ): Promise<MatchResult[]> {
    const results: MatchResult[] = [];
    let processed = 0;

    for (const track of tracks) {
      try {
        const matches = await this.findMatches(track, targetPlatform);
        const bestMatch = this.selectBestMatch(track, matches);
        
        results.push({
          originalTrack: track,
          matchedTrack: bestMatch.match,
          confidence: bestMatch.confidence,
          status: bestMatch.match ? 'matched' : 'failed'
        });

        processed++;
        
        if (progressCallback) {
          progressCallback({
            id: 'current-transfer',
            totalTracks: tracks.length,
            processedTracks: processed,
            successfulMatches: results.filter(r => r.status === 'matched').length,
            failedMatches: results.filter(r => r.status === 'failed').length,
            status: 'processing'
          });
        }

        // Rate limiting delay
        await this.sleep(200);
      } catch (error) {
        results.push({
          originalTrack: track,
          confidence: 0,
          status: 'failed'
        });
        processed++;
      }
    }

    return results;
  }

  private async findMatches(track: Track, platform: Platform): Promise<Track[]> {
    const artist = track.artists[0];
    const album = track.album;
    const name = track.name;

    if (platform === 'spotify') {
      return await this.spotifyService.searchTrack(artist, album, name);
    } else {
      // For Apple Music, we need a user token which should be passed differently
      // This is a simplified version
      return [];
    }
  }

  private selectBestMatch(original: Track, candidates: Track[]): { match?: Track; confidence: number } {
    if (candidates.length === 0) {
      return { confidence: 0 };
    }

    let bestMatch = candidates[0];
    let bestScore = 0;

    for (const candidate of candidates) {
      const score = this.calculateSimilarity(original, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    return {
      match: bestScore > 0.8 ? bestMatch : undefined,
      confidence: bestScore
    };
  }

  private calculateSimilarity(track1: Track, track2: Track): number {
    const nameScore = this.stringSimilarity(track1.name.toLowerCase(), track2.name.toLowerCase());
    const artistScore = this.stringSimilarity(track1.artists[0].toLowerCase(), track2.artists[0].toLowerCase());
    const albumScore = this.stringSimilarity(track1.album.toLowerCase(), track2.album.toLowerCase());

    // Weighted average: name is most important, then artist, then album
    return (nameScore * 0.5) + (artistScore * 0.3) + (albumScore * 0.2);
  }

  private stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}