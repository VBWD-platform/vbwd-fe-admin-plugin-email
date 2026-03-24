<template>
  <div class="email-templates-view">
    <div class="cms-list__header">
      <h1>{{ $t('email.title') }}</h1>
      <div class="cms-list__actions">
        <input
          v-model="query"
          type="search"
          :placeholder="$t('email.search_placeholder')"
          class="cms-list__search"
        >
        <button
          class="btn btn--secondary"
          @click="triggerImport"
        >
          {{ $t('email.import') }}
        </button>
        <input
          ref="importFileInput"
          type="file"
          accept=".json"
          style="display: none"
          @change="handleImport"
        >
        <button
          class="btn btn--primary"
          @click="$router.push('/admin/email/templates/new')"
        >
          {{ $t('email.add_template') }}
        </button>
      </div>
    </div>

    <!-- Bulk action bar -->
    <div
      v-if="selectedIds.size > 0"
      class="cms-list__bulk-bar"
    >
      <span>{{ selectedIds.size }} {{ $t('email.selected') }}</span>
      <button
        class="btn btn--sm"
        @click="exportSelected"
      >
        {{ $t('email.export') }}
      </button>
      <button
        class="btn btn--sm"
        @click="bulkSetActive(true)"
      >
        {{ $t('email.activate') }}
      </button>
      <button
        class="btn btn--sm"
        @click="bulkSetActive(false)"
      >
        {{ $t('email.deactivate') }}
      </button>
      <button
        class="btn btn--sm btn--danger"
        @click="bulkDelete"
      >
        {{ $t('email.delete') }}
      </button>
    </div>

    <div
      v-if="store.loading"
      class="cms-table__empty"
    >
      {{ $t('email.loading') }}
    </div>
    <div
      v-else-if="store.error"
      class="tpl-error"
    >
      {{ store.error }}
    </div>

    <table
      v-else
      class="cms-table"
    >
      <thead>
        <tr>
          <th class="cms-table__check">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleAll"
            >
          </th>
          <th
            class="sortable"
            @click="sort('event_type')"
          >
            {{ $t('email.event_type') }} <span v-if="sortBy === 'event_type'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th
            class="sortable"
            @click="sort('subject')"
          >
            {{ $t('email.subject') }} <span v-if="sortBy === 'subject'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th
            class="sortable"
            @click="sort('is_active')"
          >
            {{ $t('email.is_active') }} <span v-if="sortBy === 'is_active'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </th>
          <th
            class="sortable"
            @click="sort('updated_at')"
          >
            {{ $t('email.updated') }} <span v-if="sortBy === 'updated_at'">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="tpl in filteredSorted"
          :key="tpl.id"
          class="cms-table__row"
          @click.self="$router.push(`/admin/email/templates/${tpl.id}/edit`)"
        >
          <td @click.stop>
            <input
              type="checkbox"
              :checked="selectedIds.has(tpl.id)"
              @change="toggleOne(tpl.id)"
            >
          </td>
          <td
            class="tpl-event-type"
            @click="$router.push(`/admin/email/templates/${tpl.id}/edit`)"
          >
            {{ tpl.event_type }}
          </td>
          <td @click="$router.push(`/admin/email/templates/${tpl.id}/edit`)">
            {{ tpl.subject }}
          </td>
          <td @click="$router.push(`/admin/email/templates/${tpl.id}/edit`)">
            <span :class="['tpl-badge', tpl.is_active ? 'tpl-badge--active' : 'tpl-badge--inactive']">
              {{ tpl.is_active ? $t('email.is_active') : $t('email.inactive') }}
            </span>
          </td>
          <td @click="$router.push(`/admin/email/templates/${tpl.id}/edit`)">
            {{ formatDate(tpl.updated_at) }}
          </td>
        </tr>
        <tr v-if="!filteredSorted.length && !store.loading">
          <td
            colspan="5"
            class="cms-table__empty"
          >
            <template v-if="query">
              {{ $t('email.no_templates_match', { query }) }}
            </template>
            <template v-else>
              {{ $t('email.no_templates_seed', { command: './plugins/email/bin/populate-db.sh' }) }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { api } from '@/api'
import { useEmailStore } from '../stores/useEmailStore'
import type { EmailTemplate } from '../stores/useEmailStore'

const store = useEmailStore()

const query = ref('')
const sortBy = ref<keyof EmailTemplate>('event_type')
const sortDir = ref<'asc' | 'desc'>('asc')
const selectedIds = reactive(new Set<string>())

const filtered = computed(() => {
  const q = query.value.toLowerCase()
  if (!q) return store.templates
  return store.templates.filter(t =>
    t.event_type.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q)
  )
})

const filteredSorted = computed(() => {
  return [...filtered.value].sort((a, b) => {
    const av = String(a[sortBy.value] ?? '')
    const bv = String(b[sortBy.value] ?? '')
    const cmp = av.localeCompare(bv)
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const allSelected = computed(() =>
  filteredSorted.value.length > 0 && filteredSorted.value.every(t => selectedIds.has(t.id))
)

function sort(col: keyof EmailTemplate) {
  if (sortBy.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortBy.value = col; sortDir.value = 'asc' }
}

function toggleAll() {
  if (allSelected.value) filteredSorted.value.forEach(t => selectedIds.delete(t.id))
  else filteredSorted.value.forEach(t => selectedIds.add(t.id))
}

function toggleOne(id: string) {
  if (selectedIds.has(id)) selectedIds.delete(id)
  else selectedIds.add(id)
}

async function bulkSetActive(active: boolean) {
  const ids = [...selectedIds]
  await Promise.all(ids.map(id => store.saveTemplate(id, { is_active: active })))
  selectedIds.clear()
}

async function bulkDelete() {
  if (!confirm(`Delete ${selectedIds.size} template(s)?`)) return
  const ids = [...selectedIds]
  await Promise.all(ids.map(id => store.deleteTemplate(id)))
  selectedIds.clear()
}

function exportSelected() {
  const rows = store.templates.filter(t => selectedIds.has(t.id))
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'email-templates.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString()
}

const importFileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  importFileInput.value?.click()
}

async function handleImport(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const templates = Array.isArray(data) ? data : [data]
    await api.post('/admin/email/templates/import', templates)
    await store.fetchTemplates()
  } catch {
    alert('Import failed — invalid JSON file')
  }

  if (importFileInput.value) importFileInput.value.value = ''
}

onMounted(() => { store.fetchTemplates() })
</script>

<style scoped>
.email-templates-view {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.cms-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.cms-list__header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--admin-heading, #2c3e50);
}
.cms-list__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.cms-list__search {
  padding: 8px 12px;
  border: 1px solid var(--admin-input-border, #ddd);
  border-radius: 4px;
  font-size: 14px;
  width: 240px;
  background: var(--admin-card-bg, #fff);
  color: var(--admin-text, #333);
}
.cms-list__search:focus {
  outline: none;
  border-color: var(--admin-focus, #3498db);
}
.cms-list__bulk-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--admin-bulk-bg, #f0f4f8);
  border-left: 4px solid var(--admin-bulk-accent, #3498db);
  padding: 10px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.cms-table { width: 100%; border-collapse: collapse; }
.cms-table th,
.cms-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--admin-border-light, #eee);
  font-size: 14px;
  color: var(--admin-text, #333);
}
.cms-table th {
  background: var(--admin-th-bg, #f8f9fa);
  font-weight: 600;
  color: var(--admin-heading, #2c3e50);
}
.cms-table__check { width: 40px; text-align: center; }
.cms-table__empty { text-align: center; color: var(--admin-muted, #666); padding: 40px; }
.cms-table__row { cursor: pointer; transition: background-color 0.15s; }
.cms-table__row:hover td { background: var(--admin-row-hover, #f8f9fa); }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { background: var(--admin-row-hover, #f8f9fa); }

.tpl-event-type {
  font-family: monospace;
  font-size: 13px;
  color: var(--admin-muted, #555);
}
.tpl-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}
.tpl-badge--active {
  background: var(--admin-badge-ok-bg, #d4edda);
  color: var(--admin-badge-ok, #155724);
}
.tpl-badge--inactive {
  background: var(--admin-badge-err-bg, #f8d7da);
  color: var(--admin-badge-err, #721c24);
}
.tpl-error {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.45rem 1rem;
  border: 1px solid var(--admin-border, #d1d5db);
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--admin-text, #333);
}
.btn--sm { font-size: 0.8rem; padding: 0.35rem 0.65rem; }
.btn--primary { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.btn--primary:hover { background: #2563eb; }
.btn--danger { background: #ef4444; color: #fff; border-color: #ef4444; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
