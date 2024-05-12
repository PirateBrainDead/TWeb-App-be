import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TaskAttachment } from 'src/modules/tasks/entity/task.entity';

@ValidatorConstraint({ name: 'IsAttachmentObject', async: false })
export class IsAttachmentObject implements ValidatorConstraintInterface {
  validate(object: TaskAttachment) {
    if (!(typeof object === 'object')) {
      return false;
    }

    if ((object.admin && !Array.isArray(object.admin)) || (object.hq && !Array.isArray(object.hq))) {
      return false;
    }
    if (
      (object.admin && object.admin.length && !(typeof object.admin[0] === 'string')) ||
      (object.hq && object.hq.length && !(typeof object.hq[0] === 'string'))
    ) {
      return false;
    }
    if (
      (object.admin && object.admin.length && object.admin[0] === '') ||
      (object.hq && object.hq.length && object.hq[0] === '')
    ) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid type, propeties admin or hq must be array with non empty string.`;
  }
}

export const IsAttachment = () => (object: unknown, propertyName: string) => {
  registerDecorator({
    name: 'IsAttachment',
    target: object.constructor,
    propertyName: propertyName,
    validator: IsAttachmentObject,
  });
};
