import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

// forwardRef lets parent components get a ref to the input element
const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  className = '',
  ...rest
}, ref) => {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {rest.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      {/* Input */}
      <input
        ref={ref}
        className={`
          input-field
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...rest}
      />

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input