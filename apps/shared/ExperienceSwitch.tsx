import './experience-switch.css'

export function ExperienceSwitch({ current }: { current: 'atlas' | 'classic' }) {
  const base = import.meta.env.BASE_URL
  return (
    <div className={`loom-experience-switch loom-experience-switch--${current}`} role="navigation" aria-label="Choose experience">
      <a href={base} aria-current={current === 'atlas' ? 'page' : undefined}>Atlas</a>
      <a href={`${base}classic/`} aria-current={current === 'classic' ? 'page' : undefined}>Classic</a>
    </div>
  )
}
