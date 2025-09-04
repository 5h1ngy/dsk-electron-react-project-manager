import { Modal, Form, Input } from 'antd'
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
  return (
    <Modal
      title="Nuovo progetto"
      open={open}
      onCancel={onCancel}
      okText="Crea"
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
          label="Key"
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
                placeholder="ES. PROG"
                autoFocus
                maxLength={10}
              />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Nome"
          validateStatus={form.formState.errors.name ? 'error' : ''}
          help={form.formState.errors.name?.message}
          required
        >
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Input {...field} value={field.value ?? ''} placeholder="Nome del progetto" />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Descrizione"
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
                placeholder="Descrizione (opzionale)"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
