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

    ipcMain.handle('auth:register', async (_, userData: RegisterRequestDTO) => {
      _logger.info(`Registration request received for user: ${userData.username}`);
      return await this._authService.register(userData);
    });

    ipcMain.handle('auth:login', async (_, loginData: LoginRequestDTO) => {
      _logger.info(`Login request received for user: ${loginData.username}`);
      return await this._authService.login(loginData);
    });

    _logger.info('Auth handlers registered successfully');
  }
}