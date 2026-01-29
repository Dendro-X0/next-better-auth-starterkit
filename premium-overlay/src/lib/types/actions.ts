export type FormState = {
  success?: boolean;
  message?: string;
  error?: {
    form?: string;
    fields?: Record<string, string[] | undefined>;
  };
  // Additional fields for specific actions
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
  [key: string]: unknown; // Allow additional dynamic properties
};
