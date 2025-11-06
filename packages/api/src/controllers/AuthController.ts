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

@Service()
@JsonController('/auth')
export class AuthController extends BaseController {
  @Post('/login')
  async login(@Body() payload: unknown) {
    const result = await this.authService.login(payload)
    return {
      token: result.token,
      user: result.user
    }
  }

  @Post('/logout')
  async logout(@Req() request: Request) {
    const { token } = await this.requireActor(request, { touch: false })
    await this.authService.logout(token)
    return { success: true }
  }

  @Post('/register')
  async register(@Body() payload: unknown) {
    return await this.authService.register(payload)
  }

  @Get('/session')
  async session(@Req() request: Request) {
    const { actor } = await this.requireActor(request)
    return actor
  }

  @Get('/users')
  async listUsers(@Req() request: Request) {
    const { token } = await this.requireActor(request)
    return await this.authService.listUsers(token)
  }

  @Post('/users')
  async createUser(@Req() request: Request, @Body() payload: unknown) {
    const { token } = await this.requireActor(request)
    return await this.authService.createUser(token, payload)
  }

  @Put('/users/:userId')
  async updateUser(
    @Req() request: Request,
    @Param('userId') userId: string,
    @Body() payload: unknown
  ) {
    const { token } = await this.requireActor(request)
    return await this.authService.updateUser(token, userId, payload)
  }

  @Delete('/users/:userId')
  async deleteUser(@Req() request: Request, @Param('userId') userId: string) {
    const { token } = await this.requireActor(request)
    await this.authService.deleteUser(token, userId)
    return { success: true }
  }
}
