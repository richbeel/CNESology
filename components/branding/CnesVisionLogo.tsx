type CnesVisionLogoProps = {
  className?: string;
  /** Větší varianta pro login. */
  large?: boolean;
  /** Kompaktní varianta pro horní lištu. */
  nav?: boolean;
};

/** Rozměry public/cnes-vision-logo.png (po trim). */
const LOGO = { width: 538, height: 308 } as const;

export function CnesVisionLogo({
  className = '',
  large = false,
  nav = false,
}: CnesVisionLogoProps) {
  const logoClass = nav
    ? 'block h-11 w-auto max-w-[min(62vw,200px)] shrink-0 object-contain object-left sm:h-12 sm:max-w-[220px] md:h-14 md:max-w-[260px]'
    : large
      ? 'block h-auto w-[min(100%,300px)] max-w-none shrink-0 object-contain sm:w-[340px]'
      : 'block h-auto w-[min(100%,160px)] max-w-none shrink-0 object-contain sm:w-[180px]';

  return (
    <div className={`flex items-center justify-center overflow-visible ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/cnes-vision-logo.png"
        alt=""
        width={LOGO.width}
        height={LOGO.height}
        className={logoClass}
        decoding="async"
      />
      <span className="sr-only">ČNES vision</span>
    </div>
  );
}
