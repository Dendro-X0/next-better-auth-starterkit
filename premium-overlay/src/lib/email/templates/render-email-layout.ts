type RenderEmailLayoutParams = Readonly<{ title: string; bodyHtml: string }>;

function renderEmailLayout(params: RenderEmailLayoutParams): string {
  const html: string = `<!doctype html><html><head><meta charset=\"utf-8\" /><meta name=\"viewport\" content=\"width=device-width\" /><title>${params.title}</title></head><body style=\"font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;background:#f6f7f9;padding:24px;\"><div style=\"max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;\">${params.bodyHtml}</div><div style=\"max-width:560px;margin:12px auto 0;color:#6b7280;font-size:12px;\">If you did not request this, you can safely ignore this email.</div></body></html>`;
  return html;
}

export { renderEmailLayout };
