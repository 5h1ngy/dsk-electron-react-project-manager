import { ipcMain } from 'electron';
import { User } from '../database/models/User';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

export const registerAuthHandlers = () => {
  // Handle user registration
  ipcMain.handle('auth:register', async (_, userData: { username: string; email: string; password: string }) => {
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
  });
  
  // Handle user login
  ipcMain.handle('auth:login', async (_, loginData: { username: string; password: string }) => {
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
  });
};
