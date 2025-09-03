import { useEffect, useMemo, useState } from 'react'
import { Button, Table, Tag, Space, Modal, Form, Input, Select, Switch, message, Alert } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import type { UserDTO } from '@main/auth/authService'
import { ROLE_NAMES, type RoleName } from '@main/auth/constants'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  clearError as clearAuthError,
  createUser as createUserThunk,
  loadUsers,
  selectAuthError,
  selectUsers,
  updateUser as updateUserThunk
} from '@renderer/store/slices/auth'

const createUserSchema = z.object({
  username: z.string().min(3).max(32),
  displayName: z.string().min(1).max(64),
  password: z.string().min(8),
  roles: z.array(z.enum(ROLE_NAMES)).min(1),
  isActive: z.boolean()
})

const updateUserSchema = z.object({
  displayName: z.string().min(1).max(64),
  password: z.string().min(8).optional(),
  roles: z.array(z.enum(ROLE_NAMES)).min(1),
  isActive: z.boolean()
})

type CreateUserValues = z.infer<typeof createUserSchema>
type UpdateUserValues = z.infer<typeof updateUserSchema>

const roleOptions = ROLE_NAMES.map((role) => ({ label: role, value: role }))

export const UserManagementPanel = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectUsers)
  const error = useAppSelector(selectAuthError)

  const [messageApi, contextHolder] = message.useMessage()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null)

  useEffect(() => {
    void dispatch(loadUsers())
  }, [dispatch])

  const {
    control: createControl,
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: createSubmitting }
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: '', displayName: '', password: '', roles: ['Viewer'], isActive: true }
  })

  const {
    control: updateControl,
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    formState: { errors: updateErrors, isSubmitting: updateSubmitting }
  } = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { displayName: '', roles: ['Viewer'], isActive: true, password: undefined }
  })

  const openCreateModal = () => {
    dispatch(clearAuthError())
    resetCreate()
    setCreateOpen(true)
  }

  const closeCreateModal = () => setCreateOpen(false)

  const openEditModal = (user: UserDTO) => {
    dispatch(clearAuthError())
    setEditingUser(user)
    resetUpdate({
      displayName: user.displayName,
      roles: user.roles,
      isActive: user.isActive,
      password: undefined
    })
  }

  const closeEditModal = () => setEditingUser(null)

  const onCreateSubmit = async (values: CreateUserValues) => {
    try {
      await dispatch(createUserThunk(values)).unwrap()
      messageApi.success('Utente creato correttamente')
      closeCreateModal()
      await dispatch(loadUsers())
    } catch (err) {
      const messageText = typeof err === 'string' ? err : (err as Error).message ?? 'Errore creazione utente'
      messageApi.error(messageText)
    }
  }

  const onUpdateSubmit = async (values: UpdateUserValues) => {
    if (!editingUser) {
      return
    }
    try {
      const payload = { ...values }
      if (!values.password) {
        delete (payload as Partial<UpdateUserValues>).password
      }
      await dispatch(updateUserThunk({ userId: editingUser.id, input: payload })).unwrap()
      messageApi.success('Utente aggiornato')
      closeEditModal()
      await dispatch(loadUsers())
    } catch (err) {
      const messageText = typeof err === 'string' ? err : (err as Error).message ?? 'Errore aggiornamento utente'
      messageApi.error(messageText)
    }
  }

  const columns = useMemo<ColumnsType<UserDTO>>(
    () => [
      { title: 'Username', dataIndex: 'username', key: 'username' },
      { title: 'Nome', dataIndex: 'displayName', key: 'displayName' },
      {
        title: 'Ruoli',
        dataIndex: 'roles',
        key: 'roles',
        render: (roles: RoleName[]) => (
          <Space size={4} wrap>
            {roles.map((role) => (
              <Tag key={role} color="blue">
                {role}
              </Tag>
            ))}
          </Space>
        )
      },
      {
        title: 'Stato',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
          <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Attivo' : 'Disattivo'}</Tag>
        )
      },
      {
        title: 'Azioni',
        key: 'actions',
        render: (_value, record) => (
          <Space>
            <Button size="small" onClick={() => openEditModal(record)}>
              Modifica
            </Button>
          </Space>
        )
      }
    ],
    []
  )

  return (
    <div>
      {contextHolder}
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Button type="primary" onClick={openCreateModal}>
            Nuovo utente
          </Button>
          <Button
            onClick={() => {
              void dispatch(loadUsers())
            }}
          >
            Aggiorna
          </Button>
        </div>
        {error && (
          <Alert
            type="error"
            message="Errore"
            description={error}
            onClose={() => dispatch(clearAuthError())}
            closable
          />
        )}
        <Table<UserDTO>
          rowKey="id"
          dataSource={users}
          columns={columns}
          locale={{ emptyText: 'Nessun utente' }}
        />
      </Space>

      <Modal
        open={isCreateOpen}
        onCancel={closeCreateModal}
        title="Crea utente"
        okText="Crea"
        onOk={handleCreateSubmit(onCreateSubmit)}
        confirmLoading={createSubmitting}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Username" validateStatus={createErrors.username ? 'error' : undefined} help={createErrors.username?.message}>
            <Input {...registerCreate('username', { setValueAs: (value) => value.trim() })} autoComplete="off" />
          </Form.Item>
          <Form.Item label="Nome" validateStatus={createErrors.displayName ? 'error' : undefined} help={createErrors.displayName?.message}>
            <Input {...registerCreate('displayName', { setValueAs: (value) => value.trim() })} autoComplete="off" />
          </Form.Item>
          <Form.Item label="Password" validateStatus={createErrors.password ? 'error' : undefined} help={createErrors.password?.message}>
            <Input.Password {...registerCreate('password')} autoComplete="new-password" />
          </Form.Item>
          <Form.Item label="Ruoli" validateStatus={createErrors.roles ? 'error' : undefined} help={createErrors.roles?.message}>
            <Controller
              control={createControl}
              name="roles"
              render={({ field }) => (
                <Select
                  {...field}
                  mode="multiple"
                  options={roleOptions}
                  placeholder="Seleziona ruoli"
                />
              )}
            />
          </Form.Item>
          <Form.Item label="Attivo" valuePropName="checked">
            <Controller
              control={createControl}
              name="isActive"
              render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={Boolean(editingUser)}
        onCancel={closeEditModal}
        title={`Modifica utente ${editingUser?.username ?? ''}`}
        okText="Salva"
        onOk={handleUpdateSubmit(onUpdateSubmit)}
        confirmLoading={updateSubmitting}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Nome" validateStatus={updateErrors.displayName ? 'error' : undefined} help={updateErrors.displayName?.message}>
            <Input {...registerUpdate('displayName', { setValueAs: (value) => value.trim() })} autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Nuova password"
            validateStatus={updateErrors.password ? 'error' : undefined}
            help={updateErrors.password?.message}
            extra="Lascia vuoto per mantenere la password attuale"
          >
            <Input.Password
              {...registerUpdate('password', {
                setValueAs: (value) => (value ? value : undefined)
              })}
              autoComplete="new-password"
              allowClear
            />
          </Form.Item>
          <Form.Item label="Ruoli" validateStatus={updateErrors.roles ? 'error' : undefined} help={updateErrors.roles?.message}>
            <Controller
              control={updateControl}
              name="roles"
              render={({ field }) => (
                <Select
                  {...field}
                  mode="multiple"
                  options={roleOptions}
                  placeholder="Seleziona ruoli"
                />
              )}
            />
          </Form.Item>
          <Form.Item label="Attivo" valuePropName="checked">
            <Controller
              control={updateControl}
              name="isActive"
              render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
