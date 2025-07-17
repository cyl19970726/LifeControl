"use client"

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Block } from "@/lib/types/block"

interface TableBlockProps {
  block: Block
  mode?: 'preview' | 'readonly' | 'editable'
  onUpdate?: (block: Block) => void
}

export function TableBlock({ block, mode = 'readonly' }: TableBlockProps) {
  const content = block.content as { headers: string[]; rows: string[][] }
  
  if (mode === 'preview') {
    return (
      <div className="text-sm text-gray-600">
        表格: {content.rows.length} 行 × {content.headers.length} 列
      </div>
    )
  }
  
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {content.headers.map((header, idx) => (
              <TableHead key={idx}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {content.rows.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <TableCell key={cellIdx}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}