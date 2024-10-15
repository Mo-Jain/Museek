"use client"

import LoadingScreen from '../components/LoadingScreen';
import StreamView from '../components/StreamView'
import { useSession } from 'next-auth/react';


export default function Component() {
    const session = useSession();
    try {
        if (!session.data?.user.id) {
            return <div>
                <LoadingScreen/>
            </div>
        }
        return <StreamView creatorId={session.data.user.id} playVideo={true} />
    } catch(e) {
        console.error(e);
        return null
    }
}

export const dynamic = 'auto'
