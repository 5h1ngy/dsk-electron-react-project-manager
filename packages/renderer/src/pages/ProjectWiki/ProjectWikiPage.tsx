import { useEffect, useMemo, useState } from 'react'
import type { JSX } from 'react'
import {
  Button,
  Card,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Typography,
  message
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

import { MarkdownEditor } from '@renderer/components/Markdown/MarkdownEditor'
import { MarkdownViewer } from '@renderer/components/Markdown/MarkdownViewer'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout/useProjectRouteContext'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  createWikiPage,
  deleteWikiPage,
  fetchWikiPage,
  fetchWikiPages,
  fetchWikiRevisions,
  restoreWikiRevision,
  updateWikiPage
} from '@renderer/store/slices/wiki'
import {
  selectWikiPageDetails,
  selectWikiPageError,
  selectWikiPageStatus,
  selectWikiPages,
  selectWikiRevisions,
  selectWikiStatus
} from '@renderer/store/slices/wiki/selectors'
import type { WikiRevision, WikiRevisionsState } from '@renderer/store/slices/wiki/types'

const { TextArea } = Input

interface WikiFormValues {
  title: string
  summary?: string
}

const defaultRevisionsState: WikiRevisionsState = {
  items: [],
  status: 'idle',
  error: undefined
}

const resolveErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    return error.message.split(':').pop() ?? error.message
  }
  return String(error)
}

const ProjectWikiPage = (): JSX.Element => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const {
    projectId,
    project,
    canManageWiki,
    refreshWiki
  } = useProjectRouteContext()

  const safeProjectId = projectId ?? ''

  const [messageApi, messageContext] = message.useMessage()

  const pages = useAppSelector(selectWikiPages(safeProjectId))
  const pagesStatus = useAppSelector(selectWikiStatus(safeProjectId))

  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isRevisionModalOpen, setRevisionModalOpen] = useState(false)

  const selectedPage = useAppSelector((state) =>
    selectedPageId ? selectWikiPageDetails(safeProjectId, selectedPageId)(state) : undefined
  )
  const selectedPageStatus = useAppSelector((state) =>
    selectedPageId ? selectWikiPageStatus(safeProjectId, selectedPageId)(state) : 'idle'
  )
  const selectedPageError = useAppSelector((state) =>
    selectedPageId ? selectWikiPageError(safeProjectId, selectedPageId)(state) : undefined
  )
  const revisionsState = useAppSelector((state) =>
    selectedPageId ? selectWikiRevisions(safeProjectId, selectedPageId)(state) : defaultRevisionsState
  )

  const [createForm] = Form.useForm<WikiFormValues>()
  const [createContent, setCreateContent] = useState('')
  const [editForm] = Form.useForm<WikiFormValues>()
  const [editorContent, setEditorContent] = useState('')

  useEffect(() => {
    if (!projectId) {
      return
    }
    if (pagesStatus === 'idle') {
      void dispatch(fetchWikiPages(projectId))
    }
  }, [dispatch, pagesStatus, projectId])

  useEffect(() => {
    if (!selectedPageId && pages.length > 0) {
      setSelectedPageId(pages[0].id)
    }
  }, [pages, selectedPageId])

  useEffect(() => {
    if (!projectId || !selectedPageId) {
      return
    }
    if (!selectedPage && selectedPageStatus === 'idle') {
      void dispatch(fetchWikiPage({ projectId, pageId: selectedPageId }))
    }
  }, [dispatch, projectId, selectedPage, selectedPageId, selectedPageStatus])

  useEffect(() => {
    if (!selectedPage) {
      setIsEditing(false)
      return
    }
    editForm.setFieldsValue({
      title: selectedPage.title,
      summary: selectedPage.summary ?? undefined
    })
    setEditorContent(selectedPage.content)
  }, [editForm, selectedPage])

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId)
    setIsEditing(false)
  }

  const handleOpenCreateModal = () => {
    createForm.resetFields()
    setCreateContent('')
    setCreateModalOpen(true)
  }

  const handleCreatePage = async () => {
    if (!projectId) {
      return
    }
    try {
      const values = await createForm.validateFields()
      if (!createContent.trim()) {
        messageApi.warning(
          t('wiki.validation.contentRequired', { defaultValue: 'Inserisci il contenuto della pagina.' })
        )
        return
      }
      const result = await dispatch(
        createWikiPage({
          projectId,
          title: values.title,
          summary: values.summary ?? null,
          content: createContent
        })
      ).unwrap()
      setCreateModalOpen(false)
      setSelectedPageId(result.page.id)
      messageApi.success(t('wiki.feedback.created', { defaultValue: 'Pagina creata.' }))
    } catch (error) {
      messageApi.error(resolveErrorMessage(error))
    }
  }

  const handleUpdatePage = async () => {
    if (!projectId || !selectedPageId) {
      return
    }
    try {
      const values = await editForm.validateFields()
      if (!editorContent.trim()) {
        messageApi.warning(
          t('wiki.validation.contentRequired', { defaultValue: 'Inserisci il contenuto della pagina.' })
        )
        return
      }
      await dispatch(
        updateWikiPage({
          projectId,
          pageId: selectedPageId,
          title: values.title,
          summary: values.summary ?? null,
          content: editorContent
        })
      ).unwrap()
      setIsEditing(false)
      messageApi.success(t('wiki.feedback.updated', { defaultValue: 'Pagina aggiornata.' }))
    } catch (error) {
      messageApi.error(resolveErrorMessage(error))
    }
  }

  const handleDeletePage = (pageId: string) => {
    if (!projectId) {
      return
    }
    Modal.confirm({
      title: t('wiki.delete.confirmTitle', { defaultValue: 'Eliminare la pagina?' }),
      content: t('wiki.delete.confirmDescription', {
        defaultValue: 'Questa azione rimuovera la pagina e la sua cronologia.'
      }),
      okText: t('wiki.delete.confirmButton', { defaultValue: 'Elimina' }),
      okButtonProps: { danger: true },
      cancelText: t('wiki.delete.cancel', { defaultValue: 'Annulla' }),
      onOk: async () => {
        try {
          await dispatch(deleteWikiPage({ projectId, pageId })).unwrap()
          if (selectedPageId === pageId) {
            const remaining = pages.filter((page) => page.id !== pageId)
            setSelectedPageId(remaining.length ? remaining[0].id : null)
          }
          messageApi.success(t('wiki.feedback.deleted', { defaultValue: 'Pagina eliminata.' }))
        } catch (error) {
          messageApi.error(resolveErrorMessage(error))
        }
      }
    })
  }

  const handleOpenRevisions = () => {
    if (!projectId || !selectedPageId) {
      return
    }
    setRevisionModalOpen(true)
    if (revisionsState.status === 'idle') {
      void dispatch(fetchWikiRevisions({ projectId, pageId: selectedPageId }))
    }
  }

  const handleRestoreRevision = async (revision: WikiRevision) => {
    if (!projectId || !selectedPageId) {
      return
    }
    try {
      await dispatch(
        restoreWikiRevision({ projectId, pageId: selectedPageId, revisionId: revision.id })
      ).unwrap()
      messageApi.success(t('wiki.feedback.restored', { defaultValue: 'Revisione ripristinata.' }))
      setRevisionModalOpen(false)
    } catch (error) {
      messageApi.error(resolveErrorMessage(error))
    }
  }

  const isListLoading = pagesStatus === 'loading'
  const isPageLoading = selectedPageStatus === 'loading'

  const canEdit = Boolean(canManageWiki)
  const hasPages = pages.length > 0

  const pageHeader = useMemo(() => {
    if (!selectedPage) {
      return null
    }
    return (
      <Flex justify="space-between" align="center" wrap>
        <div>
          <Typography.Title level={4} style={{ marginBottom: 4 }}>
            {selectedPage.title}
          </Typography.Title>
          <Typography.Text type="secondary">
            {project?.name ?? ''}
          </Typography.Text>
        </div>
        <Space>
          {canEdit ? (
            <>
              {isEditing ? (
                <>
                  <Button icon={<SaveOutlined />} type="primary" onClick={handleUpdatePage}>
                    {t('wiki.actions.save', { defaultValue: 'Salva' })}
                  </Button>
                  <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)}>
                    {t('wiki.actions.cancel', { defaultValue: 'Annulla' })}
                  </Button>
                </>
              ) : (
                <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  {t('wiki.actions.edit', { defaultValue: 'Modifica' })}
                </Button>
              )}
              <Button danger icon={<DeleteOutlined />} onClick={() => handleDeletePage(selectedPage.id)}>
                {t('wiki.actions.delete', { defaultValue: 'Elimina' })}
              </Button>
            </>
          ) : null}
          <Button icon={<HistoryOutlined />} onClick={handleOpenRevisions}>
            {t('wiki.actions.history', { defaultValue: 'Cronologia' })}
          </Button>
        </Space>
      </Flex>
    )
  }, [canEdit, handleOpenRevisions, handleUpdatePage, selectedPage, isEditing, project?.name, t])

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {messageContext}
      <Flex align="center" justify="space-between" wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {t('wiki.title', { defaultValue: 'Wiki' })}
        </Typography.Title>
        <Space>
          <Button onClick={() => refreshWiki()}>{t('wiki.actions.refresh', { defaultValue: 'Aggiorna' })}</Button>
          {canEdit ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
              {t('wiki.actions.create', { defaultValue: 'Nuova pagina' })}
            </Button>
          ) : null}
        </Space>
      </Flex>
      <Flex gap={16} align="stretch" wrap style={{ width: '100%' }}>
        <Card
          style={{ flex: '0 0 280px', maxWidth: 320, minWidth: 240 }}
          styles={{ body: { padding: 0 } }}
        >
          {isListLoading ? (
            <Flex justify="center" align="center" style={{ padding: 24 }}>
              <Spin />
            </Flex>
          ) : hasPages ? (
            <List
              itemLayout="vertical"
              dataSource={pages}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => handleSelectPage(item.id)}
                  style={{
                    cursor: 'pointer',
                    background: item.id === selectedPageId ? 'var(--ant-color-primary-bg)' : undefined,
                    borderLeft:
                      item.id === selectedPageId ? '3px solid var(--ant-color-primary)' : '3px solid transparent',
                    paddingLeft: 12,
                    paddingRight: 12
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Flex align="center" justify="space-between">
                        <Typography.Text strong>{item.title}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </Typography.Text>
                      </Flex>
                    }
                    description={item.summary ? (
                      <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                        {item.summary}
                      </Typography.Paragraph>
                    ) : (
                      <Typography.Text type="secondary">
                        {t('wiki.list.noSummary', { defaultValue: 'Nessun riassunto' })}
                      </Typography.Text>
                    )}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Flex justify="center" align="center" vertical style={{ padding: 24 }}>
              <Empty
                description={t('wiki.emptyState', {
                  defaultValue: 'La wiki del progetto  -  vuota.'
                })}
              >
                {canEdit ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
                    {t('wiki.actions.createFirst', { defaultValue: 'Crea la prima pagina' })}
                  </Button>
                ) : null}
              </Empty>
            </Flex>
          )}
        </Card>
        <Card
          style={{ flex: 1, minWidth: 320 }}
          styles={{ body: { display: 'flex', flexDirection: 'column', gap: 16 } }}
        >
          {pageHeader}
          {isPageLoading ? (
            <Flex justify="center" style={{ padding: 48 }}>
              <Spin />
            </Flex>
          ) : selectedPage ? (
            isEditing ? (
              <Form form={editForm} layout="vertical" style={{ width: '100%' }}>
                <Form.Item
                  label={t('wiki.fields.title', { defaultValue: 'Titolo' })}
                  name="title"
                  rules={[{ required: true, message: t('wiki.validation.title', { defaultValue: 'Inserisci un titolo.' }) }]}
                >
                  <Input maxLength={160} />
                </Form.Item>
                <Form.Item label={t('wiki.fields.summary', { defaultValue: 'Riassunto' })} name="summary">
                  <TextArea maxLength={240} autoSize={{ minRows: 2, maxRows: 4 }} />
                </Form.Item>
                <Typography.Text strong>
                  {t('wiki.fields.content', { defaultValue: 'Contenuto' })}
                </Typography.Text>
                <MarkdownEditor value={editorContent} onChange={setEditorContent} />
              </Form>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selectedPage.summary ? (
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {selectedPage.summary}
                  </Typography.Paragraph>
                ) : null}
                <MarkdownViewer value={selectedPage.content} />
              </div>
            )
          ) : (
            <Flex justify="center" style={{ padding: 48 }}>
              <Empty description={t('wiki.noSelection', { defaultValue: 'Seleziona una pagina dalla lista.' })} />
            </Flex>
          )}
          {selectedPageError ? (
            <Typography.Text type="danger">{selectedPageError}</Typography.Text>
          ) : null}
        </Card>
      </Flex>
      <Modal
        open={isCreateModalOpen}
        title={t('wiki.create.title', { defaultValue: 'Nuova pagina' })}
        onCancel={() => setCreateModalOpen(false)}
        okText={t('wiki.actions.create', { defaultValue: 'Crea' })}
        onOk={handleCreatePage}
        width={720}
        destroyOnHidden
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Form form={createForm} layout="vertical">
            <Form.Item
              label={t('wiki.fields.title', { defaultValue: 'Titolo' })}
              name="title"
              rules={[{ required: true, message: t('wiki.validation.title', { defaultValue: 'Inserisci un titolo.' }) }]}
            >
              <Input maxLength={160} />
            </Form.Item>
            <Form.Item label={t('wiki.fields.summary', { defaultValue: 'Riassunto' })} name="summary">
              <TextArea maxLength={240} autoSize={{ minRows: 2, maxRows: 4 }} />
            </Form.Item>
          </Form>
          <div>
            <Typography.Text strong>
              {t('wiki.fields.content', { defaultValue: 'Contenuto' })}
            </Typography.Text>
            <MarkdownEditor value={createContent} onChange={setCreateContent} />
          </div>
        </Space>
      </Modal>
      <Modal
        open={isRevisionModalOpen}
        title={t('wiki.revisions.title', { defaultValue: 'Cronologia revisioni' })}
        onCancel={() => setRevisionModalOpen(false)}
        footer={null}
        width={720}
        destroyOnHidden
      >
        {revisionsState.status === 'loading' ? (
          <Flex justify="center" style={{ padding: 24 }}>
            <Spin />
          </Flex>
        ) : revisionsState.items.length ? (
          <List<WikiRevision>
            dataSource={revisionsState.items}
            renderItem={(item: WikiRevision) => (
              <List.Item
                key={item.id}
                actions={
                  canEdit
                    ? [
                        <Button key="restore" type="link" onClick={() => handleRestoreRevision(item)}>
                          {t('wiki.revisions.restore', { defaultValue: 'Ripristina' })}
                        </Button>
                      ]
                    : undefined
                }
              >
                <List.Item.Meta
                  title={`${item.title}`}
                  description={
                    <Space direction="vertical" size={4}>
                      <Typography.Text type="secondary">
                        {new Date(item.createdAt).toLocaleString()}  -  {item.createdBy.displayName ?? item.createdBy.username}
                      </Typography.Text>
                      {item.summary ? (
                        <Typography.Text>{item.summary}</Typography.Text>
                      ) : (
                        <Typography.Text type="secondary">
                          {t('wiki.revisions.noSummary', { defaultValue: 'Nessun riassunto' })}
                        </Typography.Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description={t('wiki.revisions.empty', { defaultValue: 'Nessuna revisione disponibile.' })} />
        )}
      </Modal>
    </Space>
  )
}

ProjectWikiPage.displayName = 'ProjectWikiPage'

export default ProjectWikiPage
