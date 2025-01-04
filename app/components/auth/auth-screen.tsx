"use client";

import { useState } from "react";
import SigninCard from "./sign-in-card";
import SignupCard from "./sign-up-card";
import { SignInFlow } from "@/app/types/auth-types";
import {  ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthScreen({ authType }: { authType?: SignInFlow }) {
  const [formType, setFormType] = useState<SignInFlow>(authType || "signIn");
  const router = useRouter(); 
  return (
    <div className=" w-full h-screen flex items-center justify-center gap-5 bg-gradient-to-b from-purple-900 to-gray-900">
        <Button variant="ghost" className="absolute top-4 left-4 text-white cursor-pointer hover:text-black"
          onClick={() => router.back()}
        >
          <ArrowLeft  />
        </Button>
        <div className="w-full md:h-auto md:w-[420px] px-4">
          {formType === "signIn" ? (
            <SigninCard setFormType={setFormType} />
          ) : (
            <SignupCard setFormType={setFormType} />
          )}
        </div>
      </div>
  );
}
