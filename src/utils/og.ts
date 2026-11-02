import satori from 'satori'
import sharp from 'sharp'
import fs from 'node:fs'

// Satori reads TTF, OTF and WOFF, but not WOFF2.
const headingFont = fs.readFileSync(
    'public/fonts/onest/onest-latin-600-normal.woff'
)
const bodyFont = fs.readFileSync(
    'public/fonts/onest/onest-latin-400-normal.woff'
)
const avatarPng = sharp('src/assets/generals/avatar.webp').resize(96, 96).png()
let avatarBase64: string

// The font has no emoji glyphs, so Satori would draw them as empty boxes.
const stripEmoji = (text: string) =>
    text
        .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim()

function descriptionNode(description: string) {
    const clean = stripEmoji(description)
    // Two lines fit about 180 characters; cut at a word boundary past that.
    const text =
        clean.length > 180
            ? clean.slice(0, 179).replace(/\s+\S*$/, '') + '…'
            : clean
    return {
        type: 'p',
        props: {
            style: {
                fontSize: '22px',
                fontWeight: 400,
                color: '#72809a',
                marginTop: '20px',
                lineHeight: 1.5
            },
            children: text
        }
    }
}

async function getAvatar() {
    if (!avatarBase64) {
        const buf = await avatarPng.toBuffer()
        avatarBase64 = `data:image/png;base64,${buf.toString('base64')}`
    }
    return avatarBase64
}

export async function generateOgImage(
    title: string,
    description?: string
): Promise<Buffer> {
    const avatar = await getAvatar()
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    backgroundColor: '#fcfcfc',
                    fontFamily: 'Onest'
                },
                children: [
                    {
                        type: 'img',
                        props: {
                            src: avatar,
                            width: 120,
                            height: 120,
                            style: {
                                borderRadius: '50%',
                                marginBottom: '32px'
                            }
                        }
                    },
                    {
                        type: 'h1',
                        props: {
                            style: {
                                fontSize: title.length > 40 ? '48px' : '56px',
                                fontWeight: 600,
                                color: '#111',
                                lineHeight: 1.2,
                                margin: 0
                            },
                            children: stripEmoji(title)
                        }
                    },
                    ...(description ? [descriptionNode(description)] : [])
                ]
            }
        },
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Onest',
                    data: headingFont,
                    weight: 600,
                    style: 'normal'
                },
                {
                    name: 'Onest',
                    data: bodyFont,
                    weight: 400,
                    style: 'normal'
                }
            ]
        }
    )

    return await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}