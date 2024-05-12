import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { applyDecorators } from '@nestjs/common';
import { Errors } from '../../shared/constants/errors.constants';

export const ApiGetSections = () =>
  applyDecorators(
    ApiOperation({ summary: 'Find all Sections by logged in User Store' }),
    ApiOkResponse({ description: 'Successfully returned all Store Sections' }),
  );

export const ApiCreateSection = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create new Section' }),
    ApiOkResponse({ description: 'Successfully created new Section' }),
    ApiBadRequestResponse({ description: Errors.SectionNameUnique }),
    ApiBadRequestResponse({ description: Errors.SectionIconNameUnique }),
  );

export const ApiUpdatePlanningStatus = () =>
  applyDecorators(
    ApiOperation({ summary: 'Mark section as done/undone by logged in User for Store and provided date' }),
    ApiOkResponse({ description: 'Successfully marked section as done for Store and provided date' }),
    ApiNotFoundResponse({ description: `Section doesn't exist` }),
  );

export const ApiEditSection = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update sectio name' }),
    ApiOkResponse({ description: 'Successfully updated section name' }),
    ApiNotFoundResponse({ description: `Section doesn't exist` }),
  );

export const ApiDeleteSection = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete Section' }),
    ApiOkResponse({ description: 'Successfully deleted section' }),
  );
