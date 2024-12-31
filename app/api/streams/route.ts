import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {z} from "zod";
//@ts-expect-error no types available
import youtubesearchapi from "youtube-search-api";
import { getServerSession } from "next-auth";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()         //add youtube and spotify urls checks
})
const MAX_QUEUE_LEN =20;

export async function POST(req: NextRequest) {
    try{
        const data =  CreateStreamSchema.parse(await req.json());
        const isYt = data.url.match(YT_REGEX);
        const session = await getServerSession();

        console.log("got data");
        if(!isYt){
            return NextResponse.json({
                message: "wrong URL formt"
            },{
                status:411
            })
        }

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
        console.log("got user");

        const extractedId = data.url.split("?v=")[1];

        const res = await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails = res.thumbnail.thumbnails
        thumbnails.sort((a:{width:number},b:{width:number}) => a.width < b.width ? -1 : 1);

        console.log("got thumbnails");
        const existingActiveStream = await prismaClient.stream.count({
            where:{
                userId:data.creatorId
            }
        })

        if(existingActiveStream > MAX_QUEUE_LEN){
            console.log("too many streams");
            return NextResponse.json({
                message: "Error while adding a stream"
            },{
                status:411
            })
        }
        const stream = await prismaClient.stream.create({
            data:{
                userId:data.creatorId,
                url: data.url,
                extractedId,
                addedById:user.id,
                type:"Youtube",
                title: res.title ?? "Can't find video",
            }
        });
        console.log("got active stream");

        return NextResponse.json({
            ...stream,
            haveUpvoted: false,
            upvotes:0
        })
    }
    catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({
            message: "Error while adding a stream",
            error: error.message,
        }, {
            status: 411,
        });
    }

}

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
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

    if(!creatorId){
        return NextResponse.json({
            message:"Invalid creator id"
        },{
            status:411
        })
    }
        
    const streams= await prismaClient.stream.findMany({
        where: {
            userId: creatorId,
            played:false
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: user.id
                }
            }
        }
    })
    
    const activeStream = await prismaClient.currentStream.findFirst({
        where:{
            userId:creatorId
        },
        include: {
            stream: true
        }
    })

    return NextResponse.json({
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true :false
        })),
        activeStream
    })
}

