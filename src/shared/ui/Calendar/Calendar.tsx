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
  const [month, setMonth] = React.useState<Date>(
    ((props as any).selected instanceof Date ? (props as any).selected : props.defaultMonth) || new Date()
  );

  const years = Array.from({ length: 121 }, (_, i) => 2050 - i);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleMonthChange = (monthName: string) => {
    const newMonth = new Date(month);
    const monthIndex = months.findIndex(m => m === monthName);
    if (monthIndex !== -1) {
      newMonth.setMonth(monthIndex);
      setMonth(newMonth);
    }
  };

  const handleYearChange = (year: string) => {
    const newMonth = new Date(month);
    newMonth.setFullYear(parseInt(year));
    setMonth(newMonth);
  };

  return (
    <div 
      className="p-2.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 min-w-[270px] max-w-[calc(100vw-2rem)] select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={showOutsideDays}
        className={cn("w-full", className)}
      classNames={{
        months: "relative flex flex-col space-y-2",
        month: "space-y-2.5",
        month_caption: "relative flex justify-center h-8 items-center mb-1.5",
        caption_label: "hidden",
        nav: "absolute w-full flex justify-between px-0.5 z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-60 hover:opacity-100 shadow-xs border-slate-100 rounded-full"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-60 hover:opacity-100 shadow-xs border-slate-100 rounded-full"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full mb-1",
        weekday: "text-slate-400 font-semibold text-[0.62rem] flex-1 text-center uppercase tracking-tighter opacity-70",
        week: "flex w-full mt-0.5",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7.5 w-7.5 p-0 text-[12px] font-normal aria-selected:opacity-100 flex-1 hover:bg-slate-50 hover:text-indigo-600 transition-all rounded-full"
        ),
        selected:
          "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-600 focus:text-white rounded-full font-semibold",
        today: "text-indigo-600 font-bold bg-indigo-50/70 rounded-full",
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
            <Select value={months[month.getMonth()]} onValueChange={handleMonthChange}>
              <SelectTrigger className="h-7 py-0 px-1.5 text-[12.5px] font-bold border-none bg-transparent hover:bg-slate-50 focus:ring-0 transition-colors rounded-md min-w-[55px] justify-center gap-0.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[90px] rounded-xl border-slate-100 shadow-2xl">
                {months.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs font-medium rounded-lg py-1">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="h-7 py-0 px-1.5 text-[12.5px] font-bold border-none bg-transparent hover:bg-slate-50 focus:ring-0 transition-colors rounded-md justify-center gap-0.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[80px] rounded-xl border-slate-100 shadow-2xl">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()} className="text-xs font-medium rounded-lg py-1">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ),
      }}
      captionLayout="label"
      fixedWeeks
      {...props}
    />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
