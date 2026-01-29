"use client";

import { Button } from "@/components/ui/button"
import { FaGoogle } from "react-icons/fa"
import { FaGithub } from "react-icons/fa"
import { authClient } from "@/lib/auth/client";

export function SocialLogin() {
  return (
    <div className="flex w-full flex-col items-center gap-y-2 my-4">
      <div className="relative w-full">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="w-full grid grid-cols-2 gap-x-2">
        <Button
          size="lg"
          className="w-full"
          variant="outline"
          onClick={() => authClient.signIn.social({ provider: "google" })}
        >
          <FaGoogle className="mr-2 h-5 w-5" />
          Google
        </Button>
        <Button
          size="lg"
          className="w-full"
          variant="outline"
          onClick={() => authClient.signIn.social({ provider: "github" })}
        >
          <FaGithub className="mr-2 h-5 w-5" />
          GitHub
        </Button>
      </div>
    </div>
  )
}
