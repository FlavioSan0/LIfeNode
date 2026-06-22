"use client";

import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const NONE_VALUE = "__none";

type Option = {
  value: string;
  label: string;
  hint?: string | null;
  color?: string | null;
};

export function FieldErrorMessage({ error }: { error?: FieldError | string }) {
  const message = typeof error === "string" ? error : error?.message;
  if (!message) return null;

  return <p className="text-xs text-life-red">{message}</p>;
}

export function FieldShell({
  label,
  children,
  error,
  className
}: {
  label: string;
  children: React.ReactNode;
  error?: FieldError | string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
      <FieldErrorMessage error={error} />
    </div>
  );
}

export function OptionSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Selecionar",
  error,
  allowNone = true,
  className
}: {
  label: string;
  value?: string;
  onValueChange: (value: string | undefined) => void;
  options: Option[];
  placeholder?: string;
  error?: FieldError | string;
  allowNone?: boolean;
  className?: string;
}) {
  return (
    <FieldShell label={label} error={error} className={className}>
      <Select
        value={value ?? NONE_VALUE}
        onValueChange={(nextValue) => onValueChange(nextValue === NONE_VALUE ? undefined : nextValue)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allowNone ? <SelectItem value={NONE_VALUE}>Nenhum</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="inline-flex items-center gap-2">
                {option.color ? (
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                ) : null}
                <span>{option.label}</span>
                {option.hint ? <span className="text-life-muted">({option.hint})</span> : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}
