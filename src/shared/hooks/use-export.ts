"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Export formats
export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json'

// Export scope
export type ExportScope = 'all' | 'selected' | 'visible' | 'filtered'

// Export options
export interface ExportOptions {
  format: ExportFormat
  scope: ExportScope
  filename?: string
  includeHeaders?: boolean
  selectedColumns?: string[]
  customHeaders?: Record<string, string>
  // PDF specific options
  pdfOptions?: {
    orientation?: 'portrait' | 'landscape'
    title?: string
    subtitle?: string
    pageSize?: 'a4' | 'a3' | 'letter'
    headerStyle?: {
      fontStyle?: string
      lineWidth?: number
    }
  }
  // Excel specific options
  excelOptions?: {
    sheetName?: string
    addTimestamp?: boolean
    headerStyle?: {
      font?: { bold?: boolean }
      border?: {
        top?: { style: string; color?: { auto?: number } }
        bottom?: { style: string; color?: { auto?: number } }
        left?: { style: string; color?: { auto?: number } }
        right?: { style: string; color?: { auto?: number } }
      }
    }
  }
}

// Hook interface
export interface UseUniversalExportReturn {
  exportData: (options: ExportOptions) => Promise<void>
  isExporting: boolean
  error: string | null
}

// Main hook
export function useUniversalExport<T extends Record<string, any>>(
  table: Table<T>,
  data?: T[] // Optional external data source
): UseUniversalExportReturn {
  const [isExporting, setIsExporting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Get data based on scope
  const getDataByScope = React.useCallback((scope: ExportScope): T[] => {
    switch (scope) {
      case 'all':
        return data || table.getCoreRowModel().rows.map(row => row.original)
      
      case 'selected':
        return table.getSelectedRowModel().rows.map(row => row.original)
      
      case 'visible':
        return table.getRowModel().rows.map(row => row.original)
      
      case 'filtered':
        return table.getFilteredRowModel().rows.map(row => row.original)
      
      default:
        return data || table.getCoreRowModel().rows.map(row => row.original)
    }
  }, [table, data])

  // Get columns based on selection
  const getColumns = React.useCallback((selectedColumns?: string[]) => {
    const allColumns = table.getAllColumns().filter(col => col.getCanHide() !== false)
    
    if (selectedColumns) {
      return allColumns.filter(col => selectedColumns.includes(col.id))
    }
    
    return allColumns.filter(col => col.getIsVisible())
  }, [table])

  // Format data for export
  const formatDataForExport = React.useCallback((
    exportData: T[], 
    columns: any[], 
    customHeaders?: Record<string, string>,
    format?: ExportFormat
  ) => {
    return exportData.map(row => {
      const formattedRow: Record<string, any> = {}
      
      columns.forEach(column => {
        let header = customHeaders?.[column.id] || 
                    (typeof column.columnDef.header === 'string' 
                      ? column.columnDef.header 
                      : column.id)
        
        // For CSV, uppercase headers for visual distinction
        if (format === 'csv') {
          header = header.toUpperCase()
        }
        
        let value = row[column.id]
        
        // Handle special formatting
        if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'object') {
          value = JSON.stringify(value)
        } else if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No'
        }
        
        formattedRow[header] = value
      })
      
      return formattedRow
    })
  }, [])

  // Export to Excel
  const exportToExcel = React.useCallback(async (
    exportData: any[], 
    filename: string,
    options?: ExportOptions['excelOptions']
  ) => {
    try {
      if (!exportData.length) {
        throw new Error('Không có dữ liệu để xuất Excel')
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      
      const sheetName = options?.sheetName || 'Data'
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      
      // Apply header formatting
      if (options?.headerStyle && exportData[0]) {
        const headers = Object.keys(exportData[0])
        console.log('Applying header styles:', options.headerStyle) // Debug log
        for (let col = 0; col < headers.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
          if (!worksheet[cellAddress]) {
            console.warn(`Cell ${cellAddress} not found in worksheet`) // Debug log
            continue
          }
          worksheet[cellAddress].s = {
            font: options.headerStyle.font || { bold: true },
            border: options.headerStyle.border || {
              bottom: { style: 'thin', color: { auto: 1 } }
            }
          }
        }
      } else {
        console.log('No headerStyle provided or empty data') // Debug log
      }
      
      // Add timestamp if requested
      if (options?.addTimestamp) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        filename = `${filename}_${timestamp}`
      }
      
      XLSX.writeFile(workbook, `${filename}.xlsx`)
    } catch (err) {
      console.error('Excel export error:', err) // Debug log
      throw new Error(`Xuất Excel thất bại: ${err}`)
    }
  }, [])

  // Export to CSV
  const exportToCSV = React.useCallback(async (
    exportData: any[], 
    filename: string
  ) => {
    try {
      // Add separator row after headers
      const headers = Object.keys(exportData[0] || {})
      const separatorRow = headers.map(() => '----')
      const dataWithSeparator = [exportData[0], separatorRow, ...exportData.slice(1)]
      
      const worksheet = XLSX.utils.json_to_sheet(dataWithSeparator)
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      throw new Error(`Xuất CSV thất bại: ${err}`)
    }
  }, [])

  // Export to PDF
  const exportToPDF = React.useCallback(async (
    exportData: any[], 
    filename: string,
    options?: ExportOptions['pdfOptions']
  ) => {
    try {
      const doc = new jsPDF({
        orientation: options?.orientation || 'landscape',
        unit: 'mm',
        format: options?.pageSize || 'a4'
      })

      // Add title
      if (options?.title) {
        doc.setFontSize(18)
        doc.text(options.title, 14, 20)
      }

      // Add subtitle
      if (options?.subtitle) {
        doc.setFontSize(12)
        doc.text(options.subtitle, 14, options?.title ? 30 : 20)
      }

      // Prepare table data
      const headers = Object.keys(exportData[0] || {})
      const rows = exportData.map(item => headers.map(header => item[header] || ''))

      // Add table
      doc.autoTable({
        head: [headers],
        body: rows,
        startY: options?.title || options?.subtitle ? 40 : 20,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: options?.headerStyle?.fontStyle || 'bold',
          lineWidth: options?.headerStyle?.lineWidth || 0.5
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      })

      // Add timestamp
      const timestamp = new Date().toLocaleDateString()
      doc.setFontSize(8)
      doc.text(`Tạo vào: ${timestamp}`, 14, doc.internal.pageSize.height - 10)

      doc.save(`${filename}.pdf`)
    } catch (err) {
      throw new Error(`Xuất PDF thất bại: ${err}`)
    }
  }, [])

  // Export to JSON
  const exportToJSON = React.useCallback(async (
    exportData: any[], 
    filename: string
  ) => {
    try {
      // Add metadata to headers
      const headers = Object.keys(exportData[0] || {})
      const dataWithMetadata = [
        { isHeader: true, values: headers },
        ...exportData
      ]
      
      const jsonData = JSON.stringify(dataWithMetadata, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      throw new Error(`Xuất JSON thất bại: ${err}`)
    }
  }, [])

  // Main export function
  const exportData = React.useCallback(async (options: ExportOptions) => {
    setIsExporting(true)
    setError(null)

    try {
      // Get data based on scope
      const rawData = getDataByScope(options.scope)
      
      if (!rawData.length) {
        throw new Error('Không có dữ liệu để xuất')
      }

      // Get columns
      const columns = getColumns(options.selectedColumns)
      
      if (!columns.length) {
        throw new Error('Không có cột nào được chọn để xuất')
      }

      // Format data
      const formattedData = formatDataForExport(rawData, columns, options.customHeaders, options.format)
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0]
      const defaultFilename = `export_${options.scope}_${timestamp}`
      const filename = options.filename || defaultFilename

      // Export based on format
      switch (options.format) {
        case 'excel':
          await exportToExcel(formattedData, filename, options.excelOptions)
          break
          
        case 'csv':
          await exportToCSV(formattedData, filename)
          break
          
        case 'pdf':
          await exportToPDF(formattedData, filename, options.pdfOptions)
          break
          
        case 'json':
          await exportToJSON(formattedData, filename)
          break
          
        default:
          throw new Error(`Định dạng xuất không hỗ trợ: ${options.format}`)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Xuất dữ liệu thất bại'
      setError(errorMessage)
      throw err
    } finally {
      setIsExporting(false)
    }
  }, [
    getDataByScope, 
    getColumns, 
    formatDataForExport, 
    exportToExcel, 
    exportToCSV, 
    exportToPDF, 
    exportToJSON
  ])

  return {
    exportData,
    isExporting,
    error
  }
}