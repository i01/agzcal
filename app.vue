<template>
  <UApp>
    <div class='app'>
      <div class='app-sidebar'>
        <div class='app-sidebar-section'>
          <h2>Instructions</h2>
          <ul>
            <li>Select dates and you will be prompted to create a new event</li>
            <li>Drag, drop, and resize events</li>
            <li>Click an event to delete it</li>
          </ul>
        </div>
        <div class='app-sidebar-section'>
          <label>
            <input
              type='checkbox'
              :checked='calendarOptions.weekends'
              @change='handleWeekendsToggle'
            />
            toggle weekends
          </label>
        </div>
        <div class='app-sidebar-section'>
          <h2>All Events ({{ currentEvents.length }})</h2>
          <ul>
            <li v-for='event in currentEvents' :key='event.id'>
              <b>{{ event.startStr }}</b>
              <i>{{ event.title }}</i>
            </li>
          </ul>
        </div>
      </div>
      <div class='app-main'>
        <FullCalendar class='app-calendar' :options='calendarOptions'>
          <template v-slot:eventContent='arg'>
            <b>{{ arg.timeText }}</b>
            <i>{{ arg.event.title }}</i>
          </template>
        </FullCalendar>
      </div>
    </div>
  </UApp>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import interactionPlugin from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import type { CalendarOptions, DateSelectArg, EventApi, EventChangeArg, EventClickArg, EventInput } from '@fullcalendar/core/index.js'
import type { ez } from '@fullcalendar/core/internal-common'
import { ref } from 'vue'
import { LazyModalEvent } from '#components'

async function handleFormGet(): Promise<EventInput[]>{
  return await $fetch<EventInput[]>('/api/entries')
}

async function handleFormInsert(event: { id: string; title: string; start: string; end: string; allDay: boolean }) {
  const res = await $fetch('/api/entries', {
    method: 'POST',
    body: event
  })
}

async function handleFormUpdate(event: ez) {
  const res = await $fetch(`/api/entries/${event.id}`, {
    method: 'PATCH',
    body: event
  })
}

async function handleFormDelete(event: ez){
  const res = await $fetch(`/api/entries/${event.id}`, {
    method: 'DELETE'
  })
}

const toast = useToast()
const overlay = useOverlay()

const modal = overlay.create(LazyModalEvent)

const calendarOptions = ref<CalendarOptions>({
  plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  initialView: 'timeGridWeek',
  nowIndicator: true,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  select: async (selectInfo: DateSelectArg) => {
    const instance = modal.open({
      title: ref('').value,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay
    })

    let {title, _} = await instance.result
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      let entry = {
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      }
      calendarApi.addEvent(entry)

      toast.add({
        title: `Success`,
        description: `'${title}' has been added.`,
        color: 'success',
        close: false,
        id: 'modal-success'
      })
      handleFormInsert(entry)
      return
    }

    toast.add({
      title: `Canceled`,
      color: 'error',
      close: false,
      id: 'modal-dismiss'
    })
  },
  eventClick: async (clickInfo: EventClickArg) => {
    const instance = modal.open({
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay
    })

    let {title, toDelete} = await instance.result

    if (toDelete) {
      clickInfo.event.remove()

      toast.add({
        title: `Success`,
        description: `'${title}' has been deleted.`,
        color: 'success',
        close: false,
        id: 'modal-success'
      })
      handleFormDelete(clickInfo.event)
      return
    }

    if (title) {
      clickInfo.event.setProp('title', title)

      toast.add({
        title: `Success`,
        description: `'${title}' has been updated.`,
        color: 'success',
        close: false,
        id: 'modal-success'
      })
      return
    }

    toast.add({
      title: `Canceled`,
      color: 'error',
      close: false,
      id: 'modal-dismiss'
    })
  },
  eventsSet: (events: EventApi[]) => {
    currentEvents.value = events
  },
  /* you can update a remote database when these fire:
  eventAdd:
  eventChange:
  eventRemove:
  */
  eventChange: (clickInfo: EventChangeArg) => {
    handleFormUpdate(clickInfo.event)
  },
  //initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  events: async () => {
    const events = await handleFormGet()
    return events as EventInput[]
  }
})

const currentEvents = ref<EventApi[]>([])

function handleWeekendsToggle() {
  calendarOptions.value.weekends = !calendarOptions.value.weekends // update a property
}
</script>

<style scoped>
h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b { /* used for event dates/times */
  margin-right: 3px;
}

.app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.app-sidebar-section {
  padding: 2em;
}

.app-main {
  flex-grow: 1;
  padding: 3em;
}

.fc { /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}
</style>
