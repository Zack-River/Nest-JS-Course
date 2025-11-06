import { SessionDto } from './session.dto';

export class MetaDto {
  affectedRows: number;
  session: SessionDto;
  timestamp?: Date;
  requestId?: string;
}
