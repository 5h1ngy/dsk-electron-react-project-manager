import { Button, Form, Input, Space, Typography } from 'antd'
import { Controller, type UseFormReturn } from 'react-hook-form'

import type { CreateTaskValues } from '../schemas/taskSchemas'

export interface TaskComposerProps {
  form: UseFormReturn<CreateTaskValues>
  onSubmit: () => void
  disabled: boolean
}

export const TaskComposer = ({ form, onSubmit, disabled }: TaskComposerProps): JSX.Element => (
  <Form layout="vertical" onFinish={onSubmit} disabled={disabled}>
    <Space direction="vertical" size={8} style={{ width: '100%' }}>
      <Typography.Text strong>Crea nuovo task</Typography.Text>
      <Form.Item
        validateStatus={form.formState.errors.title ? 'error' : ''}
        help={form.formState.errors.title?.message}
        style={{ marginBottom: 8 }}
      >
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <Input {...field} value={field.value ?? ''} placeholder="Titolo del task" />
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
              placeholder="Descrizione (opzionale)"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          )}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={disabled} disabled={disabled}>
        Aggiungi task
      </Button>
    </Space>
  </Form>
)

