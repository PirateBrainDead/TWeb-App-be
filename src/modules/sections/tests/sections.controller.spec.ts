import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from '../sections.controller';
import { SectionsService } from '../services/sections.service';
import { createSectionMock, updateSectionPlanningDtoMock } from './__mocks__/sections.mocks';
import { EditSectionDto } from '../dto/edit-section.dto';

describe('SectionsController', () => {
  let sectionsController: SectionsController;
  let sectionsService: SectionsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [
        {
          provide: SectionsService,
          useValue: {
            findAllByStoreId: () => jest.fn(),
            create: () => jest.fn(),
            updatePlanningStatus: () => jest.fn(),
            editSection: () => jest.fn(),
          },
        },
      ],
    }).compile();

    sectionsController = app.get<SectionsController>(SectionsController);
    sectionsService = app.get<SectionsService>(SectionsService);
  });

  it('should call findAllSectionsByStoreId', async () => {
    const findAllByStoreIdFn = jest.spyOn(sectionsService, 'findAllByStoreId');
    await sectionsController.findAll();
    expect(findAllByStoreIdFn).toBeCalled();
  });
  it('should call create', async () => {
    const createFn = jest.spyOn(sectionsService, 'create');
    await sectionsController.create(createSectionMock);
    expect(createFn).toBeCalled();
  });
  it('should call updatePlanningStatus', async () => {
    const updatePlanningStatusFn = jest.spyOn(sectionsService, 'updatePlanningStatus');
    await sectionsController.updatePlanningStatus(updateSectionPlanningDtoMock);
    expect(updatePlanningStatusFn).toBeCalled();
  });
  it('should call editSection', async () => {
    const editSectionDtoMock: EditSectionDto = {
      sectionId: '1ebc7a2f-2ff8-4c3c-9832-5303918dd16a',
      name: 'New Bread',
    };

    const editSectionFn = jest.spyOn(sectionsService, 'editSection');
    await sectionsController.editSection(editSectionDtoMock);
    expect(editSectionFn).toBeCalledWith(editSectionDtoMock);
  });
});
