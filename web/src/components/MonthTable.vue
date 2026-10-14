<script setup lang="ts">
import { clock, dayName, dayOfMonth, total } from '../format'
import type { DayRow } from '../types'

const props = defineProps<{ days: DayRow[]; overtimeMin: number; selected: string; today: string }>()
const emit = defineEmits<{ select: [date: string] }>()

function rowClass(day: DayRow) {
  return {
    weekend: day.weekday === 0 || day.weekday === 6 || day.holiday,
    over: day.worked !== null && day.worked > props.overtimeMin,
    selected: day.date === props.selected,
    today: day.date === props.today,
  }
}
</script>

<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Tgl</th>
          <th>Hadir</th>
          <th>Masuk</th>
          <th>Keluar</th>
          <th>Lunch</th>
          <th>Total</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in days" :key="day.date" :class="rowClass(day)" @click="emit('select', day.date)">
          <td class="date">{{ dayOfMonth(day.date) }} {{ dayName(day.weekday) }}</td>
          <td>{{ day.hadir || '-' }}</td>
          <td>{{ clock(day.start) }}</td>
          <td>{{ clock(day.end) }}</td>
          <td>{{ clock(day.lunch) }}</td>
          <td>{{ total(day.worked) }}</td>
          <td class="note">{{ day.note }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
