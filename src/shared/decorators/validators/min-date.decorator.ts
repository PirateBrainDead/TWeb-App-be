import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';
import { formatDate } from '../../utils/date.utils';

const minDate = (date: string, minDate: Date): boolean => formatDate(date) >= formatDate(minDate);

export function MinCustomDate(date: () => Date, validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'MinCustomDate',
      constraints: [date()],
      validator: {
        validate: (value, args): boolean => minDate(value, args.constraints[0]),
        defaultMessage: buildMessage((eachPrefix, args) => {
          return `minimal allowed date for ${eachPrefix}$property is ${formatDate(args.constraints[0])}`;
        }, validationOptions),
      },
    },
    validationOptions,
  );
}
