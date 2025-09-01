import { ipcMain } from 'electron';
import { Inject, Service } from 'typedi';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { RegisterRequestDTO, LoginRequestDTO } from '../dtos/auth.dto';
import * as _logger from '../shared/logger';
@Service()
export class AuthController extends BaseController {

  constructor(
    @Inject() private _authService: AuthService,
  ) {
    super();
  }

  public registerHandlers(): void {
    _logger.info('Registering auth handlers...');
    ipcMain.handle('auth:register', async (_, userData: Record<string, string>) => {
      const dto = new RegisterRequestDTO(userData.username, userData.email, userData.password, userData.confirmPassword);
      _logger.info(`Registration request received for user: ${dto.username}`);
      return await this._authService.register(dto);
    });

    ipcMain.handle('auth:login', async (_, loginData: Record<string, string>) => {
      const dto = new LoginRequestDTO(loginData.username, loginData.password);
      _logger.info(`Login request received for user: ${dto.username}`);
      return await this._authService.login(dto);
    });

    _logger.info('Auth handlers registered successfully');
  }
}