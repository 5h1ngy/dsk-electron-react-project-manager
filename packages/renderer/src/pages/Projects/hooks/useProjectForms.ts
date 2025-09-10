import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectValues,
  type UpdateProjectValues
} from '@renderer/pages/Projects/schemas/projectSchemas'

export interface ProjectForms {
  createForm: ReturnType<typeof useForm<CreateProjectValues>>
  updateForm: ReturnType<typeof useForm<UpdateProjectValues>>
}

export const useProjectForms = (): ProjectForms => {
  const createResolver = useMemo(() => zodResolver(createProjectSchema), [])
  const updateResolver = useMemo(() => zodResolver(updateProjectSchema), [])

  const createForm = useForm<CreateProjectValues>({
    resolver: createResolver,
    mode: 'onChange',
    defaultValues: {
      key: '',
      name: '',
      description: null,
      tags: []
    }
  })

  const updateForm = useForm<UpdateProjectValues>({
    resolver: updateResolver,
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: null,
      tags: []
    }
  })

  return { createForm, updateForm }
}
