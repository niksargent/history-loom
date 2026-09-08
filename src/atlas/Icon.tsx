export function Icon({
  name,
  size = 20,
  className = '',
}: {
  name: string
  size?: number
  className?: string
}) {
  const paths: Record<string, React.ReactNode> = {
    arrow: (
      <>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </>
    ),
    back: (
      <>
        <path d="M20 12H5m6-6-6 6 6 6" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v2m0 18v2M1 12h2m18 0h2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4m0-15.6-1.4 1.4M5.6 18.4l-1.4 1.4" />
      </>
    ),
    moon: <path d="M20.7 14A9 9 0 0 1 10 3.3 9 9 0 1 0 20.7 14Z" />,
    spark: (
      <>
        <path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z" />
        <path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6Z" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0" />
      </>
    ),
    route: (
      <>
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9" />
      </>
    ),
    chart: (
      <>
        <path d="M4 3v17h17M7 15l4-5 4 2 5-7" />
        <circle cx="11" cy="10" r="1" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
    play: <path d="m8 4 12 8-12 8Z" />,
    pause: (
      <>
        <path d="M8 4v16M16 4v16" />
      </>
    ),
    sound: (
      <>
        <path d="M3 9h4l5-4v14l-5-4H3ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="M3 9h4l5-4v14l-5-4H3Zm13 0 6 6m0-6-6 6" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12h3v8H4zM17 12h3v8h-3z" />
      </>
    ),
    check: <path d="m5 12 4 4L20 5" />,
    external: (
      <>
        <path d="M14 3h7v7M21 3 10 14M10 3H3v18h18v-7" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-3-7-3-10-2v16c3-1 7-1 10 2 3-3 7-3 10-2V3c-3-1-7-1-10 2Zm0 0v16" />
      </>
    ),
    network: (
      <>
        <circle cx="12" cy="4" r="2" />
        <circle cx="4" cy="18" r="2" />
        <circle cx="20" cy="18" r="2" />
        <path d="m11 6-6 10m8-10 6 10M6 18h12" />
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C8 2 1 10 6 17c8 7 16-2 14-14ZM4 21 16 8" />
      </>
    ),
    arch: (
      <>
        <path d="M4 21V10a8 8 0 0 1 16 0v11M8 21V10a4 4 0 0 1 8 0v11M2 21h20" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    reset: (
      <>
        <path d="M3 4v6h6M4 9a8 8 0 1 1 0 7" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.spark}
    </svg>
  )
}
