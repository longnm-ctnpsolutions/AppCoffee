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
        title: "Xuất dữ liệu thành công",
        description: `Dữ liệu đã được xuất thành công dưới dạng ${format.toUpperCase()}.`,
      })
      
      setOpen(false)
    } catch (err) {
      toast({
        title: "Xuất dữ liệu thất bại",
        description: error || "Đã xảy ra lỗi trong quá trình xuất dữ liệu.",
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
        <DialogTitle>Xuất dữ liệu</DialogTitle>
        <DialogDescription className="text-sm">
          Cấu hình cài đặt xuất và tải xuống dữ liệu của bạn.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label htmlFor="format" className="text-sm font-medium">Định dạng xuất</Label>
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
          <Label htmlFor="scope" className="text-sm font-medium">Phạm vi dữ liệu</Label>
          <Select value={scope} onValueChange={(value: ExportScope) => setScope(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                Tất cả dữ liệu ({totalRowsCount} hàng)
              </SelectItem>
              <SelectItem value="filtered">
                Dữ liệu đã lọc ({filteredRowsCount} hàng)
              </SelectItem>
              <SelectItem value="selected" disabled={selectedRowsCount === 0}>
                Hàng đã chọn ({selectedRowsCount} hàng)
              </SelectItem>
              <SelectItem value="visible">
                Dữ liệu hiển thị (trang hiện tại)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filename */}
        <div className="space-y-2">
          <Label htmlFor="filename" className="text-sm font-medium">Tên tệp (tùy chọn)</Label>
          <Input
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="Để trống để tự động tạo tên"
            className="w-full"
          />
        </div>

        {/* Column Selection - Improved for mobile */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Các cột để xuất</Label>
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
              Bao gồm tiêu đề
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
              In đậm tiêu đề
            </Label>
          </div>
        </div>

        {/* Format-specific options */}
        {format === 'excel' && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Tùy chọn Excel</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="sheetName" className="text-sm">Tên trang tính</Label>
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
                    Thêm dấu thời gian vào tên tệp
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
              <Label className="text-sm font-semibold">Tùy chọn PDF</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pdfTitle" className="text-sm">Tiêu đề tài liệu</Label>
                  <Input
                    id="pdfTitle"
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder="Tiêu đề tài liệu (tùy chọn)"
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="orientation" className="text-sm">Hướng trang</Label>
                  <Select 
                    value={pdfOrientation} 
                    onValueChange={(value: 'portrait' | 'landscape') => setPdfOrientation(value)}
                  >
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Dọc</SelectItem>
                      <SelectItem value="landscape">Ngang</SelectItem>
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
          Hủy
        </Button>
        <Button 
          onClick={handleExport} 
          disabled={isExporting || selectedColumns.length === 0}
          className="w-full sm:w-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xuất...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Xuất dữ liệu
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
