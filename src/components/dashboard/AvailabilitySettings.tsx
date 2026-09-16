"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

type BusinessHour = {
  id: string;
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

type BusinessBreak = {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  label: string | null;
};

type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
};

type BreakDraft = {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  label: string;
};

const DAYS: Array<{
  value: DayOfWeek;
  label: string;
}> = [
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isTimeRangeValid(start: string, end: string) {
  return isValidTime(start) && isValidTime(end) && start < end;
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getDayLabel(day: DayOfWeek) {
  return DAYS.find((item) => item.value === day)?.label ?? day;
}

async function getErrorMessage(
  response: Response,
  fallback: string
) {
  const data = await response.json().catch(() => null);

  return data?.error || fallback;
}

export function AvailabilitySettings() {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [breaks, setBreaks] = useState<BusinessBreak[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState<DayOfWeek | null>(null);
  const [savingBreak, setSavingBreak] = useState(false);
  const [savingBlockedDate, setSavingBlockedDate] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [breakDraft, setBreakDraft] = useState<BreakDraft>({
    dayOfWeek: "SATURDAY",
    startTime: "13:00",
    endTime: "14:00",
    label: "",
  });

  const [blockedDate, setBlockedDate] = useState("");
  const [blockedReason, setBlockedReason] = useState("");

  const hoursByDay = useMemo(() => {
    return new Map(
      hours.map((hour) => [hour.dayOfWeek, hour])
    );
  }, [hours]);

  useEffect(() => {
    let cancelled = false;

    async function initializeAvailability() {
      try {
        setLoading(true);
        setError("");

        const [
          hoursResponse,
          breaksResponse,
          blockedResponse,
        ] = await Promise.all([
          fetch("/api/business-hours"),
          fetch("/api/business-breaks"),
          fetch("/api/blocked-dates"),
        ]);

        if (!hoursResponse.ok) {
          throw new Error(
            await getErrorMessage(
              hoursResponse,
              "Failed to load business hours."
            )
          );
        }

        if (!breaksResponse.ok) {
          throw new Error(
            await getErrorMessage(
              breaksResponse,
              "Failed to load business breaks."
            )
          );
        }

        if (!blockedResponse.ok) {
          throw new Error(
            await getErrorMessage(
              blockedResponse,
              "Failed to load blocked dates."
            )
          );
        }

        const [
          hoursData,
          breaksData,
          blockedData,
        ] = await Promise.all([
          hoursResponse.json(),
          breaksResponse.json(),
          blockedResponse.json(),
        ]);

        if (cancelled) {
          return;
        }

        setHours(hoursData as BusinessHour[]);
        setBreaks(breaksData as BusinessBreak[]);
        setBlockedDates(blockedData as BlockedDate[]);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load availability settings."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializeAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  async function saveBusinessHour(
    dayOfWeek: DayOfWeek,
    values: {
      isOpen: boolean;
      startTime: string;
      endTime: string;
    }
  ) {
    try {
      setSavingDay(dayOfWeek);
      clearFeedback();

      if (
        values.isOpen &&
        !isTimeRangeValid(
          values.startTime,
          values.endTime
        )
      ) {
        throw new Error(
          "Opening time must be earlier than closing time."
        );
      }

      const existing = hoursByDay.get(dayOfWeek);

      const response = await fetch("/api/business-hours", {
        method: existing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dayOfWeek,
          isOpen: values.isOpen,
          startTime: values.startTime,
          endTime: values.endTime,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to save business hours."
          )
        );
      }

      const saved = (await response.json()) as BusinessHour;

      setHours((current) => {
        const exists = current.some(
          (item) => item.dayOfWeek === dayOfWeek
        );

        if (!exists) {
          return [...current, saved];
        }

        return current.map((item) =>
          item.dayOfWeek === dayOfWeek
            ? saved
            : item
        );
      });

      setMessage(
        `${getDayLabel(dayOfWeek)} hours saved.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save business hours."
      );
    } finally {
      setSavingDay(null);
    }
  }

  async function deleteBreak(id: string) {
    try {
      clearFeedback();

      const response = await fetch(
        "/api/business-breaks",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to delete break."
          )
        );
      }

      setBreaks((current) =>
        current.filter((item) => item.id !== id)
      );

      setMessage("Break removed successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete break."
      );
    }
  }

  async function addBreak() {
    try {
      setSavingBreak(true);
      clearFeedback();

      if (
        !isTimeRangeValid(
          breakDraft.startTime,
          breakDraft.endTime
        )
      ) {
        throw new Error(
          "Break start time must be earlier than end time."
        );
      }

      const response = await fetch(
        "/api/business-breaks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dayOfWeek: breakDraft.dayOfWeek,
            startTime: breakDraft.startTime,
            endTime: breakDraft.endTime,
            label: breakDraft.label.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to add break."
          )
        );
      }

      const created =
        (await response.json()) as BusinessBreak;

      setBreaks((current) =>
        [...current, created].sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek) {
            return (
              DAYS.findIndex(
                (item) => item.value === a.dayOfWeek
              ) -
              DAYS.findIndex(
                (item) => item.value === b.dayOfWeek
              )
            );
          }

          return a.startTime.localeCompare(
            b.startTime
          );
        })
      );

      setBreakDraft({
        dayOfWeek: breakDraft.dayOfWeek,
        startTime: "13:00",
        endTime: "14:00",
        label: "",
      });

      setMessage("Break added successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add break."
      );
    } finally {
      setSavingBreak(false);
    }
  }

  async function addBlockedDate() {
    try {
      setSavingBlockedDate(true);
      clearFeedback();

      if (!blockedDate) {
        throw new Error("Please select a date.");
      }

      const response = await fetch(
        "/api/blocked-dates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: blockedDate,
            reason: blockedReason.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to block date."
          )
        );
      }

      const created =
        (await response.json()) as BlockedDate;

      setBlockedDates((current) =>
        [...current, created].sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      );

      setBlockedDate("");
      setBlockedReason("");

      setMessage("Date blocked successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to block date."
      );
    } finally {
      setSavingBlockedDate(false);
    }
  }

  async function deleteBlockedDate(id: string) {
    try {
      clearFeedback();

      const response = await fetch(
        "/api/blocked-dates",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to remove blocked date."
          )
        );
      }

      setBlockedDates((current) =>
        current.filter((item) => item.id !== id)
      );

      setMessage("Blocked date removed.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove blocked date."
      );
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border-border bg-card shadow-md">
        <CardContent className="flex min-h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading availability...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div
          className={
            message
              ? "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400"
              : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
          }
        >
          {message || error}
        </div>
      )}

      <Card className="rounded-2xl border-border bg-card shadow-md">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
              <Clock3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <CardTitle>
                Business Hours
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Set the weekly hours when customers can
                book appointments.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {DAYS.map((day) => {
            const existing = hoursByDay.get(
              day.value
            );

            const isOpen = existing?.isOpen ?? false;
            const startTime =
              existing?.startTime ?? DEFAULT_START;
            const endTime =
              existing?.endTime ?? DEFAULT_END;

            return (
              <div
                key={day.value}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      saveBusinessHour(day.value, {
                        isOpen: !isOpen,
                        startTime,
                        endTime,
                      })
                    }
                    disabled={
                      savingDay === day.value
                    }
                    className={
                      isOpen
                        ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 transition hover:bg-green-200 disabled:opacity-50 dark:bg-green-950 dark:text-green-400"
                        : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 disabled:opacity-50"
                    }
                    aria-label={
                      isOpen
                        ? `Close ${day.label}`
                        : `Open ${day.label}`
                    }
                  >
                    {savingDay === day.value ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isOpen ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>

                  <div>
                    <p className="font-medium">
                      {day.label}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {isOpen ? "Open" : "Closed"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={startTime}
                      disabled={
                        !isOpen ||
                        savingDay === day.value
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setHours((current) => {
                          const existingHour =
                            current.find(
                              (hour) =>
                                hour.dayOfWeek ===
                                day.value
                            );

                          if (!existingHour) {
                            return current;
                          }

                          return current.map(
                            (hour) =>
                              hour.dayOfWeek ===
                              day.value
                                ? {
                                    ...hour,
                                    startTime:
                                      nextValue,
                                  }
                                : hour
                          );
                        });
                      }}
                      onBlur={(event) =>
                        saveBusinessHour(
                          day.value,
                          {
                            isOpen,
                            startTime:
                              event.target.value,
                            endTime,
                          }
                        )
                      }
                      className="w-full sm:w-32"
                    />

                    <span className="text-sm text-muted-foreground">
                      to
                    </span>

                    <Input
                      type="time"
                      value={endTime}
                      disabled={
                        !isOpen ||
                        savingDay === day.value
                      }
                      onChange={(event) => {
                        const nextValue =
                          event.target.value;

                        setHours((current) => {
                          const existingHour =
                            current.find(
                              (hour) =>
                                hour.dayOfWeek ===
                                day.value
                            );

                          if (!existingHour) {
                            return current;
                          }

                          return current.map(
                            (hour) =>
                              hour.dayOfWeek ===
                              day.value
                                ? {
                                    ...hour,
                                    endTime: nextValue,
                                  }
                                : hour
                          );
                        });
                      }}
                      onBlur={(event) =>
                        saveBusinessHour(
                          day.value,
                          {
                            isOpen,
                            startTime,
                            endTime:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full sm:w-32"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      savingDay === day.value
                    }
                    onClick={() =>
                      saveBusinessHour(day.value, {
                        isOpen,
                        startTime,
                        endTime,
                      })
                    }
                    className="gap-2"
                  >
                    {savingDay === day.value ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}

                    Save
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-card shadow-md">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950">
              <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>

            <div>
              <CardTitle>Breaks</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Add breaks during business hours when
                appointments should not be available.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border p-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Day
              </label>

              <select
                value={breakDraft.dayOfWeek}
                onChange={(event) =>
                  setBreakDraft((current) => ({
                    ...current,
                    dayOfWeek:
                      event.target.value as DayOfWeek,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-background px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700"
              >
                {DAYS.map((day) => (
                  <option
                    key={day.value}
                    value={day.value}
                  >
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Start
              </label>

              <Input
                type="time"
                value={breakDraft.startTime}
                onChange={(event) =>
                  setBreakDraft((current) => ({
                    ...current,
                    startTime:
                      event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                End
              </label>

              <Input
                type="time"
                value={breakDraft.endTime}
                onChange={(event) =>
                  setBreakDraft((current) => ({
                    ...current,
                    endTime:
                      event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <label className="text-sm font-medium">
                Label
              </label>

              <Input
                value={breakDraft.label}
                onChange={(event) =>
                  setBreakDraft((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                placeholder="Lunch break"
                maxLength={200}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addBreak}
                disabled={savingBreak}
                className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                {savingBreak ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                Add Break
              </Button>
            </div>
          </div>

          {breaks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center">
              <p className="font-medium">
                No breaks configured
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add a break above when you need to pause
                bookings during the day.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {breaks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                      <Clock3 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {item.label || "Break"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {getDayLabel(
                          item.dayOfWeek
                        )}{" "}
                        · {item.startTime} –{" "}
                        {item.endTime}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      deleteBreak(item.id)
                    }
                    className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-card shadow-md">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950">
              <CalendarDays className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <CardTitle>
                Blocked Dates
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Prevent customers from booking on
                specific dates.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border p-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date
              </label>

              <Input
                type="date"
                value={blockedDate}
                onChange={(event) =>
                  setBlockedDate(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">
                Reason
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={blockedReason}
                  onChange={(event) =>
                    setBlockedReason(
                      event.target.value
                    )
                  }
                  placeholder="Holiday, maintenance, personal day..."
                  maxLength={200}
                  className="flex-1"
                />

                <Button
                  type="button"
                  onClick={addBlockedDate}
                  disabled={savingBlockedDate}
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {savingBlockedDate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  Block Date
                </Button>
              </div>
            </div>
          </div>

          {blockedDates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-8 text-center">
              <p className="font-medium">
                No blocked dates
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Dates you block will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {blockedDates.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {formatDate(
                          item.date.slice(0, 10)
                        )}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {item.reason ||
                          "No reason provided"}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      deleteBlockedDate(item.id)
                    }
                    className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}