import HeadlessDemoClient from "@/app/examples/headless/headless-demo-client";
import type React from "react";

export default function HeadlessExamplePage(): React.JSX.Element {
  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Headless Example</h1>
        <p className="text-muted-foreground">
          This route demonstrates how to consume the Auth Kit headless core from a custom UI.
        </p>
      </div>
      <HeadlessDemoClient />
    </div>
  );
}
