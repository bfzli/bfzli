import type { APIRoute } from 'astro'

import { generateResumePdf } from '@/utils/pdf'

export const GET: APIRoute = async () =>
    new Response(new Uint8Array(await generateResumePdf()), {
        headers: {
            'Content-Type': 'application/pdf',
            'Cache-Control': 'public, max-age=0, must-revalidate'
        }
    })