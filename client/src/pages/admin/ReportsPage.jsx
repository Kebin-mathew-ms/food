import React, { useState } from 'react';
import { useAdminReportsQuery } from '../../hooks/useAdmin.js';
import { Download, FileText, Calendar, Search } from 'lucide-react';

export default function ReportsPage() {
  const [type, setType] = useState('USERS');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: reportData, isLoading, refetch } = useAdminReportsQuery({ type, startDate, endDate });

  const list = reportData?.data || [];

  const convertToCSV = (arr) => {
    if (!arr || arr.length === 0) return '';
    const headers = Object.keys(arr[0]).join(',');
    const rows = arr.map((row) =>
      Object.values(row)
        .map((val) => {
          let str = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const handleExport = () => {
    if (list.length === 0) return;
    const csvContent = convertToCSV(list);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-foreground">
      {/* Title Header */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Administrative Reporting Suite
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Compile operational reports metrics and download spreadsheets for verification audits.
        </p>
      </div>

      {/* Date Ranges Filters Bar */}
      <div className="flex flex-wrap gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm items-center">
        {/* Report type select */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] text-muted-foreground font-bold uppercase">Report Criteria Segment</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-background border border-border text-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="USERS">Users Register Audit Logs</option>
            <option value="DONATIONS">Food Waste Donations Logs</option>
            <option value="NGOS">NGO verification approvals</option>
            <option value="VOLUNTEERS">Volunteers Availability logs</option>
            <option value="DELIVERIES">Deliveries Workflow transitions</option>
            <option value="COMPLAINTS">Support Tickets Logs</option>
            <option value="FOOD_WASTE">Delivered Weight Totals</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className="text-[10px] text-muted-foreground font-bold uppercase">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border border-border text-foreground rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full"
            />
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className="text-[10px] text-muted-foreground font-bold uppercase">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border border-border text-foreground rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full"
            />
          </div>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex gap-2 self-end mt-4 md:mt-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5" /> Compile Report
          </button>

          <button
            type="button"
            disabled={list.length === 0}
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Compiled Data Table View */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
        <h3 className="text-md font-bold mb-4 text-foreground">Report Preview: {type}</h3>

        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">Compiling report rows...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No records match criteria in selected date range.</div>
        ) : (
          <div className="w-full overflow-x-auto max-h-[350px]">
            <table className="w-full text-left text-xs text-foreground">
              <thead className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase border-b border-border text-foreground">
                <tr>
                  {Object.keys(list[0]).map((k) => (
                    <th key={k} className="px-3 py-2.5">{k.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    {Object.values(row).map((val, vIdx) => {
                      let displayVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
                      return (
                        <td key={vIdx} className="px-3 py-3 max-w-[200px] truncate text-muted-foreground" title={displayVal}>
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
