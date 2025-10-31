import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;
    
    @IsOptional()
    @IsEmail()
    @IsString()
    email?: string;

    @IsOptional()
    @MinLength(6)
    @IsString()
    password?: string;
}