import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'deepspace_bookmarks'

const DEFAULT_DATA = [
  { category: '常用工具', items: [
    { name: 'Google 搜索',  url: 'https://www.google.com' },
    { name: '百度',         url: 'https://www.baidu.com' },
    { name: 'B站',          url: 'https://www.bilibili.com' },
    { name: '知乎',         url: 'https://www.zhihu.com' },
    { name: 'GitHub',       url: 'https://github.com' },
    { name: '微博',         url: 'https://www.weibo.com' },
    { name: '豆瓣',         url: 'https://www.douban.com' },
  ]},
  { category: '学习资源', items: [
    { name: 'MDN 开发者文档', url: 'https://developer.mozilla.org/zh-CN/' },
    { name: '菜鸟教程',      url: 'https://www.runoob.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: '维基百科',      url: 'https://zh.wikipedia.org' },
  ]},
  { category: '工作相关', items: [
    { name: '钉钉',    url: 'https://www.dingtalk.com' },
    { name: '飞书',    url: 'https://www.feishu.cn' },
    { name: '企业微信', url: 'https://work.weixin.qq.com' },
    { name: '腾讯云',   url: 'https://cloud.tencent.com' },
    { name: '阿里云',   url: 'https://www.aliyun.com' },
  ]},
  { category: '娱乐休闲', items: [
    { name: 'YouTube',    url: 'https://www.youtube.com' },
    { name: '网易云音乐',  url: 'https://music.163.com' },
  ]},
]

export const useBookmarkStore = defineStore('bookmarks', () => {
  // ── State ──
  const data = ref([])
  const currentCategory = ref(0)
  const searchQuery = ref('')
  const editingItem = ref(null) // { catIdx, itemIdx } or null

  // ── Getters ──
  const currentCat = computed(() => data.value[currentCategory.value] || null)

  const categories = computed(() => data.value.map(c => c.category))

  const filteredItems = computed(() => {
    if (!currentCat.value) return []
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return currentCat.value.items
    return currentCat.value.items.filter(item =>
      item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q)
    )
  })

  const isEmpty = computed(() => data.value.length === 0)

  // ── Actions ──
  function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        data.value = JSON.parse(saved)
        if (!data.value.length) data.value = DEFAULT_DATA
      } catch {
        data.value = DEFAULT_DATA
      }
    } else {
      data.value = DEFAULT_DATA
    }
    saveData()
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  }

  function selectCategory(index) {
    currentCategory.value = index
  }

  function setSearch(query) {
    searchQuery.value = query
  }

  // Bookmark CRUD
  function addBookmark(name, url, catIdx) {
    catIdx = catIdx ?? currentCategory.value
    data.value[catIdx].items.push({ name, url })
    saveData()
  }

  function updateBookmark(catIdx, itemIdx, name, url, newCatIdx) {
    if (catIdx !== newCatIdx) {
      // Move to different category
      const item = data.value[catIdx].items.splice(itemIdx, 1)[0]
      item.name = name
      item.url = url
      data.value[newCatIdx].items.push(item)
      currentCategory.value = newCatIdx
    } else {
      const item = data.value[catIdx].items[itemIdx]
      item.name = name
      item.url = url
    }
    saveData()
  }

  function deleteBookmark(catIdx, itemIdx) {
    data.value[catIdx].items.splice(itemIdx, 1)
    saveData()
  }

  // Category CRUD
  function addCategory(name) {
    data.value.push({ category: name, items: [] })
    currentCategory.value = data.value.length - 1
    saveData()
  }

  function deleteCategory(index) {
    if (data.value.length <= 1) return false
    data.value.splice(index, 1)
    if (currentCategory.value >= data.value.length) {
      currentCategory.value = data.value.length - 1
    }
    saveData()
    return true
  }

  // Modal editing state
  function startEdit(catIdx, itemIdx) {
    editingItem.value = { catIdx, itemIdx }
  }

  function clearEdit() {
    editingItem.value = null
  }

  function getEditingData() {
    if (!editingItem.value) return null
    const { catIdx, itemIdx } = editingItem.value
    const item = data.value[catIdx]?.items[itemIdx]
    if (!item) return null
    return { ...item, catIdx, itemIdx }
  }

  // Export / Import
  function exportData() {
    const blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '书签备份.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function importData(jsonStr) {
    const imported = JSON.parse(jsonStr)
    if (!Array.isArray(imported)) throw new Error('格式不正确')
    data.value = imported
    currentCategory.value = 0
    saveData()
  }

  return {
    data,
    currentCategory,
    searchQuery,
    editingItem,
    currentCat,
    categories,
    filteredItems,
    isEmpty,
    loadData,
    saveData,
    selectCategory,
    setSearch,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addCategory,
    deleteCategory,
    startEdit,
    clearEdit,
    getEditingData,
    exportData,
    importData,
  }
})
