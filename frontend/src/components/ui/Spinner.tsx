// Spinner.tsx — loading indicator
// Shown while checking if user is authenticated on app load

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div
      className={`
        ${sizeClasses[size]}
        border-4 border-gray-200
        border-t-blue-600
        rounded-full
        animate-spin
      `}
    />
  )

  // fullScreen centers the spinner on the entire page
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}

export default Spinner