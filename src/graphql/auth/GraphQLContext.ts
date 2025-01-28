import { AuthenticatedUser } from '../../common/interfaces/user.interface';

export interface GraphQLRequest {
  user?: AuthenticatedUser;
}

export interface GraphQLContext {
  req: GraphQLRequest;
}
