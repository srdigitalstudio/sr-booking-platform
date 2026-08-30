"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  DollarSign,
  Search,
  Scissors,
  X,
  XCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { EditServiceDialog } from "@/components/dashboard/EditServiceDialog";
import { DeleteServiceButton } from "@/components/dashboard/DeleteServiceButton";
import { ServiceFormValues } from "@/components/dashboard/ServiceForm";

type ServiceTableItem = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: string | number | null;
  active: boolean;
  appointments: unknown[];
};

type ServiceTableProps = {
  services: ServiceTableItem[];

  onUpdate: (
    id: string,
    values: ServiceFormValues
  ) => void | Promise<void>;
};

type ServiceFilter = "all" | "active" | "inactive";

export function ServiceTable({
  services,
  onUpdate,
}: ServiceTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ServiceFilter>("all");

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        query === "" ||
        service.name.toLowerCase().includes(query) ||
        (service.description ?? "")
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && service.active) ||
        (filter === "inactive" && !service.active);

      return matchesSearch && matchesFilter;
    });
  }, [services, search, filter]);

  const activeCount = services.filter(
    (service) => service.active
  ).length;

  const inactiveCount =
    services.length - activeCount;

  const hasFilters =
    search.trim() !== "" || filter !== "all";

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="border-b border-border bg-background px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by service name or description..."
              className="h-11 rounded-xl pl-9 pr-10"
              aria-label="Search services"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex w-full overflow-x-auto rounded-xl border border-border bg-muted/30 p-1 lg:w-auto">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
              <span className="ml-1.5 text-xs opacity-70">
                {services.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === "active"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Active

              <span className="text-xs opacity-80">
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilter("inactive")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === "inactive"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <XCircle
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Inactive

              <span className="text-xs opacity-80">
                {inactiveCount}
              </span>
            </button>
          </div>
        </div>

        {/* Filter result summary */}
        {hasFilters && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredServices.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {services.length}
              </span>{" "}
              services
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-medium text-blue-600 hover:underline dark:text-blue-400 sm:self-auto"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {filteredServices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-border bg-muted/30 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">
                  Service
                </th>

                <th className="px-6 py-4">
                  Description
                </th>

                <th className="px-6 py-4">
                  Duration
                </th>

                <th className="px-6 py-4">
                  Price
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Bookings
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/20"
                >
                  {/* Service */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                        <Scissors
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {service.name}
                        </p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Booking service
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="max-w-xs px-6 py-5">
                    <p
                      className="truncate text-sm text-muted-foreground"
                      title={
                        service.description ??
                        undefined
                      }
                    >
                      {service.description ||
                        "No description"}
                    </p>
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock3
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <span>
                        {service.duration} min
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <DollarSign
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />

                      <span>
                        {service.price !== null
                          ? `$${service.price.toString()}`
                          : "—"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        service.active
                          ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          service.active
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                        aria-hidden="true"
                      />

                      {service.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Bookings */}
                  <td className="px-6 py-5">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-muted px-2.5 py-1.5 text-sm font-semibold">
                      {service.appointments.length}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-1">
                      <EditServiceDialog
                        service={{
                          id: service.id,
                          name: service.name,
                          description:
                            service.description,
                          duration:
                            service.duration,
                          price:
                            service.price?.toString() ??
                            null,
                          active: service.active,
                        }}
                        onSubmit={onUpdate}
                      />

                      <DeleteServiceButton
                        serviceId={service.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            {hasFilters ? (
              <Search
                className="h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <Scissors
                className="h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>

          <h3 className="mt-5 text-base font-semibold">
            {hasFilters
              ? "No matching services"
              : "No services yet"}
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {hasFilters
              ? "Try changing your search or filter to find a service."
              : "Create your first service to start accepting bookings."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:underline dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}