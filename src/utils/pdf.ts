import PDFDocument from 'pdfkit'
import sharp from 'sharp'
import fs from 'node:fs'

import type { Experience, Skill } from '@/types'
import { constants } from '@/config'
import { avatar, techIcons } from '@/assets'
import { staticPages } from '@/data/pages'
import { experience, skillGroups, technical } from '@/data/resume'
import { initials } from '@/utils/text'

type Doc = PDFKit.PDFDocument

interface Style {
    font: 'regular' | 'bold'
    size: number
    color: string
    gap?: number
}

interface Column {
    x: number
    width: number
    y: number
    page: number
}

const { profile } = constants

// US Letter in points, matching the hand-made resume this replaces.
const page = { width: 612, height: 792 }
const margin = 48
const photo = 44
const logo = 28
const icon = 10

// Light theme values from src/styles/colors.css, since paper has no dark mode.
const colors = {
    default: '#111111',
    soft: '#54545a',
    comment: '#71717a',
    element: '#f4f4f5'
}

const styles = {
    name: { font: 'bold', size: 20, color: colors.default },
    headline: { font: 'regular', size: 10, color: colors.soft, gap: 2 },
    heading: { font: 'bold', size: 11, color: colors.default },
    body: { font: 'regular', size: 10, color: colors.soft, gap: 2.5 },
    skill: { font: 'regular', size: 9.5, color: colors.soft },
    initials: { font: 'bold', size: 8, color: colors.comment }
} satisfies Record<string, Style>

const fonts = {
    regular: fs.readFileSync('public/fonts/dm-sans/DMSans-Regular.ttf'),
    bold: fs.readFileSync('public/fonts/dm-sans/DMSans-Bold.ttf')
}

// Astro keeps the source path on imported images while it builds.
const sourceOf = (image: ImageMetadata) =>
    (image as ImageMetadata & { fsPath: string }).fsPath

// The icons are drawn around 12px, so render them far larger before
// scaling down or they blur in print.
const rasterize = (svg: string) =>
    sharp(Buffer.from(svg), { density: 1200 })
        .resize(64, 64, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toBuffer()

const measure = (doc: Doc, style: Style, text: string, width: number) =>
    doc
        .font(style.font)
        .fontSize(style.size)
        .heightOfString(text, { width, lineGap: style.gap })

const write = (
    doc: Doc,
    style: Style,
    text: string,
    x: number,
    y: number,
    options: PDFKit.Mixins.TextOptions = {}
) =>
    doc
        .font(style.font)
        .fontSize(style.size)
        .fillColor(style.color)
        .text(text, x, y, { lineGap: style.gap, ...options })

// Claims room in a column and moves the block to the next page when it would
// cross the bottom margin, so a longer resume flows instead of clipping.
const reserve = (doc: Doc, column: Column, height: number) => {
    if (column.y + height > page.height - margin && column.y > margin) {
        column.page += 1
        column.y = margin
        if (column.page === doc.bufferedPageRange().count) doc.addPage()
    }

    doc.switchToPage(column.page)

    const y = column.y
    column.y += height

    return y
}

const header = async (doc: Doc) => {
    const x = margin + photo + 14
    const width = page.width - margin - x
    const image = await sharp(sourceOf(avatar))
        .resize(240, 240)
        .jpeg({ quality: 90 })
        .toBuffer()

    doc.save()
        .circle(margin + photo / 2, margin + photo / 2, photo / 2)
        .clip()
        .image(image, margin, margin, { width: photo, height: photo })
        .restore()

    write(doc, styles.name, profile.name, x, margin, { width })
    // Capped so a longer headline still keeps short lines.
    write(doc, styles.headline, profile.headline, x, doc.y + 2, { width: 390 })

    return Math.max(margin + photo, doc.y)
}

const role = async (doc: Doc, column: Column, job: Experience) => {
    const x = column.x + logo + 12
    const width = column.width - logo - 12
    const title = `${job.title} at ${job.company}`
    const titleHeight = measure(doc, styles.heading, title, width) + 4
    const height =
        titleHeight + measure(doc, styles.body, job.description, width)
    const y = reserve(doc, column, Math.max(logo, height) + 20)
    const image = job.logo && (await sharp(sourceOf(job.logo)).png().toBuffer())

    doc.save().roundedRect(column.x, y, logo, logo, 8).clip()

    if (image) {
        doc.image(image, column.x, y, { width: logo, height: logo })
    } else {
        const text = initials(job.company)
        const offset = (logo - measure(doc, styles.initials, text, logo)) / 2

        doc.rect(column.x, y, logo, logo).fill(colors.element)
        write(doc, styles.initials, text, column.x, y + offset, {
            width: logo,
            align: 'center',
            lineBreak: false
        })
    }

    doc.restore()

    write(doc, styles.heading, title, x, y, { width })
    write(doc, styles.body, job.description, x, y + titleHeight, { width })
}

const skillGroup = async (
    doc: Doc,
    column: Column,
    title: string,
    skills: Skill[]
) => {
    const x = column.x + icon + 6
    const width = column.width - icon - 6
    const titleHeight = measure(doc, styles.heading, title, column.width) + 8
    const rows = skills.map(
        (skill) => measure(doc, styles.skill, skill.name, width) + 6
    )
    const height = titleHeight + rows.reduce((sum, row) => sum + row, 0)
    const y = reserve(doc, column, height + 18)

    write(doc, styles.heading, title, column.x, y, { width: column.width })

    let top = y + titleHeight

    for (const [index, skill] of skills.entries()) {
        const image = await rasterize(techIcons[skill.icon])

        doc.image(image, column.x, top + 1.5, { width: icon, height: icon })
        write(doc, styles.skill, skill.name, x, top, { width })
        top += rows[index]
    }
}

export async function generateResumePdf(): Promise<Buffer> {
    const doc = new PDFDocument({
        size: [page.width, page.height],
        margin: 0,
        bufferPages: true,
        lang: 'en',
        displayTitle: true,
        info: {
            Title: `${profile.name} - Resume`,
            Author: profile.name,
            Subject: staticPages.resume.description,
            Keywords: staticPages.resume.keywords
        }
    })

    const chunks: Uint8Array[] = []
    const done = new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)
    })

    doc.registerFont('regular', fonts.regular)
    doc.registerFont('bold', fonts.bold)

    const top = (await header(doc)) + 30
    const left: Column = { x: margin, width: 316, y: top, page: 0 }
    const right: Column = { x: margin + 356, width: 160, y: top, page: 0 }
    const heading = measure(doc, styles.heading, 'Experience', left.width) + 10
    const y = reserve(doc, left, heading)

    write(doc, styles.heading, 'Experience', left.x, y, { width: left.width })

    for (const job of experience) await role(doc, left, job)

    for (const group of skillGroups) {
        await skillGroup(doc, right, group.title, technical[group.key])
    }

    doc.end()

    return done
}