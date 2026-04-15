'use client'

import { useFormStatus } from 'react-dom'
import { ReactNode } from 'react'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  pendingText?: string | ReactNode;
  isFullWidth?: boolean;
}

export function SubmitButton({ 
  children, 
  pendingText = 'กำลังดำเนินการ...', 
  isFullWidth = false,
  className = '',
  ...props 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`relative inline-flex items-center justify-center transition-all duration-200 active:scale-95 ${isFullWidth ? 'w-full' : ''} ${className} ${pending ? 'opacity-70 cursor-not-allowed active:scale-100' : ''}`}
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
