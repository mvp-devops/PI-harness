# Pi Harness Control

Production-ready SPA для управления Pi agent harness (pi.dev): запуск, наблюдение, контроль и остановка задач harness без терминала.

## Стек

- React 19 + TypeScript, Vite 8
- Tailwind CSS v4 (дизайн-токены: neutral-палитра, один акцент — глубокий зелёный, радиусы 8–12px)
- React Router 7 — навигация
- TanStack Query 5 — серверное состояние; Zustand 5 — UI-состояние и настройки
- lucide-react — иконки

## Экраны

| Маршрут | Экран |
|---|---|
| `/` | Dashboard — 4 карточки метрик, последние jobs, empty state |
| `/jobs` | Jobs — таблица с фильтрами по статусу, поиском, пагинацией и действиями |
| `/jobs/new` | New job — форма запуска (requirement, модель, режим, approval) |
| `/jobs/:id` | Job details — Overview / Tasks / Logs / Artifacts + правая панель с метаданными, действиями и live-событиями |
| `/tasks` | Tasks — все подзадачи по всем jobs с фильтрами |
| `/logs` | Logs — глобальный поток логов: фильтр по job/уровню/тексту, Copy/Download |
| `/settings` | Settings — подключение к runtime, тема, автоскролл логов, подтверждение опасных действий |

Поддерживаются светлая и тёмная темы (Light / Dark / System), оптимистичные действия Pause / Resume / Cancel / Retry с подтверждениями, toast-уведомления в правом нижнем углу.

## Команды

```bash
npm install      # установить зависимости
npm run dev      # dev-сервер на http://localhost:5173
npm run build    # типопасная production-сборка (tsc -b && vite build)
npm run preview  # предпросмотр production-сборки
npm run lint     # oxlint
npm run format   # prettier
```

## Архитектура

```
src/
  app/            # корневой компонент, роутинг, провайдеры
  components/
    layout/       # AppLayout, Sidebar, PageHeader, индикатор runtime
    ui/           # дизайн-система: Button, Inputs, StatusBadge, Card, Modal, Toast, Tabs, ProgressBar, Checkbox, EmptyState
    jobs/         # JobActions, JobMetaPanel
    logs/         # LogViewer (autoscroll, поиск, фильтры, copy, download)
  features/       # экраны по доменам: jobs, tasks, logs, settings
  lib/
    api/          # контракт HarnessApi, фабрика провайдера, query-хуки, event-sync, optimistic-действия
    utils/        # cn, форматирование времени/длительности, статусные словари
  types/          # доменные типы (Job, Task, LogEntry, Artifact, RuntimeStatus, JobEvent…)
  mocks/          # MockHarnessApi: dataset + тикер, имитирующий прогресс, логи и события
```

## Контракт API (`src/lib/api/contract.ts`)

```ts
interface HarnessApi {
  startJob(requirement: string, options: StartJobOptions): Promise<Job>
  getJobs(filters?: JobFilters): Promise<{ items: Job[]; total: number }>
  getJobById(id: string): Promise<Job | null>
  pauseJob(id: string): Promise<Job>
  resumeJob(id: string): Promise<Job>
  cancelJob(id: string): Promise<Job>
  retryJob(id: string): Promise<Job>
  getTasks(jobId?: string): Promise<Task[]>
  getLogs(jobId?: string, filters?: LogFilters): Promise<LogEntry[]>
  getArtifacts(jobId: string): Promise<Artifact[]>
  subscribeToJobEvents(jobId: string | 'all', listener: JobEventListener): JobEventSubscription
  getRuntimeStatus(): Promise<RuntimeStatus>
}
```

Экраны зависят **только** от этого интерфейса — сегодня его реализует `MockHarnessApi`.

## Подключение реального Pi backend вместо mock

1. Реализуйте интерфейс `HarnessApi` (например, `src/lib/api/piRpcApi.ts`) поверх Pi RPC/WebSocket:
   - запросы — RPC-вызовы;
   - `subscribeToJobEvents` — WebSocket/SSE-подписка, события приводятся к типу `JobEvent`;
   - `getRuntimeStatus` — health-check runtime.
2. Зарегистрируйте реализацию в фабрике `src/lib/api/index.ts`:

   ```ts
   export function createHarnessApi(provider: ApiProviderId = 'pi-rpc'): HarnessApi {
     switch (provider) {
       case 'mock': return new MockHarnessApi()
       case 'pi-rpc': return new PiRpcHarnessApi(settings.url, settings.token)
     }
   }
   ```

3. Экраны, query-хуки и optimistic-действия менять не нужно: live-обновления уже приходят через `useJobEventsSync`, optimistic UI отработает так же на реальном транспорте.

## Примечания по безопасности

- Токен доступа не сохраняется в localStorage в открытом виде по умолчанию (настройка «помнить в сессии» — осознанный выбор пользователя); на экране Settings выводится предупреждение и рекомендация хранить токен в keychain ОС или в переменных окружения backend-прокси.
- Для production рекомендуется держать токен на стороне прокси-сервера, а не в браузере.

## Границы (осознанно не реализовано)

Командный чат с ИИ, маркетплейс плагинов, аналитика, multi-user RBAC, редактор кода, deployment pipeline — вне ТЗ.
