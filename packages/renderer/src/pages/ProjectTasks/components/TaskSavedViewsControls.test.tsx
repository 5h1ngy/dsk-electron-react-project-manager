import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import TaskSavedViewsControls from '@renderer/pages/ProjectTasks/components/TaskSavedViewsControls'
import type { SavedView } from '@renderer/store/slices/views/types'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('TaskSavedViewsControls', () => {
  const baseView: SavedView = {
    id: 'view-1',
    projectId: 'project-1',
    userId: 'user-1',
    name: 'My view',
    filters: {
      searchQuery: '',
      status: 'all',
      priority: 'all',
      assignee: 'all',
      dueDateRange: null
    },
    sort: null,
    columns: ['key', 'title'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  it('calls callbacks for select, save and delete', async () => {
    const onSelect = jest.fn()
    const onCreate = jest.fn()
    const onDelete = jest.fn()

    const user = userEvent.setup()

    const { rerender } = render(
      <TaskSavedViewsControls
        views={[baseView]}
        selectedViewId={null}
        onSelect={onSelect}
        onCreate={onCreate}
        onDelete={onDelete}
        loadingStatus="idle"
        mutationStatus="idle"
      />
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText(baseView.name))
    expect(onSelect).toHaveBeenCalledWith(baseView.id)

    await user.click(screen.getByRole('button', { name: /tasks\.savedViews\.saveButton/ }))
    expect(onCreate).toHaveBeenCalled()

    rerender(
      <TaskSavedViewsControls
        views={[baseView]}
        selectedViewId={baseView.id}
        onSelect={onSelect}
        onCreate={onCreate}
        onDelete={onDelete}
        loadingStatus="idle"
        mutationStatus="idle"
      />
    )

    await user.click(screen.getByRole('button', { name: /tasks\.savedViews\.deleteButton/ }))
    expect(onDelete).toHaveBeenCalledWith(baseView.id)
  })
})
