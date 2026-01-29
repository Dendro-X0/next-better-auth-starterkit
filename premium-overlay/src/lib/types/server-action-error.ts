type FieldErrors = Readonly<Record<string, ReadonlyArray<string> | undefined>>;

type ServerActionError = Readonly<{
  code: "NOT_AUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "AUTH" | "UNKNOWN";
  message: string;
  fields?: FieldErrors;
}>;

export type { ServerActionError };
