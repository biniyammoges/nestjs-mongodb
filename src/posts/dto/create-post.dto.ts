import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  text: string;

  @IsString()
  creator: string;
}
