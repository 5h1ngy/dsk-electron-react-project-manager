import type { JSX } from 'react'
import { DatePicker, Form, Input, Modal, Select, Space } from 'antd'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

import type { TaskFormValues } from '@renderer/pages/Projects/schemas/taskSchemas'
import type { TaskDetails } from '@renderer/store/slices/tasks'
import MarkdownEditor from '@renderer/components/Markdown/MarkdownEditor'

const STATUS_ORDER: TaskDetails['status'][] = ['todo', 'in_progress', 'blocked', 'done']
const PRIORITY_ORDER: TaskDetails['priority'][] = ['low', 'medium', 'high', 'critical']

export interface TaskFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: () => void
  form: UseFormReturn<TaskFormValues>
  submitting: boolean
  assigneeOptions: Array<{ label: string; value: string }>
  taskTitle?: string
}

export const TaskFormModal = ({
  open,
  mode,
  onCancel,
  onSubmit,
  form,
  submitting,
  assigneeOptions,
  taskTitle
}: TaskFormModalProps): JSX.Element => {
  const { t } = useTranslation('projects')

  const title =
    mode === 'create'
      ? t('tasks.form.createTitle', { defaultValue: 'Nuovo task' })
      : t('tasks.form.editTitle', {
          defaultValue: 'Modifica task',
          title: taskTitle ?? ''
        })

  const okText =
    mode === 'create'
      ? t('tasks.form.createAction', { defaultValue: 'Crea task' })
      : t('tasks.form.updateAction', { defaultValue: 'Salva modifiche' })

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={okText}
      confirmLoading={submitting}
      destroyOnHidden
      width={520}
    >
      <Form
        layout="vertical"
        onFinish={onSubmit}
        disabled={submitting}
        initialValues={form.getValues()}
      >
        <Form.Item
          label={t('tasks.form.fields.title')}
          validateStatus={form.formState.errors.title ? 'error' : ''}
          help={form.formState.errors.title?.message}
          required
        >
          <Controller
            control={form.control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t('tasks.form.placeholders.title')}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label={t('tasks.form.fields.description')}
          validateStatus={form.formState.errors.description ? 'error' : ''}
          help={form.formState.errors.description?.message}
        >
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <MarkdownEditor
                value={field.value ?? ''}
                onChange={(next) => field.onChange(next)}
                placeholder={t('tasks.form.placeholders.description')}
                maxLength={20000}
                disabled={submitting}
              />
            )}
          />
        </Form.Item>

        <Space size="large" style={{ width: '100%' }} wrap>
          <Form.Item
            label={t('tasks.form.fields.status')}
            style={{ flex: 1, minWidth: 160 }}
            validateStatus={form.formState.errors.status ? 'error' : ''}
            help={form.formState.errors.status?.message}
            required
          >
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  options={STATUS_ORDER.map((status) => ({
                    value: status,
                    label: t(`details.status.${status}`)
                  }))}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('tasks.form.fields.priority')}
            style={{ flex: 1, minWidth: 160 }}
            validateStatus={form.formState.errors.priority ? 'error' : ''}
            help={form.formState.errors.priority?.message}
            required
          >
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value}
                  options={PRIORITY_ORDER.map((priority) => ({
                    value: priority,
                    label: t(`details.priority.${priority}`)
                  }))}
                />
              )}
            />
          </Form.Item>
        </Space>

        <Space size="large" style={{ width: '100%' }} wrap>
          <Form.Item
            label={t('tasks.form.fields.assignee')}
            style={{ flex: 1, minWidth: 200 }}
            validateStatus={form.formState.errors.assigneeId ? 'error' : ''}
            help={form.formState.errors.assigneeId?.toString()}
          >
            <Controller
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  allowClear
                  placeholder={t('tasks.form.placeholders.assignee')}
                  options={assigneeOptions}
                  onChange={(value) => field.onChange(value ?? null)}
                  showSearch
                  optionFilterProp="label"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={t('tasks.form.fields.dueDate')}
            style={{ flex: 1, minWidth: 180 }}
            validateStatus={form.formState.errors.dueDate ? 'error' : ''}
            help={form.formState.errors.dueDate?.toString()}
          >
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  format="YYYY-MM-DD"
                  onChange={(value) => field.onChange(value ? value.format('YYYY-MM-DD') : null)}
                  style={{ width: '100%' }}
                  placeholder={t('tasks.form.placeholders.dueDate')}
                />
              )}
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  )
}

TaskFormModal.displayName = 'TaskFormModal'

export default TaskFormModal
