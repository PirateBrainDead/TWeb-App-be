import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Section } from '../entity/section.entity';
import { Errors } from '../../../shared/constants/errors.constants';

@Injectable()
export class SectionsValidationService {
  validateSectionExists(section: Section): void {
    if (!section) throw new NotFoundException(Errors.SectionNotFound);
  }

  validateUniqueSectionName(sectionNewName: string, sections: Section[]): void {
    if (sections.some((section) => section.name === sectionNewName))
      throw new BadRequestException(Errors.SectionNameUnique);
  }

  validateUniqueSectionIconName(sectionNewIconName: string, sections: Section[]): void {
    if (sections.some((section) => section.iconName === sectionNewIconName))
      throw new BadRequestException(Errors.SectionIconNameUnique);
  }

  validateIsSectionAlreadyPlanned(isDone: boolean, plannedDayExist: boolean): void {
    if (isDone && plannedDayExist) throw new BadRequestException(Errors.SectionAlreadyPlanned);
  }

  validateIsSectionAlreadyNotPlanned(isDone: boolean, plannedDayExist: boolean): void {
    if (!isDone && !plannedDayExist) throw new BadRequestException(Errors.SectionAlreadyNotPlanned);
  }
}
