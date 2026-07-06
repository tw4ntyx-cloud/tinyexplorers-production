import { useEffect, useRef, useState } from "react";

/**
 * useInView — minimal IntersectionObserver hook.
 *
 * Returns [ref, inView]. Attach ref to any element; when it enters the
 * viewport (with a small `rootMargin` so the trigger fires slightly before
 * the element is fully visible), `inView` flips to true and stays true.
 *
 * Used for scroll-triggered fade-up on section entries. Cheaper than any
 * library; no dependency on framer-motion.
 *
 * Respects prefers-reduced-motion at the CSS level — the animation class
 * itself is gated by motion-safe: in components.
 */
export function useInView(options = {}) {
  const { rootMargin = "0px 0px -10% 0px", threshold = 0.05, once = true } = options;
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, inView];
}

export default useInView;
