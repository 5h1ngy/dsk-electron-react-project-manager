import { useOutletContext } from 'react-router-dom'

import type { ProjectRouteContext } from '@renderer/pages/ProjectLayout/ProjectLayout.types'

export const useProjectRouteContext = (): ProjectRouteContext =>
  useOutletContext<ProjectRouteContext>()

export default useProjectRouteContext
