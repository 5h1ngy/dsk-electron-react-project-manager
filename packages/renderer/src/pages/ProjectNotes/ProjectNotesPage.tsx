import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import {
  Badge,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Switch,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Segmented,
  Tag,
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
import MarkdownEditor, {
  type MarkdownSuggestion
} from '@renderer/components/Markdown/MarkdownEditor'
import MarkdownViewer from '@renderer/components/Markdown/MarkdownViewer'
import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'

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
    label: `${task.key} - ${task.title}`,
    value: task.id
  }))

const buildTaskSuggestions = (tasks: TaskDetails[]): MarkdownSuggestion[] =>
  tasks.map((task) => ({
    id: task.id,
    label: task.key,
    description: task.title
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
  const includePrivateOptions = useMemo(
    () => [
      {
        label: (
          <Space size={6}>
            <UnlockOutlined />
            <Typography.Text type="secondary">
              {t('notes.filters.includePrivateOptions.public')}
            </Typography.Text>
          </Space>
        ),
        value: 'public'
      },
      {
        label: (
          <Space size={6}>
            <LockOutlined />
            <Typography.Text type="secondary">
              {t('notes.filters.includePrivateOptions.private')}
            </Typography.Text>
          </Space>
        ),
        value: 'private'
      }
    ],
    [t]
  )

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {contextHolder}
      <Typography.Title level={4} style={{ marginBottom: 0 }}>
        {project?.name ?? t('notes.title')}
      </Typography.Title>
      <BorderedPanel padding="lg" style={{ width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {canManageNotes ? (
            <Segmented
              size="large"
              value={includePrivate ? 'private' : 'public'}
              onChange={(value) => setIncludePrivate(value === 'private')}
              options={includePrivateOptions}
              style={{ alignSelf: 'flex-start' }}
            />
          ) : null}
          <Space wrap align="center" size="middle">
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
          </Space>
        </Space>
      </BorderedPanel>
      <BorderedPanel padding="md" style={{ width: '100%' }}>
        <Space wrap align="center" size="small">
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} disabled={noteLoading}>
            {t('details.refresh')}
          </Button>
          {canManageNotes ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateNote}>
              {t('notes.actions.create')}
            </Button>
          ) : null}
        </Space>
      </BorderedPanel>
      <List
        loading={noteLoading}
        dataSource={notes}
        renderItem={(note) => (
          <List.Item
            key={note.id}
            actions={[
              <Button
                key="view"
                type="text"
                icon={<FileMarkdownOutlined />}
                onClick={() => handleViewerOpen(note.id)}
              >
                {t('notes.actions.view')}
              </Button>,
              canManageNotes ? (
                <Button
                  key="edit"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditNote(note)}
                >
                  {t('notes.actions.edit')}
                </Button>
              ) : null
            ].filter(Boolean)}
          >
            <List.Item.Meta
              title={
                <Space size={8}>
                  <Typography.Link onClick={() => handleViewerOpen(note.id)}>{note.title}</Typography.Link>
                  {note.isPrivate ? (
                    <Tag icon={<LockOutlined />} color="orange">
                      {t('notes.labels.private')}
                    </Tag>
                  ) : (
                    <Tag icon={<UnlockOutlined />} color="success">
                      {t('notes.labels.public')}
                    </Tag>
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
      <NoteDetailsModal
        open={Boolean(viewerNoteId)}
        noteId={viewerNoteId}
        canManage={canManageNotes}
        tasks={tasks}
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
  const taskOptions = useMemo(() => buildTaskOptions(tasks), [tasks])
  const taskSuggestions = useMemo(() => buildTaskSuggestions(tasks), [tasks])
  const defaultValues = useMemo(() => noteDefaultValues(initialValues, mode), [initialValues, mode])

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<NoteFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(noteFormSchema),
    defaultValues
  })

  useEffect(() => {
    if (open) {
      reset(defaultValues)
    }
  }, [defaultValues, open, reset])

  const ensureTaskLinked = useCallback(
    (taskId: string) => {
      const current = getValues('linkedTaskIds') ?? []
      if (current.includes(taskId)) {
        return
      }
      const next = [...current, taskId]
      setValue('linkedTaskIds', next, { shouldDirty: true, shouldValidate: true })
    },
    [getValues, setValue]
  )

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit(async (values) => onSubmit(values))}
      confirmLoading={submitting}
      width={760}
      okText={mode === 'create' ? t('notes.actions.create') : t('notes.actions.save')}
      cancelText={t('notes.actions.cancel')}
      title={mode === 'create' ? t('notes.editor.createTitle') : t('notes.editor.editTitle')}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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
              <Input {...field} value={field.value ?? ''} maxLength={160} />
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
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={(next) => field.onChange(next)}
                placeholder={t('notes.editor.placeholders.body')}
                maxLength={50000}
                suggestions={taskSuggestions}
                onInsertSuggestion={(item) => ensureTaskLinked(item.id)}
              />
            </Form.Item>
          )}
        />
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

interface NoteDetailsModalProps {
  open: boolean
  noteId: string | null
  canManage: boolean
  tasks: TaskDetails[]
  onDelete: (noteId: string) => Promise<void>
  onClose: () => void
  onOpenTask: (taskId: string) => void
}

const NoteDetailsModal = ({
  open,
  noteId,
  canManage,
  tasks,
  onDelete,
  onClose,
  onOpenTask
}: NoteDetailsModalProps): ReactElement => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const detailState = useAppSelector(noteId ? selectNoteDetailsState(noteId) : () => null)
  const note = detailState?.data ?? null
  const loading = detailState?.status === 'loading'
  const mutationStatus = useAppSelector(selectNotesMutationStatus)
  const submitting = mutationStatus === 'loading'
  const form = useForm<NoteFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(noteFormSchema),
    defaultValues: noteDefaultValues(null, 'edit')
  })
  const taskOptions = useMemo(() => buildTaskOptions(tasks), [tasks])
  const taskSuggestions = useMemo(() => buildTaskSuggestions(tasks), [tasks])

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors }
  } = form

  useEffect(() => {
    if (open && note) {
      reset(noteDefaultValues(note, 'edit'))
    }
  }, [note, open, reset])

  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  const ensureTaskLinked = useCallback(
    (taskId: string) => {
      const current = getValues('linkedTaskIds') ?? []
      if (current.includes(taskId)) {
        return
      }
      const next = [...current, taskId]
      setValue('linkedTaskIds', next, { shouldDirty: true, shouldValidate: true })
    },
    [getValues, setValue]
  )

  const handleUpdate = handleSubmit(async (values) => {
    if (!note) {
      return
    }
    const sanitized = sanitizeFormValues(values)
    try {
      await dispatch(
        updateNote({
          noteId: note.id,
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
      await dispatch(fetchNoteDetails(note.id))
      message.success(t('notes.feedback.updated'))
      setIsEditing(false)
    } catch (error) {
      message.error(extractErrorMessage(error))
    }
  })

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={note ? note.title : t('notes.viewer.title')}
      width={760}
      footer={
        note && canManage ? (
          <Space>
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>{t('notes.actions.cancel')}</Button>
                <Button type="primary" onClick={handleUpdate} loading={submitting}>
                  {t('notes.actions.save')}
                </Button>
              </>
            ) : (
              <>
                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
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
              </>
            )}
          </Space>
        ) : null
      }
      destroyOnHidden
    >
      {loading ? (
        <Skeleton active />
      ) : note ? (
        isEditing ? (
          <Form layout="vertical" onFinish={handleUpdate}>
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
                  <Input {...field} value={field.value ?? ''} maxLength={160} />
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
                  <MarkdownEditor
                    value={field.value ?? ''}
                    onChange={(next) => field.onChange(next)}
                    placeholder={t('notes.editor.placeholders.body')}
                    maxLength={50000}
                    suggestions={taskSuggestions}
                    onInsertSuggestion={(item) => ensureTaskLinked(item.id)}
                  />
                </Form.Item>
              )}
            />
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
        ) : (
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
            <MarkdownViewer value={note.body} />
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
        )
      ) : (
        <Typography.Text type="secondary">{t('notes.viewer.empty')}</Typography.Text>
      )}
    </Modal>
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


