import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { UserRepository } from '@modules/users/infrastructure/repositories/UserRepository';
import { UnauthorizedError, ValidationError } from '@shared/errors';

interface LoginInput {
  code: string;
  password: string;
}

interface LoginOutput {
  token: string;
  user: {
    id: string;
    code: string;
    name: string;
    role: string;
  };
}

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const { code, password } = input;

    if (!code || !password) {
      throw new ValidationError('Código y contraseña son requeridos');
    }

    const user = await this.userRepository.findByCode(code);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn']  }
    );

    return {
      token,
      user: {
        id: user.id,
        code: user.code,
        name: user.name,
        role: user.role,
      },
    };
  }
}
