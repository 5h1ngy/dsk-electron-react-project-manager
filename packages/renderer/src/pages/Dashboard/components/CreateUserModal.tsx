import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Form, Input, Modal, Select, Switch } from 'antd'
import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { ROLE_NAMES, type RoleName } from '@main/auth/constants'

import type { CreateUserValues } from '../schemas/userSchemas'

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
      title={t('dashboard:modals.create.title')}
      okText={t('dashboard:modals.create.confirm')}
      onOk={onSubmit}
      confirmLoading={isSubmitting}
      destroyOnHidden
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
