<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-center mb-8">Music Transfer Service</h1>
      <p class="text-center text-gray-600 mb-8">
        Transfer your playlists between Spotify and Apple Music for free
      </p>

      <AuthCard />
      
      <PlaylistSelector 
        v-if="authStore.isSpotifyAuthenticated || authStore.isAppleMusicAuthenticated"
        @transfer-start="handleTransferStart"
      />
      
      <TransferProgress :progress="transferProgress" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthCard from '@/components/AuthCard.vue';
import PlaylistSelector from '@/components/PlaylistSelector.vue';
import TransferProgress from '@/components/TransferProgress.vue';
import type { Playlist, Platform, TransferProgress as TransferProgressType } from '@/types';

const authStore = useAuthStore();
const route = useRoute();
const transferProgress = ref<TransferProgressType | null>(null);

onMounted(async () => {
  // Handle Spotify callback
  const code = route.query.code as string;
  if (code) {
    try {
      await authStore.handleSpotifyCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Failed to handle Spotify callback:', error);
    }
  }
});

const handleTransferStart = (playlist: Playlist, sourcePlatform: Platform) => {
  // TODO: Implement transfer logic
  console.log('Starting transfer:', playlist.name, 'from', sourcePlatform);
};
</script>