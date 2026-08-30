"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Search,
  UserRound,
} from "lucide-react";

import { EditCustomerDialog } from "@/components/dashboard/EditCustomerDialog";
import { DeleteCustomerButton } from "@/components/dashboard/DeleteCustomerButton";
import { CustomerFormValues } from "@/components/dashboard/CustomerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  appointments: {
    id: string;
  }[];
};

type CustomersTableProps = {
  customers: Customer[];
  onUpdate: (
    id: string,
    values: CustomerFormValues
  ) => void | Promise<void>;
};

export function CustomersTable({
  customers,
  onUpdate,
}: CustomersTableProps) {
  const [search, setSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    });
  }, [customers, search]);

  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-md">
      <CardContent className="p-0">
        <div className="border-b border-border p-4 sm:p-6">
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customers..."
              aria-label="Search customers"
              className="pl-10"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1
                ? "customer"
                : "customers"}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-sm font-medium text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <UserRound
                className="h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-card-foreground">
              {search
                ? "No customers found"
                : "No customers yet"}
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {search
                ? "Try a different name, email, or phone number."
                : "Add your first customer to start managing your bookings."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">
                    Customer
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Contact
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Appointments
                  </th>

                  <th className="px-6 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          {customer.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-card-foreground">
                            {customer.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Customer
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1.5 text-sm">
                        {customer.email ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />

                            <span className="truncate">
                              {customer.email}
                            </span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            No email
                          </div>
                        )}

                        {customer.phone ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />

                            <span>
                              {customer.phone}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            No phone
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {customer.appointments.length}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-1">
                        <EditCustomerDialog
                          customer={{
                            id: customer.id,
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                          }}
                          onSubmit={onUpdate}
                        />

                        <DeleteCustomerButton
                          customerId={customer.id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}