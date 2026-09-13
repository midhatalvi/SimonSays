import React from "react";
export function LiftMark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M8 24C8 8 20 8 20 21C20 34 32 33 32 16"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="32" cy="7" r="4" fill="currentColor" />
    </svg>
  );
}
export function BrandHeader({ onHome, children }) {
  return (
    <header className="brand-header">
      <button
        className="wordmark"
        onClick={onHome}
        aria-label="Simon Says home"
      >
        <LiftMark />
        <span>
          simon says<span className="logo-dot">.</span>
        </span>
      </button>
      {children || (
        <span className="header-note">A little movement. A little joy.</span>
      )}
    </header>
  );
}
export function BrandFooter() {
  return (
    <footer className="brand-footer">
      <span>Small moves. Good company.</span>
      <span>
        Made for your kind of day <span aria-hidden="true">✳</span>
      </span>
    </footer>
  );
}
export function SimonArt({ expression = "happy", className = "" }) {
  return (
    <svg
      className={"simon-art " + className}
      viewBox="0 0 520 490"
      role="img"
      aria-label="Simon, a lilac companion with a warm smile and one hand raised"
    >
      <ellipse
        cx="262"
        cy="445"
        rx="156"
        ry="18"
        fill="#432D49"
        opacity=".09"
      />
      <g className="simon-body-art">
        <path
          d="M204 373L193 434Q193 449 215 449H241L243 375M287 377L290 430Q291 448 309 448H337Q346 447 340 435L327 372"
          fill="#49324E"
        />
        <path
          d="M176 249Q127 256 116 316Q109 335 96 328"
          fill="none"
          stroke="#9780B8"
          strokeWidth="34"
          strokeLinecap="round"
        />
        <g className="wave-arm">
          <path
            d="M333 254Q393 249 397 166"
            fill="none"
            stroke="#9780B8"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path
            d="M397 172L387 139M398 168L401 130M404 171L417 143"
            fill="none"
            stroke="#9780B8"
            strokeWidth="13"
            strokeLinecap="round"
          />
        </g>
        <path
          d="M170 263Q174 227 216 228H300Q337 228 345 269L359 351Q361 394 314 400H204Q156 398 158 357Z"
          fill="#BBA8D4"
        />
        <path
          d="M188 310Q240 336 331 312"
          fill="none"
          stroke="#A68DC6"
          strokeWidth="3"
        />
        <path
          d="M264 313V345"
          stroke="#49324E"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="264" cy="355" r="4" fill="#49324E" />
        <rect x="164" y="126" width="187" height="155" rx="61" fill="#CDBDE0" />
        <path
          d="M179 178Q180 148 214 148H303Q336 148 336 179V208Q336 241 303 245H213Q179 245 179 212Z"
          fill="#F9F6EF"
        />
        <ellipse cx="225" cy="190" rx="7" ry="12" fill="#49324E" />
        <ellipse cx="290" cy="190" rx="7" ry="12" fill="#49324E" />
        <path
          d={
            expression === "oops"
              ? "M247 225Q257 216 269 223"
              : "M243 213Q258 230 274 211"
          }
          fill="none"
          stroke="#49324E"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <ellipse cx="207" cy="211" rx="11" ry="6" fill="#E5ABA8" />
        <ellipse cx="307" cy="211" rx="11" ry="6" fill="#E5ABA8" />
        <path
          d="M256 128V108"
          stroke="#49324E"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M258 112Q223 111 220 81Q252 74 258 112" fill="#8D9E60" />
        <path d="M258 112Q258 75 290 70Q305 99 258 112" fill="#B5C886" />
      </g>
      <g fill="none" stroke="#49324E" strokeWidth="3" strokeLinecap="round">
        <path d="M431 113L441 99M445 132L465 129M371 106L369 88" />
      </g>
    </svg>
  );
}
export function MoveIcon({ pose }) {
  const left = pose === "LEFT_HAND_UP",
    both = pose === "ARMS_OUT",
    head = pose === "TOUCH_HEAD",
    nose = pose === "TOUCH_NOSE",
    shoulder = pose === "TOUCH_SHOULDERS";
  return (
    <svg viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <circle cx="30" cy="13" r="7" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M30 24V42M30 42L20 54M30 42L40 54"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d={
          both
            ? "M6 28H54"
            : head
              ? "M30 27L15 24L23 5M30 27L43 39"
              : nose
                ? "M30 27L15 31L27 15M30 27L44 40"
                : shoulder
                  ? "M19 36L39 25M41 36L21 25"
                  : left
                    ? "M30 27L15 27L12 7M30 27L44 40"
                    : "M30 27L45 27L48 7M30 27L16 40"
        }
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
