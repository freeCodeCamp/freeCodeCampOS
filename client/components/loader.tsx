export const Loader = ({ size = '100' }: { size?: string }) => {
  const s = size.endsWith('px') || size.endsWith('%') ? size : `${size}px`;
  return (
    <div
      className='loader'
      style={{ width: s, height: s, verticalAlign: 'middle' }}
    ></div>
  );
};
