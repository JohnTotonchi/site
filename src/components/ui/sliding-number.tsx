'use client';
import { useEffect, useId } from 'react';
import {
  MotionValue,
  motion,
  useSpring,
  useTransform,
  motionValue,
} from 'motion/react';
import useMeasure from 'react-use-measure';

const TRANSITION = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 18,
  mass: 0.3,
};

function Digit({ value, place, showAll, maxValue }: { value: number; place: number; showAll?: boolean; maxValue?: number }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = motionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, TRANSITION);
  const maxDigit = place === 1 ? 9 : Math.floor((maxValue || 99) / place);
  const numDigits = maxDigit + 1;

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div className={`relative inline-block w-[1ch] overflow-x-visible leading-none tabular-nums ${showAll ? '' : 'overflow-y-clip'}`}>
      <div className='invisible'>0</div>
      {Array.from({ length: numDigits }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} numDigits={numDigits} />
      ))}
    </div>
  );
}

function Number({ mv, number, numDigits }: { mv: MotionValue<number>; number: number; numDigits: number }) {
  const uniqueId = useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest;
    const offset = number - placeValue;
    const memo = offset * bounds.height;

    return memo;
  });

  const opacity = useTransform(mv, (latest) => {
    const placeValue = latest;
    const offset = number - placeValue;
    return Math.max(0, 1 - Math.abs(offset) / 4);
  });

  // don't render the animated number until we know the height

  if (!bounds.height) {
    return (
      <span ref={ref} className='invisible absolute'>
        {number}
      </span>
    );
  }

  return (
    <motion.span
      style={{ y, opacity }}
      layoutId={`${uniqueId}-${number}`}
      className='absolute inset-0 flex items-center justify-center'
      transition={TRANSITION}
      ref={ref}
    >
      {number}
    </motion.span>
  );
}

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  showAll?: boolean;
  maxValue?: number;
};

export function SlidingNumber({
  value,
  padStart = false,
  decimalSeparator = '.',
  showAll = false,
  maxValue = 99,
}: SlidingNumberProps) {
  const absValue = Math.abs(value);
  const [integerPart, decimalPart] = absValue.toString().split('.');
  const integerValue = parseInt(integerPart, 10);
  const paddedInteger =
    padStart && integerValue < 10 ? `0${integerPart}` : integerPart;
  const integerDigits = paddedInteger.split('');
  const integerPlaces = integerDigits.map((_, i) =>
    Math.pow(10, integerDigits.length - i - 1)
  );

  return (
    <div className='flex items-center'>
      {value < 0 && '-'}
      {integerDigits.map((_, index) => (
        <Digit
          key={`pos-${integerPlaces[index]}`}
          value={integerValue}
          place={integerPlaces[index]}
          showAll={showAll}
          maxValue={maxValue}
        />
      ))}
      {decimalPart && (
        <>
          <span>{decimalSeparator}</span>
          {decimalPart.split('').map((_, index) => (
            <Digit
              key={`decimal-${index}`}
              value={parseInt(decimalPart, 10)}
              place={Math.pow(10, decimalPart.length - index - 1)}
              showAll={showAll}
            />
          ))}
        </>
      )}
    </div>
  );
}
