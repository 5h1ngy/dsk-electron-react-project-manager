import type { JSX } from 'react'
import { Modal, Form, Input, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { Controller, type UseFormReturn } from 'react-hook-form'

import type { UpdateProjectValues } from '@renderer/pages/Projects/schemas/projectSchemas'

export interface EditProjectModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
  form: UseFormReturn<UpdateProjectValues>
  submitting: boolean
  projectName?: string
  projectKey?: string
}

export const EditProjectModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  submitting,
  projectName,
  projectKey
}: EditProjectModalProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const title =
    projectName || projectKey
      ? t('form.editTitle', {
          defaultValue: 'Modifica {{name}}',
          name: projectName ?? projectKey
        })
      : t('form.editTitleFallback', { defaultValue: 'Modifica progetto' })

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={t('form.updateAction', { defaultValue: 'Salva modifiche' })}
      confirmLoading={submitting}
      destroyOnHidden
    >
      <Form
        layout="vertical"
        onFinish={onSubmit}
        disabled={submitting}
        initialValues={form.getValues()}
      >
        <Form.Item
          label={t('form.fields.name.label')}
          validateStatus={form.formState.errors.name ? 'error' : ''}
          help={form.formState.errors.name?.message}
          required
        >
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('form.fields.name.placeholder')}
                autoFocus
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('form.fields.description.label')}
          validateStatus={form.formState.errors.description ? 'error' : ''}
          help={form.formState.errors.description?.message}
        >
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value ?? ''}
                placeholder={t('form.fields.description.placeholder')}
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label={t('form.fields.tags.label')}
          validateStatus={form.formState.errors.tags ? 'error' : ''}
          help={form.formState.errors.tags?.message}
        >
          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <Select
                {...field}
                mode="tags"
                value={field.value ?? []}
                tokenSeparators={[',']}
                placeholder={t('form.fields.tags.placeholder')}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
