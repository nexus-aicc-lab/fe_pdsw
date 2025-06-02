import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return <table className={`table-custom ${className || ""}`}>{children}</table>;
}

export function TableRow({ children, className }: TableProps) {
  return <tr className={className}>{children}</tr>;
}

interface TableHeaderProps extends TableProps {
  colSpan?: number;
  rowSpan?: number;
}

export function TableHeader({
  children,
  className,
  colSpan,
  rowSpan,
}: TableHeaderProps) {
  return (
    <th
      className={`px-3 py-1 ${className || ""}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends TableProps {
  colSpan?: number;
  rowSpan?: number;
}

export function TableCell({
  children,
  className,
  colSpan,
  rowSpan,
}: TableCellProps) {
  return (
    <td
      className={`px-3 py-1 ${className || ""}`}
      colSpan={colSpan}
      rowSpan={rowSpan}
    >
      {children}
    </td>
  );
}