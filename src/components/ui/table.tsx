import { type ReactNode } from "react";
import { cn } from "~/utils/cn";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

export function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          "min-w-full divide-y divide-gray-300",
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      <tr>{children}</tr>
    </thead>
  );
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody
      className={cn(
        "divide-y divide-gray-200 bg-white",
        className,
      )}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
  return (
    <tr
      className={cn(
        "hover:bg-gray-50",
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
}

export function TableHeaderCell({
  children,
  className,
}: TableHeaderCellProps) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-3.5 text-left text-sm font-semibold text-gray-900",
        className,
      )}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-3 py-4 text-sm text-gray-500",
        className,
      )}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  className?: string;
}

export function TableEmpty({
  colSpan,
  message = "No data available",
  className,
}: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn(
          "px-3 py-8 text-center text-sm text-gray-500",
          className,
        )}
      >
        {message}
      </td>
    </tr>
  );
}
