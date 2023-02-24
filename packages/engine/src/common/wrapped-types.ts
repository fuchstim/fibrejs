import { GConstructor, TValidationResult } from '../types/common';

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

export interface IWrappable<TNative, TWrapped> {
  id: string;
  name: string;
  category: ETypeCategory;

  collection: WrappedCollection<TNative, TWrapped>;
  nullable: INullableWrappable<TNative, TWrapped>;

  validate(input: TWrapped): TValidationResult;
  wrap(input: TNative): TWrapped;
  unwrap(input: TWrapped): TNative;
}

type TWrappableOptions<TNative, TWrapped> = {
  id: string,
  name: string;

  validate?: IWrappable<TNative, TWrapped>['validate'],
  wrap?: IWrappable<TNative, TWrapped>['wrap'],
  unwrap?: IWrappable<TNative, TWrapped>['unwrap'],
};

type TWrappedPrimitiveOptions<TNative, TWrapped> = TWrappableOptions<TNative, TWrapped> & {
  primitiveType?: EPrimitive
};
export class WrappedPrimitive<TNative extends (string | number | boolean)> implements IWrappable<TNative, TNative> {
  public id: string;
  public name: string;
  public category: ETypeCategory = ETypeCategory.PRIMITIVE;
  public primitiveType: EPrimitive;

  constructor({ id, name, primitiveType, validate, wrap, unwrap, }: TWrappedPrimitiveOptions<TNative, TNative>) {
    this.id = id;
    this.name = name;
    this.primitiveType = primitiveType ?? id as EPrimitive;

    this.validate = validate ?? this.validate;
    this.wrap = wrap ?? this.wrap;
    this.unwrap = unwrap ?? this.unwrap;
  }

  get collection(): WrappedCollection<TNative, TNative> {
    return new WrappedCollection<TNative, TNative>({ id: this.id, name: this.name, WEntryType: this, });
  }

  get nullable(): INullableWrappable<TNative, TNative> {
    return new NullableWrappedPrimitive<TNative>({ id: this.id, name: this.name, primitiveType: this.primitiveType, });
  }

  public validate(value: TNative): TValidationResult {
    const expected = {
      [EPrimitive.STRING]: 'string',
      [EPrimitive.NUMBER]: 'number',
      [EPrimitive.BOOLEAN]: 'boolean',
    }[this.primitiveType];

    const isNaN = this.primitiveType === EPrimitive.NUMBER && Number.isNaN(value);

    if (typeof value !== expected || isNaN) {
      return {
        valid: false,
        reason: `\`${JSON.stringify(value)}\` is not a ${expected}`,
      };
    }

    return { valid: true, reason: null, };
  }

  public wrap(value: TNative): TNative {
    switch (this.primitiveType) {
      case EPrimitive.STRING: return String(value) as TNative;
      case EPrimitive.NUMBER: return Number(value) as TNative;
      case EPrimitive.BOOLEAN: return Boolean(value) as TNative;
    }
  }

  public unwrap(value: TNative): TNative {
    return value;
  }
}
const NullableWrappedPrimitive = Nullable(WrappedPrimitive);

type TWrappedComplexOptions<TNative, TWrapped> = TWrappableOptions<TNative, TWrapped> & {
  fields: Record<keyof TWrapped, WrappedPrimitive<any> | WrappedComplex<any, any>>,

  validate?: IWrappable<TNative, TWrapped>['validate'],
  wrap?: IWrappable<TNative, TWrapped>['wrap'],
  unwrap?: IWrappable<TNative, TWrapped>['unwrap'],
};
export class WrappedComplex<TNative extends Record<string, any>, TWrapped extends Record<string, any>>
implements IWrappable<TNative, TWrapped> {
  public id: string;
  public name: string;
  public category: ETypeCategory = ETypeCategory.COMPLEX;
  public fields: Record<keyof TWrapped, WrappedPrimitive<any> | WrappedComplex<any, any>>;

  constructor({ id, name, fields, validate, wrap, unwrap, }: TWrappedComplexOptions<TNative, TWrapped>) {
    this.id = id;
    this.name = name;
    this.fields = fields;

    this.validate = validate ?? this.validate;
    this.wrap = wrap ?? this.wrap;
    this.unwrap = unwrap ?? this.unwrap;
  }

  get collection(): WrappedCollection<TNative, TWrapped> {
    return new WrappedCollection<TNative, TWrapped>({ id: this.id, name: this.name, WEntryType: this, });
  }

  get nullable(): INullableWrappable<TNative, TWrapped> {
    return new NullableWrappedComplex<TNative, TWrapped>({ id: this.id, name: this.name, fields: this.fields, });
  }

  public validate(input: TWrapped): TValidationResult {
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

  public wrap(input: TNative): TWrapped {
    return Object
      .entries(this.fields)
      .reduce(
        (acc, [ key, type, ]) => ({ ...acc, [key]: type.wrap(input[key]), }),
        {} as TWrapped
      );
  }

  public unwrap(input: TWrapped): TNative {
    return Object
      .entries(this.fields)
      .reduce(
        (acc, [ key, type, ]) => ({ ...acc, [key]: type.unwrap(input[key]), }),
        {} as TNative
      );
  }
}
const NullableWrappedComplex = Nullable(WrappedComplex);

type TWrappedCollectionOptions<TNative, TWrapped> = TWrappableOptions<TNative, TWrapped> & {
  WEntryType: IWrappable<TNative, TWrapped>
};
export class WrappedCollection<TNative, TWrapped> implements IWrappable<TNative[], TWrapped[]> {
  public id: string;
  public name: string;
  public category: ETypeCategory = ETypeCategory.COLLECTION;
  public WEntryType: IWrappable<TNative, TWrapped>;
  public fields: Record<string, WrappedPrimitive<number>>;

  constructor({ id, name, WEntryType, }: TWrappedCollectionOptions<TNative, TWrapped>) {
    this.id = `${id}.COLLECTION`;
    this.name = `${name} (Collection)`;
    this.WEntryType = WEntryType;
    this.fields = { length: WNumberType, };
  }

  get collection(): never {
    throw new Error('Nested collections are not supported'); // TODO: Support
  }

  get nullable(): never {
    throw new Error('Nullable collections are not supported'); // TODO: Support
  }

  public validate(entries: TWrapped[]): TValidationResult {
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

  public wrap(entries: TNative[]): TWrapped[] {
    if (!Array.isArray(entries)) {
      throw new Error('Input must be a collection');
    }

    return entries.map(e => this.WEntryType.wrap(e));
  }

  public unwrap(entries: TWrapped[]): TNative[] {
    return entries.map(e => this.WEntryType.unwrap(e));
  }
}

export interface INullableWrappable<TNative, TWrapped> extends IWrappable<TNative | null, TWrapped | null> {
  isNullableOf(wrappedType: IWrappable<any, any>): boolean;

  validate(input: TWrapped | null): TValidationResult;
  wrap(input: TNative | null): TWrapped | null;
  unwrap(input: TWrapped | null): TNative | null;
}

type TWrappable<TNative, TWrapped> = GConstructor<IWrappable<TNative | null, TWrapped | null>>;
type ExtractNative<Wrapped> = Wrapped extends TWrappable<infer TNative, unknown> ? TNative : never;
type ExtractWrapped<Wrapped> = Wrapped extends TWrappable<unknown, infer TWrapped> ? TWrapped: never;

function createNullableId(id: string) { return `${id}.NULLABLE`; }
function createNullableName(name: string) { return `${name} (Nullable)`; }

function Nullable<TBase extends TWrappable<ExtractNative<TBase>, ExtractWrapped<TBase>>>(Base: TBase) {
  return class Nullable extends Base implements INullableWrappable<ExtractNative<TBase>, ExtractWrapped<TBase>> {
    constructor(...args: any[]) {
      const options = args[0] as TWrappableOptions<ExtractNative<TBase>, ExtractWrapped<TBase>>;

      super({
        ...options,
        id: createNullableId(options.id),
        name: createNullableName(options.name),
      });

      if (this instanceof WrappedComplex) {
        this.fields = Object
          .entries(this.fields)
          .reduce(
            (acc, [ key, value, ]) => ({ ...acc, [key]: value.nullable, }),
            {}
          );
      }
    }

    override get nullable() { return this; }

    public isNullableOf(wrappedType: IWrappable<any, any>): boolean {
      return isNullableOf(wrappedType, this);
    }

    override validate(input: ExtractWrapped<TBase> | null): TValidationResult {
      if (input === null) {
        return { valid: true, reason: null, };
      }

      return super.validate(input);
    }

    override wrap(input: ExtractNative<TBase> | null): ExtractWrapped<TBase> | null {
      if (input === null || input === undefined) { return null; }

      return super.wrap(input);
    }

    override unwrap(input: ExtractWrapped<TBase> | null): ExtractNative<TBase> | null {
      if (input === null) { return null; }

      return super.unwrap(input);
    }
  };
}

export function isNullable<TNative, TWrapped>(
  wrappedNullable: IWrappable<TNative | null, TWrapped | null>
): wrappedNullable is INullableWrappable<TNative, TWrapped> {
  return (
    wrappedNullable instanceof NullableWrappedPrimitive || wrappedNullable instanceof NullableWrappedComplex
  );
}

export function isNullableOf<TNative, TWrapped>(
  wrapped: IWrappable<TNative, TWrapped> | string,
  wrappedNullable: IWrappable<TNative | null, TWrapped | null> | string
): boolean {
  const wrappedId = typeof wrapped === 'string' ? wrapped : wrapped.id;
  const wrappedNullableId = typeof wrappedNullable === 'string' ? wrappedNullable : wrappedNullable.id;

  return createNullableId(wrappedId) === wrappedNullableId;
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

