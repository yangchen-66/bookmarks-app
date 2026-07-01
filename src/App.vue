<template>
  <div class="app">
    <!-- 3D 粒子背景 -->
    <ParticleBG />

    <!-- 主界面 -->
    <div class="app__ui">
      <!-- 顶栏 -->
      <Header
        @add-bookmark="openAddBookmark"
        @add-category="openAddCategory"
      />

      <!-- 搜索栏 -->
      <div class="search-bar">
        <div class="search-bar__inner">
          <span class="search-bar__icon">⌕</span>
          <input
            class="search-input"
            type="text"
            placeholder="搜索书签..."
            :value="store.searchQuery"
            @input="store.setSearch($event.target.value)"
          />
          <button
            v-if="store.searchQuery"
            class="search-bar__clear"
            @click="store.setSearch('')"
          >
            ✕
          </button>
        </div>
        <div class="search-bar__actions">
          <button class="btn btn-ghost btn-sm" @click="store.exportData()">
            ⬇ 导出
          </button>
          <button class="btn btn-ghost btn-sm" @click="triggerImport">
            ⬆ 导入
          </button>
          <input
            ref="importInput"
            type="file"
            accept=".json"
            style="display: none"
            @change="handleImport"
          />
        </div>
      </div>

      <!-- 主区域 -->
      <div class="main-layout">
        <!-- 侧边栏 -->
        <Sidebar
          :categories="store.categories"
          :current-index="store.currentCategory"
          @select="store.selectCategory"
        />

        <!-- 书签区域 -->
        <main class="content">
          <div class="content__header" v-if="store.currentCat">
            <h2 class="content__title">{{ store.currentCat.category }}</h2>
            <span class="content__count">
              {{ store.filteredItems.length }} 个书签
            </span>
          </div>

          <TransitionGroup
            name="card"
            tag="div"
            class="link-grid"
            v-if="store.filteredItems.length > 0"
          >
            <LinkCard
              v-for="(bookmark, idx) in store.filteredItems"
              :key="bookmark.url + bookmark.name"
              :bookmark="bookmark"
              :item-index="idx"
              @edit="openEditBookmark(idx)"
              @delete="confirmDelete(idx)"
            />
          </TransitionGroup>

          <div class="empty-state" v-else>
            <div class="empty-state__icon">
              {{ store.searchQuery ? '🔍' : '📂' }}
            </div>
            <p class="empty-state__text">
              {{ store.searchQuery ? '没有匹配的书签' : '这个分类还没有书签' }}
            </p>
            <button
              v-if="!store.searchQuery"
              class="btn btn-primary"
              @click="openAddBookmark"
            >
              + 添加第一个
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- 添加/编辑书签弹窗 -->
    <Modal
      :visible="showLinkModal"
      :title="isEditing ? '编辑书签' : '添加书签'"
      @close="closeLinkModal"
    >
      <form @submit.prevent="saveLink" class="modal-form">
        <label class="modal-form__label">网站名称</label>
        <input
          ref="nameInput"
          v-model="linkForm.name"
          class="input"
          placeholder="例如：GitHub"
          autofocus
        />

        <label class="modal-form__label">网址</label>
        <input
          v-model="linkForm.url"
          class="input"
          placeholder="例如：https://github.com"
        />

        <label class="modal-form__label">分类</label>
        <select v-model="linkForm.category" class="input">
          <option
            v-for="(cat, i) in store.data"
            :key="i"
            :value="i"
          >
            {{ cat.category }}
          </option>
        </select>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" @click="closeLinkModal">
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? '保存' : '添加' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- 添加分类弹窗 -->
    <Modal
      :visible="showCatModal"
      title="添加分类"
      @close="showCatModal = false"
    >
      <form @submit.prevent="saveCategory" class="modal-form">
        <label class="modal-form__label">分类名称</label>
        <input
          v-model="catForm.name"
          class="input"
          placeholder="例如：工作"
          autofocus
        />
        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-ghost"
            @click="showCatModal = false"
          >
            取消
          </button>
          <button type="submit" class="btn btn-primary">添加</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useBookmarkStore } from './stores/bookmarks'
import ParticleBG from './components/ParticleBG.vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import LinkCard from './components/LinkCard.vue'
import Modal from './components/Modal.vue'

const store = useBookmarkStore()
const nameInput = ref(null)
const importInput = ref(null)

// ── 生命周期 ──
onMounted(() => {
  store.loadData()
})

// ── 书签弹窗 ──
const showLinkModal = ref(false)
const isEditing = ref(false)
const editingIndex = ref(null) // index in filteredItems

const linkForm = reactive({
  name: '',
  url: '',
  category: 0,
})

function openAddBookmark() {
  isEditing.value = false
  editingIndex.value = null
  linkForm.name = ''
  linkForm.url = ''
  linkForm.category = store.currentCategory
  showLinkModal.value = true
  nextTick(() => nameInput.value?.focus())
}

function openEditBookmark(idx) {
  // idx is index in filteredItems
  const item = store.filteredItems[idx]
  // Find real index in the category
  const cat = store.currentCat
  const realIdx = cat.items.findIndex(
    i => i.name === item.name && i.url === item.url
  )
  if (realIdx === -1) return

  isEditing.value = true
  editingIndex.value = { catIdx: store.currentCategory, itemIdx: realIdx }
  linkForm.name = item.name
  linkForm.url = item.url
  linkForm.category = store.currentCategory
  showLinkModal.value = true
  nextTick(() => nameInput.value?.focus())
}

function closeLinkModal() {
  showLinkModal.value = false
  store.clearEdit()
}

function saveLink() {
  const name = linkForm.name.trim()
  let url = linkForm.url.trim()
  if (!name) return
  if (!url) return

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  if (isEditing.value && editingIndex.value) {
    store.updateBookmark(
      editingIndex.value.catIdx,
      editingIndex.value.itemIdx,
      name,
      url,
      linkForm.category
    )
  } else {
    store.addBookmark(name, url, linkForm.category)
    store.selectCategory(linkForm.category)
  }

  closeLinkModal()
}

// ── 分类弹窗 ──
const showCatModal = ref(false)
const catForm = reactive({ name: '' })

function openAddCategory() {
  catForm.name = ''
  showCatModal.value = true
}

function saveCategory() {
  const name = catForm.name.trim()
  if (!name) return
  store.addCategory(name)
  showCatModal.value = false
}

// ── 删除确认 ──
function confirmDelete(idx) {
  const item = store.filteredItems[idx]
  const cat = store.currentCat
  const realIdx = cat.items.findIndex(
    i => i.name === item.name && i.url === item.url
  )
  if (realIdx === -1) return

  if (confirm(`确定删除「${item.name}」吗？`)) {
    store.deleteBookmark(store.currentCategory, realIdx)
  }
}

// ── 导入 ──
function triggerImport() {
  importInput.value?.click()
}

function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      store.importData(e.target.result)
      alert('导入成功！')
    } catch {
      alert('文件格式不正确')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
}

.app__ui {
  position: relative;
  z-index: 1;
}

/* ── 搜索栏 ── */
.search-bar {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  align-items: center;
}

.search-bar__inner {
  flex: 1;
  position: relative;
  max-width: 480px;
}

.search-bar__icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  font-size: var(--text-lg);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  outline: none;
  transition: all var(--duration-fast) var(--ease-out-expo);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-input:focus {
  border-color: var(--accent-gold);
  box-shadow: 0 0 0 3px var(--accent-glow);
  background: rgba(255, 255, 255, 0.08);
}

.search-bar__clear {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: var(--text-xs);
  padding: var(--space-1);
}

.search-bar__clear:hover {
  color: var(--text-primary);
}

.search-bar__actions {
  display: flex;
  gap: var(--space-2);
}

/* ── 主布局 ── */
.main-layout {
  display: flex;
  gap: var(--space-5);
  padding: 0 var(--space-8) var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
}

/* ── 内容区 ── */
.content {
  flex: 1;
  min-width: 0;
}

.content__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.content__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: var(--tracking-wide);
}

.content__count {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 10px;
  border-radius: 12px;
}

/* ── 书签网格 ── */
.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-3);
}

/* ── 弹窗表单 ── */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-form__label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  margin-bottom: -12px;
}

.modal-form select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='%236b6b80'%3E%3Cpath d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

.modal-form select.input option {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

/* ── 响应式 ── */
@media (max-width: 700px) {
  .search-bar {
    flex-direction: column;
    padding: var(--space-3) var(--space-4);
  }

  .search-bar__inner {
    max-width: 100%;
  }

  .search-bar__actions {
    align-self: flex-end;
  }

  .main-layout {
    flex-direction: column;
    padding: 0 var(--space-4) var(--space-6);
  }

  .content__title {
    font-size: var(--text-xl);
  }

  .link-grid {
    grid-template-columns: 1fr;
  }
}
</style>
