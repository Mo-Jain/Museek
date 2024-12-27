import NextAuth, {type DefaultSession } from "next-auth"
import { authConfig } from "@/app/lib/auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}


const handler = NextAuth(authConfig);

export { handler as GET, handler as POST }
