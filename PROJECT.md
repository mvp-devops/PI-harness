Создай современный минималистичный веб-интерфейс для управления Pi harness (pi.dev) на ReactJS.

## Роль и цель
Ты — senior frontend engineer и product designer. Создай production-ready SPA «Pi Harness Control» — визуальный графический интерфейс для управления Pi agent harness.

Цель интерфейса: быстро запускать, наблюдать, контролировать и останавливать задачи harness, не переключаясь в терминал. Интерфейс должен быть лаконичным, понятным и не перегруженным функциями.

## Технологический стек
- React 18+ с TypeScript.
- Vite.
- React Router для навигации.
- Zustand или TanStack Query для состояния/серверного состояния.
- Tailwind CSS для стилей.
- lucide-react для иконок.
- Не используй тяжёлые UI-киты; при необходимости — shadcn/ui или Radix UI.
- Для графики состояния используй простые CSS/SVG-индикаторы, без тяжёлых chart-библиотек.
- Предусмотри mock API-слой с возможностью последующей замены на реальный Pi RPC/WebSocket backend.

## Визуальный стиль
За визуальную основу возьми спокойную, чистую эстетику ChatGPT:
- Светлая тема по умолчанию, тёмная тема — обязательна.
- Нейтральная палитра: белый / почти белый фон, светло-серые границы, тёмно-серый текст.
- Один акцентный цвет — спокойный тёмно-зелёный или индиго; не используй яркие градиенты.
- Много воздуха, аккуратные отступы, скругления 8–12 px, тонкие borders.
- Типографика: system font stack или Inter; крупный читаемый текст, моноширинный шрифт для команд, путей, ID и логов.
- Никаких декоративных иллюстраций, тяжёлых анимаций и визуального шума.
- Адаптивность: desktop-first, но корректная работа от 1024 px; на мобильных — упрощённая навигация.
- Доступность: keyboard navigation, focus states, aria-labels, контрастность WCAG AA.

## Структура интерфейса
Реализуй layout из трёх зон:

1. Левый сайдбар, ширина 240–280 px:
- Логотип/название: “Pi Harness”.
- Навигация: Dashboard, Jobs, Tasks, Logs, Settings.
- Внизу — статус подключения к Pi runtime: Connected / Disconnected / Reconnecting.
- На мобильных сайдбар сворачивается.

2. Центральная рабочая область:
- Заголовок текущего раздела.
- Основной контент.
- Пустые состояния с коротким пояснением и primary action.

3. Правая панель — только на странице Job details:
- Метаданные job: ID, статус, модель, создан, обновлён, длительность.
- Быстрые действия: Pause, Resume, Cancel, Retry.
- Последние события.

## Обязательные экраны

### 1. Dashboard
Показывай только самое важное:
- 4 компактные карточки: Active jobs, Queued tasks, Failed tasks, Requires approval.
- Список последних jobs: название, статус, прогресс, время создания, действие “Open”.
- Кнопка “New job”.
- Если нет активных jobs — дружелюбный empty state с кнопкой запуска первой задачи.

### 2. Jobs
Таблица или список jobs:
- Job ID, название/requirement, статус, прогресс, agent/model, started, duration.
- Статусы: Draft, Queued, Running, Paused, Waiting approval, Completed, Failed, Cancelled.
- Фильтры по статусу и поиску по названию/ID.
- Действия в строке: Open, Pause/Resume, Cancel, Retry.
- Подтверждение перед Cancel и Retry.
- Пагинация или infinite scroll.

### 3. Job details
Экран конкретного job:
- Хлебные крошки: Jobs / Job ID.
- Заголовок с requirement.
- Статус-бейдж и progress bar.
- Вкладки: Overview, Tasks, Logs, Artifacts.
- Overview: цель задачи, план, текущий этап, ошибки, использованная модель, время.
- Tasks: список подзадач с чекбоксами/статусами и возможностью открыть детали.
- Logs: streaming log viewer с autoscroll, поиском, copy, фильтром по уровню info/warn/error.
- Artifacts: список созданных/изменённых файлов с путём, статусом и кнопкой “Open in editor” (заглушка).

### 4. New job
Простая форма:
- Поле “Requirement” — многострочный textarea, обязательное.
- Выбор модели/agent profile — select.
- Режим запуска: Interactive / Autonomous.
- Переключатель “Require approval before write operations”.
- Кнопки: Cancel и Start job.
- После запуска — переход на Job details.
- Валидация: нельзя запустить пустую задачу.

### 5. Tasks
Единый список задач по всем jobs:
- Колонки: task, job, status, assignee/agent, updated.
- Фильтры: All, Pending, In progress, Blocked, Done, Failed.
- Возможность открыть связанный job.

### 6. Logs
Глобальный лог-просмотр:
- Фильтр по job, уровню и текстовому поиску.
- Виртуализированный список, если данных много.
- Кнопки: Copy, Download, Clear filters.
- Цветовая маркировка: info — нейтральный, warn — янтарный, error — красный.

### 7. Settings
Минимальные настройки:
- Подключение к Pi runtime: URL, token, кнопка Test connection.
- Тема: Light / Dark / System.
- Автоскролл логов: on/off.
- Confirm before destructive actions: on/off.
- Не храни token в localStorage в открытом виде; покажи предупреждение и предложи безопасное хранение.

## Функциональность harness
Реализуй следующие действия через сервисный слой `harnessApi`:
- `startJob(requirement, options)`.
- `getJobs(filters)`.
- `getJobById(id)`.
- `pauseJob(id)`.
- `resumeJob(id)`.
- `cancelJob(id)`.
- `retryJob(id)`.
- `getTasks(jobId?)`.
- `getLogs(jobId?, filters)`.
- `subscribeToJobEvents(jobId, callback)` — WebSocket/SSE-ready контракт.
- `getRuntimeStatus()`.

Используй пока mock-данные и имитацию streaming events. Архитектура должна позволить заменить mock на реальный Pi RPC/WebSocket без переписывания экранов.

## UX-правила
- Все длительные операции показывают optimistic UI или аккуратный loading state.
- Ошибки выводятся компактным toast в правом нижнем углу.
- Опасные действия — Cancel, Retry, Disconnect — требуют подтверждения в modal.
- Статусы должны быть различимы не только цветом, но и текстом/иконкой.
- Не добавляй функции, которых нет в ТЗ: командный чат с ИИ, маркетплейс плагинов, сложную аналитику, multi-user RBAC, редактор кода, deployment pipeline.
- Код должен быть чистым, модульным и легко расширяемым.

## Структура проекта
Создай понятную структуру:

src/
app/
components/
layout/
ui/
jobs/
tasks/
logs/
settings/
features/
jobs/
tasks/
logs/
settings/
lib/
api/
utils/
types/
mocks/

## Deliverables
1. Полностью рабочий Vite + React + TypeScript проект.
2. Tailwind-конфигурация и базовая дизайн-система: colors, spacing, typography, radii, shadows.
3. Все перечисленные экраны и переходы между ними.
4. Mock API и mock WebSocket/SSE-события для демонстрации live-обновлений.
5. README с командами:
    - `npm install`
    - `npm run dev`
    - `npm run build`
    - описание, как подключить реальный Pi backend вместо mock-слоя.
6. Не добавляй backend-реализацию, если она не необходима для работы UI; вместо этого создай чёткий контракт API.

## Критерии приёмки
- Интерфейс выглядит минималистично и профессионально.
- Пользователь может создать job, увидеть его в списке, открыть детали, наблюдать логи и статус.
- Пользователь может pause, resume, cancel и retry job.
- Ошибки и empty states обработаны.
- Тёмная и светлая темы работают.
- Нет лишних экранов, настроек и визуальных элементов.
- Код типизирован, компоненты переиспользуемы, проект запускается без ошибок.
