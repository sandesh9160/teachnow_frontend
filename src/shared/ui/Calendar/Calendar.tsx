"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/shared/ui/Buttons/Buttons"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select/Select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  // Priority: props.month -> props.selected (if single) -> props.defaultMonth -> now
  const initialMonth = React.useMemo(() => {
    if (props.month) return props.month;
    if (props.mode === "single" && (props as any).selected instanceof Date) return (props as any).selected;
    return props.defaultMonth || new Date();
  }, [props.month, props.mode, (props as any).selected, props.defaultMonth]);

  const [internalMonth, setInternalMonth] = React.useState<Date>(initialMonth)

  // Sync internal month if external props change
  React.useEffect(() => {
    if (props.month) {
      setInternalMonth(props.month)
    } else if (props.mode === "single" && (props as any).selected instanceof Date) {
      const selected = (props as any).selected as Date;
      // If we're not controlling month but date changes, we might want to follow it
      if (selected.getMonth() !== internalMonth.getMonth() || selected.getFullYear() !== internalMonth.getFullYear()) {
         setInternalMonth(selected)
      }
    }
  }, [props.month, props.mode, (props as any).selected])

  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth)
    props.onMonthChange?.(newMonth)
  }

  const years = Array.from({ length: 91 }, (_, i) => new Date().getFullYear() + 10 - i);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const currentMonth = internalMonth;

  return (
    <div 
      className="p-2.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 min-w-[270px] max-w-[calc(100vw-2rem)] select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DayPicker
        showOutsideDays={showOutsideDays}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        className={cn("w-full", className)}
      classNames={{
        months: "relative flex flex-col space-y-2",
        month: "space-y-2.5",
        month_caption: "relative flex justify-center h-8 items-center mb-1.5",
        caption_label: "hidden",
        nav: "absolute w-full flex justify-between px-0.5 z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-60 hover:opacity-100 shadow-xs border-slate-100 rounded-full flex items-center justify-center transition-all hover:bg-slate-50"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-60 hover:opacity-100 shadow-xs border-slate-100 rounded-full flex items-center justify-center transition-all hover:bg-slate-50"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full mb-1",
        weekday: "text-slate-400 font-semibold text-[0.62rem] flex-1 text-center uppercase tracking-tighter opacity-70",
        week: "flex w-full mt-0.5",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 text-[12px] font-normal aria-selected:opacity-100 flex-1 hover:bg-indigo-50 hover:text-indigo-600 transition-all rounded-lg flex items-center justify-center"
        ),
        selected:
          "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white rounded-lg font-semibold shadow-md shadow-indigo-600/20",
        today: "text-indigo-600 font-bold bg-indigo-50/70 rounded-lg",
        outside: "text-slate-200 opacity-30",
        disabled: "text-slate-200 opacity-50",
        hidden: "invisible",
        range_middle: "aria-selected:bg-slate-50 aria-selected:text-slate-900",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          return orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          );
        },
        MonthCaption: () => (
          <div className="flex items-center gap-0.5 z-20">
            <Select 
              value={months[currentMonth.getMonth()]} 
              onValueChange={(mName) => {
                const newMonth = new Date(currentMonth);
                newMonth.setMonth(months.indexOf(mName));
                handleMonthChange(newMonth);
              }}
            >
              <SelectTrigger 
                onPointerDown={(e) => e.stopPropagation()}
                className="h-7 py-0 px-2 text-[12.5px] font-bold border-none bg-transparent hover:bg-slate-50 focus:ring-0 transition-colors rounded-md min-w-[60px] justify-center gap-0.5 shadow-none z-30"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[100px] border-slate-100 shadow-2xl rounded-xl z-[100]">
                {months.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs font-semibold py-1.5 cursor-pointer">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={currentMonth.getFullYear().toString()} 
              onValueChange={(y) => {
                const newMonth = new Date(currentMonth);
                newMonth.setFullYear(parseInt(y));
                handleMonthChange(newMonth);
              }}
            >
              <SelectTrigger 
                onPointerDown={(e) => e.stopPropagation()}
                className="h-7 py-0 px-2 text-[12.5px] font-bold border-none bg-transparent hover:bg-slate-50 focus:ring-0 transition-colors rounded-md justify-center gap-0.5 shadow-none z-30"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px] border-slate-100 shadow-2xl rounded-xl z-[100]">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()} className="text-xs font-semibold py-1.5 cursor-pointer">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      }}
      {...props}
    />
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
