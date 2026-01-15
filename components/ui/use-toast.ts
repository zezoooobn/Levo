type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const toast = ({ title, description, variant = "default" }: ToastProps) => {
  // Silent implementation - no alerts or popups
  console.log(`Toast: ${title} - ${description} (${variant})`)
  // Removed browser alert to prevent popup messages
}
