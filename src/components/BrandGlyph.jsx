export function BrandGlyph({ size = 30 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mfoDark" x1="18" y1="18" x2="84" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f5f62" />
          <stop offset="55%" stopColor="#0a3f4c" />
          <stop offset="100%" stopColor="#3cab95" />
        </linearGradient>
        <linearGradient id="mfoMint" x1="54" y1="30" x2="84" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#aeeeb8" />
          <stop offset="100%" stopColor="#7ad4a8" />
        </linearGradient>
      </defs>

      <path d="M24 75V31" fill="none" stroke="url(#mfoDark)" strokeWidth="16" strokeLinecap="round" />
      <path d="M24 31L50 57" fill="none" stroke="url(#mfoDark)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 57L76 31" fill="none" stroke="url(#mfoMint)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M76 31V75" fill="none" stroke="url(#mfoDark)" strokeWidth="16" strokeLinecap="round" />
      <path d="M37 42V68" fill="none" stroke="#edf8f4" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="37" cy="74.5" r="5.8" fill="#edf8f4" />
    </svg>
  );
}

export function GoogleGlyph({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.23-.2-1.77H12v3.4h5.52a4.72 4.72 0 0 1-2.05 3.01l-.03.11 2.98 2.31.21.02c1.92-1.77 2.97-4.38 2.97-7.08Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.89 6.63-2.69l-3.16-2.44c-.85.57-1.96.97-3.47.97-2.66 0-4.92-1.8-5.73-4.28l-.11.01-3.1 2.4-.04.11A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.27 13.56A6.02 6.02 0 0 1 5.94 12c0-.54.11-1.06.31-1.56v-.12L3.1 7.88l-.1.05A10 10 0 0 0 2 12c0 1.46.35 2.84 1.02 4.07l3.25-2.51Z" />
      <path fill="#EA4335" d="M12 6.16c1.88 0 3.15.81 3.87 1.48l2.83-2.76A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.98 5.93l3.23 2.51C7.08 7.96 9.34 6.16 12 6.16Z" />
    </svg>
  );
}
