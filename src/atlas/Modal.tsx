import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

export function Modal({
  title,
  onClose,
  children,
  className = '',
}: {
  title: string
  onClose: () => void
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])
  useEffect(() => {
    const element = ref.current
    const previous = document.activeElement as HTMLElement | null
    element?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      className={`atlas-dialog ${className}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        closeRef.current()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose()
        }
      }}
    >
      <button
        className="icon-button dialog-close"
        aria-label="Close dialog"
        onClick={onClose}
      >
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  )
}
