<script setup lang="ts">
const props = defineProps<{
  title: string
  start: string
  end: string
  allDay: boolean
}>()

const titleRef = ref(props.title)
const confirm = ref(false)
const emit = defineEmits<{ (e: 'close', payload: { title: string; toDelete: boolean }): void }>()
</script>

<template>
  <UModal
    :close="false"
    :title="'Please enter a new title for your event'"
    :ui="{ footer: 'justify-end' }"
    :description="'Enter or modify the event title here.'"
  >
    <template #body>
      <UFormField label="Title" required>
        <UInput v-model="titleRef" :value=titleRef placeholder="Event title" />
      </UFormField>
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
          <UButton color="error" label="Delete" @click="emit('close', {title: title, toDelete: true})" />
        </template>
      </UModal>
      <div class="flex-1" />
      <UButton color="neutral" label="Cancel" variant="outline" @click="emit('close', {title: '', toDelete: false})" />
      <UButton color="neutral" label="Submit" @click="emit('close', {title: titleRef, toDelete: false})" :disabled="!titleRef || titleRef.trim().length < 1" />
    </template>
  </UModal>
</template>
