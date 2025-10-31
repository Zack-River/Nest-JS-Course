import { IsString ,IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    @IsString()
    email: string;
    
    @MinLength(6)
    @IsString()
    password: string;
}