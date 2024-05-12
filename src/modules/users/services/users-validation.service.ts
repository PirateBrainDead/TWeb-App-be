import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { compare } from 'bcrypt';
import { Errors } from '../../../shared/constants/errors.constants';
import { Role } from '../entities/role.enum';

@Injectable()
export class UsersValidationService {
  validateUserExists(user: User): void {
    if (!user) throw new NotFoundException(Errors.UserNotFound);
  }

  validateUserRole(user: User, role: Role): void {
    if (user.role !== role) throw new BadRequestException(Errors.UserNotAcceptableRole);
  }

  async validatePasswordMatching(password: string, hashedPassword: string): Promise<boolean> {
    const passwordCheck = await compare(password, hashedPassword);
    if (!passwordCheck) throw new BadRequestException(Errors.UserPasswordIncorrect);
    return true;
  }

  validateUsernameUnique(username: string, allUsernames: string[], role: Role): void {
    if (allUsernames.some((existingUsername) => existingUsername === username))
      throw new BadRequestException(
        role === Role.Manager ? Errors.UserManagerUsernameUnique : Errors.UserHQUsernameUnique,
      );
  }
}
