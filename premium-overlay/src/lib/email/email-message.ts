type EmailMessage = Readonly<{
  subject: string;
  html: string;
  text: string;
}>;

export type { EmailMessage };
