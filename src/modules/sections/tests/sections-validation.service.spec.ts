import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SectionsValidationService } from '../services/sections-validation.service';
import { Errors } from '../../../shared/constants/errors.constants';
import { savedSectionsMock } from './__mocks__/sections.mocks';

describe('SectionsValidationService', () => {
  let service: SectionsValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectionsValidationService],
    }).compile();

    service = module.get<SectionsValidationService>(SectionsValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should throw NotFoundException on validateSectionExists', () => {
    try {
      service.validateSectionExists(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });
  it('should throw BadRequestException on validateSectionNameUnique', () => {
    try {
      service.validateUniqueSectionName(savedSectionsMock[0].name, savedSectionsMock);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.SectionNameUnique);
    }
  });
  it('should throw BadRequestException on validateSectionIconNameUnique', () => {
    try {
      service.validateUniqueSectionIconName(savedSectionsMock[0].iconName, savedSectionsMock);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.SectionIconNameUnique);
    }
  });
  it('should throw BadRequestException on validateIsSectionAlreadyPlanned', () => {
    try {
      service.validateIsSectionAlreadyPlanned(true, true);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.SectionAlreadyPlanned);
    }
  });
  it('should throw BadRequestException on validateIsSectionAlreadyNotPlanned', () => {
    try {
      service.validateIsSectionAlreadyNotPlanned(false, false);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.response.message).toEqual(Errors.SectionAlreadyNotPlanned);
    }
  });
});
