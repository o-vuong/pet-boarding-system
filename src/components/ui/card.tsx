import { type HTMLAttributes } from "react";
import { cn } from "~/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
}

export function Card({
  as: Component = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function CardHeader({
  title,
  description,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-6", className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-6", className)}
      {...props}
    />
  );
}
