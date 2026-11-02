import type { Experience, Skill, TechnicalGroup } from '@/types'
import { openemail, modulify, azwedo, dreampix, trokit, nun } from '@/assets'

export const experience: Experience[] = [
    {
        company: 'OpenEmail',
        title: 'Founding Engineer',
        logo: openemail,
        description:
            'Helping build OpenEmail’s core infrastructure: the console, admin tools, status pages, MCP server and SDK.'
    },
    {
        company: 'Modulify',
        title: 'Principal Engineer',
        logo: modulify,
        description:
            'Leading Modulify’s apps, Web, Webflow, CLI and APIs, keeping its AI services running at peak performance.'
    },
    {
        company: 'Azwedo',
        title: 'Software Engineer',
        logo: azwedo,
        description:
            'Led Merrfal’s back-end, built Landdding with GraphQL, and shipped Ikonik, Modulo, Svgflow and LogoToUse.'
    },
    {
        company: 'Dreampix',
        title: 'Lead Developer',
        logo: dreampix,
        description:
            'Built and led an AI-powered wallpaper platform, from content distribution to scaling for high-volume usage.'
    },
    {
        company: 'Trokit',
        title: 'Full Stack Developer',
        logo: trokit,
        description:
            'Built and led a full-stack SaaS car management platform for garages, with a focus on performance and reliability.'
    },
    {
        company: 'NuN Bookhouse',
        logo: nun,
        title: 'Developer',
        description:
            'Developed and maintained the Bookhouse e-commerce platform, owning its infrastructure and performance.'
    }
]

export const technical: Record<TechnicalGroup['key'], Skill[]> = {
    languages: [
        { name: 'TypeScript, JavaScript', icon: 'typescript' },
        { name: 'React, Next.js, Native, Expo', icon: 'react' },
        { name: 'Node, Express, Electron', icon: 'nodejs' },
        { name: 'Bun, Hono, Elysia, Astro, Vite', icon: 'bun' },
        { name: 'CLI’s, Rollup, Webpack', icon: 'rollup' }
    ],
    tools: [
        { name: 'GraphQL, Apollo, tRPC', icon: 'graphql' },
        { name: 'Firebase, Firestore', icon: 'firebase' },
        { name: 'Prisma, Neon, Turso', icon: 'prisma' },
        { name: 'Mongo, PostgreSQL', icon: 'mongodb' },
        {
            name: 'Redux, Redux Toolkit, Zustand',
            icon: 'redux'
        },
        { name: 'Tailwind, Shadcn', icon: 'tailwind' },
        { name: 'Storybook, Vitest, Jest', icon: 'storybook' }
    ],
    devops: [
        { name: 'Cloudflare Workers, R2, D1', icon: 'cloudflare' },
        { name: 'AWS, Google Cloud, Vercel, Bunny', icon: 'aws' },
        { name: 'DigitalOcean, Fly.io, Render, Railway', icon: 'digitalocean' }
    ],
    others: [
        { name: 'Claude, Codex', icon: 'claude' },
        { name: 'Figma, Webflow, Framer', icon: 'figma' }
    ]
}

export const skillGroups: TechnicalGroup[] = [
    { title: 'Languages', key: 'languages' },
    { title: 'Tools & Databases', key: 'tools' },
    { title: 'DevOps & Cloud', key: 'devops' },
    { title: 'AI & Others', key: 'others' }
]