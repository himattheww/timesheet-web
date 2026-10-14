<script setup lang="ts">
import { computed } from 'vue'
import type { Count } from '../types'

const props = defineProps<{ count: Count }>()

const items = computed(() => [
  { label: 'Hari kerja', value: props.count.workdays },
  { label: 'Hadir', value: props.count.hadir },
  { label: 'Sakit', value: props.count.sakit },
  { label: 'Izin', value: props.count.izin },
  { label: 'Cuti', value: props.count.cuti },
  { label: 'Belum diisi', value: props.count.kosong },
  { label: 'Masuk lewat 09.00', value: props.count.late },
  { label: 'Kurang dari 8 jam', value: props.count.short },
  { label: 'Lebih dari 8 jam', value: props.count.over },
])
</script>

<template>
  <section class="card">
    <h2>Rekap</h2>
    <dl class="rekap">
      <div v-for="item in items" :key="item.label">
        <dt>{{ item.label }}</dt>
        <dd>{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
