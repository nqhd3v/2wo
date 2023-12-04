import { ValidationError } from '@nestjs/common';

export interface IMessageError {
  [key: string]: string[];
}

export const formatErrors = (errors: ValidationError[]): IMessageError[] => {
  return errors.reduce((prevValue: IMessageError[], value) => {
    if (value.constraints) {
      const values: string[] = [];
      for (const key in value.constraints) {
        values.push(value.constraints[key]);
      }

      prevValue.push({
        [`${value.property}`]: values,
      });
    }

    return prevValue;
  }, []);
};
