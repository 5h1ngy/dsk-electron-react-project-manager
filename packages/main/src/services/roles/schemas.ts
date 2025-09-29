import { z } from 'zod'

export const RolePermissionSchema = z.string().min(1)

export const CreateRoleSchema = z.object({
  name: z.string().min(1),
  description: z.union([z.string(), z.null()]).optional(),
  permissions: z.array(RolePermissionSchema).optional()
})

export const UpdateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  permissions: z.array(RolePermissionSchema).optional()
})

export type CreateRoleInput = z.infer<typeof CreateRoleSchema>
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>
