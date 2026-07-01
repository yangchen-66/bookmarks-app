<template>
  <div class="link-card" @click="openLink">
    <div class="link-card__glow"></div>
    <div class="link-card__icon">{{ icon }}</div>
    <div class="link-card__info">
      <span class="link-card__name">{{ bookmark.name }}</span>
      <span class="link-card__url">{{ displayUrl }}</span>
    </div>
    <div class="link-card__actions" @click.stop>
      <button class="btn btn-ghost btn-sm" @click="$emit('edit', itemIndex)" title="编辑">
        ✎
      </button>
      <button class="btn btn-danger btn-sm" @click="$emit('delete', itemIndex)" title="删除">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bookmark: { type: Object, required: true },
  itemIndex: { type: Number, required: true },
})

defineEmits(['edit', 'delete'])

const icon = computed(() => {
  const name = props.bookmark.name
  if (name.includes('Google')) return 'G'
  if (name.includes('百度')) return '百'
  if (name.includes('B站') || name.includes('bilibili')) return 'B'
  if (name.includes('GitHub')) return 'G'
  if (name.includes('知乎')) return '知'
  if (name.includes('微博')) return '微'
  if (name.includes('豆瓣')) return '豆'
  if (name.includes('MDN')) return 'M'
  if (name.includes('Stack')) return 'S'
  if (name.includes('YouTube')) return 'Y'
  if (name.includes('钉钉')) return '钉'
  if (name.includes('飞书')) return '飞'
  return name.charAt(0).toUpperCase()
})

const displayUrl = computed(() => {
  try {
    const u = new URL(props.bookmark.url)
    return u.hostname.replace('www.', '')
  } catch {
    return props.bookmark.url
  }
})

function openLink() {
  window.open(props.bookmark.url, '_blank')
}
</script>

<style scoped>
.link-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out-expo);
  overflow: hidden;
}

.link-card:hover {
  background: var(--bg-card-hover);
  border-color: rgba(212, 168, 83, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.link-card:active {
  transform: translateY(0);
}

/* 悬停光效 */
.link-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(212, 168, 83, 0.03),
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out-expo);
  pointer-events: none;
}

.link-card:hover .link-card__glow {
  opacity: 1;
}

.link-card__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 168, 83, 0.08);
  border: 1px solid rgba(212, 168, 83, 0.12);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-sm);
  color: var(--accent-gold);
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out-expo);
}

.link-card:hover .link-card__icon {
  background: rgba(212, 168, 83, 0.15);
  border-color: rgba(212, 168, 83, 0.25);
}

.link-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.link-card__name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card__url {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-card__actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out-expo);
}

.link-card:hover .link-card__actions {
  opacity: 1;
}

@media (max-width: 700px) {
  .link-card__actions {
    opacity: 1;
  }
}
</style>
