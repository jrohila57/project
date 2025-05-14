import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserSort, UserTheme } from '@shared/interfaces';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Length(2, 100)
  name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsEnum(UserTheme)
  @IsOptional()
  theme?: UserTheme;

  @IsEnum(UserSort)
  @IsOptional()
  defaultSort?: UserSort;

  @IsBoolean()
  @IsOptional()
  showCompletedTodos?: boolean;

  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}
