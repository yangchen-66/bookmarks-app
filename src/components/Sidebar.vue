<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <span class="sidebar__label">分类</span>
    </div>
    <div class="sidebar__list">
      <button
        v-for="(cat, index) in categories"
        :key="index"
        :class="['sidebar__item', { active: index === currentIndex }]"
        @click="$emit('select', index)"
      >
        <span class="sidebar__name">{{ cat }}</span>
        <span class="sidebar__count">{{ itemCounts[index] }}</span>
      </button>
    </div>
    <div class="sidebar__empty" v-if="categories.length === 0">
      暂无分类
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useBookmarkStore } from '../stores/bookmarks'

const props = defineProps({
  categories: { type: Array, required: true },
  currentIndex: { type: Number, default: 0 },
})

defineEmits(['select'])

const store = useBookmarkStore()
const itemCounts = computed(() =>
  store.data.map(cat => cat.items.length)
)
</script>

<style scoped>
.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.sidebar__header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-1);
}

.sidebar__label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-expo);
  text-align: left;
}

.sidebar__item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.sidebar__item.active {
  background: rgba(212, 168, 83, 0.08);
  color: var(--accent-gold);
}

.sidebar__name {
  font-weight: 500;
}

.sidebar__count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 8px;
  border-radius: 10px;
}

.sidebar__item.active .sidebar__count {
  background: rgba(212, 168, 83, 0.15);
  color: var(--accent-gold);
}

.sidebar__empty {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
}

@media (max-width: 700px) {
  .sidebar {
    width: 100%;
  }
  .sidebar__list {
    flex-direction: row;
    overflow-x: auto;
    padding: var(--space-2) var(--space-4);
    gap: var(--space-1);
    -webkit-overflow-scrolling: touch;
  }
  .sidebar__item {
    white-space: nowrap;
    padding: var(--space-2) var(--space-3);
  }
  .sidebar__header {
    display: none;
  }
}
</style>
