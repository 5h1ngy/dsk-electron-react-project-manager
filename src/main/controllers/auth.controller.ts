import { ipcMain } from 'electron';
import { Service } from 'typedi';
import { BaseController } from './base.controller';
import authService from '../services/auth.service';
import { UserRegistrationDto, UserLoginDto } from '../dtos/auth.dto';
import { logger } from '../shared/logger';

/**
 * Controller for authentication-related IPC operations
 */
@Service()
export class AuthController extends BaseController {

  /**
   * Register all authentication IPC handlers
   */
  public registerHandlers(): void {
    logger.info('Registering auth handlers...');
    
    // Register user
    ipcMain.handle('auth:register', async (_, userData: UserRegistrationDto) => {
      logger.info(`Registration request received for user: ${userData.username}`);
      return await authService.register(userData);
    });
    
    // Login user
    ipcMain.handle('auth:login', async (_, loginData: UserLoginDto) => {
      logger.info(`Login request received for user: ${loginData.username}`);
      return await authService.login(loginData);
    });
    
    logger.info('Auth handlers registered successfully');
  }
}

// Non esporta più un'istanza singleton, verrà gestita da TypeDI
