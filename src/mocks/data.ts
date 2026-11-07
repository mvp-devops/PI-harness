import type { Artifact, Job, JobStatus, LogEntry, LogLevel, Task, TaskStatus } from '@/types'

const REQUIREMENTS = [
  'Refactor authentication module to use refresh tokens',
  'Add pagination to the orders listing endpoint',
  'Migrate project database from Postgres 14 to 16',
  'Implement CSV export for monthly reports',
  'Fix flaky integration tests in CI pipeline',
  'Design onboarding flow for new API consumers',
  'Optimize image uploads for large assets',
  'Write documentation for the harness RPC protocol',
  'Add rate limiting to the public gateway',
  'Prepare release notes for v2.4',
  'Audit dependencies for known vulnerabilities',
  'Introduce feature flags for the new dashboard',
]

const MODELS = ['glm-5.3-flash', 'glm-4.6', 'deepseek-v3.2']
const AGENTS = ['code-agent', 'ops-agent', 'docs-agent']

const TASK_TITLES = [
  'Analyze codebase and collect context',
  'Draft implementation plan',
  'Write failing tests first',
  'Implement the change',
  'Update documentation',
  'Run full test suite',
  'Summarize results and open PR',
]

const LOG_MESSAGES = [
  'Reading workspace files',
  'Searching for relevant modules',
  'Applying patch to src/server/routes.ts',
  'Running npm test',
  'Test suite passed in 42s',
  'Waiting for user approval to write files',
  'Retrying failed request (attempt 2/3)',
  'Committed changes on branch feat/pagination',
  'Collecting artifacts',
  'Warning: deprecated API usage detected',
  'Error: network timeout while fetching fixture',
  'Plan step completed, moving to next stage',
]

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)]
}

function isoAgo(ms: number): string {
  return new Date(Date.now() - ms).toISOString()
}

let seed = 42
function rnd(): number {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

function makeTasks(jobId: string, createdMs: number, progress: number): Task[] {
  const count = 3 + Math.floor(rnd() * 4)
  const doneCount = Math.floor((progress / 100) * count)
  return Array.from({ length: count }, (_, i) => {
    let status: TaskStatus = 'pending'
    if (i < doneCount) status = 'done'
    else if (i === doneCount && progress < 100) status = rnd() > 0.35 ? 'in_progress' : 'blocked'
    if (progress === 100) status = 'done'
    return {
      id: `${jobId}-t${i + 1}`,
      jobId,
      title: TASK_TITLES[i % TASK_TITLES.length],
      status,
      assignee: pick(AGENTS, rnd),
      updatedAt: isoAgo(createdMs - i * 60_000),
      blockedReason: status === 'blocked' ? 'Waiting for approval before write operations' : undefined,
    }
  })
}

function makeLogs(jobId: string, createdMs: number, count: number): LogEntry[] {
  const levels: LogLevel[] = ['info', 'info', 'info', 'warn', 'error']
  return Array.from({ length: count }, (_, i) => {
    const level = pick(levels, rnd)
    const message =
      level === 'error'
        ? 'Error: network timeout while fetching fixture'
        : level === 'warn'
          ? 'Warning: deprecated API usage detected'
          : pick(LOG_MESSAGES.slice(0, 8), rnd)
    return {
      id: `${jobId}-l${i + 1}`,
      jobId,
      ts: new Date(createdMs - (count - i) * 30_000).toISOString(),
      level,
      message,
    }
  })
}

function makeArtifacts(jobId: string): Artifact[] {
  const paths = ['src/server/routes.ts', 'src/lib/auth.ts', 'docs/protocol.md', 'package.json']
  const n = 1 + Math.floor(rnd() * 3)
  return Array.from({ length: n }, (_, i) => ({
    id: `${jobId}-a${i + 1}`,
    jobId,
    path: paths[(i * 7 + jobId.length) % paths.length],
    change: rnd() > 0.5 ? 'modified' : 'created',
    status: rnd() > 0.15 ? 'ok' : 'failed',
  }))
}

/** Deterministic-ish demo dataset of jobs across all lifecycle states. */
export function buildMockJobs(): Job[] {
  const statuses: JobStatus[] = [
    'running',
    'running',
    'queued',
    'waiting_approval',
    'paused',
    'completed',
    'completed',
    'failed',
    'cancelled',
    'draft',
    'completed',
    'failed',
  ]

  return statuses.map((status, i) => {
    const id = `job-${String(i + 1).padStart(3, '0')}`
    const createdMs = (i + 1) * 3_600_000 + rnd() * 1_800_000
    const createdAt = isoAgo(createdMs)
    const progress =
      status === 'completed' ? 100 : status === 'running' ? 20 + Math.floor(rnd() * 60) : status === 'draft' ? 0 : Math.floor(rnd() * 80)
    const started = status !== 'draft' && status !== 'queued'
    const finished = status === 'completed' || status === 'failed' || status === 'cancelled'
    const plan = makeTasks(id, createdMs, progress).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
    }))
    return {
      id,
      requirement: REQUIREMENTS[i % REQUIREMENTS.length],
      status,
      progress,
      model: pick(MODELS, rnd),
      agentProfile: pick(AGENTS, rnd),
      mode: rnd() > 0.4 ? 'autonomous' : 'interactive',
      requireApproval: rnd() > 0.5,
      createdAt,
      startedAt: started ? isoAgo(createdMs - 120_000) : undefined,
      updatedAt: isoAgo(createdMs - 60_000),
      finishedAt: finished ? isoAgo(createdMs - 30_000) : undefined,
      plan,
      currentStep: plan.find((p) => p.status === 'in_progress')?.title,
      error: status === 'failed' ? 'Network timeout while calling test runner' : undefined,
    }
  })
}

export { makeTasks, makeLogs, makeArtifacts, pick }
