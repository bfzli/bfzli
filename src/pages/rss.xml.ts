import type { APIRoute } from 'astro'

import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { constants } from '@/config'
import { sortByDate } from '@/utils/posts'

// Post dates have no time, so pin them to midnight UTC whatever the build machine's timezone.
const utcDay = (value: string) => {
    const date = new Date(value)
    return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
}

export const GET: APIRoute = async (context) => {
    const posts = sortByDate(await getCollection('posts'))

    return rss({
        title: constants.profile.name,
        description: constants.profile.bio,
        site: context.site ?? constants.site,
        items: posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            pubDate: utcDay(post.data.date),
            link: `/${post.slug}`,
            categories: post.data.tags
        })),
        customData: '<language>en</language>',
        // The site serves pages without a trailing slash.
        trailingSlash: false
    })
}