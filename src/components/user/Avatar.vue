<template>
  <a-avatar :src="avatarSrc" :size="size" :shape="shape">
    <template v-if="!avatarSrc" #default>
      {{ displayChar }}
    </template>
  </a-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  // 头像URL
  avatarSrc: {
    type: String,
    default: ''
  },
  // 显示名称（用于生成默认字母头像）
  displayName: {
    type: String,
    default: 'Ant'
  },
  // 头像尺寸
  size: {
    type: [Number, String],
    default: 32
  },
  // 形状：circle | square
  shape: {
    type: String,
    default: 'circle'
  }
});

// 计算显示的首字母（大写）
const displayChar = computed(() => {
  return props.displayName?.charAt(0)?.toUpperCase() || 'A';
});
</script>
