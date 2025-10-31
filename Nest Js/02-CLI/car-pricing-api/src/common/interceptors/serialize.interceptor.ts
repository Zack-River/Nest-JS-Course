import {
  UseInterceptors,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log("I'M RUNNING BEFORE THE HANDLER");
    return next.handle().pipe(
      map((data: any) => {
        // only transform the "data" property, keep the rest untouched
        if (data?.data) {
          const transformedData = plainToClass(this.dto, data.data, {
            excludeExtraneousValues: true,
          });
          return {
            ...data,
            data: transformedData,
          };
        }

        // if there's no "data" key, just transform the whole response
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
