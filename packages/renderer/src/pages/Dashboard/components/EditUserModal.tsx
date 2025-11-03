import { useCallback, useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Modal, Select, Switch, Tag, theme } from 'antd'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { SelectProps } from 'antd'

import type { UpdateUserValues } from '@renderer/pages/Dashboard/schemas/userSchemas'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

interface EditUserModalProps {
  user: { username: string } | null
  open: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  form: UseFormReturn<UpdateUserValues>
  roleOptions: string[]
}

export const EditUserModal = ({
  user,
  open,
  onCancel,
  onSubmit,
  form,
  roleOptions
}: EditUserModalProps): JSX.Element => {
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
                onBlur={field.onBlur}
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
                options={selectOptions}
                placeholder={t('dashboard:modals.edit.fields.rolesPlaceholder')}
                tagRender={roleTagRender}
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
