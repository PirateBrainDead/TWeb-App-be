import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export const ApiUpdateDeviceToken = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update notification token' }),
    ApiOkResponse({ description: 'Successfully updated notification token' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );

export const ApiRemoveDeviceToken = () =>
  applyDecorators(
    ApiOperation({ summary: 'Remove notification token' }),
    ApiOkResponse({ description: 'Successfully Removed notification token' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );
