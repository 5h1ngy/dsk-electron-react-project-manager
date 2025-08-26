import { User } from '../database/models/User';
import { Op } from 'sequelize';
import { UserRegistrationDto, UserLoginDto, UserResponseDto } from '../dtos/auth.dto';

/**
 * Service responsible for authentication operations
 */
export class AuthService {
  private static instance: AuthService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   * @param userData User registration data
   */
  public async register(userData: UserRegistrationDto): Promise<{ success: boolean; message?: string; user?: UserResponseDto }> {
    try {
      const { username, email, password } = userData;
      
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });
      
      if (existingUser) {
        return {
          success: false,
          message: 'Username or email already exists'
        };
      }
      
      // Create new user
      const user = await User.create({
        username,
        email,
        password // Password will be hashed by the model hook
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  }

  /**
   * Login user
   * @param loginData User login data
   */
  public async login(loginData: UserLoginDto): Promise<{ success: boolean; message?: string; user?: UserResponseDto }> {
    try {
      const { username, password } = loginData;
      
      // Find user by username
      const user = await User.findOne({
        where: { username }
      });
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
      
      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
      
      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }
}

export default AuthService.getInstance();
