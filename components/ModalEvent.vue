<script setup lang="ts">
const props = defineProps<{
  title: string
  start: string
  end: string
  allDay: boolean
}>()

const titleRef = ref(props.title)
const startRef = ref(props.start)
const endRef = ref(props.end)
const confirm = ref(false)
const emit = defineEmits<{ (e: 'close', payload: { title: string; start: string; end: string; toDelete: boolean }): void }>()

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
</script>

<template>
  <UModal
    :close="false"
    :title="'Please enter a new title for your event'"
    :ui="{ footer: 'justify-end' }"
    :description="'Enter or modify the event details here.'"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="Title" required>
          <UInput v-model="titleRef" :value=titleRef placeholder="Event title" />
        </UFormField>
        <div class="flex gap-2">
          <UFormField label="From" required>
            <UInput v-model="startRef" :value=toDatetimeLocal(startRef) type="datetime-local" />
          </UFormField>
          <UFormField label="To" required>
            <UInput v-model="endRef" :value=toDatetimeLocal(endRef) type="datetime-local" />
          </UFormField>
        </div>
      </div>
    </template>
    <template #footer>
      <UModal
        :close="false"
        v-model:open="confirm"
        title="Delete event?"
        :description="`Are you sure you want to delete the event '${title}'?`"
        :ui="{ footer: 'justify-end' }"
      >
        <UButton color="error" label="Delete" :hidden="!title" />
        <template #footer>
          <UButton color="neutral" label="Cancel" variant="outline" @click="confirm = false" />
          <UButton color="error" label="Delete" @click="emit('close', {title, start, end, toDelete: true})" />
        </template>
      </UModal>
      <div class="flex-1" />
      <UButton color="neutral" label="Cancel" variant="outline" @click="emit('close', {title: '', start, end, toDelete: false})" />
      <UButton color="neutral" label="Submit" @click="emit('close', {title: titleRef, start: startRef, end: endRef, toDelete: false})" :disabled="!titleRef || titleRef.trim().length < 1 || !startRef || !endRef || endRef.localeCompare(startRef) < 1" />
    </template>
  </UModal>
</template>
