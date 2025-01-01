import { prismaClient } from "@/app/lib/db";
import {z} from "zod";
import { getServerSession } from "next-auth";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

import { NextRequest, NextResponse } from "next/server";

// Type for video details fetched from the YouTube API
interface VideoDetails {
    title: string;
    thumbnails: Thumbnail[];
}

// Type for individual thumbnail object
interface Thumbnail {
    url: string;
    width: number;
    height: number;
}

const defaultThumbnail = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA2wMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAACAAEDBAYFBwj/xAA5EAACAQMDAQcBBQgBBQEAAAABAgMABBEFEiExBhMiQVFhcYEUMkKRoQcVI1KxwdHwJBYzNUNyF//EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EAB8RAQEAAgICAwEAAAAAAAAAAAABAhESITFRAxNBMv/aAAwDAQACEQMRAD8A9HVaMCnAosVySOu0IFFT1BO12G/40UTqB4+8kK8e2AauRCenFULfUommFvOhtrg9I5MDd8Hoa6A6VUKnp6aiFUk4FEKYU9Mj0Q6ZPA9ajLrGpdzhR5msff69LqupPp1gwRY+JWK5JPoPL60xO2qGo23frEsmSeN2OM+mau1iY4xY92v41dQ2OScnGTWzibMa/FVZoWaSUaigFSLQg9OOtKkKAenFNmnoB6cU1OKAelSpUA9PQ09AFRUFPmgnDApGioTXPI6KamdWeKRI+GK8H3HIoqQ4II6iqnRA1HTrXVdNRbiFHJAORwVI9/XNZprvU9BfE2byyJwgd8SJ7bjwfr+dbG1dU7xOFXO4HHAz5H865+pwpch4nQujcZVRg1rdUnEHbfQ1u4rSe4eCeXGEmjK4zV257UaPalxJfRFkALKh3H6YrB6/owltprWUxzIrjZs+8oDYxn4z9K4ep6dDBa2MgCxBJgvU7mycsD7cEfSiRN6enxduOz8oPd3yswONoHJ+KqP+0Ts6soV7whCWHeFDtGB5n9K80vNH+x9qYYYW/gzMMfPPB+orjTWK2d5d/ZZANkmMbPuk9V/ryaL0HoXaHt8t/LDa6aypEwDFpCcuDkAYHrxXX7MalFZ2PeXsyCIDJbIBPwOa8ssYY4Ly3mmt1eFIh4l5OOcAe5PH1rSW2oHvAbRo0YR4EXdq2OegJ9qW9KkaebWIL26H2OZZUklQRnj19cV6NGNqKvoK8Q0e/aftLYd4oY/akRlVFTbk/iAAr3AdTVb2WfhIoqQUAoqbMVKmpUaBxRUIohQBAU/SmpUAqVKlSBU9NT0A9FQUVBONQmioTWEdBxSpCnqirg6/rcGjSR94zAyuAxXyHTpVrVdQSGzUW/eESRhkJ9+pyf71m+3emvqN1AzHZDCOecBzkcH8qG4uI7zURFcXccW1QqjvMFRjn29viq3olGHVHutQextSchWkc8qGGcDAx15HT3rk6FFcdo+zPaFDH/yoJgsMf4gy8jr9Rz613pVs9M7zVYUmFjattkuvCqs2QCq5GW5x0rQ9lNM064uL3UNPkdY9SVZDE4GGYDBZSPUYyPL05p8uk3W/LzG/v7v956fdvBD9okRQ8T/+qRW8sDzBP0+KVnpN3cRa/FMir9ofKEN149Rx6/r0rZdoNMFpKjStllk8bbQc/pms4t/bJrF1POo7iOAhwu5RjJzxn559T8U7VSM5pVleXHZOW5O4yiRu6IXk4GAPXqM+gqnFb3sCd/OjIquMsF6Dj0rTf9dXFy9hpttYwadptycRTPF3jum4gnnAHIPrVq/gv5zqmnwaYk1xbbUNzC+BIrLlTtPng9OaVKXtnew3eyftCtIWbwl+85/EAMivodDwK+ZoJZ9L1e2lkSW1u7dhuDjDdf1FfR2mXIubGGYH/uIG/MU8SydAGizUIajBq0JKWaDNEtAGtHQrRUgVKlmmoB6VNSpA9PQ0+aAeioaegORTUWKbFYRuVLFIsFGWIAqrcahbwDLSD86pPlxe0lyqRyqynEfjG0fePQD864lx2c0y3043mpE3N+6lpJXI4bzUAngA8V19Rjg1u6tlaUxxq27h8d5gcZ9s1C97FOXsNN1S0vNRijKymWIkoCckZQHOPer1uF3Ky3/UEEGmX+hTwtcaRdbjHgESW+45K4PUBs4IzVm+7RDs52Y0X912t0tvYSITcSrs3HGNuOpyMgnpzU9t2cvbu8neaKBLRDhzFbugkx6biD9QK5utdnRq84062nX7NAwLLvBbd8en0pJ4Te2i7ValFe6OlzbAM00ZYBRk+L5+a8o1e6aG0uVAPeSQ7Gx5jPWtd3d1bs0LtNK0OEcRKW2/QdPKsf2osJkmjYLKBIcAupG7J6VHPeWm9wvHZtFDyWtpcTvD3VuxaJS/K5PPGPPrWni7UG3WYW04WSeQSzytgGQgAABSeFwBgVjLGVLCcLISseTklSAueoqw15DDK6o0UsMhxtlTjpwQQeP6VbLQ9eu0v9SiuI7pp5GIjCFOf6etfQ2gxPbaRaQyffSJQcjHlXzzos8k3aGyiu4omDToUwPCRkcfpX0VbyfwlAAAA8qrEsl0NRb6qiSnElUlaDVIrVUElSK9Gwtg0YNVlapFagJc0s0OaWaCFmlmhpUAeaVDmlmkBinzQA09AcySSOP75x9a4+oa/bWqt4xke9YXVO1N1MSqHYvzWcnvJrqXaWZ2Y4CjzNc3O3w7J8evLW6x21PiWEe2Sazw1DUb5iyrLMQcqkakge7HyHzURWx01FnvgLiY/djBG36evyePQGo21jU72MMs8en2Y4RgNo48lxyT/wDNOT2fhseyuk3s0N0mo4iM6Aq7sCeDxgA4x8GrtmqabcR6dbTw20jHnEO5ZfX/AHmsp2fiuLKX7TGjeM7WutRkI3efEYzz8sTWvbtNbBe4EE9wwHilYd3H87Ac4HvW83pz5eWp1WK4TSSmGCBeSHxx8heKwelWMNrqKXdq1tGgcs7PesOBgc4QZ8+vnXds+2tmPA95G6AhdkibB8D1q1NFDrP8fSb+OKQDhAx5/I1Nno5fajq0Ol2dy2p6Ven7WjCWe1t5fDOMYII6E+/tXGsYrPUYZe0WusTJPGPstsxJWJVXBbHTJOT8Y+Kj7R2uuGMWssKwhmIbul3bwfPr09a4cSa1YRJZxzBrZ1LIkkZxn0U+VKfFdNL8nWmfudOkS4My927M331i6k+hY+mPyq3JoH2uHvrq6SN5FBABHPv5Yo12W5ZLtIw4znaKoXNxJFMzSzh4gwJRjlh8Hr086cjO306fZvs6bXWoJJWjkVHBJdOQPnNevRmPYNoUfFeIx6ncRsslqxdOqRvwwHsR1/rWp7Odr1kYRSybW/kc9fg+dG4XHp6RvZehyPeiEtULe6WePcv1qTcc09o0vrJUyyVzUc1OklGxp0Eep0aqEb5qzG1OUaWwafNRKaPNUQs0+aAGnzSIWaWaHNLNBiBp80GafNAfOz99dS7LeJ5D7Cu3pXZTUnBZlVXYcZ/CPSvTbHQbHT48CJQfYU93qVrZJjwA+nFccldtyY2x/Z4HlM9/I07tztc8H59vauyOz+laZ/yJ2R5lAAkkGdgHko8gK5Wtdu+6JS1RnHQuM9ff0FYfWe011c3Gy6nKRMSpiDElGH9R/vrWswtZ5ZyOj2t1DTLq7h+xm5uo1yGaE7SW8lB8h1PHpXAubi0kHdyaXMqHGVmuGyfjj/c1FDfYgaVgWhkIBQsQGyccZ+evXOK0Om9j7+6sxcGWIwkh0S5PiwemcA8/4radTTHzWetn0tm2hZbQoD4llJCk+v681YiaaGYz6dq7kkAqc5XI6YNaX/8APnuYm/eGpRxhT1j3MF56c4z1otS7F9mLS1cjULlTGpLSI2BnHpU8oeqp2/b/ALQ2MRW6W3vWA2DDZYj5rl6129u7uKOKS07mNByvOc885/KqsfZW2vElk0bUY7pUBLK2Vc+mB5/nWbuILm2eVJBNGV4CyAmqmSNLE+rPcByEWTPTPJFVJrt5ljXxKO6wc+xPPzwaltjBNMq3MSByAN6ng/lQ6lEIGCKjbSODkn+1IJrW6eWSG3UAbm4IPSrlyHtboJKD3gOd6+fuRXM0s/Z5xPIBnoqk812rmyub3bKEYkjoG4qcmmNbnsTrjzRrBI+SPU1vFOQCPOvGuy8NzZ6mveIyrXsNod0CH2pQ8omXrUoNRDiiFNKzG1XYjXPj61ehqomramizUSmizVEPNLNBmlmgDzSzQZp6QGDRZqPNPQGT7VdoINNgJeQKefxCvI9d7TXGoM/dTrGo6l8n+1du+lklTdJI0rE8b+RiufKgYFdi8j+UVzzOR1ZfFfxjrzXrhhtjk2uOCyeEY9gKr2Yi3faLyQyEHIyxz881q0sLVJiRawFjk7ig5P1pmsrGbKyWsRY8MVXbxWn2xn9OTPfvI3t1BDGe7iDqzYGMkefFemW2pPNB3UcuJNuOvHrWMGhaaZA0SSxv18DnirYhuLQIba8eVkO/LKPyOKPsxpfXnHVTUL680vUo7WZnlik2AZ9/6e9XGWP7EiXS5eSIK5HmRWY0a4e1vrwSL3H2o8sCdh9vau/dzRrhE2SGQKwx5Y6YqpJ5hW39U+8i0sEabGA4IUKARnI68elHPq1sLGWPUR9qfbuZTyR68+VVrzTLmfcEfah5LY8TD+1Qy6TLGw7rKoSSxzkt6gmqT2qp2et76IXGn7lZjlYXwcj29a5Gr209rIInjI2DkEdDWs0uFrFwojcITzt9K6Opw299alcgEL1IJ/Ko32etx5vZ3CxSF3IJBGNy+ddiPVSELM77NmeerfHtXI1vTTYynbKHU8g+dWdDeOZiURXum4VW+6MfiPoKdGPp0tL1C/Vt8u4bmyoBOV9jXqfYztBDrNm0RIFxDwR/MPUV5k7y2agTMkt05xiHJ2g10uzaSWGuab3MjI7tmUnHIPXNRtWq9dNEKfbu5GMexoo0yelMqlhHNXYxgVBGmKnXitIipQafNR5p80ySA0s0ANPmkY80s0OafNAEKKoxRUg8Tw64V23L16dahlwpG1ck9BU12CjOqbjt5HIyPpVVpjlRnJUdDXC9OxC757xUAHPrxVdlcEuSPGhJ9vajVirkkYOcnI4FC7Aqc8kptJA+uauVGhxZSEeIhxxwcZFOzEHkttYDoelQQSDdhhkFcc9aaeXwkL0znOKZDkhSVgp8KZ4P83rVKeZ7WVdu4rGcD19vpzVku2FA8TDyqOUApI20YH3g3n8VWOVxqcsJk7Wh6lGfBc7TvOAQev8Aiu5d2yW43om6JjuJ64GK80YCNmmhbaSc4Nbbs92jhk0wwTuMkY5OcY863mUyYXGwheWxvY1R17wjIRhx+VK7vhaSAh1TB2EEbtrf4qxq2nW13Yi+so2eeE7lIHGKU2ix6vprL3myVlyCP5gODU1OnC7U2EckL3CJw33sAYU+RrCwyz2U3exHxYIIA4xXpMNul5ojx3BkjnhBVmJ4JXjpWBu0QTvtJO1sVWxxWNG1dbYyGfLSySbicZzV6XWZJLx2jAXw7dx864LBQQcZHn61MhDKTgZB/Soujx201rrV9AQYbmeIeRVziu5Y9utYtmUNcd8o6iVAf1rDxSbQB6+WasxXSjg5AB9Kjtrrb2DQO3dteyrBqCrbu33ZAfCT6e1bJWB6EfnXzl9tBfCH3xivRewvbDYiafqcn8I+GKQ/hPofarxz9s88PT0oGnzUYIZQynIP60QrViPNEKCiFIDBpChFEKAIUVCKKgPFb0R97IQdw9j0rn5O9cjk9a71/EkUpZYxtxnnjNcs7Cd4zjPSvPletYqy8MzMgIPXmoHVGJbJHHIroNEqxOT4uelc2bhd48zirTYjHBDBcpkjHpnpQSqzMoYEDoamCqnOTjr06Go3kO7B69QcU5U2BlRRlgN3ixx1FRhmffG3BxkMf6U8jeJz5nFChdHDMoKng/HWmSnODgNHjPmBzVVA8ZQoMtniumwUI7AZz/moY4S8iuoJx0UDoaqVFizZ9pNTitPsAuzHHLlS2wHj0zXpPZwW37sgY3EIRQNztKMgV5RJbGViv6/ymo3SRVaMEgkZOTwTV3LfSOGu29n13TNN1LU5IpEmgf8A7EZwdz45Px0rzeYmWWSVgqBmOc9OaN4jvKkHPn6iiRCuEC8E85PnT3C4qgHBGAQPMVIkXiZVPQ7T71PCiq6O21R158zTwxMeTkEcnHr50rS4oTwnXODg+ooiTt8QAI5DeoqdYCd4ILMH/wBFNLabhnaFYY4PnS2ekcaMJCQFwW4watWs8yTMvQg9DUEKSKxBUH+b6VcWMkhwv3SM7fb1pWnI9B7FdrHt9lreszWx4VjyUP8AivS0ZWUOrBlYZBHmK+ft8sB8AwRyhB4Nemfs17QfvG0ewkPjgXK5P4avDJnng3AohQijArRiIU4phRigjqKPFMtHimHkusfxAgb8KgCuIMAJwOQDSpV58evT4HfnHmOaimiQTMmPCGBxSpVRUpFHd4xwKidFVI8AeIHNNSpJUpkXuiccg4zUe4hFbPOP70qVWQk535A4BNRtwgYfz9PLpT0qaQytgx4825qJkHebfIrSpUEjH3lQ8g8c+VA8ShwKalTCRlC28hGc8c596aCFGhMpHiJ/rSpUEuaB/wCQZcDaZFyPXg1JrsKx3KquecfTBpUqf6L/ACqOirOF2jGTV2xt4+8dAMKFB+vrSpUqUT30YjiHJbDYBbmr37NZGj7YRInCujgj6UqVPHyn5HtI6CjWlSrocghUgFKlQBqKkxSpUw//2Q=="

const CreateStreamSchema = z.object({
    creatorId: z.string(),
    url: z.string()         //add youtube and spotify urls checks
})
const MAX_QUEUE_LEN =20;

async function getVideoDetails(videoId: string): Promise<VideoDetails> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error("Invalid video ID or video not found");
    }

    const video = data.items[0];
    const thumbnails: Thumbnail[] = Object.values(video.snippet.thumbnails);

    return {
        title: video.snippet.title,
        thumbnails,
    };
}


export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const data = CreateStreamSchema.parse(body);

        const isYt = data.url.match(YT_REGEX);
        const session = await getServerSession();

        if (!isYt) {
            return NextResponse.json({
                message: "Wrong URL format",
            }, {
                status: 411,
            });
        }

        const user = await prismaClient.user.findUnique({
            where: {
                email: session?.user?.email ?? "",
            },
        });

        if (!user) {
            return NextResponse.json({
                message: "Unauthenticated",
            }, {
                status: 403,
            });
        }

        const extractedId = data.url.split("?v=")[1];
        console.log("Extracted YouTube ID:", extractedId);

        const videoDetails = await getVideoDetails(extractedId);
        console.log("Video Details:", videoDetails);

        const thumbnails = videoDetails.thumbnails.sort((a: Thumbnail, b: Thumbnail) => a.width - b.width);

        const existingActiveStream = await prismaClient.stream.count({
            where: {
                userId: data.creatorId,
            },
        });

        if (existingActiveStream > MAX_QUEUE_LEN) {
            return NextResponse.json({
                message: "Too many streams",
            }, {
                status: 411,
            });
        }

        const stream = await prismaClient.stream.create({
            data: {
                userId: data.creatorId,
                url: data.url,
                extractedId,
                addedById: user.id,
                type: "Youtube",
                title: videoDetails.title,
                smallImg: (thumbnails.length > 1 ? thumbnails[thumbnails.length-2].url : thumbnails[thumbnails.length - 1].url)
                ?? defaultThumbnail,
                bigImg: thumbnails[thumbnails.length - 1].url ?? defaultThumbnail
            },
        });

        return NextResponse.json({
            ...stream,
            haveUpvoted: false,
            upvotes: 0,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
            return NextResponse.json({
                message: "Error while adding a stream",
                error: error.message,
            }, {
                status: 411,
            });
        } else {
            console.error("Unexpected error:", error);
            return NextResponse.json({
                message: "An unexpected error occurred",
            }, {
                status: 500,
            });
        }
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

