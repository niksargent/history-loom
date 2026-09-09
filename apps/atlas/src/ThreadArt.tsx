import { useId } from 'react'
import type { Journey } from './types'

export function ThreadArt({
  kind,
  className = '',
}: {
  kind: Journey['art']
  className?: string
}) {
  const id = useId().replaceAll(':', '')
  return (
    <svg
      className={`thread-art ${className}`}
      viewBox="0 0 500 290"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}glow`}>
          <stop stopColor="currentColor" stopOpacity=".26" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}line`} x2="1" y2="1">
          <stop stopColor="currentColor" stopOpacity=".1" />
          <stop offset=".5" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <ellipse cx="250" cy="150" rx="205" ry="150" fill={`url(#${id}glow)`} />
      <g stroke="currentColor" opacity=".1">
        {[58, 90, 122].map((r) => (
          <circle key={r} cx="250" cy="145" r={r} />
        ))}
        <path d="M40 145h420M250 15v260" />
      </g>
      {kind === 'networks' ? (
        <g stroke={`url(#${id}line)`}>
          {Array.from({ length: 11 }, (_, i) => (
            <path
              key={i}
              d={`M${65 + i * 2} ${205 + i * 2} Q${150 + i * 11} ${-85 + i * 17} ${435 - i * 2} ${130 + i * 6}`}
              strokeWidth={i === 5 ? 2 : 0.8}
            />
          ))}
          {[
            [95, 175],
            [170, 78],
            [282, 100],
            [385, 140],
            [310, 198],
          ].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="5" fill="currentColor" />
              <circle cx={x} cy={y} r="12" />
            </g>
          ))}
        </g>
      ) : kind === 'cities' ? (
        <g stroke="currentColor" strokeWidth="1.1">
          <path
            d="M65 226h370M90 218h325M110 209h285M140 200h225"
            opacity=".45"
          />
          <path
            d="M175 200v-16h15v-17h16v-17h16v-18h56v18h16v17h16v17h15v16Z"
            fill="currentColor"
            fillOpacity=".07"
          />
          <path d="M240 132V89h20v43M234 89h32l-16-25Z M230 200v-35h40v35M243 200v-25h14v25" />
          <path
            d="M114 209v-76h45v76M121 133v-13h31v13M124 158h6v13h-6Zm19 0h6v13h-6ZM133 209v-26h10v26"
            opacity=".65"
          />
          <path
            d="M340 209v-98h43v98M334 111h55l-27-29ZM350 145h7v15h-7Zm17 0h7v15h-7ZM351 209v-29q11-15 22 0v29"
            opacity=".65"
          />
          <circle cx="300" cy="70" r="24" opacity=".25" />
          <path d="M70 242q180 15 360-2M95 251q155 12 300-1" opacity=".2" />
        </g>
      ) : kind === 'voices' ? (
        <g stroke="currentColor">
          {Array.from({ length: 15 }, (_, i) => (
            <g
              key={i}
              transform={`translate(${90 + i * 23} ${128 + Math.sin(i * 0.8) * 27})`}
              opacity={0.25 + (i % 4) * 0.15}
            >
              <circle cy="-14" r="6" />
              <path d="M-9 22V3Q0-6 9 3v19M0 23v28" />
            </g>
          ))}
          <path d="M80 222q170-50 340 0" opacity=".35" />
        </g>
      ) : kind === 'survival' ? (
        <g stroke="currentColor">
          {Array.from({ length: 13 }, (_, i) => (
            <path
              key={i}
              d={`M${85 + i * 5} 210 C${150 + i * 9} ${100 - i * 9} ${210 + i * 9} ${260 - i * 11} ${355 + i * 4} 65`}
              opacity={0.2 + i * 0.045}
            />
          ))}
          <circle cx="250" cy="145" r="54" strokeDasharray="2 8" />
          <circle cx="250" cy="145" r="7" fill="currentColor" />
        </g>
      ) : (
        <g stroke="currentColor">
          {Array.from({ length: 20 }, (_, i) => (
            <path
              key={i}
              d={`M250 145 L${250 + Math.cos((i * Math.PI) / 10) * 110} ${145 + Math.sin((i * Math.PI) / 10) * 110}`}
              opacity=".25"
            />
          ))}
          <path
            d="m250 53 19 67 73 25-73 22-19 71-21-71-71-22 71-25Z"
            strokeWidth="1.5"
          />
          <path
            d="m250 91 13 40 39 14-39 13-13 41-14-41-38-13 38-14Z"
            fill="currentColor"
            fillOpacity=".12"
          />
          {[
            [138, 80],
            [364, 189],
            [318, 63],
            [170, 212],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="3" fill="currentColor" />
          ))}
        </g>
      )}
      <g fill="currentColor" opacity=".4">
        {Array.from({ length: 30 }, (_, i) => (
          <circle
            key={i}
            cx={30 + ((i * 71) % 450)}
            cy={20 + ((i * 43) % 260)}
            r={i % 3 === 0 ? 1.4 : 0.7}
          />
        ))}
      </g>
    </svg>
  )
}
