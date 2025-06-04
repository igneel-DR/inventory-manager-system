import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const kpiCardVariants = cva(
  "p-6 rounded-lg border bg-card shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        success: "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50",
        warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/50",
        danger: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50",
        info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export default function KpiCard({ 
  title, 
  value, 
  unit = '', 
  change, 
  icon: Icon, 
  variant = "default", 
  className,
  ...props 
}) {
  // Format change value for display if it exists
  const formattedChange = change !== undefined ? 
    `${change > 0 ? '+' : ''}${change}%` : null;
  
  // Determine change color/class based on value
  const changeColorClass = change === undefined ? '' : 
    change > 0 ? 'text-green-600 dark:text-green-400' : 
    change < 0 ? 'text-red-600 dark:text-red-400' : 
    'text-gray-600 dark:text-gray-400';

  return (
    <div 
      className={cn(kpiCardVariants({ variant }), className)} 
      {...props}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-foreground">{value} {unit}</p>
          {formattedChange && (
            <p className={`text-xs font-medium mt-1 ${changeColorClass}`}>
              {formattedChange} from previous period
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 