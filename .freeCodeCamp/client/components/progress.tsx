import { useEffect, useState } from 'react';

type ProgressProps = {
  total: number;
  count: number;
};

export function Progress({ total, count }: ProgressProps) {
  const [value, setValue] = useState(0.0);

  useEffect(() => {
    setValue(count / total);
  }, [count]);

  return (
    <label>
      Resetting: <progress value={value}></progress>
    </label>
  );
}
