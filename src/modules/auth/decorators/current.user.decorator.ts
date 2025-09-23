import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PublicUser } from '../serializer/user.serializer';

const getCurrentUserByContext = (context: ExecutionContext) =>
	context.switchToHttp().getRequest().user as PublicUser;

export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext) =>
		getCurrentUserByContext(context),
);
