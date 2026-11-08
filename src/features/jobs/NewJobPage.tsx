import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout'
import { Button, Card, CardBody, CardHeader, Checkbox, Select, Textarea, toast } from '@/components/ui'
import { harnessApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { JobMode, StartJobOptions } from '@/types'
import { Rocket } from 'lucide-react'

const MODELS = ['glm-5.3-flash', 'glm-4.6', 'deepseek-v3.2'] as const
const AGENT_PROFILES = ['code-agent', 'ops-agent', 'docs-agent'] as const

const MODE_OPTIONS: Array<{ value: JobMode; label: string; hint: string }> = [
  { value: 'interactive', label: 'Interactive', hint: 'Пауза на ключевых шагах, больше контроля.' },
  { value: 'autonomous', label: 'Autonomous', hint: 'Агент работает без остановок до результата.' },
]

export default function NewJobPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [requirement, setRequirement] = useState('')
  const [model, setModel] = useState<string>(MODELS[0])
  const [agentProfile, setAgentProfile] = useState<string>(AGENT_PROFILES[0])
  const [mode, setMode] = useState<JobMode>('interactive')
  const [requireApproval, setRequireApproval] = useState(true)
  const [touched, setTouched] = useState(false)

  const invalid = requirement.trim().length === 0

  const startJob = useMutation({
    mutationFn: (options: StartJobOptions) => harnessApi.startJob(requirement.trim(), options),
    onSuccess: (job) => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast('success', `Job ${job.id} запущен`)
      navigate(`/jobs/${job.id}`)
    },
    onError: (error) => {
      toast('error', `Не удалось запустить job: ${error instanceof Error ? error.message : 'unknown error'}`)
    },
  })

  const submit = () => {
    setTouched(true)
    if (invalid) return
    startJob.mutate({ model, agentProfile, mode, requireApproval })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="New job" description="Опишите задачу и параметры запуска." />

      <Card>
        <CardHeader className="px-5">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Параметры задачи</h2>
        </CardHeader>
        <CardBody className="space-y-5">
          <div>
            <label htmlFor="requirement" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Requirement <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <Textarea
              id="requirement"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={6}
              placeholder="Что нужно сделать? Опишите требование подробно…"
              aria-required="true"
              aria-invalid={touched && invalid}
            />
            {touched && invalid && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                Нельзя запустить пустую задачу — опишите требование.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Model
              </label>
              <Select id="model" value={model} onChange={(e) => setModel(e.target.value)}>
                {MODELS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="agent" className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Agent profile
              </label>
              <Select id="agent" value={agentProfile} onChange={(e) => setAgentProfile(e.target.value)}>
                {AGENT_PROFILES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </Select>
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">Режим запуска</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {MODE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    'flex cursor-pointer flex-col gap-0.5 rounded-xl border p-3 transition-colors',
                    'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-700',
                    mode === opt.value
                      ? 'border-accent-700 bg-accent-50 dark:border-accent-600 dark:bg-accent-900/30'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600',
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    <input
                      type="radio"
                      name="mode"
                      value={opt.value}
                      checked={mode === opt.value}
                      onChange={() => setMode(opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">{opt.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Checkbox
            checked={requireApproval}
            onCheckedChange={setRequireApproval}
            label="Require approval before write operations"
          />
        </CardBody>
      </Card>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate('/jobs')}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={startJob.isPending}>
          <Rocket className="size-4" />
          {startJob.isPending ? 'Starting…' : 'Start job'}
        </Button>
      </div>
    </div>
  )
}
