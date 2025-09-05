import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Modal, Select, Switch } from 'antd'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { ROLE_NAMES, type RoleName } from '@main/auth/constants'

import type { UpdateUserValues } from '../schemas/userSchemas'

interface EditUserModalProps {
  user: { username: string } | null
  open: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  form: UseFormReturn<UpdateUserValues>
}

export const EditUserModal = ({
  user,
  open,
  onCancel,
  onSubmit,
  form
}: EditUserModalProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const {
    control,
    formState: { errors, isSubmitting }
  } = form
  const roleOptions = useMemo(
    () =>
      ROLE_NAMES.map((role): { label: string; value: RoleName } => ({
        label: t(`dashboard:roles.${role}`, { defaultValue: role }),
        value: role
      })),
    [t]
  )

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={t('dashboard:modals.edit.title', { username: user?.username ?? '' })}
      okText={t('dashboard:modals.edit.confirm')}
      onOk={onSubmit}
      confirmLoading={isSubmitting}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={() => void onSubmit()}>
        <Form.Item
          label={t('dashboard:modals.edit.fields.displayName')}
          validateStatus={errors.displayName ? 'error' : undefined}
          help={errors.displayName?.message}
        >
          <Controller
            control={control}
            name="displayName"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={(event) => field.onChange(event.target.value.trim())}
                autoComplete="off"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.edit.fields.password')}
          validateStatus={errors.password ? 'error' : undefined}
          help={errors.password?.message}
          extra={t('dashboard:modals.edit.fields.passwordHint')}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value || undefined)}
                autoComplete="new-password"
                allowClear
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.edit.fields.roles')}
          validateStatus={errors.roles ? 'error' : undefined}
          help={errors.roles?.message}
        >
          <Controller
            control={control}
            name="roles"
            render={({ field }) => (
              <Select
                {...field}
                mode="multiple"
                options={roleOptions}
                placeholder={t('dashboard:modals.edit.fields.rolesPlaceholder')}
              />
            )}
          />
        </Form.Item>
        <Form.Item label={t('dashboard:modals.edit.fields.active')} valuePropName="checked">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
