import bcrypt from 'bcryptjs';
import { UserRepository } from '@modules/users/infrastructure/repositories/UserRepository';
import { ValidationError, ConflictError } from '@shared/errors';
import { UserRole } from '@shared/enums';

interface CreateUserInput {
  code: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateUserInput) {
    const { code, password, name, role } = input;

    if (!code || !password || !name || !role) {
      throw new ValidationError('Todos los campos obligatorios deben ser proporcionados');
    }

    const existingUser = await this.userRepository.findByCode(code);
    if (existingUser) {
      throw new ConflictError('El código de usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.create({
      ...input,
      password: hashedPassword,
    });

    return {
      id: user.id,
      code: user.code,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
