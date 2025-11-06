import { OpenAPI } from 'routing-controllers-openapi'

import { jsonContent, schemaRef } from '@api/openapi/schemas'

type HttpStatus = `${number}`

const ensureResponses = (
  schemaName: string,
  description: string,
  status: HttpStatus = '200'
) => ({
  [status]: {
    description,
    content: jsonContent(schemaName)
  }
})

export const ApiResponse = (
  schemaName: string,
  description = 'Success',
  status: HttpStatus = '200'
): MethodDecorator =>
  (OpenAPI({
    responses: ensureResponses(schemaName, description, status)
  }) as MethodDecorator)

export const ApiRequestBody = (
  schemaName: string,
  required = true
): MethodDecorator =>
  (OpenAPI({
    requestBody: {
      required,
      content: jsonContent(schemaName)
    }
  }) as MethodDecorator)

export const ApiBearerAuth = (): ClassDecorator & MethodDecorator =>
  (OpenAPI({
    security: [{ bearerAuth: [] }]
  }) as ClassDecorator & MethodDecorator)

export const schemaReference = schemaRef
