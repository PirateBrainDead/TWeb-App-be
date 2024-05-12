import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsCommentArray', async: false })
export class IsCommentArray implements ValidatorConstraintInterface {
  validate(comments: string[]) {
    if (!Array.isArray(comments)) {
      return false;
    }

    return comments.every((comment) => typeof comment === 'string' && comment.trim().length > 0);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be an array of non-empty strings.`;
  }
}

export const IsComment = () => (object: unknown, propertyName: string) => {
  registerDecorator({
    name: 'IsComment',
    target: object.constructor,
    propertyName: propertyName,
    constraints: [],
    options: {
      message: `${propertyName} must be an array of non-empty strings.`,
    },
    validator: IsCommentArray,
  });
};
