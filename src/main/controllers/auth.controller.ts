import { ipcMain } from 'electron';
import authService from '../services/auth.service';
import { UserRegistrationDto, UserLoginDto } from '../dtos/auth.dto';

/**
 * Controller for authentication-related IPC operations
 */
export class AuthController {
  private static instance: AuthController;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  /**
   * Register all authentication IPC handlers
   */
  public registerHandlers(): void {
    // Register user
    ipcMain.handle('auth:register', async (_, userData: UserRegistrationDto) => {
      return await authService.register(userData);
    });
    
    // Login user
    ipcMain.handle('auth:login', async (_, loginData: UserLoginDto) => {
      return await authService.login(loginData);
    });
  }
}

export default AuthController.getInstance();
