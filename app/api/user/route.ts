import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import {   NextResponse } from "next/server";

export const GET = async () => {
    const session = await getServerSession();
    // TODO: You can get rid of the db call here 
    const user = await prismaClient.user.findUnique({
        where: {
            email: session?.user?.email ?? ""
        }
    });
    if (!user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }
    return NextResponse.json({
        user
    });
}

// dont static render
export const dynamic = 'force-dynamic'
