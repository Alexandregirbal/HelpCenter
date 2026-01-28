type CalendarEvent = {
  kind: "opening" | "appointment";
  starts_at: Date;
  ends_at: Date;
};

const getMockedEvents = (dateFrom: Date, count = 100): Array<CalendarEvent> => {
  return [
    {
      kind: "opening",
      starts_at: new Date("2026-01-26T09:00:00Z"),
      ends_at: new Date("2026-01-26T18:00:00Z"),
    },
    {
      kind: "appointment",
      starts_at: new Date("2026-01-26T10:00:00Z"),
      ends_at: new Date("2026-01-26T18:00:00Z"),
    },
    {
      kind: "opening",
      starts_at: new Date("2026-01-28T09:00:00Z"),
      ends_at: new Date("2026-01-28T18:00:00Z"),
    },
    {
      kind: "appointment",
      starts_at: new Date("2026-01-28T09:00:00Z"),
      ends_at: new Date("2026-01-28T13:00:00Z"),
    },
    {
      kind: "opening",
      starts_at: new Date("2026-01-29T09:00:00Z"),
      ends_at: new Date("2026-01-29T18:00:00Z"),
    },
    {
      kind: "appointment",
      starts_at: new Date("2026-01-29T10:00:00Z"),
      ends_at: new Date("2026-01-29T18:00:00Z"),
    },
    {
      kind: "opening",
      starts_at: new Date("2027-01-29T09:00:00Z"),
      ends_at: new Date("2027-01-29T18:00:00Z"),
    },
  ];
};

/**
 * @example
 * daysBetween(new Date("2026-01-26"), new Date("2026-01-28"))
 * -> 2
 */
const daysBetween = (date1: Date, date2: Date): number => {
  const millisecondsInOneDay = 24 * 60 * 60 * 1000;

  const diffInTime = date2.getTime() - date1.getTime();

  return Math.round(diffInTime / millisecondsInOneDay);
};

/**
 * @example
 * formatTimeToString(new Date("2026-01-26T12:30:00Z"))
 * -> "12:30"
 */
const formatTimeToString = (datetime: Date): string => {
  return datetime.toISOString().split("T")[1].split(":00.000Z")[0];
};

/**
 * @example
 * chunkEventIntoTimeSlots({starts_at: "2026-01-26T12:30:00Z", ends_at: "2026-01-26T14:00:00Z"})
 * -> ["12:30", "13:00", "13:30"]
 */
const chunkEventIntoTimeSlots = (
  event: Pick<CalendarEvent, "starts_at" | "ends_at">,
  slotTimeMinutes: number = 30
): Array<string> => {
  const result = [formatTimeToString(event.starts_at)];
  const maxNumberofSlotsInADay = 24 * 2;
  let count = 0;
  // We consider that inputs are stable on the 30th minute (12:00 or 12:30, etc)
  while (
    count <= maxNumberofSlotsInADay &&
    result[result.length - 1] !== formatTimeToString(event.ends_at)
  ) {
    count++;
    const [hours, minutes] = result[result.length - 1].split(":").map(Number);

    const nextSlot = new Date(event.starts_at);
    nextSlot.setUTCHours(hours, minutes + slotTimeMinutes);

    if (
      formatTimeToString(new Date(nextSlot)) ===
      formatTimeToString(event.ends_at)
    )
      break;

    result.push(formatTimeToString(new Date(nextSlot)));
  }

  return result;
};

const getAvailableSlots = (
  dateFrom: Date,
  daysRange = 7
): Record<string, Set<string>> => {
  const [openingEvents, appointmentEvents] = getMockedEvents(dateFrom).reduce(
    (acc, event) => {
      if (daysBetween(dateFrom, event.starts_at) > daysRange) return acc;

      if (event.kind === "opening") {
        acc[0].push(event);
      } else {
        acc[1].push(event);
      }
      return acc;
    },
    [[], []] as Array<Array<CalendarEvent>>
  );

  console.log(`${openingEvents.length} opening events`);
  console.log(`${appointmentEvents.length} appointment events`);

  const availableSlots: Record<string, Set<string>> = {};
  for (const event of [...openingEvents, ...appointmentEvents]) {
    // We consider an event unit is limited by its day (cannot overlap 2 days)
    const [eventDateString] = event.starts_at.toISOString().split("T");

    const eventTimeSlots = chunkEventIntoTimeSlots(event, 30);

    const targetDay = availableSlots[eventDateString];
    if (!targetDay) {
      if (event.kind === "opening") {
        availableSlots[eventDateString] = new Set(eventTimeSlots);
      }
    } else {
      if (event.kind === "opening") {
        eventTimeSlots.forEach((item) => targetDay.add(item));
      } else if (event.kind === "appointment") {
        eventTimeSlots.forEach((item) => targetDay.delete(item));
      }
    }
  }

  return availableSlots;
};

const formatAvailableSlots = (
  input: Record<string, Set<string>>
): Record<string, Array<string>> => {
  const result: Record<string, Array<string>> = {};
  for (const [date, slotsSet] of Object.entries(input)) {
    result[date] = Array.from(slotsSet).sort();
  }
  return result;
};

// RUN //

const result = formatAvailableSlots(getAvailableSlots(new Date()));
console.log(`RESULT:\n`, result);
