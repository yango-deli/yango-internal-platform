"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

interface DashboardWidgetProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  // Edit mode
  editMode?: boolean;
  onRemove?: () => void;
  dragHandleProps?: any;
  className?: string;
  headerAction?: React.ReactNode;
}

export function DashboardWidget({
  title,
  description,
  isLoading,
  error,
  onRetry,
  isEmpty,
  emptyMessage,
  children,
  editMode,
  onRemove,
  dragHandleProps,
  className,
  headerAction,
}: DashboardWidgetProps) {
  const { t } = useTranslation("dashboard");

  return (
    <Card className={cn("flex h-full flex-col overflow-hidden border-gray-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          {editMode && (
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 -ml-1 rounded"
              title={t("editMode.dragHandle")}
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold text-gray-900 truncate">{title}</CardTitle>
            {description && (
              <p className="text-[10px] text-gray-500 truncate mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {headerAction}
          {editMode && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
              onClick={onRemove}
              title={t("editMode.remove")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-auto p-3 pt-1">
        {isLoading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-xs text-red-600 mb-3">{error}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-xs">
                <RefreshCw className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                {t("buttons.retry") || "Retry"}
              </Button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
            <p className="text-xs">{emptyMessage || t("empty.noData")}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
