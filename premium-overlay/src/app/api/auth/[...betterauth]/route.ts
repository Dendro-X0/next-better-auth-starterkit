import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Ensure Node.js runtime for compatibility with nodemailer and react-dom/server
export const runtime = "nodejs";

export const { POST, GET } = toNextJsHandler(auth);
