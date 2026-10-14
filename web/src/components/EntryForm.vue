<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { clock, dayName, nowClock, toMinutes, total } from '../format'
import type { AbsenceKind, DayRow, Entry } from '../types'

const props = defineProps<{ date: string; row: DayRow | undefined; busy: boolean }>()
const emit = defineEmits<{ 'update:date': [date: string]; submit: [entry: Entry] }>()

const time = ref(nowClock())
const text = ref(props.row?.note ?? '')

watch(
  () => [props.date, props.row?.note] as const,
  () => {
    text.value = props.row?.hadir === 'N' ? '' : (props.row?.note ?? '')
  },
)

const summary = computed(() => {
  const row = props.row
  if (!row) return 'Tanggal ini tidak ada di sheet.'
  const label = dayName(row.weekday) + ' ' + Number(row.date.slice(8, 10))
  if (row.hadir === 'N') return label + ' · ' + (row.note || 'tidak hadir')
  const parts = [label, 'masuk ' + clock(row.start), 'keluar ' + clock(row.end)]
  if (row.worked !== null) parts.push('total ' + total(row.worked))
  return parts.join(' · ')
})

const timeValid = computed(() => toMinutes(time.value) !== null)

function sendTime(type: 'masuk' | 'keluar') {
  const value = toMinutes(time.value)
  if (value !== null) emit('submit', { type, time: value })
}

function sendText() {
  const value = text.value.trim()
  if (value) emit('submit', { type: 'kegiatan', text: value })
}

function sendAbsence(kind: AbsenceKind) {
  emit('submit', { type: 'absen', kind })
}
</script>

<template>
  <section class="card">
    <h2>Isi hari</h2>

    <label>
      Tanggal
      <input type="date" :value="date" @change="emit('update:date', ($event.target as HTMLInputElement).value)" />
    </label>

    <p class="summary">{{ summary }}</p>

    <div class="time-row">
      <label>
        Jam
        <input v-model="time" type="time" />
      </label>
      <button class="primary" :disabled="busy || !timeValid || !row" @click="sendTime('masuk')">Masuk</button>
      <button class="primary" :disabled="busy || !timeValid || !row" @click="sendTime('keluar')">Keluar</button>
    </div>

    <label>
      Kegiatan
      <textarea v-model="text" rows="3" placeholder="2 reprint and 1 doc printing development"></textarea>
    </label>
    <button :disabled="busy || !row || text.trim() === ''" @click="sendText">Simpan kegiatan</button>

    <div class="absence">
      <button :disabled="busy || !row" @click="sendAbsence('sakit')">Sakit</button>
      <button :disabled="busy || !row" @click="sendAbsence('izin')">Izin</button>
      <button :disabled="busy || !row" @click="sendAbsence('cuti')">Cuti</button>
    </div>
  </section>
</template>
