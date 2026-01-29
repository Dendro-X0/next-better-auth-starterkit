import Link from "next/link";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function GoodbyePage(): React.JSX.Element {
  return (
    <div className="container mx-auto max-w-lg p-6">
      <Card>
        <CardHeader>
          <CardTitle>Account deleted</CardTitle>
          <CardDescription>Your account has been deleted successfully.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">You can create a new account at any time.</CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
