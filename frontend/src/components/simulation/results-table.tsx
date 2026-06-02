"use client";

import { SimulationResult } from "@/types/simulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Mail, Calendar, BarChart2 } from "lucide-react";
import { formatCurrency, formatNumber, downloadBlob } from "@/lib/utils";

interface ResultsTableProps {
  result: SimulationResult;
}

export function ResultsTable({ result }: ResultsTableProps) {
  const handleDownloadXlsx = () => {
    const bytes = Uint8Array.from(atob(result.xlsxBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, "supplier_promo_output.xlsx");
  };

  const handleDownloadEmail = () => {
    const blob = new Blob([result.emailText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, "supplier_email_proposal.txt");
  };

  const upliftRates = [...new Set(result.tierResults.map((r) => r.upliftRate))].sort();

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Simulation Results</h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {result.dateRangeUsed.from} – {result.dateRangeUsed.to}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <BarChart2 className="h-3 w-3" />
              {formatNumber(result.totalOrdersAnalyzed)} orders analyzed
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDownloadXlsx}>
            <Download className="h-4 w-4" />
            XLSX
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadEmail}>
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </div>

      {/* Tier comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tier Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Uplift</TableHead>
                <TableHead className="text-right">Forecasted orders</TableHead>
                <TableHead className="text-right">Delivery budget</TableHead>
                <TableHead className="text-right">Fixed cost</TableHead>
                <TableHead className="text-right font-bold">Total cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.tierResults
                .sort((a, b) => {
                  if (a.tierType !== b.tierType) return a.tierType.localeCompare(b.tierType);
                  return a.upliftRate - b.upliftRate;
                })
                .map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant={row.tierType === "basket_value" ? "default" : "secondary"}>
                        {row.tierType === "basket_value" ? "By Value" : "By Units"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{row.tier}</TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        +{(row.upliftRate * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(row.forecastedRedemptions)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatCurrency(row.deliveryBudget)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatCurrency(row.fixedOperationalCost)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-900">
                      {formatCurrency(row.finalActivityCost)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Brand summary */}
      {result.brandSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Brand / GMV Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Brand / Product Type</TableHead>
                  <TableHead className="text-right">Units sold</TableHead>
                  <TableHead className="text-right">GMV (NIS)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.brandSummary
                  .sort((a, b) => b.gmv - a.gmv)
                  .map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.brand}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.quantity)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(row.gmv)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
