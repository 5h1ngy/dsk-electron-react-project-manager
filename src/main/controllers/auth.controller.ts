import { ipcMain } from 'electron';
import Container, { Inject, Service } from 'typedi';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { RegisterRequestDTO, LoginRequestDTO } from '../dtos/auth.dto';
import { Logger } from '../shared/logger';

@Service()
export class AuthController extends BaseController {

  constructor(
    @Inject() private _authService: AuthService,
  ) {
    super(Container.get(Logger));
  }

  public registerHandlers(): void {
    this._logger.info('Registering auth handlers...');

    ipcMain.handle('auth:register', async (_, userData: RegisterRequestDTO) => {
      this._logger.info(`Registration request received for user: ${userData.username}`);
      return await this._authService.register(userData);
    });

    ipcMain.handle('auth:login', async (_, loginData: LoginRequestDTO) => {
      this._logger.info(`Login request received for user: ${loginData.username}`);
      return await this._authService.login(loginData);
    });

    this._logger.info('Auth handlers registered successfully');
  }
}