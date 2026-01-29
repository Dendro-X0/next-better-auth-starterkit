type EmailSendRequest = Readonly<{
  to: string;
  subject: string;
  html: string;
  text?: string;
}>;

export type { EmailSendRequest };
