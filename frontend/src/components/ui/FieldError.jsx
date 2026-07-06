import React from "react";

/**
 * <FieldError> — inline, screen-reader-announced validation message.
 * Pair with an input via `aria-describedby={id}` and `aria-invalid={!!message}`.
 */
export default function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}
