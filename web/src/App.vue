<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchMonth, loadSettings, saveSettings, sendEntry } from './api'
import EntryForm from './components/EntryForm.vue'
import MonthTable from './components/MonthTable.vue'
import RekapCard from './components/RekapCard.vue'
import SettingsForm from './components/SettingsForm.vue'
import { firstOfMonth, isoOf, monthName, shiftMonth } from './format'
import type { Entry, MonthData, Settings } from './types'

const settings = ref<Settings>(loadSettings())
const showSettings = ref(settings.value.url === '' || settings.value.apiKey === '')

const today = ref(isoOf(new Date()))
const selected = ref(today.value)
const month = ref<MonthData | null>(null)
const busy = ref(false)
const notice = ref('')
const failure = ref('')

const view = ref({ year: Number(today.value.slice(0, 4)), month: Number(today.value.slice(5, 7)) })

const currentRow = computed(() => month.value?.days.find((day) => day.date === selected.value))

async function run(task: () => Promise<void>) {
  busy.value = true
  failure.value = ''
  try {
    await task()
  } catch (err) {
    failure.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}

function load(date: string) {
  return run(async () => {
    const result = await fetchMonth(date)
    month.value = result.month
    today.value = result.today
  })
}

function goToMonth(year: number, monthNumber: number) {
  view.value = { year, month: monthNumber }
  const isCurrent = today.value.startsWith(firstOfMonth(year, monthNumber).slice(0, 7))
  selected.value = isCurrent ? today.value : firstOfMonth(year, monthNumber)
  notice.value = ''
  load(selected.value)
}

function step(delta: number) {
  const next = shiftMonth(view.value.year, view.value.month, delta)
  goToMonth(next.year, next.month)
}

function selectDate(date: string) {
  if (date === '') return
  const sameMonth = date.slice(0, 7) === firstOfMonth(view.value.year, view.value.month).slice(0, 7)
  if (sameMonth) {
    selected.value = date
    notice.value = ''
    return
  }
  view.value = { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) }
  selected.value = date
  notice.value = ''
  load(date)
}

function submit(entry: Entry) {
  return run(async () => {
    const result = await sendEntry(selected.value, entry)
    month.value = result.month
    today.value = result.today
    notice.value = result.message ?? ''
  })
}

function applySettings(next: Settings) {
  saveSettings(next)
  settings.value = next
  showSettings.value = false
  load(selected.value)
}

onMounted(() => {
  if (!showSettings.value) load(selected.value)
})
</script>

<template>
  <main>
    <header>
      <div class="month-nav">
        <button :disabled="busy" aria-label="Bulan sebelumnya" @click="step(-1)">‹</button>
        <h1>{{ monthName(view.month) }} {{ view.year }}</h1>
        <button :disabled="busy" aria-label="Bulan berikutnya" @click="step(1)">›</button>
      </div>
      <button @click="showSettings = !showSettings">Koneksi</button>
    </header>

    <SettingsForm
      v-if="showSettings"
      :initial="settings"
      @save="applySettings"
      @cancel="showSettings = false"
    />

    <p v-if="failure" class="banner error" role="alert">{{ failure }}</p>
    <p v-else-if="notice" class="banner" role="status">{{ notice }}</p>

    <template v-if="!showSettings">
      <EntryForm :date="selected" :row="currentRow" :busy="busy" @update:date="selectDate" @submit="submit" />

      <p v-if="busy && !month" class="empty">Memuat…</p>
      <template v-else-if="month">
        <MonthTable
          :days="month.days"
          :overtime-min="month.overtimeMin"
          :selected="selected"
          :today="today"
          @select="selectDate"
        />
        <RekapCard :count="month.count" />
      </template>
      <p v-else-if="!failure" class="empty">Belum ada data.</p>
    </template>
  </main>
</template>
