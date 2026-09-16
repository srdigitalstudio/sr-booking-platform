"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Globe,
  Save,
  Settings,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AvailabilitySettings } from "@/components/dashboard/AvailabilitySettings";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

type SettingsData = {
  businessName: string;
  businessType: string;
  bookingEnabled: boolean;
  defaultAppointmentStatus: AppointmentStatus;
  bookingNotifications: boolean;
  customerNotifications: boolean;
  language: string;
  currency: string;
};

const defaultSettings: SettingsData = {
  businessName: "SR Booking",
  businessType: "Booking Platform",
  bookingEnabled: true,
  defaultAppointmentStatus: "PENDING",
  bookingNotifications: true,
  customerNotifications: true,
  language: "English",
  currency: "USD",
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/settings");

        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data =
          (await response.json()) as SettingsData;

        setSettings(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load settings.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateSettings(
    changes: Partial<SettingsData>
  ) {
    setSettings((current) => ({
      ...current,
      ...changes,
    }));

    setMessage("");
    setError("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json().catch(
          () => null
        );

        throw new Error(
          data?.error || "Failed to save settings"
        );
      }

      const data =
        (await response.json()) as SettingsData;

      setSettings(data);
      setMessage("Settings saved successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Manage your booking platform settings.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <CardTitle>
                  Business Information
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage your business name and basic information.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Business name
              </label>

              <Input
                value={settings.businessName}
                onChange={(event) =>
                  updateSettings({
                    businessName: event.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Business type
              </label>

              <Input
                value={settings.businessType}
                onChange={(event) =>
                  updateSettings({
                    businessType: event.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <CardTitle>
                  Booking Settings
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Configure how customers can make appointments.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">
                  Booking status
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Allow customers to create bookings.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.bookingEnabled}
                onChange={(event) =>
                  updateSettings({
                    bookingEnabled:
                      event.target.checked,
                  })
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default appointment status
              </label>

              <select
                value={settings.defaultAppointmentStatus}
                onChange={(event) =>
                  updateSettings({
                    defaultAppointmentStatus:
                      event.target.value as AppointmentStatus,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <CardTitle>
                  Notifications
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Control notifications related to your bookings.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">
                  Booking notifications
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Notify when a new booking is created.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.bookingNotifications
                }
                onChange={(event) =>
                  updateSettings({
                    bookingNotifications:
                      event.target.checked,
                  })
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">
                  Customer notifications
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Notify customers about booking updates.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  settings.customerNotifications
                }
                onChange={(event) =>
                  updateSettings({
                    customerNotifications:
                      event.target.checked,
                  })
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <CardTitle>
                  Language & Region
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage language and regional preferences.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Language
              </label>

              <select
                value={settings.language}
                onChange={(event) =>
                  updateSettings({
                    language: event.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
              >
                <option value="English">
                  English
                </option>

                <option value="Dari">
                  Dari
                </option>

                <option value="Pashto">
                  Pashto
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Currency
              </label>

              <select
                value={settings.currency}
                onChange={(event) =>
                  updateSettings({
                    currency: event.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
              >
                <option value="USD">
                  USD
                </option>

                <option value="EUR">
                  EUR
                </option>

                <option value="AFN">
                  AFN
                </option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Availability
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure your weekly schedule, breaks, and blocked
            dates.
          </p>
        </div>

        <AvailabilitySettings />
      </div>
    </div>
  );
}