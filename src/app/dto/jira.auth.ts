import { IsString, IsNotEmpty } from 'class-validator';

export class JiraAuthDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
