import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string = '';

  @IsNotEmpty()
  @IsString()
  password: string = '';
}
