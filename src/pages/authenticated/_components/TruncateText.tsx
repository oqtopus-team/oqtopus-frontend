import { FC } from 'react';
import clsx from 'clsx';

export type TruncateTextProps = {
  text: string;
  limit: number;
  className?: string;
};

export const TruncateText: FC<TruncateTextProps> = ({ text, limit, className }) => {
  const displayText = text.length > limit ? `${text.slice(0, limit)}…` : text;
  return <span className={clsx('break-words', className)}>{displayText}</span>;
};

export default TruncateText;
