<script setup lang="ts">
import JamJar from "@/assets/img/627a3e29a51c556-removebg-preview.png";
const paymentStore = usePaymentStore();
const { registrationData } = storeToRefs(paymentStore);

const hostingStatus = computed(() => {
  if (registrationData.value?.hosting === "i-can-host") {
    return "Hosting";
  } else {
    return "Not hosting";
  }
});

const registrationDetails = computed(() => {
  const details: Record<string, any> = { ...registrationData.value };
  delete details.optional;
  return details;
});

const teamBadgeClass = (team: string) => {
  const palette: Record<string, string> = {
    raspberry: "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/40",
    blueberry: "bg-indigo-500/15 text-indigo-600 ring-1 ring-indigo-500/40",
    "lemon curd": "bg-amber-300/20 text-amber-700 ring-1 ring-amber-400/60",
  };
  return (
    palette[team?.toLowerCase()] ??
    "bg-muted text-foreground ring-1 ring-border"
  );
};

const optionalDetails = computed(() => {
  return registrationData.value?.optional || {};
});

const accountDetails = computed(() => {
  return [
    {
      label: "Name",
      value:
        registrationData.value?.name?.first +
        " " +
        registrationData.value?.name?.last,
    },
    {
      label: "Pronouns",
      value: registrationData.value?.pronouns,
    },
    {
      label: "Primary role",
      value: "Lead",
    },
    {
      label: "Pass type",
      value: registrationData.value?.pass?.name,
    },

    {
      label: "Volunteering",
      value: registrationData.value?.volunteering ? "Yes" : "No",
    },
    {
      label: "Hosting status",
      value:
        registrationData.value?.hosting === "i-can-host"
          ? "Hosting"
          : "Not hosting",
    },
    {
      label: "Musician",
      value: `${registrationData.value?.musician?.participates ? "Yes" : "No"}${
        registrationData.value?.musician?.participates
          ? ` (${registrationData.value?.musician?.instrument})`
          : ""
      }`,
    },
    {
      label: "Merch",
      value: registrationData.value?.merch?.want
        ? `${registrationData.value?.merch?.size}`
        : "No",
    },
  ];
});

const teamBadge = (team: string) => {
  const palette: Record<string, string> = {
    raspberry: "bg-rose-500/15 text-rose-600 ring-1 ring-rose-500/40",
    blueberry: "bg-indigo-500/15 text-indigo-600 ring-1 ring-indigo-500/40",
    "lemon curd": "bg-amber-300/20 text-amber-700 ring-1 ring-amber-400/60",
  };
  return (
    palette[team?.toLowerCase()] ||
    "bg-muted text-foreground ring-1 ring-border"
  );
};
</script>

<template>
  <div class="grid gap-4">
    <div
      v-if="accountDetails"
      class="border-border bg-background overflow-hidden rounded-lg border"
    >
      <UiTable>
        <UiTableBody>
          <template v-for="(item, index) in accountDetails" :key="index">
            <UiTableRow v-if="index === 'name'">
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                index
              }}</UiTableCell>
              <UiTableCell> {{ item?.first }} {{ item?.last }} </UiTableCell>
            </UiTableRow>

            <UiTableRow v-else-if="index === 'hosting'">
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                index
              }}</UiTableCell>
              <UiTableCell>{{ hostingStatus }}</UiTableCell>
            </UiTableRow>

            <UiTableRow v-else-if="index === 'pass'">
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                index
              }}</UiTableCell>
              <UiTableCell>
                <UiBadge variant="default">
                  {{ item.name }}
                  <Icon
                    :name="
                      item.name === 'Full'
                        ? 'lucide:star'
                        : 'lucide:party-popper'
                    "
                  />
                </UiBadge>
              </UiTableCell>
            </UiTableRow>

            <UiTableRow v-else-if="index === 'merch' && item.want">
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                index
              }}</UiTableCell>
              <UiTableCell>
                <UiBadge variant="default">
                  {{ item?.size }}
                </UiBadge>
              </UiTableCell>
            </UiTableRow>

            <UiTableRow v-else>
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                item.label
              }}</UiTableCell>
              <UiTableCell>{{ item.value }}</UiTableCell>
            </UiTableRow>
          </template>
          <UiTableRow>
            <UiTableCell class="bg-muted/50 py-2 font-medium">
              Team
            </UiTableCell>
            <UiTableCell>
              <span
                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold capitalize"
                :class="teamBadgeClass('raspberry')"
              >
                <img :src="JamJar" class="size-6" />
                Raspberry
              </span>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <div
      v-if="registrationData.length > 0"
      class="border-border bg-background overflow-hidden rounded-lg border"
    >
      <UiTable>
        <UiTableBody>
          <UiTableRow v-for="(item, index) in optionalDetails" :key="index">
            <template v-if="index === 'community'">
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                index
              }}</UiTableCell>
              <UiTableCell>
                <span class="flex gap-2">
                  <UiBadge
                    v-for="(item, index) in item"
                    :key="index"
                    variant="default"
                  >
                    {{ item }}
                  </UiBadge>
                </span>
              </UiTableCell>
            </template>

            <template v-else>
              <UiTableCell class="bg-muted/50 py-2 font-medium">{{
                index
              }}</UiTableCell>
              <UiTableCell>{{ item }}</UiTableCell>
            </template>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>
  </div>
</template>
