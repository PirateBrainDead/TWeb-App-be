import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export const ApiGetDailyTasksByDate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Find all daily Tasks by logged in User Store and date' }),
    ApiOkResponse({ description: 'Successfully returned all daily Tasks by date' }),
    ApiBadRequestResponse({
      description: 'Params from query are not valid',
    }),
  );

export const ApiGetRepeatableTasksByDate = () =>
  applyDecorators(
    ApiOperation({ summary: 'Find Repeatable Tasks by logged in User Store by date' }),
    ApiOkResponse({ description: 'Successfully returned all daily Repeatable Tasks by date' }),
  );

export const ApiCreateTask = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create new task' }),
    ApiCreatedResponse({ description: 'Successfully created new task' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );

export const ApiUpdateTask = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update task' }),
    ApiOkResponse({ description: 'Successfully updated task' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
    ApiBadRequestResponse({
      description: `Task in status Initiated or Done can't be updated`,
    }),
    ApiNotFoundResponse({
      description: 'Task not found',
    }),
  );

export const ApiUpdateTaskStatus = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update task status' }),
    ApiOkResponse({ description: 'Successfully updated task status' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
    ApiNotFoundResponse({
      description: 'Task not found',
    }),
  );

export const ApiDeleteTask = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete task' }),
    ApiOkResponse({ description: 'Successfully deleted task' }),
    ApiBadRequestResponse({
      description: 'Query params are not valid',
    }),
    ApiBadRequestResponse({
      description: `Task in status Initiated or Done can't be removed`,
    }),
    ApiNotFoundResponse({
      description: 'Task not found',
    }),
  );
