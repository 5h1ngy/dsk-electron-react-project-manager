import { User } from '../models/User';
import { Op } from 'sequelize';
import { Service } from 'typedi';
import { logger } from '../shared/logger';
import { 
  UserRegistrationDto, 
  UserLoginDto, 
  UserResponseDto, 
  RegisterResponseDto,
  LoginResponseDto 
} from '../dtos/auth.dto';

/**
 * Service responsible for authentication operations
 */
@Service()
export class AuthService {

  /**
   * Register a new user
   * @param userData User registration data
   */
  public async register(userData: UserRegistrationDto): Promise<RegisterResponseDto> {
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
      
      logger.info(`User ${username} registered successfully`);
      const userResponse = new UserResponseDto(user.id, user.username, user.email);
      return new LoginResponseDto(true, undefined, userResponse);
    } catch (error) {
      console.error('Registration error:', error);
      logger.error(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
      return new RegisterResponseDto(false, 'Registration failed');
    }
  }

  /**
   * Login user
   * @param loginData User login data
   */
  public async login(loginData: UserLoginDto): Promise<LoginResponseDto> {
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
      
      logger.info(`User ${username} registered successfully`);
      const userResponse = new UserResponseDto(user.id, user.username, user.email);
      return new LoginResponseDto(true, undefined, userResponse);
    } catch (error) {
      console.error('Login error:', error);
      logger.error(`Login error: ${error instanceof Error ? error.message : String(error)}`);
      return new LoginResponseDto(false, 'Login failed');
    }
  }
}

// Creiamo un'istanza singleton del servizio
const authServiceInstance = new AuthService();
export default authServiceInstance;
