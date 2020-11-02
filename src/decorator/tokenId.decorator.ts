import { createParamDecorator } from '@nestjs/common';

export const TokenId = createParamDecorator((data: string, req) => {
  return req.args[0].user.id;
});
