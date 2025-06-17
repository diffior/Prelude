<template>
  <div v-if="progress" class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">Transfer Progress</h2>
    
    <div class="mb-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress: {{ progress.processedTracks }} / {{ progress.totalTracks }}</span>
        <span>{{ Math.round((progress.processedTracks / progress.totalTracks) * 100) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(progress.processedTracks / progress.totalTracks) * 100}%` }"
        ></div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="text-center p-3 bg-green-50 rounded">
        <div class="text-2xl font-bold text-green-600">{{ progress.successfulMatches }}</div>
        <div class="text-sm text-gray-600">Successful</div>
      </div>
      <div class="text-center p-3 bg-red-50 rounded">
        <div class="text-2xl font-bold text-red-600">{{ progress.failedMatches }}</div>
        <div class="text-sm text-gray-600">Failed</div>
      </div>
    </div>

    <div class="text-center">
      <span class="inline-block px-3 py-1 rounded-full text-sm font-medium"
            :class="{
              'bg-yellow-100 text-yellow-800': progress.status === 'processing',
              'bg-green-100 text-green-800': progress.status === 'completed',
              'bg-red-100 text-red-800': progress.status === 'failed',
              'bg-gray-100 text-gray-800': progress.status === 'pending'
            }">
        {{ progress.status.charAt(0).toUpperCase() + progress.status.slice(1) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransferProgress } from '@/types';

defineProps<{
  progress: TransferProgress | null
}>();
</script>