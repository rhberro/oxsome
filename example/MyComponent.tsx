import { useMemo } from 'react';

export interface MyComponentProps {
  name: string;
  values: Array<number>;
}

export function MyComponent(props: MyComponentProps) {
  const { name, values } = props;

  function calculateTotal() {
    return values.reduce(sum, 0);
  }

  function sum(total: number, value: number) {
    return total + value;
  }

  const total = useMemo(calculateTotal, [values]);
  const label = `${name}: ${total}`;

  return <p>{label}</p>;
}
