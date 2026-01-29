"use client";

import type React from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServerActionResult } from "@/lib/types/server-action-result";

import { runHeadlessDemoAction } from "@/app/examples/headless/actions";
import type { HeadlessDemoData } from "@/app/examples/headless/headless-demo-types";

type HeadlessDemoState = ServerActionResult<HeadlessDemoData> | null;

const initialState: HeadlessDemoState = null;

function renderEmptyState(): React.JSX.Element {
  return <div className="text-sm text-muted-foreground">Press the button to call the protected server action.</div>;
}

function renderOkState(data: HeadlessDemoData): React.JSX.Element {
  return (
    <div className="space-y-2 text-sm">
      <div>
        <span className="font-medium">userId:</span> {data.userId}
      </div>
      <div>
        <span className="font-medium">entitlementChecked:</span> {data.entitlementChecked}
      </div>
      <div>
        <span className="font-medium">canAccessEntitlement:</span> {String(data.canAccessEntitlement)}
      </div>
    </div>
  );
}

function renderErrorState(message: string): React.JSX.Element {
  return <div className="text-sm text-destructive">{message}</div>;
}

function renderState(state: HeadlessDemoState): React.JSX.Element {
  if (!state) {
    return renderEmptyState();
  }
  if (state.ok) {
    return renderOkState(state.data);
  }
  return renderErrorState(state.error.message);
}

export default function HeadlessDemoClient(): React.JSX.Element {
  const [state, formAction, isPending] = useActionState(runHeadlessDemoAction, initialState);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Headless Core Demo</CardTitle>
        <CardDescription>
          Calls a protected server action that uses `requireAuth()` + `hasEntitlement()` and returns a typed `ServerActionResult`.
        </CardDescription>
      </CardHeader>
      <CardContent>{renderState(state)}</CardContent>
      <CardFooter>
        <form action={formAction}>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Running…" : "Run server action"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
