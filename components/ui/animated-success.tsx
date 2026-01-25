"use client";

export function AnimatedSuccess() {
  return (
    <div className="relative inline-flex items-center justify-center w-16 h-16">
      {/* Circle ring that draws */}
      <svg
        className="absolute inset-0 w-16 h-16"
        viewBox="0 0 64 64"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="176"
          className="animate-ring"
        />
      </svg>

      {/* Background and checkmark appear after ring completes */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 animate-bg">
        <svg className="w-8 h-8 animate-check" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="#16a34a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes ring {
          0% {
            stroke-dashoffset: 176;
          }
          80% {
            stroke-dashoffset: 0;
          }
          90% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes bg-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes check-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-ring {
          animation: ring 1.2s ease-in-out forwards;
        }

        .animate-bg {
          animation: bg-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s forwards;
        }

        .animate-check {
          animation: check-pop 0.3s ease-out 1.7s forwards;
        }
      `}</style>
    </div>
  );
}
