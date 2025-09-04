import { Modal, Form, Input, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import { Controller, type UseFormReturn } from 'react-hook-form'

import type { CreateProjectValues } from '../schemas/projectSchemas'

export interface CreateProjectModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
  form: UseFormReturn<CreateProjectValues>
  submitting: boolean
}

export const CreateProjectModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  submitting
}: CreateProjectModalProps): JSX.Element => {
  const { t } = useTranslation('projects')

  return (
    <Modal
      title={t('form.createTitle')}
      open={open}
      onCancel={onCancel}
      okText={t('form.createAction')}
      onOk={onSubmit}
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
          label={t('form.fields.key.label')}
          validateStatus={form.formState.errors.key ? 'error' : ''}
          help={form.formState.errors.key?.message}
          required
        >
          <Controller
            control={form.control}
            name="key"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('form.fields.key.placeholder')}
                autoFocus
                maxLength={10}
              />
            )}
          />
        </Form.Item>
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
              <Input {...field} value={field.value ?? ''} placeholder={t('form.fields.name.placeholder')} />
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
