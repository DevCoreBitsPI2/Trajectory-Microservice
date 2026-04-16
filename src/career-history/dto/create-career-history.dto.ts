import { Type } from "class-transformer";
import { IsDate, IsNumber, isNumber, IsPositive, IsString} from "class-validator";
export class CreateCareerHistoryDto {
    @IsString()
    description: string

    @IsDate()
    @Type(() => Date)
    event_date: Date

    @IsString()
    type: string

    @IsNumber()
    @IsPositive()
    id_employee: number
}
