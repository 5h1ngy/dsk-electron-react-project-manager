import { useMemo } from 'react'
import { useForm, type UseFormReturn, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectValues,
  type UpdateProjectValues
} from '@renderer/pages/Projects/schemas/projectSchemas'

export interface ProjectForms {
  createForm: UseFormReturn<CreateProjectValues>
  updateForm: UseFormReturn<UpdateProjectValues>
}

export const useProjectForms = (): ProjectForms => {
  const createForm = useForm<CreateProjectValues>({
    resolver: useMemo(
      () => zodResolver(createProjectSchema) as unknown as Resolver<CreateProjectValues>,
      []
    ),
    mode: 'onChange',
    defaultValues: {
      key: '',
      name: '',
      description: null,
      tags: []
    }
  })

  const updateForm = useForm<UpdateProjectValues>({
    resolver: useMemo(
      () => zodResolver(updateProjectSchema) as unknown as Resolver<UpdateProjectValues>,
      []
    ),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: null,
      tags: []
    }
  })

  return { createForm, updateForm }
}
