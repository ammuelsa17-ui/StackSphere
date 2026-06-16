import React from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In - StackSphere",
  description: "Sign in to your StackSphere account to continue.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <LoginForm />
      </div>
    </div>
  );
}
