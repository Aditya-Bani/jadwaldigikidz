import { ScheduleEntry as ScheduleEntryType } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Power, Tent, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduleEntryProps {
  entry: ScheduleEntryType;
  onEdit: (entry: ScheduleEntryType) => void;
  onDelete: (id: string) => void;
}

function getLevelClass(level: string): string {
  if (level.startsWith('Little Creator')) return 'level-little-creator';
  if (level.startsWith('Junior')) return 'level-junior';
  if (level.startsWith('Teenager')) return 'level-teenager';
  if (level === 'Trial Class') return 'level-trial';
  return '';
}

export function ScheduleEntryCard({ entry, onEdit, onDelete }: ScheduleEntryProps) {
  const coachClass =
    entry.coach === 'Mr. Bani'
      ? 'coach-bani'
      : entry.coach === 'Mr. Argy'
        ? 'coach-argy'
        : entry.coach === 'Ms. Nay'
          ? 'coach-nay'
          : entry.coach === 'Ms. Nurul'
            ? 'coach-nurul'
            : 'coach-zaura';
  const levelClass = getLevelClass(entry.level);
  
  const isPending = entry.status === 'pending';
  const isInactive = entry.status === 'inactive' || (!entry.isActive && !isPending);
  
  const pendingClass = isPending 
    ? (entry.isHolidayCamp 
        ? 'border-dashed border-amber-400 dark:border-amber-500' 
        : entry.isTrial 
          ? 'border-dashed border-indigo-400 dark:border-indigo-500' 
          : 'opacity-55 grayscale-[30%] border-dashed border-amber-300 dark:border-amber-700 bg-amber-50/10 dark:bg-amber-950/10')
    : '';
  const inactiveClass = isInactive ? 'opacity-40 grayscale hover:opacity-80 transition-opacity' : '';
  const holidayCampClass = entry.isHolidayCamp ? 'bg-amber-50/90 border-amber-300/80 dark:border-amber-700/50 dark:bg-amber-900/30 shadow-sm' : '';
  const trialClass = entry.isTrial ? 'bg-indigo-50/90 border-indigo-300/80 dark:border-indigo-700/50 dark:bg-indigo-900/30 shadow-sm' : '';

  return (
    <div className={cn('schedule-entry group relative border shadow-sm p-3 rounded-xl transition-all duration-300', coachClass, holidayCampClass, trialClass, inactiveClass, pendingClass)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Status Badges */}
          {(isPending || isInactive) && (
            <div className="mb-2 flex flex-wrap">
              <div className={cn(
                "inline-flex items-center gap-1.5 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-xs uppercase tracking-wider",
                isPending 
                  ? (entry.isHolidayCamp ? "bg-amber-600 text-white" : entry.isTrial ? "bg-indigo-600 text-white" : "bg-amber-500 text-white") 
                  : "bg-slate-500 text-white"
              )}>
                <span className={cn(!entry.isHolidayCamp && !entry.isTrial && "opacity-80")}>{isPending ? "Pending" : "Nonaktif"}</span>
                {entry.inactiveReason && (
                  <>
                    <div className="w-px h-2 bg-white/30 shrink-0" />
                    <span className="truncate max-w-[140px]">{entry.inactiveReason}</span>
                  </>
                )}
              </div>
            </div>
          )}
          <p className={cn("font-bold text-foreground truncate text-sm tracking-tight", isInactive && "line-through opacity-70")}>
            {entry.studentName}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">{entry.coach}</p>
            {entry.isHolidayCamp && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100/80 dark:text-amber-300 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md tracking-wider border border-amber-300/60 dark:border-amber-700/60">
                <Tent className="w-2.5 h-2.5 text-amber-600" /> CAMP
              </span>
            )}
            {entry.isTrial && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-indigo-700 bg-indigo-100/80 dark:text-indigo-300 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md tracking-wider border border-indigo-300/60 dark:border-indigo-700/60">
                <Sparkles className="w-2.5 h-2.5 text-indigo-600" /> TRIAL
              </span>
            )}
          </div>
          <div className="mt-2 text-left">
            <span className={cn('level-badge text-[10px] py-0.5 px-2 font-bold uppercase tracking-tight inline-block break-words max-w-full leading-tight', levelClass)}>
              {entry.level}
            </span>
          </div>
          {entry.notes && (
            <p className="text-[10px] text-muted-foreground mt-2 italic line-clamp-2">
              <span className="opacity-60">Note:</span> {entry.notes}
            </p>
          )}

          {(entry.updatedBy || entry.updatedAt) && (
            <div className="mt-2 pt-2 border-t border-border/40 transition-opacity">
              <p className="text-[9px] font-semibold text-muted-foreground/70 flex items-center gap-1 leading-none">
                <Clock className="w-2.5 h-2.5 text-primary/60" />
                Diedit oleh {entry.updatedBy || 'System'}
                {entry.updatedAt && (
                  <span className="text-muted-foreground/50">
                    {' '}pada {new Date(entry.updatedAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 transform translate-x-0 sm:translate-x-2 sm:group-hover:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            title={entry.isActive ? "Nonaktifkan Murid" : "Aktifkan Murid"}
            className={cn("h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm border-none hover:text-white", entry.isActive ? "hover:bg-amber-500" : "hover:bg-emerald-500 text-slate-400")}
            onClick={(e) => {
              e.stopPropagation();
              onEdit({ ...entry, isActive: !entry.isActive });
            }}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm border-none hover:bg-primary hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entry);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur-sm shadow-sm border-none hover:bg-destructive hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

