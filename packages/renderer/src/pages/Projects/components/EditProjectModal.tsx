import { Modal, Form, Input } from 'antd'
import { Controller, type UseFormReturn } from 'react-hook-form'

import type { UpdateProjectValues } from '@renderer/pages/Projects/schemas/projectSchemas'

export interface EditProjectModalProps {
  open: boolean
  onCancel: () => void
  onSubmit: () => void
  form: UseFormReturn<UpdateProjectValues>
  submitting: boolean
}

export const EditProjectModal = ({
  open,
  onCancel,
  onSubmit,
  form,
  submitting
}: EditProjectModalProps): JSX.Element => (
  <Modal
    title="Modifica progetto"
    open={open}
    onCancel={onCancel}
    onOk={onSubmit}
    okText="Salva"
    confirmLoading={submitting}
    destroyOnClose
  >
    <Form layout="vertical" onFinish={onSubmit} disabled={submitting} initialValues={form.getValues()}>
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
            <Input {...field} value={field.value ?? ''} placeholder="Nome del progetto" autoFocus />
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
