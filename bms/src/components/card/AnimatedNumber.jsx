import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Single scrolling digit column (0-9), like an odometer wheel.
 */
function Digit({ digit, height = "1em" }) {
  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ height, width: "0.62em" }}
    >
      <span
        className="flex flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            style={{ height }}
            className="flex items-center justify-center"
          >
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * AnimatedNumber
 * - While `loading` is true: digits spin/cycle randomly (odometer "searching" effect).
 * - When `loading` becomes false: eases smoothly from the current spun value to the real `value`.
 *
 * Usage:
 *   <AnimatedNumber value={periodSummary.income} loading={loading} prefix="₱" decimals={2} />
 */
export default function AnimatedNumber({
  value = 0,
  loading = false,
  decimals = 2,
  prefix = "",
  spinIntervalMs = 90,
  settleDurationMs = 800,
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const spinRef = useRef(null);
  const displayRef = useRef(0);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  // Spin randomly while loading
  useEffect(() => {
    if (!loading) return;
    const magnitude = Math.max(Math.abs(value), 1000);
    spinRef.current = setInterval(() => {
      setDisplay(Math.random() * magnitude);
    }, spinIntervalMs);
    return () => clearInterval(spinRef.current);
  }, [loading, value, spinIntervalMs]);

  // Ease into the real value once loading finishes (or value changes)
  useEffect(() => {
    if (loading) return;
    clearInterval(spinRef.current);

    const start = displayRef.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startTime) / settleDurationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(start + (end - start) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(end);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loading, value, settleDurationMs]);

  const formatted = useMemo(() => {
    const fixed = Math.max(display, 0).toFixed(decimals);
    const [intPart, decPart] = fixed.split(".");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimals > 0 ? `${withCommas}.${decPart}` : withCommas;
  }, [display, decimals]);

  return (
    <span className="inline-flex items-baseline font-mono tabular-nums">
      {prefix && <span className="mr-0.5">{prefix}</span>}
      {formatted.split("").map((ch, idx) =>
        /\d/.test(ch) ? (
          <Digit key={idx} digit={Number(ch)} />
        ) : (
          <span key={idx} className="mx-[1px]">
            {ch}
          </span>
        )
      )}
    </span>
  );
}