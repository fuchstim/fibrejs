import { Dispatch, SetStateAction } from 'react';

export type HeaderSetter = Dispatch<SetStateAction<HeaderConfig>>;

export type HeaderConfig = {
  title: string,
  subtitle: string,
  extra?: JSX.Element,
};
