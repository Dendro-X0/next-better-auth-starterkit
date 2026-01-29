"use client";

import { cn } from "@/lib/utils/utils";

interface FieldMessageProps {
  messages?: string | string[];
  className?: string;
}

export function FieldMessage({ messages, className }: FieldMessageProps) {
  if (!messages) {
    return null;
  }

  const messageArray = Array.isArray(messages) ? messages : [messages];

  if (messageArray.length === 0) {
    return null;
  }

  return (
    <div className={cn("text-sm font-medium text-destructive", className)}>
      {messageArray.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  );
}
