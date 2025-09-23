import { useCallback, useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Modal, Select, Switch, Tag, theme } from 'antd'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { SelectProps } from 'antd'

import { ROLE_NAMES, type RoleName } from '@main/services/auth/constants'

import type { CreateUserValues } from '@renderer/pages/Dashboard/schemas/userSchemas'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

interface CreateUserModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => Promise<void>
  form: UseFormReturn<CreateUserValues>
}

export const CreateUserModal = ({
  open,
  onCancel,
  onSubmit,
  form
}: CreateUserModalProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const {
    control,
    register,
    formState: { errors, isSubmitting }
  } = form
  const { token } = theme.useToken()
  const badgeTokens = useSemanticBadges()
  const roleOptions = useMemo(
    () =>
      ROLE_NAMES.map((role): { label: string; value: RoleName } => ({
        label: t(`dashboard:roles.${role}`, { defaultValue: role }),
        value: role
      })),
    [t]
  )
  const roleTagRender = useCallback<
    NonNullable<SelectProps<RoleName>['tagRender']>
  >(
    ({ label, value, closable, onClose }) => {
      const role = value as RoleName
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
          <Input
            {...register('username', { setValueAs: (value) => value.trim() })}
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.create.fields.displayName')}
          validateStatus={errors.displayName ? 'error' : undefined}
          help={errors.displayName?.message}
        >
          <Input
            {...register('displayName', { setValueAs: (value) => value.trim() })}
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          label={t('dashboard:modals.create.fields.password')}
          validateStatus={errors.password ? 'error' : undefined}
          help={errors.password?.message}
        >
          <Input.Password {...register('password')} autoComplete="new-password" />
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
                mode="multiple"
                options={roleOptions}
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
              <Switch checked={field.value} onChange={(checked) => field.onChange(checked)} />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
