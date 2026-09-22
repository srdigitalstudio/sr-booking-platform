"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Search,
  UserRound,
} from "lucide-react";

import { DeleteStaffButton } from "@/components/dashboard/DeleteStaffButton";
import { EditStaffDialog } from "@/components/dashboard/EditStaffDialog";
import {
  StaffFormValues,
} from "@/components/dashboard/StaffForm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Staff = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  appointments: {
    id: string;
  }[];
};

type StaffTableProps = {
  staff: Staff[];
  onUpdate: (
    id: string,
    values: StaffFormValues
  ) => void | Promise<void>;
};

export function StaffTable({
  staff,
  onUpdate,
}: StaffTableProps) {
  const [search, setSearch] = useState("");

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return staff;
    }

    return staff.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.phone?.toLowerCase().includes(query)
      );
    });
  }, [staff, search]);

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
              placeholder="Search staff..."
              aria-label="Search staff"
              className="pl-10"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {filteredStaff.length}{" "}
              {filteredStaff.length === 1
                ? "staff member"
                : "staff members"}
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

        {filteredStaff.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <UserRound
                className="h-7 w-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-base font-semibold text-card-foreground">
              {search
                ? "No staff found"
                : "No staff yet"}
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {search
                ? "Try a different name, email, or phone number."
                : "Add your first staff member to start managing your team."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">
                    Staff
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Contact
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Status
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
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                          {member.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-card-foreground">
                            {member.name}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Staff member
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1.5 text-sm">
                        {member.email ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />

                            <span className="truncate">
                              {member.email}
                            </span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            No email
                          </div>
                        )}

                        {member.phone ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone
                              className="h-4 w-4 shrink-0"
                              aria-hidden="true"
                            />

                            <span>
                              {member.phone}
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
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          member.active
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {member.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {member.appointments.length}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-1">
                        <EditStaffDialog
                          staff={{
                            id: member.id,
                            name: member.name,
                            email: member.email,
                            phone: member.phone,
                            active: member.active,
                          }}
                          onSubmit={onUpdate}
                        />

                        <DeleteStaffButton
                          staffId={member.id}
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