import { buildMessage, registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { formatDate } from '../../utils/date.utils';

export const IsGreaterOrEqualTo =
  (property: string, validationOptions?: ValidationOptions) => (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'IsGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return formatDate(value) >= formatDate(relatedValue);
        },
        defaultMessage: buildMessage((eachPrefix, args) => {
          return `${eachPrefix}$property should be greater than or equal ${args.constraints[0]}`;
        }, validationOptions),
      },
    });
  };
