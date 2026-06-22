import { z } from "zod";

export const optionalId = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional()
);

export const optionalText = (max = 2000) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

export const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data válida.").optional()
);

export const optionalTime = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use uma hora válida.").optional()
);

export const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use uma cor hexadecimal válida.");
