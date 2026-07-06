import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Link } from "react-router-dom";
import { cva } from "class-variance-authority";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils"

const ICONS = {
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
};

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-soft focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 hover:shadow-soft-lg",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent:
          "bg-brand-orange text-white shadow-soft hover:scale-[1.02] hover:shadow-soft-lg",
        primary:
          "bg-brand-ink text-white shadow-soft hover:scale-[1.02] hover:bg-brand-orange hover:shadow-soft-lg",
      },
      size: {
        default: "h-10 px-5 py-2.5 sm:h-9 sm:px-4 sm:py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 px-8 py-3 sm:h-10 sm:px-8 sm:py-2.5",
        icon: "h-10 w-10 sm:h-9 sm:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, to, href, testId, icon, children, ...props }, ref) => {
  const classes = cn(buttonVariants({ variant, size, className }));
  const Icon = typeof icon === "string" ? ICONS[icon] : undefined;
  const content = Icon ? (
    <>
      {children}
      <Icon size={15} strokeWidth={2.5} />
    </>
  ) : (
    children
  );

  if (to) {
    return (
      <Link to={to} ref={ref} className={classes} data-testid={testId} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} ref={ref} className={classes} data-testid={testId} {...props}>
        {content}
      </a>
    );
  }

  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={classes}
      ref={ref}
      data-testid={testId}
      {...props}
    >
      {content}
    </Comp>
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button;