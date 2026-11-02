import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// Git rules for bfzli (see CLAUDE.md, Git). The Husky hooks call this:
//   commit-msg  bun scripts/git-rules.ts commit-msg <file>
//   pre-commit  bun scripts/git-rules.ts branch
//   pre-push    bun scripts/git-rules.ts push   (git passes the refs on stdin)
// The post workflows run with HUSKY=0, so their content/post-* branches never reach these checks.

const MAIN = 'main'

const TYPES = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
    'content'
]

const SUBJECT = new RegExp(
    `^(${TYPES.join('|')})(\\([a-z0-9]+(-[a-z0-9]+)*\\))?!?: \\S`
)

const GENERATED =
    /^(Merge (branch|branches|remote-tracking branch|pull request|commit|tag) |Revert ")/

const DELETED_SHA = /^0+$/

const HEADS = 'refs/heads/'

const git = (...args: string[]) => {
    const result = spawnSync('git', args, { encoding: 'utf8' })
    return result.status === 0 ? result.stdout.trim() : ''
}

const firstLine = (message: string) =>
    message
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line !== '' && !line.startsWith('#')) ?? ''

const subjectAllowed = (subject: string) =>
    SUBJECT.test(subject) || GENERATED.test(subject)

const subjectRefusal = (subject: string) =>
    [
        `"${subject}" is not a conventional commit subject.`,
        `Write type(scope): what changed, with an optional lowercase scope. Types: ${TYPES.join(', ')}.`,
        'For example `feat: add an rss feed` or `fix(og): strip emoji from thumbnails`. See CLAUDE.md, Git.'
    ].join('\n')

const branchRefusal = (name: string) =>
    [
        `"${name}" is not ${MAIN}. bfzli has one branch: commit on ${MAIN} and push ${MAIN}.`,
        `Go back with git switch ${MAIN}, then bring your commits over with git cherry-pick <commit>. See CLAUDE.md, Git.`
    ].join('\n')

const refuse = (problems: string[]) => {
    if (problems.length === 0) return
    console.error(problems.join('\n\n'))
    process.exit(1)
}

const checkMessage = (file: string) => {
    const subject = firstLine(readFileSync(file, 'utf8'))
    refuse(subjectAllowed(subject) ? [] : [subjectRefusal(subject)])
}

const checkBranch = () => {
    const branch = git('symbolic-ref', '--short', '-q', 'HEAD')
    refuse(branch === '' || branch === MAIN ? [] : [branchRefusal(branch)])
}

// Each stdin line is "<local ref> <local sha> <remote ref> <remote sha>".
const checkPush = () => {
    const lines = readFileSync(0, 'utf8').split('\n').filter(Boolean)

    const problems = lines.flatMap((line) => {
        const [, localSha, remoteRef] = line.split(' ')

        if (DELETED_SHA.test(localSha)) return []

        if (remoteRef.startsWith(HEADS) && remoteRef !== HEADS + MAIN) {
            return [branchRefusal(remoteRef.slice(HEADS.length))]
        }

        return git(
            'log',
            '--no-merges',
            '--format=%h %s',
            localSha,
            '--not',
            '--remotes'
        )
            .split('\n')
            .filter(Boolean)
            .map((entry) => {
                const [sha, ...words] = entry.split(' ')
                return { sha, subject: words.join(' ') }
            })
            .filter((commit) => !subjectAllowed(commit.subject))
            .map((commit) => `${commit.sha}: ${subjectRefusal(commit.subject)}`)
    })

    refuse(problems)
}

const [mode, target] = process.argv.slice(2)

if (mode === 'commit-msg') checkMessage(target ?? '')
else if (mode === 'branch') checkBranch()
else if (mode === 'push') checkPush()
else
    refuse([
        'Usage: bun scripts/git-rules.ts commit-msg <file> | branch | push'
    ])