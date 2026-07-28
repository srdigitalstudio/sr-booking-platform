import * as React from "react";

function Label({
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-2 block text-sm font-medium text-slate-700 ${className}`}
      {...props}
    />
  );
}

export { Label };