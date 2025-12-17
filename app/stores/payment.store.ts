import { defineStore } from "pinia";

export const usePaymentStore = defineStore("payment", () => {
  const exampleValue = ref("example");

  const ticketTypes = [
    {
      name: "Full",
      price: 200,
    },
    {
      name: "Party",
      price: 120,
    },
  ];

  // Persist and hydrate from localStorage after mount to survive reloads.
  // Default the chosen ticket to the 'Full' ticket when no value exists.
  const chosenTicket = useLocalStorage("chosen-ticket", ticketTypes[0], {
    initOnMounted: true,
  });

  const payItForwardAmount = useLocalStorage("pay-it-forward-amount", 0, {
    initOnMounted: true,
  });

  const registrationData = useLocalStorage(
    "registration-data",
    {},
    {
      initOnMounted: true,
    }
  );

  const setChosenTicket = (ticket: string | null) => {
    if (ticket === null) {
      chosenTicket.value = null;
      return;
    }
    const foundTicket = ticketTypes.find((t) => t.name === ticket);
    if (!foundTicket) {
      throw new Error(`Ticket type "${ticket}" not found`);
    }
    console.log(
      `Chosen ticket set to: ${foundTicket.name} at £${foundTicket.price}`
    );
    chosenTicket.value = foundTicket;
  };

  const setPayItForward = (amount: number) => {
    registrationData.value = {
      ...registrationData.value,
      payItForward: amount,
    };
    payItForwardAmount.value = amount;
  };

  const setRegistrationData = (data: Record<string, any>) => {
    registrationData.value = { ...registrationData.value, ...data };
  };

  return {
    chosenTicket,
    exampleValue,
    payItForwardAmount,
    setChosenTicket,
    setPayItForward,
    ticketTypes,
    registrationData,
    setRegistrationData,
  };
});
