<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal glass">
          <div class="modal__header">
            <h3 class="modal__title">{{ title }}</h3>
            <button class="modal__close" @click="$emit('close')">✕</button>
          </div>
          <div class="modal__body">
            <slot />
          </div>
          <div class="modal__footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
})

defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  width: 440px;
  max-width: 90vw;
  border-radius: var(--radius-lg);
  overflow: hidden;
  animation: modalIn 0.3s var(--ease-out-expo);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.modal__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-expo);
}

.modal__close:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}

.modal__body {
  padding: var(--space-6);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s var(--ease-out-expo);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
