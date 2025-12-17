import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className={cn("grid w-full max-w-sm items-center gap-1.5", className)}>
        {label && <Label htmlFor={props.id}>{label}</Label>}
        <Input 
          ref={ref} 
          type="file" 
          className="cursor-pointer file:text-primary file:font-medium" 
          {...props} 
        />
      </div>
    )
  }
)
FileInput.displayName = "FileInput"

export { FileInput }
