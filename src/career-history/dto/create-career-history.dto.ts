import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsPositive, IsString } from 'class-validator';
import { career_history_type } from '@prisma/client';
import { career_type_change, CareerTypeChangeListDto } from '../enum/career_type_change';

export class CreateCareerHistoryDto {
    @IsString()
    description: string

    @IsDate()
    @Type(() => Date)
    event_date: Date

    @IsEnum(career_type_change,
        { message: `type must be one of the following values: ${CareerTypeChangeListDto}` }
    )
    type: career_history_type

    @IsNumber()
    @IsPositive()
    id_employee: number
}
