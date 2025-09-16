import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  FileMarkdownOutlined,
  LinkOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import {
  clearNoteErrors,
  createNote,
  deleteNote,
  fetchNoteDetails,
  fetchNotes,
  searchNotes,
  selectNoteDetailsState,
  selectNotesMutationStatus,
  selectNotesSearchState,
  updateNote
} from '@renderer/store/slices/notes'
import type { NoteDetails, NoteSummary } from '@renderer/store/slices/notes/types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import type { SearchNotesInput } from '@main/services/note/schemas'
import { extractErrorMessage } from '@renderer/store/slices/auth/helpers'

type NoteEditorMode = 'create' | 'edit'

interface NoteEditorProps {
  open: boolean
  mode: NoteEditorMode
  initialValues: NoteSummary | NoteDetails | null
  submitting: boolean
  tasks: TaskDetails[]
  onSubmit: (values: NoteFormValues) => Promise<void>
  onCancel: () => void
}

interface NoteViewerProps {
  open: boolean
  noteId: string | null
  canManage: boolean
  onEdit: (note: NoteDetails) => void
  onDelete: (noteId: string) => Promise<void>
  onClose: () => void
  onOpenTask: (taskId: string) => void
}

interface NoteSearchDrawerProps {
  open: boolean
  searchState: ReturnType<typeof selectNotesSearchState>
  onClose: () => void
  onSelect: (noteId: string) => void
}

const noteFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'projects:notes.validation.title')
    .max(160, 'projects:notes.validation.titleMax'),
  body: z
    .string()
    .trim()
    .min(1, 'projects:notes.validation.body'),
  notebook: z
    .string()
    .trim()
    .max(80, 'projects:notes.validation.notebookMax')
    .nullable()
    .optional(),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'projects:notes.validation.tag')
        .max(40, 'projects:notes.validation.tagMax')
    )
    .max(20, 'projects:notes.validation.tooManyTags')
    .optional(),
  linkedTaskIds: z.array(z.string().trim()).max(20, 'projects:notes.validation.tooManyLinks').optional(),
  isPrivate: z.boolean().optional()
})

type NoteFormValues = z.infer<typeof noteFormSchema>

const sanitizeFormValues = (values: NoteFormValues): NoteFormValues => ({
  ...values,
  notebook: values.notebook ? values.notebook.trim() || null : null,
  tags: values.tags?.map((tag) => tag.trim()).filter((tag) => tag.length > 0) ?? [],
  linkedTaskIds: Array.from(new Set(values.linkedTaskIds ?? [])),
  body: values.body.trim(),
  title: values.title.trim(),
  isPrivate: values.isPrivate ?? false
})

const buildTaskOptions = (tasks: TaskDetails[]) =>
  tasks.map((task) => ({
    label: `${task.key} · ${task.title}`,
    value: task.id
  }))

const buildTagOptions = (notes: NoteSummary[]) =>
  Array.from(
    new Set(
      notes
        .flatMap((note) => note.tags)
        .map((tag) => tag.toLowerCase())
        .filter(Boolean)
    )
  ).map((tag) => ({
    label: tag,
    value: tag
  }))

const buildNotebookOptions = (notes: NoteSummary[]) =>
  Array.from(
    new Set(
      notes
        .map((note) => note.notebook?.trim())
        .filter((value): value is string => Boolean(value))
    )
  ).map((notebook) => ({
    label: notebook,
    value: notebook
  }))

const extractSuggestionQuery = (value: string, cursor: number): { query: string; start: number } | null => {
  const textBeforeCursor = value.slice(0, cursor)
  const triggerIndex = textBeforeCursor.lastIndexOf('[[')
  if (triggerIndex === -1) {
    return null
  }
  const between = textBeforeCursor.slice(triggerIndex + 2)
  if (between.includes(']]')) {
    return null
  }
  const sanitized = between.trim()
  if (sanitized.length > 50) {
    return null
  }
  return { query: sanitized, start: triggerIndex }
}

const ProjectNotesPage = (): ReactElement => {
  const {
    projectId,
    project,
    notes,
    notesStatus,
    canManageNotes,
    tasks,
    openTaskDetails
  } = useProjectRouteContext()
  const dispatch = useAppDispatch()
  const { t } = useTranslation('projects')
  const [messageApi, contextHolder] = message.useMessage()

  const [includePrivate, setIncludePrivate] = useState(false)
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [viewerNoteId, setViewerNoteId] = useState<string | null>(null)
  const [editorMode, setEditorMode] = useState<NoteEditorMode>('create')
  const [editingNote, setEditingNote] = useState<NoteDetails | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const mutationStatus = useAppSelector(selectNotesMutationStatus)
  const searchState = useAppSelector(selectNotesSearchState)
  const [searchParams, setSearchParams] = useSearchParams()

  const fetchCurrentNotes = useCallback(() => {
    if (!projectId) {
      return
    }
    dispatch(
      fetchNotes({
        projectId,
        includePrivate: includePrivate && canManageNotes,
        notebook: selectedNotebook ?? undefined,
        tag: selectedTag ?? undefined
      })
    )
  }, [dispatch, projectId, includePrivate, canManageNotes, selectedNotebook, selectedTag])

  useEffect(() => {
    fetchCurrentNotes()
  }, [fetchCurrentNotes])

  const handleRefresh = () => {
    fetchCurrentNotes()
  }

  const handleCreateNote = () => {
    setEditorMode('create')
    setEditingNote(null)
    setIsEditorOpen(true)
  }

  const handleEditNote = (note: NoteSummary | NoteDetails) => {
    setEditorMode('edit')
    if ('body' in note) {
      setEditingNote(note)
      setIsEditorOpen(true)
      return
    }
    void dispatch(fetchNoteDetails(note.id))
      .unwrap()
      .then((details) => {
        setEditingNote(details)
        setIsEditorOpen(true)
      })
      .catch((error) => messageApi.error(extractErrorMessage(error)))
  }

  const handleViewerOpen = useCallback(
    (noteId: string) => {
      setViewerNoteId(noteId)
      void dispatch(fetchNoteDetails(noteId))
    },
    [dispatch]
  )

  useEffect(() => {
    const noteParam = searchParams.get('note')
    if (noteParam) {
      handleViewerOpen(noteParam)
      const next = new URLSearchParams(searchParams)
      next.delete('note')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, handleViewerOpen])

  const handleViewerClose = () => {
    setViewerNoteId(null)
  }

  const handleEditorSubmit = async (values: NoteFormValues) => {
    if (!projectId) {
      return
    }
    const sanitized = sanitizeFormValues(values)
    try {
      if (editorMode === 'create') {
        await dispatch(
          createNote({
            projectId,
            title: sanitized.title,
            body: sanitized.body,
            tags: sanitized.tags,
            notebook: sanitized.notebook,
            linkedTaskIds: sanitized.linkedTaskIds,
            isPrivate: sanitized.isPrivate
          })
        ).unwrap()
        messageApi.success(t('notes.feedback.created'))
      } else if (editingNote) {
        await dispatch(
          updateNote({
            noteId: editingNote.id,
            input: {
              title: sanitized.title,
              body: sanitized.body,
              tags: sanitized.tags,
              notebook: sanitized.notebook,
              linkedTaskIds: sanitized.linkedTaskIds,
              isPrivate: sanitized.isPrivate
            }
          })
        ).unwrap()
        messageApi.success(t('notes.feedback.updated'))
      }
      setIsEditorOpen(false)
      setEditingNote(null)
      fetchCurrentNotes()
    } catch (error) {
      messageApi.error(extractErrorMessage(error))
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!projectId) {
      return
    }
    try {
      await dispatch(deleteNote({ projectId, noteId })).unwrap()
      messageApi.success(t('notes.feedback.deleted'))
      setViewerNoteId((current) => (current === noteId ? null : current))
      fetchCurrentNotes()
    } catch (error) {
      messageApi.error(extractErrorMessage(error))
    }
  }

  const handleSearch = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }
    setIsSearchOpen(true)
    const payload: SearchNotesInput = {
      query: trimmed
    }
    if (includePrivate && canManageNotes && projectId) {
      payload.projectId = projectId
    }
    void dispatch(searchNotes(payload))
  }

  const notebooks = useMemo(() => buildNotebookOptions(notes), [notes])
  const tags = useMemo(() => buildTagOptions(notes), [notes])
  const noteLoading = notesStatus === 'loading'

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {contextHolder}
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col>
          <Space size={16} align="center">
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {project?.name ?? t('notes.title')}
            </Typography.Title>
            {canManageNotes ? (
              <Space size={8}>
                <Switch
                  checked={includePrivate}
                  onChange={setIncludePrivate}
                  checkedChildren={t('notes.filters.includePrivate')}
                  unCheckedChildren={t('notes.filters.includePrivate')}
                />
              </Space>
            ) : null}
          </Space>
        </Col>
        <Col>
          <Space wrap align="center">
            <Input.Search
              placeholder={t('notes.actions.searchPlaceholder')}
              onSearch={handleSearch}
              allowClear
              style={{ width: 220 }}
              enterButton={<SearchOutlined />}
            />
            <Select
              allowClear
              placeholder={t('notes.filters.notebook')}
              style={{ width: 180 }}
              options={notebooks}
              value={selectedNotebook ?? undefined}
              onChange={(value) => setSelectedNotebook(value ?? null)}
            />
            <Select
              allowClear
              placeholder={t('notes.filters.tag')}
              style={{ width: 180 }}
              options={tags}
              value={selectedTag ?? undefined}
              onChange={(value) => setSelectedTag(value ?? null)}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} disabled={noteLoading}>
              {t('details.refresh')}
            </Button>
            {canManageNotes ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNote}>
                {t('notes.actions.create')}
              </Button>
            ) : null}
          </Space>
        </Col>
      </Row>
      <List
        loading={noteLoading}
        dataSource={notes}
        renderItem={(note) => (
          <List.Item
            key={note.id}
            actions={[
              <Tooltip title={t('notes.actions.view')} key="view">
                <Button type="text" icon={<FileMarkdownOutlined />} onClick={() => handleViewerOpen(note.id)} />
              </Tooltip>,
              canManageNotes ? (
                <Tooltip title={t('notes.actions.edit')} key="edit">
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEditNote(note)} />
                </Tooltip>
              ) : null
            ].filter(Boolean)}
          >
            <List.Item.Meta
              title={
                <Space size={8}>
                  <Typography.Link onClick={() => handleViewerOpen(note.id)}>{note.title}</Typography.Link>
                  {note.isPrivate ? (
                    <Tooltip title={t('notes.labels.private')}>
                      <LockOutlined style={{ color: '#f97316' }} />
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('notes.labels.public')}>
                      <UnlockOutlined style={{ color: '#10b981' }} />
                    </Tooltip>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Typography.Text type="secondary">
                    {t('notes.list.updatedBy', {
                      user: note.owner.displayName,
                      date: dayjs(note.updatedAt).format('LLL')
                    })}
                  </Typography.Text>
                  <Space size={4} wrap>
                    {note.notebook ? <Tag color="geekblue">{note.notebook}</Tag> : null}
                    {note.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />

      <NoteEditorModal
        open={isEditorOpen}
        mode={editorMode}
        initialValues={editingNote}
        onCancel={() => {
          setIsEditorOpen(false)
          setEditingNote(null)
          dispatch(clearNoteErrors(undefined))
        }}
        onSubmit={handleEditorSubmit}
        submitting={mutationStatus === 'loading'}
        tasks={tasks}
      />
      <NoteViewerDrawer
        open={Boolean(viewerNoteId)}
        noteId={viewerNoteId}
        canManage={canManageNotes}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        onClose={handleViewerClose}
        onOpenTask={(taskId) => {
          handleViewerClose()
          setTimeout(() => openTaskDetails(taskId), 150)
        }}
      />
      <NoteSearchDrawer
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(noteId) => {
          setIsSearchOpen(false)
          handleViewerOpen(noteId)
        }}
        searchState={searchState}
      />
    </Space>
  )
}

const noteDefaultValues = (
  note: NoteSummary | NoteDetails | null,
  mode: NoteEditorMode
): NoteFormValues => ({
  title: note?.title ?? '',
  body: mode === 'edit' && note && 'body' in note ? note.body : '',
  tags: note?.tags ?? [],
  isPrivate: note?.isPrivate ?? false,
  linkedTaskIds: note?.linkedTasks?.map((linked) => linked.id) ?? [],
  notebook: note?.notebook ?? null
})

const NoteEditorModal = ({
  open,
  mode,
  initialValues,
  submitting,
  tasks,
  onSubmit,
  onCancel
}: NoteEditorProps): ReactElement => {
  const { t } = useTranslation('projects')
  const textareaRef = useRef<TextAreaRef | null>(null)
  const [suggestion, setSuggestion] = useState<{ query: string; start: number } | null>(null)
  const taskOptions = useMemo(() => buildTaskOptions(tasks), [tasks])
  const defaultValues = useMemo(() => noteDefaultValues(initialValues, mode), [initialValues, mode])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<NoteFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(noteFormSchema),
    defaultValues
  })

  const bodyValue = watch('body') ?? ''

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues, open])

  useEffect(() => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    if (!textarea) {
      setSuggestion(null)
      return
    }
    const handleSelectionChange = () => {
      const position = textarea.selectionStart ?? textarea.value.length
      const queryInfo = extractSuggestionQuery(textarea.value, position)
      setSuggestion(queryInfo)
    }
    textarea.addEventListener('keyup', handleSelectionChange)
    textarea.addEventListener('click', handleSelectionChange)
    return () => {
      textarea.removeEventListener('keyup', handleSelectionChange)
      textarea.removeEventListener('click', handleSelectionChange)
    }
  }, [])

  useEffect(() => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    if (!textarea) {
      return
    }
    const position = textarea.selectionStart ?? textarea.value.length
    const queryInfo = extractSuggestionQuery(bodyValue, position)
    setSuggestion(queryInfo)
  }, [bodyValue])

  const filteredTasks = useMemo(() => {
    if (!suggestion) {
      return []
    }
    const query = suggestion.query.toLowerCase()
    return tasks.filter(
      (task) =>
        task.key.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query)
    )
  }, [tasks, suggestion])

  const insertTaskReference = (task: TaskDetails) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    if (!textarea || !suggestion) {
      return
    }
    const selectionEnd = textarea.selectionEnd ?? textarea.value.length
    const before = textarea.value.slice(0, suggestion.start)
    const after = textarea.value.slice(selectionEnd)
    const insertion = `[[${task.key}]]`
    const nextValue = `${before}${insertion}${after}`
    setValue('body', nextValue, { shouldDirty: true })
    const currentLinks = getValues('linkedTaskIds') ?? []
    if (!currentLinks.includes(task.id)) {
      setValue('linkedTaskIds', [...currentLinks, task.id], { shouldDirty: true })
    }
    setSuggestion(null)
    requestAnimationFrame(() => {
      const caret = before.length + insertion.length
      textarea.focus()
      textarea.setSelectionRange(caret, caret)
    })
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit(async (values) => onSubmit(values))}
      confirmLoading={submitting}
      width={740}
      okText={mode === 'create' ? t('notes.actions.create') : t('notes.actions.save')}
      cancelText={t('notes.actions.cancel')}
      title={mode === 'create' ? t('notes.editor.createTitle') : t('notes.editor.editTitle')}
      destroyOnClose
    >
      <Form layout="vertical">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Form.Item
              label={t('notes.editor.fields.title')}
              required
              validateStatus={errors.title ? 'error' : ''}
              help={errors.title ? t(errors.title.message as string) : undefined}
            >
              <Input {...field} maxLength={160} />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          name="notebook"
          render={({ field }) => (
            <Form.Item
              label={t('notes.editor.fields.notebook')}
              validateStatus={errors.notebook ? 'error' : ''}
              help={errors.notebook ? t(errors.notebook.message as string) : undefined}
            >
              <Input
                {...field}
                value={field.value ?? ''}
                maxLength={80}
                placeholder={t('notes.editor.placeholders.notebook')}
              />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Form.Item
              label={t('notes.editor.fields.tags')}
              validateStatus={errors.tags ? 'error' : ''}
              help={errors.tags ? t(errors.tags.message as string) : undefined}
            >
              <Select
                {...field}
                mode="tags"
                tokenSeparators={[',']}
                placeholder={t('notes.editor.placeholders.tags')}
              />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          name="isPrivate"
          render={({ field }) => (
            <Form.Item label={t('notes.editor.fields.visibility')}>
              <Switch
                checked={field.value}
                onChange={(checked) => field.onChange(checked)}
                checkedChildren={t('notes.labels.private')}
                unCheckedChildren={t('notes.labels.public')}
              />
            </Form.Item>
          )}
        />
        <Controller
          control={control}
          name="body"
          render={({ field }) => (
            <Form.Item
              label={t('notes.editor.fields.body')}
              required
              validateStatus={errors.body ? 'error' : ''}
              help={errors.body ? t(errors.body.message as string) : undefined}
            >
              <Input.TextArea
                {...field}
                autoSize={{ minRows: 8 }}
                maxLength={50000}
                ref={textareaRef}
                placeholder={t('notes.editor.placeholders.body')}
                onChange={(event) => {
                  field.onChange(event)
                  const position = event.target.selectionStart ?? event.target.value.length
                  const queryInfo = extractSuggestionQuery(event.target.value, position)
                  setSuggestion(queryInfo)
                }}
                onSelect={(event) => {
                  const target = event.target as HTMLTextAreaElement
                  const position = target.selectionStart ?? target.value.length
                  const queryInfo = extractSuggestionQuery(target.value, position)
                  setSuggestion(queryInfo)
                }}
              />
            </Form.Item>
          )}
        />
        {suggestion ? (
          <Card size="small" style={{ marginBottom: 16 }} title={t('notes.editor.suggestions.title')}>
            {filteredTasks.length ? (
              <Space direction="vertical" size={8}>
                {filteredTasks.slice(0, 8).map((task) => (
                  <Button
                    key={task.id}
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => insertTaskReference(task)}
                    style={{ padding: 0, textAlign: 'left' }}
                  >
                    {task.key} · {task.title}
                  </Button>
                ))}
              </Space>
            ) : (
              <Typography.Text type="secondary">
                {t('notes.editor.suggestions.empty')}
              </Typography.Text>
            )}
          </Card>
        ) : null}
        <Controller
          control={control}
          name="linkedTaskIds"
          render={({ field }) => (
            <Form.Item
              label={t('notes.editor.fields.linkedTasks')}
              validateStatus={errors.linkedTaskIds ? 'error' : ''}
              help={errors.linkedTaskIds ? t(errors.linkedTaskIds.message as string) : undefined}
            >
              <Select
                {...field}
                mode="multiple"
                allowClear
                placeholder={t('notes.editor.placeholders.linkedTasks')}
                options={taskOptions}
              />
            </Form.Item>
          )}
        />
      </Form>
    </Modal>
  )
}

const NoteViewerDrawer = ({
  open,
  noteId,
  canManage,
  onEdit,
  onDelete,
  onClose,
  onOpenTask
}: NoteViewerProps): ReactElement => {
  const { t } = useTranslation('projects')
  const detailState = useAppSelector(noteId ? selectNoteDetailsState(noteId) : () => null)
  const note = detailState?.data ?? null
  const loading = detailState?.status === 'loading'

  return (
    <Drawer
      title={note ? note.title : t('notes.viewer.title')}
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        note && canManage ? (
          <Space>
            <Button icon={<EditOutlined />} onClick={() => onEdit(note)}>
              {t('notes.actions.edit')}
            </Button>
            <Popconfirm
              title={t('notes.actions.deleteTitle')}
              description={t('notes.actions.deleteConfirmText')}
              okText={t('notes.actions.delete')}
              cancelText={t('notes.actions.cancel')}
              onConfirm={() => note && onDelete(note.id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                {t('notes.actions.delete')}
              </Button>
            </Popconfirm>
          </Space>
        ) : null
      }
    >
      {loading ? (
        <Skeleton active />
      ) : note ? (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Space size={8} wrap>
            {note.isPrivate ? (
              <Badge color="orange" text={t('notes.labels.private')} />
            ) : (
              <Badge color="green" text={t('notes.labels.public')} />
            )}
            {note.notebook ? <Tag color="geekblue">{note.notebook}</Tag> : null}
            {note.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
          <Typography.Text type="secondary">
            {t('notes.viewer.updatedBy', {
              user: note.owner.displayName,
              date: dayjs(note.updatedAt).format('LLL')
            })}
          </Typography.Text>
          <Divider style={{ margin: '8px 0' }} />
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {note.body}
          </ReactMarkdown>
          <Divider />
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Typography.Text strong>{t('notes.viewer.linkedTasks')}</Typography.Text>
            {note.linkedTasks.length ? (
              note.linkedTasks.map((linked) => (
                <Button
                  key={linked.id}
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    onClose()
                    setTimeout(() => onOpenTask(linked.id), 150)
                  }}
                >
                  {linked.title} ({linked.key})
                </Button>
              ))
            ) : (
              <Typography.Text type="secondary">{t('notes.viewer.noLinks')}</Typography.Text>
            )}
          </Space>
        </Space>
      ) : (
        <Typography.Text type="secondary">{t('notes.viewer.empty')}</Typography.Text>
      )}
    </Drawer>
  )
}

const NoteSearchDrawer = ({
  open,
  searchState,
  onClose,
  onSelect
}: NoteSearchDrawerProps): ReactElement => {
  const { t } = useTranslation('projects')

  return (
    <Drawer
      title={t('notes.search.title')}
      placement="right"
      open={open}
      onClose={onClose}
      width={480}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <List
          loading={searchState.status === 'loading'}
          dataSource={searchState.results}
          locale={{ emptyText: t('notes.search.empty') }}
          renderItem={(note) => (
            <List.Item
              key={note.id}
              actions={[
                <Button type="link" onClick={() => onSelect(note.id)} key="open">
                  {t('notes.search.open')}
                </Button>
              ]}
            >
              <List.Item.Meta
                title={note.title}
                description={
                  <Space direction="vertical" size={4}>
                    <HighlightSnippet highlight={note.highlight} />
                    <Space size={4} wrap>
                      {note.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Drawer>
  )
}

const HighlightSnippet = ({ highlight }: { highlight: string | null | undefined }) => {
  const { t } = useTranslation('projects')
  if (!highlight) {
    return (
      <Typography.Text type="secondary">{t('notes.search.noHighlight')}</Typography.Text>
    )
  }
  const segments = highlight.split(/(<mark>|<\/mark>)/g)
  let active = false
  const nodes = segments
    .map((segment, index) => {
      if (segment === '<mark>') {
        active = true
        return null
      }
      if (segment === '</mark>') {
        active = false
        return null
      }
      if (!segment) {
        return null
      }
      return active ? (
        <mark key={`${segment}-${index}`}>{segment}</mark>
      ) : (
        <span key={`${segment}-${index}`}>{segment}</span>
      )
    })
    .filter(Boolean)
  return <Typography.Paragraph style={{ marginBottom: 0 }}>{nodes}</Typography.Paragraph>
}

export { ProjectNotesPage }
export default ProjectNotesPage
