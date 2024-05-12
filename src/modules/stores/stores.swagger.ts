import { ApiBadRequestResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';

export const ApiGetAllStores = () =>
  applyDecorators(
    ApiOperation({ summary: 'Gets all stores with users' }),
    ApiOkResponse({ description: 'Successfully gets all stores with users' }),
  );

export const ApiGetUserStore = () =>
  applyDecorators(
    ApiOperation({ summary: 'Gets a store that user belongs to' }),
    ApiOkResponse({ description: 'Successfully gets a store' }),
  );

export const ApiCreateStore = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create store with users' }),
    ApiOkResponse({ description: 'Successfully created store with users' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );

export const ApiUpdateStore = () =>
  applyDecorators(
    ApiOperation({ summary: 'Updates store' }),
    ApiOkResponse({ description: 'Successfully updated store' }),
    ApiBadRequestResponse({
      description: 'Leaflet Link is not valid URL',
    }),
  );

export const ApiUpdateActivation = () =>
  applyDecorators(
    ApiOperation({ summary: 'Updates store activation' }),
    ApiOkResponse({ description: 'Successfully updated store activation' }),
    ApiBadRequestResponse({
      description: 'Params from body are not valid',
    }),
  );
