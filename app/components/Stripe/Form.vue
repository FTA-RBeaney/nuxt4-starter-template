<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { set } from "~~/node_modules/nuxt/dist/app/compat/capi";

const paymentStore = usePaymentStore();
const { setChosenTicket, setRegistrationData, setPayItForward } = paymentStore;
const { chosenTicket, payItForwardAmount } = storeToRefs(paymentStore);

// stripe module client helper (from @unlok-co/nuxt-stripe module)
const {
  loadStripe: moduleLoadStripe,
  stripe: moduleStripe,
  isLoading,
} = useClientStripe();

// Personal + registration fields
const firstName = ref("");
const surname = ref("");
const pronouns = ref("");
const email = ref("");
const city = ref("");
const friendName = ref("");

// Hosting
const hosting = ref("no-need");

// Musician
const isMusician = ref(false);
const musicianInstrument = ref("");
const bringInstrument = ref(false);

const payItForwardOptions = [
  { id: "none", name: "None", value: 0 },
  { id: "donate-10", name: "+£10 sustainable top up", value: 10 },
  { id: "donate-20", name: "+£20 sustainable top up", value: 20 },
  { id: "donate-30", name: "+£30 sustainable top up", value: 30 },
  { id: "request-10", name: "£10 discount (request support)", value: -10 },
  { id: "request-20", name: "£20 discount (request support)", value: -20 },
  { id: "request-30", name: "£30 discount (request support)", value: -30 },
];

// Pay it forward
const payItForward = ref({
  type: "none" as "none" | "donate" | "request",
  amount: 0,
});

// Merch
const merch = ref({ want: false, size: "" });

// Terms
const termsAccepted = ref(false);

// Optional
const optional = ref({
  startYear: null as number | null,
  travelMethod: "",
  community: [] as string[],
});

// UI state
const name = ref("");
const error = ref<string | null>(null);
const processing = ref(false);
const cardEl = ref<HTMLElement | null>(null);

const paymentMethods = [
  {
    id: "payment-card",
    name: "Full",
    icon: "mdi:star",
  },
  {
    id: "payment-paypal",
    name: "Party",
    icon: "mdi:party-popper",
  },
];

let stripe: Stripe | null = null;
let card: StripeCardElement | null = null;
let elements: any = null;

onMounted(async () => {
  try {
    let _stripe: any = moduleStripe.value;
    if (!_stripe) {
      _stripe = await moduleLoadStripe();
    }
    if (!_stripe) {
      error.value = "Stripe failed to load";
      return;
    }
    stripe = _stripe as unknown as Stripe;
    elements = (stripe as any).elements();
    card = elements.create("card", {
      hidePostalCode: true,
    });
    if (cardEl.value && card) card.mount(cardEl.value);
  } catch (e: any) {
    error.value = e?.message || String(e);
  }
});

function validateRequired() {
  if (!chosenTicket.value) {
    error.value = "Please select a pass type.";
    return false;
  }
  if (!firstName.value.trim()) {
    error.value = "First name is required.";
    return false;
  }
  if (!surname.value.trim()) {
    error.value = "Surname is required.";
    return false;
  }
  if (!email.value.trim()) {
    error.value = "Email is required.";
    return false;
  }
  if (!city.value.trim()) {
    error.value = "City is required.";
    return false;
  }
  if (!termsAccepted.value) {
    error.value = "You must accept the Terms & Conditions.";
    return false;
  }
  if (!stripe || !card) {
    error.value = "Payment is not ready yet.";
    return false;
  }
  return true;
}

async function onSubmit() {
  useConfetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  error.value = null;
  if (!validateRequired()) return;

  processing.value = true;

  // compute amount: chosenTicket price (in GBP) plus donation if any
  const baseAmount = Math.round((chosenTicket.value?.price ?? 0) * 100);
  const donation =
    payItForward.value.type === "donate" && payItForward.value.amount
      ? Math.round(payItForward.value.amount * 100)
      : 0;
  const amount = baseAmount + donation;

  // Build registration payload
  const registration = {
    name: {
      first: firstName.value,
      last: surname.value,
    },
    pronouns: pronouns.value,
    email: email.value,
    city: city.value,
    friendName: friendName.value || null,
    pass: chosenTicket.value || null,
    payItForward: { ...payItForward.value },
    hosting: hosting.value,
    musician: {
      participates: isMusician.value,
      instrument: musicianInstrument.value,
      bringsInstrument: bringInstrument.value,
    },
    merch: merch.value,
    termsAccepted: termsAccepted.value,
    optional: optional.value,
    submittedAt: new Date().toISOString(),
  };

  try {
    // Create payment intent on server: send amount in cents and registration
    const resp = await $fetch("/api/create-payment-intent", {
      method: "POST",
      body: { amount, currency: "GBP", registration },
    });

    const clientSecret = (resp as any).clientSecret;
    if (!clientSecret) throw new Error("No client secret from server");

    const result = await stripe!.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: {
          name: `${firstName.value} ${surname.value}`,
          email: email.value,
          address: {
            line1: city.value,
            postal_code: "UK",
            country: "GB",
          },
        },
      },
    });

    if (result.error) {
      error.value = result.error.message || "Payment failed";
    } else if (
      result.paymentIntent &&
      result.paymentIntent.status === "succeeded"
    ) {
      setRegistrationData(registration);
      useSonner("Payment successful", {
        description: "Thanks — payment succeeded.",
      });
      // optional: clear form or navigate to success page
      navigateTo("/account");
    } else {
      error.value = "Payment not completed";
    }
  } catch (err: any) {
    error.value = err?.message || String(err);
  } finally {
    processing.value = false;
  }
}

const totalPrice = computed(() => {
  let total = 0;
  total = chosenTicket.value?.price + (payItForwardAmount.value || 0);
  return total;
});
</script>

<template>
  <div class="mx-auto w-full max-w-7xl p-6">
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="grid grid-cols-2 items-start gap-4">
        <UiCard>
          <UiCardContent class="grid space-y-3">
            <UiRadioGroup orientation="horizontal" class="grid gap-4">
              <template
                v-for="(p, i) in paymentMethods"
                :key="`payment-method-${i}`"
              >
                <div @click="setChosenTicket(p?.name)">
                  <UiRadioGroupItem
                    :id="p.id"
                    :value="p.id"
                    class="peer sr-only"
                  />
                  <UiLabel
                    :for="p.id"
                    class="border-muted bg-popover peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex items-center justify-start gap-3 rounded-md border-2 p-4"
                    :class="
                      chosenTicket.name === p.name ? 'border-primary' : ''
                    "
                  >
                    <Icon class="h-6 w-6" :name="p.icon" />
                    <span class="text-sm">{{ p?.name }} pass</span>
                  </UiLabel>
                </div>
              </template>
            </UiRadioGroup>

            <!-- Pass selection hint -->
            <div>
              <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                >Selected pass</UiLabel
              >
              <div class="text-muted-foreground text-sm">
                {{
                  chosenTicket?.name
                    ? `${chosenTicket?.name || chosenTicket} — £${chosenTicket?.price}`
                    : "Please select a pass type above"
                }}
              </div>
            </div>

            <!-- Pay it forward -->
            <div>
              <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                >Pay it forward</UiLabel
              >
              <p class="text-muted-foreground mb-2 text-sm">
                Choose to add a donation to support others attending, or request
                support yourself.
              </p>
              <div class="mb-2 items-center gap-2">
                <UiRadioGroup orientation="horizontal" class="grid gap-4">
                  <template
                    v-for="(p, i) in payItForwardOptions"
                    :key="`payitforward-method-${i}`"
                  >
                    <div @click="setPayItForward(p?.value)">
                      <UiRadioGroupItem
                        :id="p.id"
                        :value="p.id"
                        class="peer sr-only"
                      />
                      <UiLabel
                        :for="p.id"
                        class="border-muted bg-popover peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary block items-center justify-start gap-3 rounded-md border-2 p-4"
                        :class="
                          p.value === payItForwardAmount ? 'border-primary' : ''
                        "
                      >
                        <div class="text-sm">{{ p?.name }}</div>
                        <div class="text-sm">
                          £{{ chosenTicket?.price + p?.value }}
                        </div>
                      </UiLabel>
                    </div>
                  </template>
                </UiRadioGroup>
                <!-- <label class="flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="payItForward.type"
                    value="none"
                  />
                  <span>None</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="payItForward.type"
                    value="donate"
                  />
                  <span>I want to donate</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="radio"
                    v-model="payItForward.type"
                    value="request"
                  />
                  <span>I would like support</span>
                </label> -->
              </div>
              <div v-if="payItForward.type !== 'none'" class="flex gap-2">
                <UiInput
                  v-model.number="payItForward.amount"
                  placeholder="Amount (GBP)"
                  type="number"
                />
              </div>
            </div>

            <!-- Hosting -->
            <div>
              <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                >Hosting</UiLabel
              >
              <div class="flex flex-col gap-2">
                <label
                  ><input type="radio" v-model="hosting" value="i-can-host" /> I
                  can host</label
                >
                <label
                  ><input
                    type="radio"
                    v-model="hosting"
                    value="i-would-like-to-be-hosted"
                  />
                  I would like to be hosted</label
                >
                <label
                  ><input type="radio" v-model="hosting" value="no-need" /> I
                  don't need to be hosted</label
                >
                <label
                  ><input
                    type="radio"
                    v-model="hosting"
                    value="cannot-come-without"
                  />
                  I cannot come without being hosted</label
                >
              </div>
            </div>

            <!-- JazzJam musician -->
            <div>
              <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                >JazzJam musician</UiLabel
              >
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="isMusician" />
                <span>I would like to participate as a musician</span>
              </label>
              <div v-if="isMusician" class="mt-2 grid grid-cols-2 gap-2">
                <UiInput
                  v-model="musicianInstrument"
                  placeholder="Instrument"
                />
                <label class="flex items-center gap-2"
                  ><input type="checkbox" v-model="bringInstrument" /> I will
                  bring my own instrument</label
                >
              </div>
            </div>

            <!-- Merch placeholder -->
            <div>
              <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                >Merch (T‑shirt)</UiLabel
              >
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="merch.want" />
                <span>I would like merch (T-shirt)</span>
              </label>
              <div v-if="merch.want" class="mt-2 flex gap-2">
                <UiSelect v-model="merch.size">
                  <UiSelectTrigger placeholder="Select size" />
                  <UiSelectContent>
                    <UiSelectGroup>
                      <UiSelectItem value="S">Small (S)</UiSelectItem>
                      <UiSelectItem value="M">Medium (M)</UiSelectItem>
                      <UiSelectItem value="L">Large (L)</UiSelectItem>
                      <UiSelectItem value="XL">Extra Large (XL)</UiSelectItem>
                      <UiSelectItem value="XXL"
                        >Double Extra Large (XXL)</UiSelectItem
                      >
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
              </div>
            </div>

            <!-- Optional questions -->
            <div class="mt-4">
              <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                >Optional</UiLabel
              >
              <UiInput
                v-model="optional.startYear"
                placeholder="What year did you start swing dancing?"
                type="number"
              />
              <div class="mt-2">
                <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                  >How are you travelling?</UiLabel
                >
                <UiSelect v-model="optional.travelMethod">
                  <UiSelectTrigger placeholder="Select an option" />
                  <UiSelectContent>
                    <UiSelectGroup>
                      <UiSelectItem value="over-land"
                        >I travel over land</UiSelectItem
                      >
                      <UiSelectItem value="would-normally-fly"
                        >Normally I'd fly but coming by land</UiSelectItem
                      >
                      <UiSelectItem value="by-plane"
                        >I will come by plane</UiSelectItem
                      >
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <div class="mt-2">
                <UiLabel class="font-lazy mb-1 block text-sm font-medium"
                  >Community engagement (select any)</UiLabel
                >
                <div class="grid gap-2">
                  <label
                    ><input
                      type="checkbox"
                      value="hosted"
                      v-model="optional.community"
                    />
                    I have hosted dancers</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="organiser"
                      v-model="optional.community"
                    />
                    I organise dance events</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="dj"
                      v-model="optional.community"
                    />
                    I am a DJ</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="motivator"
                      v-model="optional.community"
                    />
                    I motivate people to attend socials</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="volunteer"
                      v-model="optional.community"
                    />
                    I volunteer at events</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="communicator"
                      v-model="optional.community"
                    />
                    I communicate dance opportunities</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="teacher"
                      v-model="optional.community"
                    />
                    I teach or facilitate dance content</label
                  >
                  <label
                    ><input
                      type="checkbox"
                      value="multiple"
                      v-model="optional.community"
                    />
                    I take on multiple roles
                  </label>
                  <label
                    ><input
                      type="checkbox"
                      value="not-yet"
                      v-model="optional.community"
                    />
                    I do not take an active role (yet)</label
                  >
                </div>
              </div>
            </div>
          </UiCardContent>
        </UiCard>

        <UiCard class="sticky top-20 self-start">
          <UiCardContent class="grid space-y-3">
            <!-- Error -->
            <p v-if="error" class="text-red-500">{{ error }}</p>

            <!-- Required personal details -->
            <div class="grid grid-cols-2 gap-3">
              <UiInput v-model="firstName" placeholder="First name" />
              <UiInput v-model="surname" placeholder="Surname" />
            </div>

            <UiInput v-model="pronouns" placeholder="Pronouns (optional)" />
            <UiInput v-model="email" placeholder="Email" type="email" />
            <UiInput v-model="city" placeholder="City, Country" />

            <UiInput
              v-model="friendName"
              placeholder="Name of 1 friend to be in same track (optional)"
            />

            <!-- Stripe card element -->
            <div ref="cardEl" class="rounded border p-3"></div>

            <!-- Terms -->
            <div class="mt-8">
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="termsAccepted" />
                <span>I accept the Terms & Conditions</span>
              </label>
            </div>

            <div class="text-right">
              <UiButton
                v-if="chosenTicket?.price"
                :disabled="processing || !termsAccepted"
                type="submit"
                class="btn"
              >
                {{
                  processing
                    ? "Processing…"
                    : chosenTicket
                      ? `Pay £${totalPrice}`
                      : "Please select a pass type"
                }}
              </UiButton>
              <!-- Badges -->
              <div class="flex items-center gap-2">
                <!-- Pass Type Badge -->
                <UiTooltip v-if="chosenTicket?.name">
                  <UiTooltipTrigger as-child>
                    <div
                      class="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-full"
                    >
                      <Icon
                        v-if="chosenTicket?.name === 'Full'"
                        name="lucide:ticket"
                        class="size-5"
                      />
                      <Icon v-else name="lucide:party-popper" class="size-5" />
                    </div>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>Pass: {{ chosenTicket?.name || chosenTicket }}</p>
                  </UiTooltipContent>
                </UiTooltip>

                <!-- Donation Badge -->
                <UiTooltip
                  v-if="payItForward.type === 'donate' && payItForward.amount"
                >
                  <UiTooltipTrigger as-child>
                    <div
                      class="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    >
                      <Icon name="lucide:gift" class="size-5" />
                    </div>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>Donating £{{ payItForward.amount }}</p>
                  </UiTooltipContent>
                </UiTooltip>

                <!-- Volunteer Badge -->
                <!-- <UiTooltip v-if="attendee.volunteering">
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
                </UiTooltip> -->

                <!-- Host Badge -->
                <UiTooltip v-if="hosting === 'i-can-host'">
                  <UiTooltipTrigger as-child>
                    <div
                      class="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      <Icon name="lucide:home" class="size-5" />
                    </div>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>Super host!</p>
                  </UiTooltipContent>
                </UiTooltip>

                <UiTooltip v-if="isMusician && musicianInstrument">
                  <UiTooltipTrigger as-child>
                    <div
                      class="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    >
                      <Icon name="lucide:piano" class="size-5" />
                    </div>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>{{ musicianInstrument }}</p>
                  </UiTooltipContent>
                </UiTooltip>

                <UiTooltip v-if="merch.want">
                  <UiTooltipTrigger as-child>
                    <div
                      class="flex size-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                    >
                      <Icon name="lucide:shirt" class="size-5" />
                    </div>
                  </UiTooltipTrigger>
                  <UiTooltipContent>
                    <p>
                      Merch: T-shirt ({{ merch.size || "no size selected" }})
                    </p>
                  </UiTooltipContent>
                </UiTooltip>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </form>
  </div>
</template>

<style scoped>
.font-lazy {
  font-family: "lazy_dog", sans-serif;
  font-size: 1.4rem;
}
</style>
