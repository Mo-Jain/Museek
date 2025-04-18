import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";

const UpvoteSchema = z.object({
    streamId: z.string(),
})

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    //TODO: You can get rid of the db call here
    const  user = await prismaClient.user.findUnique({
        where:{
            email: session?.user?.email || ""
        }
    })
    if(!user){
        return NextResponse.json({
            message: "Unauthenticated"
        },{
            status:411
        })
    }

    try{
        const data = UpvoteSchema.parse(await req.json())
        await prismaClient.upvote.create({
            data:{
                userId: user.id,
                streamId: data.streamId
            }
        })

        return NextResponse.json({
            message: "Done!"
        })
    }
    catch {
        return NextResponse.json({
            message: "Error while upvoting"
        },{
            status:411
        })
    }

}