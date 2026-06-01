"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/shared/ui/Calendar/Calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/Popover/Popover"

interface DatePickerProps {
  date?: Date
  setDate: (date?: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  calendarDisabled?: any
}

export function DatePicker({ date, setDate, placeholder = "Pick a date", className, disabled, calendarDisabled }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={!disabled ? setOpen : undefined}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-start text-left h-10 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 outline-none text-[13px] font-semibold group/picker disabled:opacity-50 disabled:cursor-not-allowed",
            !date && "text-slate-400 text-slate-400/70 font-normal",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 group-hover/picker:text-indigo-500 shrink-0" />
          <span className="truncate">{date ? format(date, "PPP") : placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-none z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d)
            setOpen(false)
          }}
          disabled={calendarDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
