import { OpenAPI } from 'routing-controllers-openapi'

import { jsonContent, schemaRef } from '@backend/openapi/schemas'

type HttpStatus = `${number}`

const ensureResponses = (schemaName: string, description: string, status: HttpStatus = '200') => ({
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
  OpenAPI({
    responses: ensureResponses(schemaName, description, status)
  }) as MethodDecorator

export const ApiRequestBody = (schemaName: string, required = true): MethodDecorator =>
  OpenAPI({
    requestBody: {
      required,
      content: jsonContent(schemaName)
    }
  }) as MethodDecorator

export const ApiBearerAuth = (): ClassDecorator & MethodDecorator =>
  OpenAPI({
    security: [{ bearerAuth: [] }]
  }) as ClassDecorator & MethodDecorator

export const backendResponse = (
  schemaName: string,
  description = 'Success',
  status: HttpStatus = '200'
): MethodDecorator => ApiResponse(schemaName, description, status)

export const backendRequestBody = (schemaName: string, required = true): MethodDecorator =>
  ApiRequestBody(schemaName, required)

export const backendBearerAuth = (): ClassDecorator & MethodDecorator => ApiBearerAuth()

export const schemaReference = schemaRef
