import { Op } from 'sequelize';
import { Service } from 'typedi';

import { User } from '../models';
import { RegisterRequestDTO, RegisterResponseDTO, LoginResponseDTO } from '../dtos/auth.dto';
import { LoginRequestDTO, UserResponseDTO } from '../dtos/auth.dto';
import { BaseService } from './base.service';
import * as _logger from '../shared/logger';

@Service()
export class AuthService extends BaseService {

  public async register(form: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    try {
      const error = form.isValid();
      if (error) {
        throw new Error('VALIDATION_ERROR');
      }

      const { username, email, password } = form.toPlain();

      const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
      if (existingUser) {
        throw new Error('ALREADY_EXIST');
      }

      const user = await User.create({ username, email, password } as any);
      _logger.info(`User ${username} registered successfully`);

      const userResponse = new UserResponseDTO(user.id, user.username, user.email);
      return new LoginResponseDTO(true, undefined, userResponse);

    } catch (error) {
      _logger.error(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
      return new RegisterResponseDTO(false, error instanceof Error ? error.message : String(error));

    }
  }

  public async login(loginData: LoginRequestDTO): Promise<LoginResponseDTO> {
    try {
      const error = loginData.isValid();
      if (error) {
        throw new Error('VALIDATION_ERROR');
      }

      const { username, password } = loginData.toPlain();

      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error('ALREADY_EXIST');
      }

      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
      }

      _logger.info(`User ${username} registered successfully`);
      const userResponse = new UserResponseDTO(user.id, user.username, user.email);
      return new LoginResponseDTO(true, undefined, userResponse);

    } catch (error) {
      _logger.error(`Login error: ${error instanceof Error ? error.message : String(error)}`);
      return new LoginResponseDTO(false, error instanceof Error ? error.message : String(error));

    }
  }
}