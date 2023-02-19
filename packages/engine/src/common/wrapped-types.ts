export enum EPrimitive {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

export enum ETypeCategory {
  PRIMITIVE = 'PRIMITIVE',
  COMPLEX = 'COMPLEX',
  COLLECTION = 'COLLECTION'
}

type TTypeValidationResult = { valid: true, reason: null, } | { valid: false, reason: string };

type TWrappedTypeOptions<TNative, TWrapped> = {
  id: string;
  name: string;
  category: ETypeCategory;
  validate: (input: TWrapped) => TTypeValidationResult;
  unwrap: (input: TWrapped) => TNative;
  wrap: (input: TNative) => TWrapped;
};
export class WrappedType<TNative, TWrapped> {
  public id: TWrappedTypeOptions<TNative, TWrapped>['id'];
  public name: TWrappedTypeOptions<TNative, TWrapped>['name'];
  public category: TWrappedTypeOptions<TNative, TWrapped>['category'];
  public validate: TWrappedTypeOptions<TNative, TWrapped>['validate'];
  public unwrap: TWrappedTypeOptions<TNative, TWrapped>['unwrap'];
  public wrap: TWrappedTypeOptions<TNative, TWrapped>['wrap'];

  constructor({ id, name, category, validate, unwrap, wrap, }: TWrappedTypeOptions<TNative, TWrapped>) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.validate = validate;
    this.unwrap = unwrap;
    this.wrap = wrap;
  }

  get collection() {
    return new WrappedCollection<TNative, TWrapped>({
      id: `COLLECTION.${this.id}`,
      name: `Collection (${this.name})`,
      validate: entries => {
        const validationErrors: string[] = [];

        entries.forEach((entry, index) => {
          const { valid, reason, } = this.validate(entry);
          if (!valid) {
            validationErrors.push(
              `Invalid entry at index ${index} (${reason})`
            );
          }
        });

        if (validationErrors.length === 0) { return { valid: true, reason: null, }; }

        return {
          valid: false,
          reason: validationErrors.join(', '),
        };
      },
      unwrap: wrappedEntries => wrappedEntries.map(this.unwrap),
      wrap: unwrappedEntries => unwrappedEntries.map(this.wrap),
    });
  }
}

type TWrappedPrimitiveOptions<TNative> = Omit<TWrappedTypeOptions<TNative, TNative>, 'category'>;
export class WrappedPrimitive<TNative extends (string | number | boolean)> extends WrappedType<TNative, TNative> {
  constructor(options: TWrappedPrimitiveOptions<TNative>) {
    super({
      ...options,
      category: ETypeCategory.PRIMITIVE,
    });
  }
}

type TWrappedComplexOptions<TNative, TWrapped> = Omit<TWrappedTypeOptions<TNative, TWrapped>, 'category'> & {
  fields: Record<keyof TWrapped, WrappedType<any, any>>,
};
export class WrappedComplex<TNative, TWrapped extends Record<string, any>> extends WrappedType<TNative, TWrapped> {
  public fields: TWrappedComplexOptions<TNative, TWrapped>['fields'];

  constructor(options: TWrappedComplexOptions<TNative, TWrapped>) {
    super({
      ...options,
      category: ETypeCategory.PRIMITIVE,
    });

    this.fields = options.fields;
  }
}

type TWrappedCollectionOptions<TNative, TWrapped> = Omit<TWrappedTypeOptions<TNative, TWrapped>, 'category'>;
export class WrappedCollection<TNative, TWrapped> extends WrappedType<TNative[], TWrapped[]> {
  constructor(options: TWrappedCollectionOptions<TNative[], TWrapped[]>) {
    super({
      ...options,
      category: ETypeCategory.COLLECTION,
    });
  }
}

function validatePrimitive(value: string | number | boolean, expected: 'string' | 'number' | 'boolean'): TTypeValidationResult {
  if (typeof value !== expected) {
    return {
      valid: false,
      reason: `\`${JSON.stringify(value)}\` is not a ${expected}`,
    };
  }

  return { valid: true, reason: null, };
}

export const WStringType = new WrappedPrimitive<string>({
  id: EPrimitive.STRING,
  name: 'String',
  validate: value => validatePrimitive(value, 'string'),
  unwrap: value => String(value),
  wrap: value => value,
});

export const WNumberType = new WrappedPrimitive<number>({
  id: EPrimitive.NUMBER,
  name: 'Number',
  validate: value => validatePrimitive(value, 'number'),
  unwrap: value => Number(value),
  wrap: value => value,
});

export const WBooleanType = new WrappedPrimitive<boolean>({
  id: EPrimitive.BOOLEAN,
  name: 'Boolean',
  validate: value => validatePrimitive(value, 'boolean'),
  unwrap: value => Boolean(value),
  wrap: value => value,
});

export type TDateType = {
  milliseconds: number,
  seconds: number,
  minutes: number,
  hours: number,
  days: number,
  months: number,
  years: number,
  timestamp: string,
};
export const WDateType = new WrappedComplex<Date, TDateType>({
  id: 'DATE',
  name: 'Date',
  fields: {
    milliseconds: WNumberType,
    seconds: WNumberType,
    minutes: WNumberType,
    hours: WNumberType,
    days: WNumberType,
    months: WNumberType,
    years: WNumberType,
    timestamp: WStringType,
  },
  validate: wrappedDate => {
    const validationErrors: string[] = [];

    Object
      .keys(WDateType.fields)
      .forEach(key => {
        const { valid, reason, } = WDateType.fields[key as keyof TDateType].validate(wrappedDate[key as keyof TDateType]);
        if (!valid) {
          validationErrors.push(
            `Invalid ${key} (${reason})`
          );
        }
      });

    if (validationErrors.length === 0) { return { valid: true, reason: null, }; }

    return {
      valid: false,
      reason: validationErrors.join(', '),
    };
  },
  unwrap: ({ timestamp, }) => new Date(WStringType.unwrap(timestamp)),
  wrap: input => {
    const date = new Date(input);

    return {
      milliseconds: WNumberType.wrap(date.getMilliseconds()),
      seconds: WNumberType.wrap(date.getSeconds()),
      minutes: WNumberType.wrap(date.getMinutes()),
      hours: WNumberType.wrap(date.getHours()),
      days: WNumberType.wrap(date.getDate()),
      months: WNumberType.wrap(date.getMonth() + 1),
      years: WNumberType.wrap(date.getFullYear()),
      timestamp: WStringType.wrap(date.toISOString()),
    };
  },
});
