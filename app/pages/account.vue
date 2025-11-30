<template>
  <div class="w-full">
    <slot name="image">
      <img
        src="https://res.cloudinary.com/dgbn0ttzf/image/upload/v1763947944/DTJJ_-_FB_Cover_hstthn.png"
        class="h-[180px] w-full object-cover md:h-[250px]"
      />
    </slot>
    <UiContainer v-if="user" class="p-4 md:px-8 md:pt-6">
      <div class="hidden md:block">
        <slot name="crumbs">
          <UiBreadcrumbs v-if="crumbs" :items="crumbs" class="mb-5" />
        </slot>
      </div>
      <slot name="back-link">
        <NuxtLink
          class="mb-5 flex items-center gap-3 text-sm underline-offset-2 hover:underline md:hidden"
          to="#"
        >
          <Icon name="lucide:arrow-left" class="size-4" />
          Back
        </NuxtLink>
      </slot>
      <div
        class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-5">
          <slot name="avatar">
            <UiAvatar
              v-if="avatar"
              :src="avatar"
              class="size-8 object-cover md:size-10"
            />
          </slot>
          <div class="flex flex-col gap-1">
            <slot name="title">
              <h1 v-if="name" class="leading-none font-bold lg:text-lg">
                {{ name }}
              </h1>
            </slot>
            <slot name="description">
              <p
                v-if="email"
                class="text-muted-foreground text-sm leading-none"
              >
                {{ email }}
              </p>
            </slot>
          </div>

          <!-- Badges -->
          <div class="flex items-center gap-2">
            <!-- Team Badge -->
            <UiTooltip>
              <UiTooltipTrigger as-child>
                <div
                  class="bg-muted flex size-8 items-center justify-center rounded-full"
                >
                  <img :src="JamJar" class="size-5" />
                </div>
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>Team: {{ attendee.team }}</p>
              </UiTooltipContent>
            </UiTooltip>

            <!-- Pass Type Badge -->
            <UiTooltip>
              <UiTooltipTrigger as-child>
                <div
                  class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full"
                >
                  <Icon name="lucide:ticket" class="size-5" />
                </div>
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>Pass: {{ attendee.passType }}</p>
              </UiTooltipContent>
            </UiTooltip>

            <!-- Volunteer Badge -->
            <UiTooltip v-if="attendee.volunteering">
              <UiTooltipTrigger as-child>
                <div
                  class="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                >
                  <Icon name="lucide:hand-heart" class="size-5" />
                </div>
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>Volunteer</p>
              </UiTooltipContent>
            </UiTooltip>

            <!-- Host Badge -->
            <UiTooltip v-if="attendee.hostingStatus">
              <UiTooltipTrigger as-child>
                <div
                  class="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  <Icon name="lucide:home" class="size-5" />
                </div>
              </UiTooltipTrigger>
              <UiTooltipContent>
                <p>Status: {{ attendee.hostingStatus }}</p>
              </UiTooltipContent>
            </UiTooltip>
          </div>
        </div>

        <div
          class="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center"
        >
          <slot>
            <UiDialog v-model:open="isEditProfileOpen">
              <UiDialogTrigger as-child>
                <UiButton size="sm" variant="outline" text="Edit Profile" />
                <UiButton
                  size="sm"
                  variant="outline"
                  text="Logout"
                  @click="logout"
                />
              </UiDialogTrigger>
              <UiDialogContent>
                <UiDialogHeader class="contents space-y-0 text-left">
                  <UiDialogTitle class="px-6 pt-6">Edit Profile</UiDialogTitle>

                  <form class="flex flex-col gap-4" @submit="updateProfile">
                    <div class="grid grid-cols-2 gap-4">
                      <UiVeeInput
                        name="first_name"
                        label="First Name"
                        placeholder="Enter your first name"
                      />
                      <UiVeeInput
                        name="last_name"
                        label="Last Name"
                        placeholder="Enter your last name"
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <UiLabel>Pass Type</UiLabel>
                        <UiSelect
                          v-model="values.passType"
                          @update:model-value="
                            setFieldValue('passType', String($event ?? ''))
                          "
                        >
                          <UiSelectTrigger placeholder="Select pass type" />
                          <UiSelectContent>
                            <UiSelectItem value="Full pass">
                              Full pass
                            </UiSelectItem>
                            <UiSelectItem value="Party pass">
                              Party pass
                            </UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>

                      <div class="space-y-2">
                        <UiLabel>Role</UiLabel>
                        <UiSelect
                          v-model="values.role"
                          @update:model-value="
                            setFieldValue('role', String($event ?? ''))
                          "
                        >
                          <UiSelectTrigger placeholder="Select role" />
                          <UiSelectContent>
                            <UiSelectItem value="Lead">Lead</UiSelectItem>
                            <UiSelectItem value="Follow">Follow</UiSelectItem>
                            <UiSelectItem value="Switch">Switch</UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <UiLabel>Hosting Status</UiLabel>
                        <UiSelect
                          v-model="values.hostingStatus"
                          @update:model-value="
                            setFieldValue('hostingStatus', String($event ?? ''))
                          "
                        >
                          <UiSelectTrigger placeholder="Select status" />
                          <UiSelectContent>
                            <UiSelectItem value="Being hosted">
                              Being hosted
                            </UiSelectItem>
                            <UiSelectItem value="Hosting">Hosting</UiSelectItem>
                            <UiSelectItem value="Not hosting">
                              Not hosting
                            </UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>

                      <div class="space-y-2">
                        <UiLabel>Team</UiLabel>
                        <UiSelect
                          v-model="values.team"
                          @update:model-value="
                            setFieldValue('team', String($event ?? ''))
                          "
                        >
                          <UiSelectTrigger placeholder="Select team" />
                          <UiSelectContent>
                            <UiSelectItem value="raspberry">
                              Raspberry
                            </UiSelectItem>
                            <UiSelectItem value="blueberry">
                              Blueberry
                            </UiSelectItem>
                            <UiSelectItem value="lemon curd">
                              Lemon Curd
                            </UiSelectItem>
                          </UiSelectContent>
                        </UiSelect>
                      </div>
                    </div>

                    <div
                      class="flex items-center justify-between rounded-lg border p-3 shadow-sm"
                    >
                      <div class="space-y-0.5">
                        <UiLabel>Volunteering</UiLabel>
                        <p class="text-muted-foreground text-sm">
                          Are you interested in volunteering?
                        </p>
                        <pre>{{ values.volunteering }}</pre>
                      </div>
                      <UiSwitch
                        :checked="values.volunteering"
                        :model-value="values.volunteering"
                        @update:model-value="
                          setFieldValue('volunteering', $event)
                        "
                      />
                    </div>

                    <div class="mt-4 flex justify-end gap-2">
                      <UiButton type="submit" :disabled="isSubmitting">
                        Save Changes
                      </UiButton>
                    </div>
                  </form>
                </UiDialogHeader>
              </UiDialogContent>
            </UiDialog>
          </slot>
        </div>
      </div>

      <UiDivider class="my-8" />
    </UiContainer>

    <UiContainer v-if="user" class="md:px-8">
      <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-4">
          <div
            class="border-border/60 max-w-2xl overflow-hidden rounded-xl border shadow-sm"
          >
            <div class="bg-muted/50 px-4 py-3 font-semibold">
              Registration details
            </div>
            <table class="divide-border/60 bg-background min-w-full divide-y">
              <tbody class="divide-border/60 divide-y">
                <tr class="hover:bg-muted/40">
                  <th
                    scope="row"
                    class="w-1/3 px-4 py-3 text-left text-sm font-semibold"
                  >
                    Signed up
                  </th>
                  <td class="text-muted-foreground px-4 py-3 text-sm">
                    {{ attendee.signedUp }}
                  </td>
                </tr>
                <tr class="hover:bg-muted/40">
                  <th
                    scope="row"
                    class="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Pass type
                  </th>
                  <td class="text-muted-foreground px-4 py-3 text-sm">
                    {{ attendee.passType }}
                  </td>
                </tr>
                <tr class="hover:bg-muted/40">
                  <th
                    scope="row"
                    class="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Primary role
                  </th>
                  <td class="text-muted-foreground px-4 py-3 text-sm">
                    {{ attendee.role }}
                  </td>
                </tr>
                <tr class="hover:bg-muted/40">
                  <th
                    scope="row"
                    class="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Volunteering
                  </th>
                  <td class="text-muted-foreground px-4 py-3 text-sm">
                    <span
                      class="bg-muted inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      <span
                        :class="[
                          'size-2 rounded-full',
                          attendee.volunteering
                            ? 'bg-emerald-500'
                            : 'bg-amber-500',
                        ]"
                      />
                      {{ attendee.volunteering ? "Yes" : "No" }}
                    </span>
                  </td>
                </tr>
                <tr class="hover:bg-muted/40">
                  <th
                    scope="row"
                    class="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Hosting status
                  </th>
                  <td class="text-muted-foreground px-4 py-3 text-sm">
                    {{ attendee.hostingStatus }}
                  </td>
                </tr>
                <tr class="hover:bg-muted/40">
                  <th
                    scope="row"
                    class="px-4 py-3 text-left text-sm font-semibold"
                  >
                    Team
                  </th>
                  <td class="text-muted-foreground px-4 py-3 text-sm">
                    <span
                      class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize"
                      :class="teamBadgeClass"
                    >
                      <img :src="JamJar" class="size-6" />
                      {{ attendee.team }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            class="border-border/60 max-w-2xl overflow-hidden rounded-xl border shadow-sm"
          >
            <div class="bg-muted/50 px-4 py-3 font-semibold">
              Weekend Timetable
            </div>
            <div class="bg-background p-4">
              <div
                v-for="day in timetable"
                :key="day.day"
                class="mb-6 last:mb-0"
              >
                <h3 class="text-primary mb-2 text-lg font-bold">
                  {{ day.day }}
                  <span class="text-muted-foreground text-sm font-normal">
                    ({{ day.date }})
                  </span>
                </h3>
                <ul class="space-y-3">
                  <li
                    v-for="(event, index) in day.events"
                    :key="index"
                    class="flex gap-4 text-sm"
                  >
                    <span class="min-w-[50px] font-mono font-semibold">
                      {{ event.time }}
                    </span>
                    <div class="flex-1">
                      <div class="font-medium">{{ event.title }}</div>
                      <div class="text-muted-foreground text-xs">
                        {{ event.location }}
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          class="border-border/60 max-w-2xl overflow-hidden rounded-xl border shadow-sm"
        >
          <div class="bg-muted/50 px-4 py-3 font-semibold">Files</div>
          <div>
            <dd class="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <ul
                role="list"
                class="divide-y divide-gray-100 rounded-md border-gray-200"
              >
                <li
                  class="flex items-center justify-between py-4 pr-5 pl-4 text-sm leading-6"
                >
                  <div class="flex w-0 flex-1 items-center">
                    <Icon
                      name="lucide:file-text"
                      class="h-5 w-5 flex-shrink-0 text-gray-400"
                    />
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">
                        welcome_booklet.pdf
                      </span>
                      <span class="flex-shrink-0 text-gray-400">2.4mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <UiButton size="sm">Download</UiButton>
                  </div>
                </li>
                <li
                  class="flex items-center justify-between py-4 pr-5 pl-4 text-sm leading-6"
                >
                  <div class="flex w-0 flex-1 items-center">
                    <Icon
                      name="lucide:file-text"
                      class="h-5 w-5 flex-shrink-0 text-gray-400"
                    />
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">schedule.pdf</span>
                      <span class="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <UiButton size="sm">Download</UiButton>
                  </div>
                </li>
                <li
                  class="flex items-center justify-between py-4 pr-5 pl-4 text-sm leading-6"
                >
                  <div class="flex w-0 flex-1 items-center">
                    <Icon
                      name="lucide:file-text"
                      class="h-5 w-5 flex-shrink-0 text-gray-400"
                    />
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                      <span class="truncate font-medium">your_pass.pdf</span>
                      <span class="flex-shrink-0 text-gray-400">4.5mb</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <UiButton size="sm">Download</UiButton>
                  </div>
                </li>
              </ul>
            </dd>
          </div>
        </div>
      </div>
    </UiContainer>
  </div>
</template>

<script lang="ts" setup>
import type { BreadcrumbItem } from "@/components/Ui/Breadcrumbs.vue";
import { object, string, boolean } from "yup";
import JamJar from "../assets/img/627a3e29a51c556-removebg-preview.png";

definePageMeta({
  layout: "admin",
});

const sbUser = useSupabaseUser();
const supabase = useSupabaseClient();
const userStore = useUserStore();
const { profile, attendee } = storeToRefs(userStore);
const { fetchProfile, updateAttendee } = userStore;

const isEditProfileOpen = ref(false);

const user = computed(() => profile?.value ?? null);
const name = computed(() =>
  profile.value
    ? `${(profile.value as any).first_name} ${(profile.value as any).last_name}`
    : ""
);
const email = computed(() => (user.value as any)?.email);
const avatar = computed(() => (user.value as any)?.avatar_url);

const ProfileSchema = object({
  first_name: string().required().label("First Name"),
  last_name: string().required().label("Last Name"),
  passType: string().required().label("Pass Type"),
  role: string().required().label("Role"),
  hostingStatus: string().required().label("Hosting Status"),
  team: string().required().label("Team"),
  volunteering: boolean().label("Volunteering"),
});

const {
  handleSubmit,
  isSubmitting,
  setValues: _setValues,
  values,
  setFieldValue,
  resetForm,
} = useForm<{
  first_name: string;
  last_name: string;
  passType: string;
  role: string;
  hostingStatus: string;
  team: string;
  volunteering: boolean;
}>({
  validationSchema: ProfileSchema,
  initialValues: {
    first_name: "",
    last_name: "",
    passType: "",
    role: "",
    hostingStatus: "",
    team: "",
    volunteering: false,
  },
});

// Pre-fill form when profile is loaded or modal opens
watch(
  [() => profile.value, () => attendee.value, () => isEditProfileOpen.value],
  ([newProfile, newAttendee, _isOpen]) => {
    const p = newProfile as any; // Cast to any or Profile interface if available
    if (p && newAttendee) {
      resetForm({
        values: {
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          passType: newAttendee.passType || "",
          role: newAttendee.role || "",
          hostingStatus: newAttendee.hostingStatus || "",
          team: newAttendee.team || "",
          volunteering: newAttendee.volunteering ?? false,
        },
      });
    }
  },
  { immediate: true }
);

watch(
  () => sbUser.value,
  async (user) => {
    const userId = user?.id || user?.sub; // Support both id and sub fields
    console.log("Confirm page - user state changed:", userId);

    if (userId) {
      console.log("Fetching profile for user:", userId);
      await fetchProfile(userId);
      console.log("Profile loaded:", profile.value);
    }
  },
  { immediate: true }
);

const logout = () => {
  supabase.auth.signOut();
};

const updateProfile = handleSubmit(async (values) => {
  if (!sbUser.value) return;

  const { first_name, last_name, ...attendeeData } = values;

  // Update Profile in Supabase
  // const { error } = await supabase
  //   .from("profiles")
  //   .update({ first_name, last_name })
  //   .eq("id", sbUser.value.sub);

  // if (error) {
  //   useSonner("Error updating profile", {
  //     description: error.message,
  //     type: "error",
  //   });
  //   return;
  // }

  // Update Profile in Store (temporary until Supabase update is enabled)
  if (profile.value) {
    profile.value = {
      ...(profile.value as any),
      first_name,
      last_name,
    };
  }

  // Update Attendee in Store
  updateAttendee(attendeeData);

  useSonner("Profile updated", {
    description: "Your profile has been successfully updated.",
  });
  isEditProfileOpen.value = false;
});

const teamBadgeClass = computed(() => {
  const palette: Record<string, string> = {
    raspberry: "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/40",
    blueberry: "bg-indigo-500/15 text-indigo-600 ring-1 ring-indigo-500/40",
    "lemon curd": "bg-amber-300/20 text-amber-700 ring-1 ring-amber-400/60",
  };
  return (
    palette[attendee.value?.team?.toLowerCase()] ??
    "bg-muted text-foreground ring-1 ring-border"
  );
});

const crumbs = computed(
  () =>
    [
      {
        icon: "lucide:home",
      },
      {
        label: "Settings",
        link: "#",
      },
      {
        label: "Profile",
        link: "/confirm",
      },
    ] as BreadcrumbItem[]
);

// Timetable Data
const timetable = [
  {
    day: "Friday",
    date: "Feb 14",
    events: [
      { time: "19:00", title: "Registration Opens", location: "Main Hall" },
      { time: "20:00", title: "Welcome Dance", location: "Ballroom" },
      { time: "22:00", title: "Late Night Blues", location: "Basement" },
    ],
  },
  {
    day: "Saturday",
    date: "Feb 15",
    events: [
      { time: "10:00", title: "Workshops: Lindy Hop", location: "Studios A-C" },
      { time: "13:00", title: "Lunch Break", location: "Cafeteria" },
      {
        time: "14:00",
        title: "Workshops: Jazz Roots",
        location: "Studios A-C",
      },
      { time: "20:00", title: "Grand Ball", location: "Ballroom" },
    ],
  },
  {
    day: "Sunday",
    date: "Feb 16",
    events: [
      { time: "11:00", title: "Tea Dance", location: "Garden" },
      { time: "15:00", title: "Farewell", location: "Main Hall" },
    ],
  },
];
</script>
