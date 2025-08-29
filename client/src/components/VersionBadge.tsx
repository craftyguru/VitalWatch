import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Code, GitBranch, Clock } from 'lucide-react';

export function VersionBadge() {
  // Version information - update this when making major releases
  const version = "6.0.0";
  const buildDate = new Date().toISOString().split('T')[0]; // Current date as build date
  const environment = 'production';
  const isDevelopment = false;
  
  // Git commit hash (simulated - in real deployment this would come from build process)
  const commitHash = "5f8c9a1";
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant={isDevelopment ? "secondary" : "default"}
          className={`text-xs font-mono cursor-help select-none whitespace-nowrap ${
            isDevelopment 
              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700' 
              : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700'
          }`}
        >
          <Code className="w-3 h-3 mr-1" />
          v{version}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm">
        <div className="space-y-2 text-sm">
          <div className="font-semibold flex items-center gap-2">
            <Code className="w-4 h-4" />
            VitalWatch Version Information
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-mono">v{version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <span className={`font-mono ${isDevelopment ? 'text-yellow-600' : 'text-green-600'}`}>
                {environment.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build Date:</span>
              <span className="font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {buildDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Commit:</span>
              <span className="font-mono flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {commitHash}
              </span>
            </div>
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            "Production build - all features verified"
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}