 
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/users/application/services/users.service';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockConfigService: Partial<ConfigService>;
  let mockUsersService: Partial<UsersService>;
  const mockJwtSecret = 'testSecret';
  const mockUser = { id: 1, username: 'testuser' };

  beforeEach(() => {
    mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue(mockJwtSecret),
    };
    mockUsersService = {
      getUserById: jest.fn(),
      getUserByUsername: jest.fn(),
    };
    jwtStrategy = new JwtStrategy(
      mockConfigService as ConfigService,
      mockUsersService as UsersService,
    );
  });

  describe('validate', () => {
    it('should call usersService.getUserById with the sub from the payload', async () => {
      const payload = { username: "testuser" };
      (mockUsersService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      await jwtStrategy.validate(payload);
      expect(mockUsersService.getUserByUsername).toHaveBeenCalledWith(payload.username);
    });

    it('should return the user if found', async () => {
      const payload = { username: "testuser" };
      (mockUsersService.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      const user = await jwtStrategy.validate(payload);
      expect(user).toEqual(mockUser);
    });

    it('should return null if the user is not found', async () => {
      const payload = { username: 'testuser' };
      (mockUsersService.getUserByUsername as jest.Mock).mockResolvedValue(undefined);
      const user = await jwtStrategy.validate(payload);
      expect(user).toBeNull();
    });

    it('should handle errors from usersService.getUserByUsername', async () => {
      const errorMessage = 'Database error';
      const payload = { username: 'testuser' };
      (mockUsersService.getUserByUsername as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(errorMessage);
    });
  });
});