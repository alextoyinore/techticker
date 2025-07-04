import * as React from "react"

function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={36}
      height={36}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3h18v18H3z" fill="hsl(var(--primary))" stroke="none" />
      <path d="M6 19v-3" stroke="hsl(var(--primary-foreground))" />
      <path d="M10 19v-7" stroke="hsl(var(--primary-foreground))" />
      <path d="M14 19v-11" stroke="hsl(var(--primary-foreground))" />
      <path d="M18 19v-15" stroke="hsl(var(--primary-foreground))" />
    </svg>
  )
}

export default Logo
