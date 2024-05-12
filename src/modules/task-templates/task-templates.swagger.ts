import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { Errors } from '../../shared/constants/errors.constants';

export const ApiGetTaskTemplates = () =>
  applyDecorators(
    ApiOperation({ summary: 'Find all TaskTemplates by logged in User' }),
    ApiOkResponse({ description: 'Successfully returned all TaskTemplates' }),
  );

export const ApiCreateTaskTemplate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create new task template' }),
    ApiCreatedResponse({ description: 'Successfully created new task template' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );

export const ApiUpdateTaskTemplate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update task template' }),
    ApiCreatedResponse({ description: 'Successfully updated task template' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
    ApiNotFoundResponse({
      description: Errors.TaskTemplateNotFound,
    }),
  );

export const ApiDeleteTaskTemplate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete task template' }),
    ApiCreatedResponse({ description: 'Successfully deleted task template' }),
    ApiBadRequestResponse({
      description: 'Params from query are not valid',
    }),
    ApiNotFoundResponse({
      description: Errors.TaskTemplateNotFound,
    }),
  );
