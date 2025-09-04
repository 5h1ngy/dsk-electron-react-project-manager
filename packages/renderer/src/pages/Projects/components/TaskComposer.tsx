import { Button, Form, Input, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Controller, type UseFormReturn } from 'react-hook-form'

import type { CreateTaskValues } from '../schemas/taskSchemas'

export interface TaskComposerProps {
  form: UseFormReturn<CreateTaskValues>
  onSubmit: () => void
  disabled: boolean
}

export const TaskComposer = ({ form, onSubmit, disabled }: TaskComposerProps): JSX.Element => {
  const { t } = useTranslation('projects')

  return (
    <Form layout="vertical" onFinish={onSubmit} disabled={disabled}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Typography.Text strong>{t('board.composer.title')}</Typography.Text>
        <Form.Item
          validateStatus={form.formState.errors.title ? 'error' : ''}
          help={form.formState.errors.title?.message}
          style={{ marginBottom: 8 }}
        >
          <Controller
            control={form.control}
            name="title"
            render={({ field }) => (
              <Input {...field} value={field.value ?? ''} placeholder={t('board.composer.titlePlaceholder')} />
            )}
          />
        </Form.Item>
        <Form.Item
          validateStatus={form.formState.errors.description ? 'error' : ''}
          help={form.formState.errors.description?.message}
          style={{ marginBottom: 8 }}
        >
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <Input.TextArea
                {...field}
                value={field.value ?? ''}
                placeholder={t('board.composer.descriptionPlaceholder')}
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            )}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={form.formState.isSubmitting} disabled={disabled}>
          {t('board.composer.submit')}
        </Button>
      </Space>
    </Form>
  )
}
