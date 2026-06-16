import React from "react";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create Account - StackSphere",
  description: "Sign up for a StackSphere account to get started.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <RegisterForm />
      </div>
    </div>
  );
}
