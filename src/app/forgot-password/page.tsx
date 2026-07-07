import React from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Recover Password - StackSphere",
  description: "Request a password reset link to recover access to your StackSphere account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
