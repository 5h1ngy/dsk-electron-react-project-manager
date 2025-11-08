import { useCallback, useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Modal, Select, Switch, Tag, theme } from 'antd'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { SelectProps } from 'antd'

import type { CreateUserValues } from '@renderer/pages/Dashboard/schemas/userSchemas'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

interface CreateUserModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  form: UseFormReturn<CreateUserValues>
  roleOptions: string[]
}

export const CreateUserModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  roleOptions
}: CreateUserModalProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const {
    control,
    formState: { errors, isSubmitting }
  } = form
  const { token } = theme.useToken()
  const badgeTokens = useSemanticBadges()
  const selectOptions = useMemo(
    () =>
      roleOptions.map((role) => ({
        label: t(`dashboard:roles.${role}`, { defaultValue: role }),
        value: role
      })),
    [roleOptions, t]
  )
  const roleTagRender = useCallback<NonNullable<SelectProps<string>['tagRender']>>(
    ({ label, value, closable, onClose }) => {
      const role = value as string
      const badge = badgeTokens.userRole[role] ?? badgeTokens.userRole.Viewer
      return (
        <Tag
          closable={closable}
          onClose={onClose}
          onMouseDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          style={{
            ...buildBadgeStyle(badge),
            display: 'inline-flex',
            alignItems: 'center',
            marginInlineEnd: token.marginXXS
          }}
        >
          {label}
        </Tag>
      )
    },
    [badgeTokens, token.marginXXS]
  )

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={t('dashboard:modals.create.title')}
      okText={t('dashboard:modals.create.confirm')}
      onOk={onSubmit}
      confirmLoading={isSubmitting}
      destroyOnHidden
      styles={{
        body: {
          paddingTop: token.paddingLG
        }
      }}
    >
      <Form layout="vertical" onFinish={() => void onSubmit()}>
        <Form.Item
          label={t('dashboard:modals.create.fields.username')}
          validateStatus={errors.username ? 'error' : undefined}
          help={errors.username?.message}
        >
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={(event) => {
                  const trimmed = event.target.value.trim()
                  if (trimmed !== field.value) {
                    field.onChange(trimmed)
                  }
                  field.onBlur()
                }}
                autoComplete="off"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.create.fields.displayName')}
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
                onBlur={(event) => {
                  const trimmed = event.target.value.trim()
                  if (trimmed !== field.value) {
                    field.onChange(trimmed)
                  }
                  field.onBlur()
                }}
                autoComplete="off"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.create.fields.password')}
          validateStatus={errors.password ? 'error' : undefined}
          help={errors.password?.message}
        >
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password
                {...field}
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                autoComplete="new-password"
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.create.fields.roles')}
          validateStatus={errors.roles ? 'error' : undefined}
          help={errors.roles?.message}
        >
          <Controller
            control={control}
            name="roles"
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? []}
                mode="multiple"
                options={selectOptions}
                placeholder={t('dashboard:modals.create.fields.rolesPlaceholder')}
                tagRender={roleTagRender}
              />
            )}
          />
        </Form.Item>
        <Form.Item label={t('dashboard:modals.create.fields.active')} valuePropName="checked">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onChange={(checked) => field.onChange(checked)}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
