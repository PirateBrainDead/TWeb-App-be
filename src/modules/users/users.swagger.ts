import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export const ApiChangePassword = () =>
  applyDecorators(
    ApiOperation({ summary: 'Change user password' }),
    ApiOkResponse({ description: 'Successfully changed user password' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );

export const ApiIsPasswordChanged = () =>
  applyDecorators(
    ApiOperation({ summary: 'Check if User password is changed - by lastLogin date' }),
    ApiOkResponse({ description: 'Checked if UserPassword is changed since lastLogin date' }),
    ApiBadRequestResponse({
      description: 'Params from query are not valid',
    }),
  );
