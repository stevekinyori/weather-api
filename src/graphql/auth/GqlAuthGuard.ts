import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLContext } from './GraphQLContext';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): GraphQLContext['req'] {
    const gqlCtx = GqlExecutionContext.create(context);
    return gqlCtx.getContext<GraphQLContext>().req;
  }
}
