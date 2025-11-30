<template>
  <div class="m-6">
    <UiCard>
      <template #content>
        <UiCardContent>
          <UiTable>
            <UiTableHeader>
              <UiTableRow class="hover:bg-transparent">
                <UiTableHead>Name</UiTableHead>
                <UiTableHead>Email</UiTableHead>

                <UiTableHead class="text-right">Actions</UiTableHead>
              </UiTableRow>
            </UiTableHeader>
            <UiTableBody>
              <UiTableRow v-for="item in data" :key="item.id">
                <UiTableCell>
                  <div class="flex items-center gap-3">
                    <UiAvatar
                      class="size-8"
                      :src="item.image"
                      :alt="item.name"
                    />
                    <div class="leading-none">
                      <div class="font-medium">{{ item.name }}</div>
                      <span
                        class="text-muted-foreground mt-1 inline-block text-xs"
                      >
                        @{{ item.username }}
                      </span>
                    </div>
                  </div>
                </UiTableCell>
                <UiTableCell>{{ item.email }}</UiTableCell>

                <UiTableCell class="text-right">
                  <UiButton variant="outline">Edit</UiButton>
                </UiTableCell>
              </UiTableRow>
            </UiTableBody>
          </UiTable>
        </UiCardContent>
      </template>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "admin",
});
const data = [
  {
    id: 1,
    name: "Robert Beaney",
    username: "robertbeaney",
    image: "https://github.com/robertbeaney.png",
    email: "robertbeaney@gmail.com",
  },
  {
    id: 2,
    name: "Sonnie Spoon",
    username: "sonnie",
    image: "https://github.com/sonnie.png",
    email: "sonnie@gmail.com",
  },
];
</script>
