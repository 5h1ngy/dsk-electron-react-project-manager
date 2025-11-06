import type { Request } from 'express'
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  Req
} from 'routing-controllers'
import { Service } from 'typedi'

import { BaseController } from '@api/controllers/BaseController'
import { ApiBearerAuth, ApiRequestBody, ApiResponse } from '@api/openapi/decorators'

@Service()
@JsonController('/auth')
export class AuthController extends BaseController {
  @Post('/login')
  @ApiRequestBody('LoginRequest')
  @ApiResponse('SessionPayload')
  async login(@Body() payload: unknown) {
    const result = await this.authService.login(payload)
    return {
      token: result.token,
      user: result.user
    }
  }

  @Post('/logout')
  @ApiBearerAuth()
  @ApiResponse('OperationResult')
  async logout(@Req() request: Request) {
    const { token } = await this.requireActor(request, { touch: false })
    await this.authService.logout(token)
    return { success: true }
  }

  @Post('/register')
  @ApiRequestBody('RegisterUserRequest')
  @ApiResponse('SessionPayload')
  async register(@Body() payload: unknown) {
    return await this.authService.register(payload)
  }

  @Get('/session')
  @ApiBearerAuth()
  @ApiResponse('UserDTO')
  async session(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return actor
  }

  @Get('/users')
  @ApiBearerAuth()
  @ApiResponse('UserList')
  async listUsers(@Req() request: Request) {
    const { token } = await this.requireActor(request)
    return await this.authService.listUsers(token)
  }

  @Post('/users')
  @ApiBearerAuth()
  @ApiRequestBody('CreateUserRequest')
  @ApiResponse('UserDTO')
  async createUser(@Req() request: Request, @Body() payload: unknown) {
    const { token } = await this.requireActor(request)
    return await this.authService.createUser(token, payload)
  }

  @Put('/users/:userId')
  @ApiBearerAuth()
  @ApiRequestBody('UpdateUserRequest')
  @ApiResponse('UserDTO')
  async updateUser(
    @Req() request: Request,
    @Param('userId') userId: string,
    @Body() payload: unknown
  ) {
    const { token } = await this.requireActor(request)
    return await this.authService.updateUser(token, userId, payload)
  }

  @Delete('/users/:userId')
  @ApiBearerAuth()
  @ApiResponse('OperationResult')
  async deleteUser(@Req() request: Request, @Param('userId') userId: string) {
    const { token } = await this.requireActor(request)
    await this.authService.deleteUser(token, userId)
    return { success: true }
  }
}
