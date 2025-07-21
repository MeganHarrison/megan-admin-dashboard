import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";

interface Milestone {
  id: number;
  title: string;
  date: string;
  notes: string;
  scale: string;
  year: string;
}

// Define the table data using the interface
const tableData: Milestone[] = [
  {
    id: 1,
    title: "January 2023",
    date: "January 1, 2023",
    notes: "First and second date",
    scale: "2",
    year: "2023",
  },
  {
    id: 2,
    title: "February 2023",
    date: "February 1, 2023",
    notes: "Plat Finance - Trust built on the mountain",
    scale: "4",
    year: "2023",
  },
  {
    id: 3,
    title: "March 2023",
    date: "March 1, 2023",
    notes: "...",
    scale: "5",
    year: "2023",
  },
  {
    id: 4,
    title: "April 2023",
    date: "April 1, 2023",
    notes: "...",
    scale: "6",
    year: "2023",
  },
  {
    id: 5,
    title: "May 2023",
    date: "May 1, 2023",
    notes: "...",
    scale: "7",
    year: "2023",
  },
];

export default function MilestoneTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Month
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Notes
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Connection
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Year
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tag
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {milestone.title}
                    </span>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                      {milestone.date}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {milestone.notes}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        parseInt(milestone.scale) >= 7
                          ? "success"
                          : parseInt(milestone.scale) >= 5
                            ? "warning"
                            : "error"
                      }
                      variant="light"
                    >
                      {milestone.scale}/10
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">
                    {milestone.year}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color="primary" variant="light">
                      Milestone
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
