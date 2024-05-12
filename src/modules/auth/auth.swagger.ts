import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export const ApiManagerAppLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login - Manager app' }),
    ApiOkResponse({ description: 'Successfully logged in user' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
    ApiNotFoundResponse({
      description: 'User is not found',
    }),
  );

export const ApiHQAppLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login - HQ app' }),
    ApiOkResponse({ description: 'Successfully logged in user' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
    ApiNotFoundResponse({
      description: 'User is not found',
    }),
  );

export const ApiBackofficeLogin = () =>
  applyDecorators(
    ApiOperation({ summary: 'Login - Backoffice' }),
    ApiOkResponse({ description: 'Successfully logged in user' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
    ApiNotFoundResponse({
      description: 'User is not found',
    }),
  );
