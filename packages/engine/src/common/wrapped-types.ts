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

type TWrappedTypeOptions = {
  id: string;
  name: string;
  category: ETypeCategory;
};
export abstract class WrappedType<TNative, TWrapped> {
  public id: TWrappedTypeOptions['id'];
  public name: TWrappedTypeOptions['name'];
  public category: TWrappedTypeOptions['category'];

  constructor({ id, name, category, }: TWrappedTypeOptions) {
    this.id = id;
    this.name = name;
    this.category = category;
  }

  get collection() {
    return new WrappedCollection<TNative, TWrapped>({
      id: `COLLECTION.${this.id}`,
      name: `Collection (${this.name})`,
      WEntryType: this,
    });
  }

  public abstract validate(input: TWrapped): TTypeValidationResult;
  public abstract wrap(input: TNative): TWrapped;
  public abstract unwrap(input: TWrapped): TNative;
}

export class WrappedPrimitive<TNative extends (string | number | boolean)> extends WrappedType<TNative, TNative> {
  public override id: EPrimitive;

  constructor(options: Omit<TWrappedTypeOptions, 'category'> & { id: EPrimitive }) {
    super({
      ...options,
      category: ETypeCategory.PRIMITIVE,
    });

    this.id = options.id;
  }

  public override validate(value: TNative): TTypeValidationResult {
    const expected = {
      [EPrimitive.STRING]: 'string',
      [EPrimitive.NUMBER]: 'number',
      [EPrimitive.BOOLEAN]: 'boolean',
    }[this.id];

    const isNaN = this.id === EPrimitive.NUMBER && Number.isNaN(value);

    if (typeof value !== expected || isNaN) {
      return {
        valid: false,
        reason: `\`${JSON.stringify(value)}\` is not a ${expected}`,
      };
    }

    return { valid: true, reason: null, };
  }

  public override wrap(value: TNative): TNative {
    switch (this.id) {
      case EPrimitive.STRING: return String(value) as TNative;
      case EPrimitive.NUMBER: return Number(value) as TNative;
      case EPrimitive.BOOLEAN: return Boolean(value) as TNative;
    }
  }

  public override unwrap(value: TNative): TNative { return value; }
}

type TWrappedComplexOptions<TNative, TWrapped> = Omit<TWrappedTypeOptions, 'category'> & {
  validate?: WrappedType<TNative, TWrapped>['validate'],
  wrap?: WrappedType<TNative, TWrapped>['wrap'],
  unwrap?: WrappedType<TNative, TWrapped>['unwrap'],

  fields: Record<keyof TWrapped, WrappedType<any, any>>,
};
// eslint-disable-next-line max-len
export class WrappedComplex<TNative extends Record<string, any>, TWrapped extends Record<string, any>> extends WrappedType<TNative, TWrapped> {
  public fields: TWrappedComplexOptions<TNative, TWrapped>['fields'];

  constructor(options: TWrappedComplexOptions<TNative, TWrapped>) {
    super({
      ...options,
      category: ETypeCategory.COMPLEX,
    });

    this.validate = options.validate ?? this.validate;
    this.wrap = options.wrap ?? this.wrap;
    this.unwrap = options.unwrap ?? this.unwrap;

    this.fields = options.fields;
  }

  public override validate(input: TWrapped): TTypeValidationResult {
    const validationErrors: string[] = [];

    Object
      .keys(this.fields)
      .forEach(key => {
        const { valid, reason, } = this.fields[key].validate(input[key]);
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
  }

  public override wrap(input: TNative): TWrapped {
    return Object
      .entries(this.fields)
      .reduce(
        (acc, [ key, type, ]) => ({ ...acc, [key]: type.wrap(input[key]), }),
        {} as TWrapped
      );
  }

  public override unwrap(input: TWrapped): TNative {
    return Object
      .entries(this.fields)
      .reduce(
        (acc, [ key, type, ]) => ({ ...acc, [key]: type.unwrap(input[key]), }),
        {} as TNative
      );
  }
}

type TWrappedCollectionOptions<TNative, TWrapped> = Omit<TWrappedTypeOptions, 'category'> & {
  WEntryType: WrappedType<TNative, TWrapped>
};
export class WrappedCollection<TNative, TWrapped> extends WrappedType<TNative[], TWrapped[]> {
  private WEntryType: WrappedType<TNative, TWrapped>;
  public fields: Record<string, WrappedType<any, any>>;

  constructor(options: TWrappedCollectionOptions<TNative, TWrapped>) {
    super({
      ...options,
      category: ETypeCategory.COLLECTION,
    });

    this.WEntryType = options.WEntryType;

    this.fields = {
      length: WNumberType,
    };
  }

  public override validate(entries: TWrapped[]): TTypeValidationResult {
    const validationErrors: string[] = [];

    entries.forEach((entry, index) => {
      const { valid, reason, } = this.WEntryType.validate(entry);
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
  }

  public override wrap(entries: TNative[]): TWrapped[] {
    if (!Array.isArray(entries)) {
      throw new Error('Input must be a collection');
    }

    return entries.map(e => this.WEntryType.wrap(e));
  }

  public override unwrap(entries: TWrapped[]): TNative[] {
    return entries.map(e => this.WEntryType.unwrap(e));
  }
}

export const WStringType = new WrappedPrimitive<string>({
  id: EPrimitive.STRING,
  name: 'String',
});

export const WNumberType = new WrappedPrimitive<number>({
  id: EPrimitive.NUMBER,
  name: 'Number',
});

export const WBooleanType = new WrappedPrimitive<boolean>({
  id: EPrimitive.BOOLEAN,
  name: 'Boolean',
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
