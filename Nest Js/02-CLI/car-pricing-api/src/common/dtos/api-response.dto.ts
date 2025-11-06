import { MetaDto } from './meta.dto';

export class ApiResponse<T = unknown> {
  action: string;
  success: boolean;
  message: string;
  meta: MetaDto;
  data: T;

  constructor(
    action: string,
    success: boolean,
    message: string,
    meta: MetaDto,
    data: T,
  ) {
    this.action = action;
    this.success = success;
    this.message = message;
    this.meta = meta;
    this.data = data;
  }

  /**
   * successful responses
   */
  static success<T>(
    action: string,
    message: string,
    data: T,
    meta: Partial<MetaDto> = {},
  ): ApiResponse<T> {
    return new ApiResponse(
      action,
      true,
      message,
      {
        affectedRows: meta.affectedRows ?? 0,
        session: meta.session ?? { userId: 0 },
        timestamp: meta.timestamp ?? new Date(),
        requestId: meta.requestId,
      },
      data,
    );
  }

  /**
   * error responses
   */
  static error<T = null>(
    action: string,
    message: string,
    meta: Partial<MetaDto> = {},
    data: T = null as T,
  ): ApiResponse<T> {
    return new ApiResponse(
      action,
      false,
      message,
      {
        affectedRows: meta.affectedRows ?? 0,
        session: meta.session ?? { userId: 0 },
        timestamp: meta.timestamp ?? new Date(),
        requestId: meta.requestId,
      },
      data,
    );
  }
}
