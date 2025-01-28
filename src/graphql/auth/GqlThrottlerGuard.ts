/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    if (context.getType<'http'>() === 'http') {
      const httpContext = context.switchToHttp();
      return { req: httpContext.getRequest(), res: httpContext.getResponse() };
    } else if (context.getType<GqlContextType>() === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context).getContext();
      return { req: gqlContext.req, res: gqlContext.res };
    }
    throw new Error('Unsupported context type');
  }
}
