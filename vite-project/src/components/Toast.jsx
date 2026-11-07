import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Small popup that slides in at the bottom of the screen and closes itself.
// Rendered into <body> so parent layouts (e.g. backdrop-blur) can't clip it.
function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);
  // Kept in a ref so parent re-renders don't restart the timers
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onCloseRef.current(), 300);
  };

  useEffect(() => {
    const showFrame = requestAnimationFrame(() => setVisible(true));
    const hideTimer = setTimeout(() => setVisible(false), duration);
    const closeTimer = setTimeout(() => onCloseRef.current(), duration + 300);
    return () => {
      cancelAnimationFrame(showFrame);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [message, duration]);

  const isSuccess = type === "success";

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-[1000] -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl border bg-white ${
          isSuccess ? "border-green-200" : "border-red-200"
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <svg
            className={`h-5 w-5 ${isSuccess ? "text-green-600" : "text-red-600"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d={isSuccess ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"}
            />
          </svg>
        </div>
        <p className="flex-1 text-sm font-semibold text-gray-800">{message}</p>
        <button
          onClick={dismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default Toast;
