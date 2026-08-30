"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Check,
  ChevronRight,
  CircleAlert,
  Globe,
  RotateCcw,
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

const appointmentStatusOptions: {
  value: AppointmentStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "PENDING",
    label: "Pending",
    description: "New bookings wait for confirmation.",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
    description: "New bookings are confirmed automatically.",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "New bookings start as completed.",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "New bookings start as cancelled.",
  },
];

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}

function SectionIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
      {children}
    </div>
  );
}

function SettingSwitch({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-5 rounded-2xl border bg-background p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [savedSettings, setSavedSettings] =
    useState<SettingsData>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => null);

          throw new Error(
            data?.error || "Failed to load settings."
          );
        }

        const data =
          (await response.json()) as SettingsData;

        setSettings(data);
        setSavedSettings(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load settings."
        );
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

  function handleReset() {
    setSettings(savedSettings);
    setMessage("");
    setError("");
  }

  async function handleSave() {
    if (saving || !hasChanges) {
      return;
    }

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

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to save settings."
        );
      }

      const updatedSettings =
        data as SettingsData;

      setSettings(updatedSettings);
      setSavedSettings(updatedSettings);
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
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span>Dashboard</span>
            <ChevronRight className="h-4 w-4" />
            <span>Settings</span>
          </div>

          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Configure your business, booking workflow,
              notifications, and regional preferences.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasChanges && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="gap-2 bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save state */}
      {(message || error || hasChanges) && (
        <div
          className={`flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
            error
              ? "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20"
              : message
                ? "border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20"
                : "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20"
          }`}
        >
          <div className="flex items-start gap-3">
            {error ? (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            ) : message ? (
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            )}

            <div>
              <p
                className={`text-sm font-semibold ${
                  error
                    ? "text-red-700 dark:text-red-400"
                    : message
                      ? "text-green-700 dark:text-green-400"
                      : "text-blue-700 dark:text-blue-400"
                }`}
              >
                {error
                  ? "Something went wrong"
                  : message
                    ? "All changes are saved"
                    : "You have unsaved changes"}
              </p>

              <p
                className={`mt-1 text-xs ${
                  error
                    ? "text-red-600/80 dark:text-red-400/80"
                    : message
                      ? "text-green-600/80 dark:text-green-400/80"
                      : "text-blue-600/80 dark:text-blue-400/80"
                }`}
              >
                {error ||
                  message ||
                  "Save your changes before leaving this page."}
              </p>
            </div>
          </div>

          {hasChanges && !error && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
            >
              {saving ? "Saving..." : "Save now"}
            </Button>
          )}
        </div>
      )}

      {/* Settings grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business */}
        <Card className="overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-start gap-4">
              <SectionIcon>
                <Building2 className="h-5 w-5" />
              </SectionIcon>

              <div className="min-w-0">
                <CardTitle className="text-lg">
                  Business Information
                </CardTitle>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Keep your business identity clear and
                  consistent across the platform.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <label
                htmlFor="business-name"
                className="text-sm font-semibold"
              >
                Business name
              </label>

              <Input
                id="business-name"
                value={settings.businessName}
                onChange={(event) =>
                  updateSettings({
                    businessName: event.target.value,
                  })
                }
                placeholder="Enter your business name"
                className="h-11 rounded-xl"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                This is the primary name of your business.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="business-type"
                className="text-sm font-semibold"
              >
                Business type
              </label>

              <Input
                id="business-type"
                value={settings.businessType}
                onChange={(event) =>
                  updateSettings({
                    businessType: event.target.value,
                  })
                }
                placeholder="e.g. Clinic, Salon, Consultant"
                className="h-11 rounded-xl"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Describe the type of service your business
                provides.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking */}
        <Card className="overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-start gap-4">
              <SectionIcon>
                <Settings className="h-5 w-5" />
              </SectionIcon>

              <div className="min-w-0">
                <CardTitle className="text-lg">
                  Booking Settings
                </CardTitle>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Control how your appointment booking
                  workflow behaves.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <SettingSwitch
              checked={settings.bookingEnabled}
              onChange={(checked) =>
                updateSettings({
                  bookingEnabled: checked,
                })
              }
              title={
                settings.bookingEnabled
                  ? "Bookings are enabled"
                  : "Bookings are disabled"
              }
              description={
                settings.bookingEnabled
                  ? "Customers can currently create new appointments."
                  : "New appointments are currently blocked."
              }
            />

            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="mb-4">
                <label
                  htmlFor="default-status"
                  className="text-sm font-semibold"
                >
                  Default appointment status
                </label>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Choose the status assigned to newly created
                  appointments.
                </p>
              </div>

              <select
                id="default-status"
                value={settings.defaultAppointmentStatus}
                onChange={(event) =>
                  updateSettings({
                    defaultAppointmentStatus:
                      event.target.value as AppointmentStatus,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-background px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-500"
              >
                {appointmentStatusOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {
                  appointmentStatusOptions.find(
                    (option) =>
                      option.value ===
                      settings.defaultAppointmentStatus
                  )?.description
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-start gap-4">
              <SectionIcon>
                <Bell className="h-5 w-5" />
              </SectionIcon>

              <div className="min-w-0">
                <CardTitle className="text-lg">
                  Notifications
                </CardTitle>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Manage how booking activity notifications
                  are handled.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-6">
            <SettingSwitch
              checked={settings.bookingNotifications}
              onChange={(checked) =>
                updateSettings({
                  bookingNotifications: checked,
                })
              }
              title="Booking notifications"
              description="Receive notifications when a new booking is created."
            />

            <SettingSwitch
              checked={settings.customerNotifications}
              onChange={(checked) =>
                updateSettings({
                  customerNotifications: checked,
                })
              }
              title="Customer notifications"
              description="Enable notifications related to customer booking updates."
            />

            <div className="rounded-2xl border border-dashed bg-muted/20 p-4">
              <div className="flex gap-3">
                <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">
                    Notification preferences
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    These settings control the notification
                    preferences currently supported by your
                    booking platform.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Region */}
        <Card className="overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-start gap-4">
              <SectionIcon>
                <Globe className="h-5 w-5" />
              </SectionIcon>

              <div className="min-w-0">
                <CardTitle className="text-lg">
                  Language & Region
                </CardTitle>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Choose the language and currency used by
                  your platform.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <label
                htmlFor="language"
                className="text-sm font-semibold"
              >
                Language
              </label>

              <select
                id="language"
                value={settings.language}
                onChange={(event) =>
                  updateSettings({
                    language: event.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-background px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-500"
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

              <p className="text-xs leading-5 text-muted-foreground">
                Select the primary language for your
                platform.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="currency"
                className="text-sm font-semibold"
              >
                Currency
              </label>

              <select
                id="currency"
                value={settings.currency}
                onChange={(event) =>
                  updateSettings({
                    currency: event.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-background px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-blue-500"
              >
                <option value="USD">
                  USD — US Dollar
                </option>

                <option value="EUR">
                  EUR — Euro
                </option>

                <option value="AFN">
                  AFN — Afghan Afghani
                </option>
              </select>

              <p className="text-xs leading-5 text-muted-foreground">
                Used when displaying prices throughout the
                booking platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col gap-4 rounded-2xl border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              {hasChanges
                ? "You have unsaved changes"
                : "Everything is up to date"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {hasChanges
                ? "Save your changes to apply the new configuration."
                : "Your settings are synchronized with the server."}
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={saving}
                className="flex-1 gap-2 sm:flex-none"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1 gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:flex-none"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}