import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'My Project',
    description: 'The name of the project',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string = '';

  @ApiPropertyOptional({
    example: 'This is a description of my project',
    description: 'The description of the project',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
