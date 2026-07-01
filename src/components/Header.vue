<template>
  <header class="header glass">
    <div class="header__left">
      <h1 class="header__title">
        <span class="header__icon">✦</span>
        深空书签
        <span class="header__subtitle">点击卡片立即打开</span>
      </h1>
    </div>
    <div class="header__actions">
      <button class="btn btn-primary" @click="$emit('add-bookmark')">
        <span>+</span> 添加书签
      </button>
      <button class="btn btn-ghost" @click="$emit('add-category')">
        <span>+</span> 添加分类
      </button>
    </div>
  </header>
</template>

<script setup>
defineEmits(['add-bookmark', 'add-category'])
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-8);
  border-bottom: 1px solid var(--border-subtle);
}

.header__left {
  display: flex;
  align-items: center;
}

.header__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-xl);
  letter-spacing: var(--tracking-wider);
  color: var(--text-primary);
}

.header__icon {
  color: var(--accent-gold);
  margin-right: var(--space-2);
  font-size: var(--text-lg);
}

.header__subtitle {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  letter-spacing: var(--tracking-wide);
  margin-left: var(--space-3);
}

.header__actions {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 700px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }
  .header__title {
    font-size: var(--text-lg);
  }
  .header__subtitle {
    display: none;
  }
  .header__actions {
    justify-content: stretch;
  }
  .header__actions .btn {
    flex: 1;
    justify-content: center;
  }
}
</style>
