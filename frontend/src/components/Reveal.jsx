import { useEffect, useRef, useState } from "react";

// Wraps any content and animates it in once it scrolls into view.
// direction: "up" (default, subtle rise from below), "down" (falls from
// above), or "fade" (no movement, just opacity).
export default function Reveal({ children, direction = "up", delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // animate in once, don't repeat on scroll back up
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startPosition = {
    up: "translate-y-6",
    down: "-translate-y-6",
    fade: "translate-y-0",
  }[direction];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1500 ease-out ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 ${startPosition}`
      } ${className}`}
    >
      {children}
    </div>
  );
}