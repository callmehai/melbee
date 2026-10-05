import { ArrowUpRight } from 'lucide-react'
import { FacebookIcon, ZaloIcon } from './BrandIcons.jsx'
import { brand } from '../../config/brand.js'
import './Button.css'

/** Nút/đường dẫn dùng chung. variant: solid | outline | ghost | light */
export default function Button({ href, children, variant = 'solid', icon, external, className = '', ...rest }) {
  const isExternal = external ?? /^https?:/.test(href || '')
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      className={`btn btn--${variant} ${className}`}
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      type={href ? undefined : 'button'}
      data-cursor="cta"
      {...rest}
    >
      {icon}
      <span>{children}</span>
    </Tag>
  )
}

/** Nút nhắn tin Facebook — link lấy từ src/config/brand.js */
export function FacebookButton({ variant = 'solid', children = brand.cta.facebook, ...rest }) {
  return (
    <Button href={brand.facebook} variant={variant} icon={<FacebookIcon />} aria-label={`${children} (mở Facebook)`} {...rest}>
      {children}
    </Button>
  )
}

/** Nút nhắn tin Zalo — link lấy từ src/config/brand.js */
export function ZaloButton({ variant = 'outline', children = brand.cta.zalo, ...rest }) {
  return (
    <Button href={brand.zalo} variant={variant} icon={<ZaloIcon />} aria-label={`${children} (mở Zalo)`} {...rest}>
      {children}
    </Button>
  )
}

export function ArrowLink({ href, children, ...rest }) {
  return (
    <a className="arrow-link" href={href} data-cursor="cta" {...rest}>
      <span>{children}</span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  )
}
