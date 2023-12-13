import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
  IsEnum,
} from 'class-validator';

export enum GEventAttendeeResStatusEnum {
  UNCONFIRMED = 'needsAction',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative',
}

export class CreateGEventDTO {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  recurringId?: string;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  eventLink?: string;

  @IsString()
  startedAt: string; // ISO8601

  @IsString()
  finishedAt: string; // ISO8601

  @ValidateNested()
  @Type(() => AttendeeDTO)
  attendees: AttendeeDTO[];

  @IsBoolean()
  isPrivate: boolean;
}

export class CreateGEventsDTO {
  @ValidateNested()
  @Type(() => CreateGEventDTO)
  events: CreateGEventDTO[];
}

class AttendeeDTO {
  @IsString()
  username: string;

  @IsEnum(GEventAttendeeResStatusEnum)
  status: GEventAttendeeResStatusEnum;
}
