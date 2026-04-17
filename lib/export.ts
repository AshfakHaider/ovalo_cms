import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

export interface ExportDataRow {
  month: number
  year: number
  customerName: string
  quantity: number
  billAmount: number
  paymentReceived: number
  closingDue: number
}

// Ensure month names are formatted nicely
const getMonthName = (m: number) => {
  const date = new Date()
  date.setMonth(m - 1)
  return date.toLocaleString('default', { month: 'long' })
}

export function exportToPDF(data: ExportDataRow[]) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Monthly Report', 14, 22)

  // Group data by month/year
  const grouped = data.reduce((acc, row) => {
    const key = `${getMonthName(row.month)} ${row.year}`
    if (!acc[key]) acc[key] = []
    acc[key].push(row)
    return acc
  }, {} as Record<string, ExportDataRow[]>)

  let startY = 30

  for (const [monthKey, rows] of Object.entries(grouped)) {
    doc.setFontSize(14)
    doc.text(`Month: ${monthKey}`, 14, startY)

    let totalQty = 0
    let totalCollected = 0

    const tableData = rows.map(r => {
      totalQty += r.quantity
      totalCollected += r.paymentReceived
      return [
        r.customerName,
        r.quantity.toFixed(2),
        `৳${r.billAmount.toFixed(2)}`,
        `৳${r.paymentReceived.toFixed(2)}`,
        `৳${r.closingDue.toFixed(2)}`,
      ]
    })

    // Summary row
    tableData.push([
      'Total / Summary',
      totalQty.toFixed(2),
      '-',
      `৳${totalCollected.toFixed(2)}`,
      '-'
    ])

    autoTable(doc, {
      startY: startY + 5,
      head: [['Customer', 'Quantity (L)', 'Bill Amount', 'Paid', 'Closing Due']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 229, 190], textColor: [13, 15, 26] },
      footStyles: { fillColor: [13, 15, 26] },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [200, 200, 200]
          data.cell.styles.textColor = [0, 0, 0]
        }
      }
    })

    startY = (doc as any).lastAutoTable.finalY + 15
  }

  doc.save('monthly_report.pdf')
}

export function exportToCSV(data: ExportDataRow[]) {
  // Add formatted month key for CSV
  const csvData = data.map(row => ({
    Period: `${getMonthName(row.month)} ${row.year}`,
    Customer: row.customerName,
    'Quantity (L)': row.quantity.toFixed(2),
    'Bill Amount': row.billAmount.toFixed(2),
    Paid: row.paymentReceived.toFixed(2),
    'Closing Due': row.closingDue.toFixed(2)
  }))

  const csv = Papa.unparse(csvData)
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'monthly_report.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
