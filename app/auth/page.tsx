"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { SignInFlow } from "@/app/types/auth-types";
import AuthScreen from "../components/auth/auth-screen";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { authType: SignInFlow; mailId?: string };
}) {
  const formType = searchParams.authType;
  const session = useSession();
  const router = useRouter();

  if (session.status === "authenticated") {
    return router.push("/");
  }
  return <div className="w-full h-full"><AuthScreen authType={formType} /></div> ;
}
