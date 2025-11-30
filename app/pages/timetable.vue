<script setup lang="ts">
import { ref, computed } from "vue";

definePageMeta({
  layout: "admin",
});

interface Event {
  title: string;
  day: "Friday" | "Saturday" | "Sunday" | "Monday";
  startTime: string;
  endTime: string;
}

// Helper to convert HH:MM to minutes from midnight
const timeToMinutes = (time: string): number => {
  const parts = time.split(":");
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  return hours * 60 + minutes;
};

// Start time for our calendar display (9 AM in minutes from midnight)
const CALENDAR_START_TIME_MINUTES = timeToMinutes("09:00");
// Height of a 15-minute slot in pixels
const PIXELS_PER_15_MINUTES = 16; // Based on h-16 = 64px for one hour (4 * 15min)
const PIXELS_PER_MINUTE = PIXELS_PER_15_MINUTES / 15;

const events = ref<Event[]>([
  // Friday
  {
    title: "Opening Ceremony",
    day: "Friday",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    title: "Salsa Workshop (Beginner)",
    day: "Friday",
    startTime: "10:30",
    endTime: "12:00",
  },
  {
    title: "DJ Set: Funk & Soul",
    day: "Friday",
    startTime: "12:00",
    endTime: "14:00",
  },
  {
    title: "Bachata Workshop (Intermediate)",
    day: "Friday",
    startTime: "14:30",
    endTime: "16:00",
  },
  {
    title: "Live Band: Latin Jazz",
    day: "Friday",
    startTime: "16:00",
    endTime: "18:00",
  },
  {
    title: "Dinner Break",
    day: "Friday",
    startTime: "18:00",
    endTime: "19:00",
  },
  {
    title: "Social Dancing (Open Floor)",
    day: "Friday",
    startTime: "19:00",
    endTime: "23:00",
  },

  // Saturday
  {
    title: "Yoga for Dancers",
    day: "Saturday",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    title: "Afro-Cuban Rhythms Workshop",
    day: "Saturday",
    startTime: "10:00",
    endTime: "11:30",
  },
  {
    title: "Merengue Class",
    day: "Saturday",
    startTime: "11:30",
    endTime: "12:30",
  },
  {
    title: "Lunch Break",
    day: "Saturday",
    startTime: "12:30",
    endTime: "13:30",
  },
  {
    title: "Performance Showcase",
    day: "Saturday",
    startTime: "13:30",
    endTime: "15:00",
  },
  {
    title: "Kizomba Workshop",
    day: "Saturday",
    startTime: "15:00",
    endTime: "16:30",
  },
  {
    title: "DJ Set: Tropical House",
    day: "Saturday",
    startTime: "16:30",
    endTime: "18:30",
  },
  {
    title: "Gala Dinner",
    day: "Saturday",
    startTime: "19:00",
    endTime: "20:30",
  },
  {
    title: "Late Night Social",
    day: "Saturday",
    startTime: "20:30",
    endTime: "23:00",
  },

  // Sunday
  {
    title: "Stretch & Recovery Session",
    day: "Sunday",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    title: "Reggaeton Fusion Workshop",
    day: "Sunday",
    startTime: "10:00",
    endTime: "11:30",
  },
  {
    title: "Dance Battle Prelims",
    day: "Sunday",
    startTime: "11:30",
    endTime: "13:00",
  },
  { title: "Brunch", day: "Sunday", startTime: "13:00", endTime: "14:00" },
  {
    title: "Semba Workshop",
    day: "Sunday",
    startTime: "14:00",
    endTime: "15:30",
  },
  {
    title: "Panel Discussion: Future of Dance",
    day: "Sunday",
    startTime: "15:30",
    endTime: "17:00",
  },
  {
    title: "Closing DJ Set",
    day: "Sunday",
    startTime: "17:00",
    endTime: "19:00",
  },
  {
    title: "Farewell Social",
    day: "Sunday",
    startTime: "19:00",
    endTime: "23:00",
  },

  // Monday
  {
    title: "Check-out & Departures",
    day: "Monday",
    startTime: "09:00",
    endTime: "11:00",
  },
  {
    title: "Brunch & Networking",
    day: "Monday",
    startTime: "11:00",
    endTime: "13:00",
  },
  {
    title: "Optional City Tour",
    day: "Monday",
    startTime: "13:00",
    endTime: "17:00",
  },
  {
    title: "Chill-out Session",
    day: "Monday",
    startTime: "17:00",
    endTime: "19:00",
  },
]);

const timeRange = computed(() => {
  const hours = [];
  for (let i = 9; i <= 23; i++) {
    // From 9 AM to 11 PM
    hours.push(`${i.toString().padStart(2, "0")}:00`);
  }
  return hours;
});

const calculatedEvents = computed(() => {
  type Days = Event["day"];
  const groups: Record<Days, (Event & { top: string; height: string })[]> = {
    Friday: [],
    Saturday: [],
    Sunday: [],
    Monday: [],
  };

  for (const event of events.value) {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);

    // Calculate start position (top) relative to 9 AM
    const offsetMinutes = startMinutes - CALENDAR_START_TIME_MINUTES;
    const top = offsetMinutes * PIXELS_PER_MINUTE;

    // Calculate height of the event
    const durationMinutes = endMinutes - startMinutes;
    const height = durationMinutes * PIXELS_PER_MINUTE;

    // ensure the group exists for the day (narrowed by Record<Days,...>)
    groups[event.day as Days].push({
      ...event,
      top: `${top}px`,
      height: `${height}px`,
    });
  }
  return groups;
});

const addEvent = (event: Event) => {
  if (event.title && event.day && event.startTime && event.endTime) {
    events.value.push({ ...event });
  }
};
</script>

<template>
  <UiContainer class="py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Schedule</h1>
      <TimetableAddModal @save="addEvent" />
    </div>

    <!-- Modified grid layout for 5 columns (1 for time, 4 for days) -->
    <div
      class="relative mt-8 grid h-[calc(100vh-200px)] grid-cols-1 gap-8 overflow-y-auto md:grid-cols-3 lg:grid-cols-5"
    >
      <!-- Time Axis Column -->
      <div
        class="bg-background sticky top-0 z-10 hidden border-r border-gray-200 lg:block dark:border-gray-700"
      >
        <div class="h-[64px]"></div>
        <!-- Placeholder for day header alignment -->
        <div class="relative">
          <div
            v-for="(time, index) in timeRange"
            :key="index"
            class="flex h-16 items-start justify-end pr-2 text-sm text-gray-500 dark:text-gray-400"
            :style="{ paddingTop: index === 0 ? '0' : '8px' }"
          >
            {{ time }}
          </div>
        </div>
      </div>

      <!-- Day Columns -->
      <div
        v-for="(dayEvents, day) in calculatedEvents"
        :key="day"
        class="relative rounded-lg border p-4"
      >
        <h2 class="mb-4 text-center text-xl font-bold">{{ day }}</h2>
        <!-- Time slot lines for visual reference -->
        <div class="absolute inset-0 z-0">
          <div
            v-for="(time, index) in timeRange"
            :key="index"
            class="h-16 border-t border-gray-100 dark:border-gray-800"
            :class="{ 'border-b-0': index === timeRange.length - 1 }"
          ></div>
        </div>
        <div class="relative h-full">
          <div
            v-for="(event, index) in dayEvents"
            :key="index"
            class="bg-primary text-primary-foreground absolute z-10 overflow-hidden rounded-lg p-2 text-xs shadow-md transition-shadow duration-200 ease-in-out hover:shadow-lg"
            :style="{
              top: event.top,
              height: event.height,
              left: '2px',
              right: '2px',
            }"
          >
            <h3 class="font-bold whitespace-normal">{{ event.title }}</h3>
            <p class="whitespace-normal">
              {{ event.startTime }} - {{ event.endTime }}
            </p>
          </div>
          <p
            v-if="dayEvents.length === 0"
            class="text-muted-foreground text-center"
          >
            No events scheduled.
          </p>
        </div>
      </div>
    </div>
  </UiContainer>
</template>
