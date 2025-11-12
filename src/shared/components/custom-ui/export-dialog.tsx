"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { 
  FileSpreadsheet, 
  FileText, 
  Download,
  Settings,
  Loader2
} from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Separator } from "@/shared/components/ui/separator"
import { useToast } from "@/shared/hooks/use-toast"
import { 
  useUniversalExport, 
  ExportFormat, 
  ExportScope, 
  ExportOptions 
} from "@/hooks/use-export"

type CheckedState = boolean | "indeterminate"

interface ExportDialogProps<T extends Record<string, any>> {
  table: Table<T>
  data?: T[]
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExportDialog<T extends Record<string, any>>({ 
  table, 
  data,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: ExportDialogProps<T>) {
  const { exportData, isExporting, error } = useUniversalExport(table, data)
  const { toast } = useToast()
  
  // Smart state: Controlled or uncontrolled
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen
  
  const [format, setFormat] = React.useState<ExportFormat>('excel')
  const [scope, setScope] = React.useState<ExportScope>('all')
  const [filename, setFilename] = React.useState('')
  const [includeHeaders, setIncludeHeaders] = React.useState(true)
  const [boldHeaders, setBoldHeaders] = React.useState(true)
  const [selectedColumns, setSelectedColumns] = React.useState<string[]>([])
  
  // PDF options
  const [pdfTitle, setPdfTitle] = React.useState('')
  const [pdfOrientation, setPdfOrientation] = React.useState<'portrait' | 'landscape'>('landscape')
  
  // Excel options  
  const [sheetName, setSheetName] = React.useState('Sheet1')
  const [addTimestamp, setAddTimestamp] = React.useState(true)

  // Get available columns
  const availableColumns = React.useMemo(() => {
    return table.getAllColumns()
      .filter(col => col.getCanHide() !== false)
      .map(col => ({
        id: col.id,
        label: typeof col.columnDef.header === 'string' 
          ? col.columnDef.header 
          : col.id
      }))
  }, [table])

  // Initialize selected columns
  React.useEffect(() => {
    if (selectedColumns.length === 0) {
      const visibleColumns = table.getAllColumns()
        .filter(col => col.getIsVisible() && col.getCanHide() !== false)
        .map(col => col.id)
      setSelectedColumns(visibleColumns)
    }
  }, [table, selectedColumns.length])

  // Handle column selection
  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    )
  }

  // Handle export
  const handleExport = async () => {
    try {
      const options: ExportOptions = {
        format,
        scope,
        filename: filename || undefined,
        includeHeaders,
        selectedColumns: selectedColumns.length > 0 ? selectedColumns : undefined,
        pdfOptions: format === 'pdf' ? {
          title: pdfTitle || undefined,
          orientation: pdfOrientation,
          pageSize: 'a4',
          headerStyle: {
            fontStyle: boldHeaders ? 'bold' : 'normal',
            lineWidth: 0.5
          }
        } : undefined,
        excelOptions: format === 'excel' ? {
          sheetName,
          addTimestamp,
          headerStyle: {
            font: { bold: boldHeaders },
            border: { bottom: { style: 'thin', color: { auto: 1 } } }
          }
        } : undefined
      }

      console.log('Export options:', options)
      await exportData(options)
      
      toast({
        title: "Export successful",
        description: `Data has been successfully exported as ${format.toUpperCase()}.`,
      })
      
      setOpen(false)
    } catch (err) {
      toast({
        title: "Export failed",
        description: error || "An error occurred during data export.",
        variant: "destructive",
      })
    }
  }

  // Get selected row count
  const selectedRowsCount = table.getSelectedRowModel().rows.length
  const totalRowsCount = table.getCoreRowModel().rows.length
  const filteredRowsCount = table.getFilteredRowModel().rows.length

  // Conditional rendering: With or without trigger
  const dialogContent = (
    <DialogContent className="w-[100vw] h-[100vh] max-w-none max-h-none rounded-none p-4 md:w-[95vw] md:max-w-lg md:max-h-[90vh] md:rounded-lg md:h-auto overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Export Data</DialogTitle>
        <DialogDescription className="text-sm">
          Configure export settings and download your data.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label htmlFor="format" className="text-sm font-medium">Export Format</Label>
          <Select value={format} onValueChange={(value: ExportFormat) => setFormat(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Excel (.xlsx)
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  CSV (.csv)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  PDF (.pdf)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  JSON (.json)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scope Selection */}
        <div className="space-y-2">
          <Label htmlFor="scope" className="text-sm font-medium">Data Scope</Label>
          <Select value={scope} onValueChange={(value: ExportScope) => setScope(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All data ({totalRowsCount} rows)
              </SelectItem>
              <SelectItem value="filtered">
                Filtered data ({filteredRowsCount} rows)
              </SelectItem>
              <SelectItem value="selected" disabled={selectedRowsCount === 0}>
                Selected rows ({selectedRowsCount} rows)
              </SelectItem>
              <SelectItem value="visible">
                Visible data (current page)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filename */}
        <div className="space-y-2">
          <Label htmlFor="filename" className="text-sm font-medium">Filename (optional)</Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Leave blank for auto-generated name"
            className="w-full"
          />
        </div>

        {/* Column Selection - Improved for mobile */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Columns to Export</Label>
          <div className="border rounded-lg p-3 max-h-28 overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {availableColumns.map((column) => (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`col-${column.id}`}
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => handleColumnToggle(column.id)}
                  />
                  <Label 
                    htmlFor={`col-${column.id}`} 
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* General Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeHeaders"
              checked={includeHeaders}
              onCheckedChange={(checked: CheckedState) => {
                if (checked !== 'indeterminate') {
                  setIncludeHeaders(checked)
                }
              }}
            />
            <Label htmlFor="includeHeaders" className="text-sm">
              Include headers
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="boldHeaders"
              checked={boldHeaders}
              onCheckedChange={(checked: CheckedState) => {
                if (checked !== 'indeterminate') {
                  setBoldHeaders(checked)
                }
              }}
            />
            <Label htmlFor="boldHeaders" className="text-sm">
              Bold headers
            </Label>
          </div>
        </div>

        {/* Format-specific options */}
        {format === 'excel' && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Excel Options</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="sheetName" className="text-sm">Sheet Name</Label>
                  <Input
                    id="sheetName"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="mt-1 w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timestamp"
                    checked={addTimestamp}
                    onCheckedChange={(checked: CheckedState) => {
                      if (checked !== 'indeterminate') {
                        setAddTimestamp(checked)
                      }
                    }}
                  />
                  <Label htmlFor="timestamp" className="text-sm">
                    Add timestamp to filename
                  </Label>
                </div>
              </div>
            </div>
          </>
        )}

        {format === 'pdf' && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-semibold">PDF Options</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pdfTitle" className="text-sm">Document Title</Label>
                  <Input
                    id="pdfTitle"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Document title (optional)"
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="orientation" className="text-sm">Page Orientation</Label>
                  <Select 
                    value={pdfOrientation} 
                    onValueChange={(value: 'portrait' | 'landscape') => setPdfOrientation(value)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
        <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button 
          onClick={handleExport} 
          disabled={isExporting || selectedColumns.length === 0}
          className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )

  // Render: With trigger (uncontrolled) or without trigger (controlled)
  if (trigger) {
    // Uncontrolled mode with trigger
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {dialogContent}
      </Dialog>
    )
  } else {
    // Controlled mode without trigger
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    )
  }
}
