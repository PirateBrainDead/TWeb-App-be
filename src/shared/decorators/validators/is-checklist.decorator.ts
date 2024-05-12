import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { ChecklistDto } from 'src/modules/tasks/dto/create-task.dto';

@ValidatorConstraint({ async: false })
export class IsChecklistConstraint implements ValidatorConstraintInterface {
  validate(checklist: ChecklistDto): boolean {
    if (!checklist.items || !Array.isArray(checklist.items)) {
      return false;
    }

    return checklist.items.every(
      (item) => typeof item.name === 'string' && item.name.trim().length > 0 && typeof item.isChecked === 'boolean',
    );
  }

  defaultMessage(): string {
    return 'Checklist items must have a non-empty name and isChecked must be a boolean value.';
  }
}

export function IsChecklist(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string): void {
    registerDecorator({
      name: 'isChecklist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsChecklistConstraint,
    });
  };
}
