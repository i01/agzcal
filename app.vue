<template>
  <UApp>
    <div class='app'>
      <div class='app-sidebar'>
        <div class='app-sidebar-section'>
          <h2>Instructions</h2>
          <ul>
            <li>Select dates and you will be prompted to create a new event</li>
            <li>Drag, drop, and resize events</li>
            <li>Click an event to edit or delete it</li>
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
import dayGridPlugin from '@fullcalendar/vue3/daygrid'
import timeGridPlugin from '@fullcalendar/vue3/timegrid'
import interactionPlugin from '@fullcalendar/vue3/interaction'
import classicThemePlugin from '@fullcalendar/vue3/themes/classic'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import '@fullcalendar/vue3/skeleton.css';
import '@fullcalendar/vue3/themes/classic/theme.css';
import '@fullcalendar/vue3/themes/classic/palette.css';
import type { CalendarOptions, DateSelectInfo, EventApi, EventChangeInfo, EventClickInfo, EventInput } from '@fullcalendar/vue3'
import { ref } from 'vue'
import { LazyModalEvent } from '#components'

async function handleFormGet(): Promise<EventInput[]> {
  return await $fetch<EventInput[]>('/api/entries')
}

async function handleFormInsert(event: EventInput) {
  const res = await $fetch('/api/entries', {
    method: 'POST',
    body: event
  })
}

async function handleFormUpdate(event: EventApi) {
  const res = await $fetch(`/api/entries/${event.id}`, {
    method: 'PATCH',
    body: event
  })
}

async function handleFormDelete(event: EventApi) {
  const res = await $fetch(`/api/entries/${event.id}`, {
    method: 'DELETE'
  })
}

const res = await $fetch<EventInput[] | { error?: string }>('/api/entries').catch(() => null)
const dbAvailable = Array.isArray(res)

const toast = useToast()
const overlay = useOverlay()

const modal = overlay.create(LazyModalEvent)

const isDark = import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches

const calendarOptions = ref<CalendarOptions>({
  colorScheme: isDark ? 'dark' : 'light',
  plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, classicThemePlugin],
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
  forceEventDuration: true,
  select: async (selectInfo: DateSelectInfo) => {
    const instance = modal.open({
      title: ref('').value,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay
    })

    let { title, start, end } = await instance.result
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      let entry = {
        id: createEventId(),
        title,
        start,
        end,
        allDay: selectInfo.allDay
      }

      if (dbAvailable) {
        await handleFormInsert(entry)
        calendarApi.refetchEvents()
      } else {
        calendarApi.addEvent(entry)
      }
      toast.add({
        title: `Success`,
        description: `'${title}' has been added.`,
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
  eventClick: async (clickInfo: EventClickInfo) => {
    const instance = modal.open({
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay
    })

    let { title, start, end, toDelete } = await instance.result

    if (toDelete) {
      clickInfo.event.remove()

      if (dbAvailable) {
        handleFormDelete(clickInfo.event)
      }
      toast.add({
        title: `Success`,
        description: `'${title}' has been deleted.`,
        color: 'success',
        close: false,
        id: 'modal-success'
      })
      return
    }

    if (title) {
      clickInfo.event.setProp('title', title)
      clickInfo.event.setStart(start)
      clickInfo.event.setEnd(end)

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
  eventChange: (clickInfo: EventChangeInfo) => {
    if (dbAvailable) {
      handleFormUpdate(clickInfo.event)
    }
  },
  //initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  events: async () => {
    if (dbAvailable) {
      const events = await handleFormGet()
      if (events.length > 0) {
        return events as EventInput[]
      }
    }
    return INITIAL_EVENTS as EventInput[]
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
  background: light-dark(#eaf9ff, var(--fc-classic-button));
  border-right: 1px solid #d3e2e8;
}

.app-sidebar-section {
  padding: 2em;
}

.app-main {
  flex-grow: 1;
  padding: 3em;
}
</style>

<style>
.app-calendar {
  max-width: 1100px;
  margin: 0 auto;
}
</style>
