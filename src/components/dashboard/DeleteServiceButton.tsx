"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteServiceButtonProps = {
  serviceId: string;
};

export function DeleteServiceButton({
  serviceId,
}: DeleteServiceButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function handleOpen() {
    setError("");
    setOpen(true);
  }

  function handleClose() {
    if (deleting) {
      return;
    }

    setOpen(false);
    setError("");
  }

  async function handleDelete() {
    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        "/api/services",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: serviceId,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Failed to delete service.";

        try {
          const data =
            await response.json();

          if (
            data &&
            typeof data.error === "string"
          ) {
            message = data.error;
          }
        } catch {
          // Ignore invalid JSON responses.
        }

        throw new Error(message);
      }

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to delete service:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete service. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        disabled={deleting}
        aria-label="Delete service"
        title="Delete service"
        className="h-9 w-9 rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        <Trash2
          className="h-4 w-4"
          aria-hidden="true"
        />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleClose();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            aria-describedby="delete-service-description"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  <AlertTriangle
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2
                    id="delete-service-title"
                    className="text-base font-semibold text-foreground"
                  >
                    Delete service
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={deleting}
                aria-label="Close dialog"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p
                id="delete-service-description"
                className="text-sm leading-6 text-muted-foreground"
              >
                Are you sure you want to delete this
                service? Any existing bookings associated
                with this service may also be affected.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                >
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={deleting}
                className="w-full rounded-xl sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full rounded-xl sm:w-auto"
              >
                {deleting ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Delete service
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}