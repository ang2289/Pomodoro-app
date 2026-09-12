import crypto from 'crypto'


type NotificationDeliveryStatus =
  | 'notification_pending'
  | 'notification_sent'
  | 'notification_failed'

type GroupBuyNotificationMessage = {
  eventType: string
  to: string
  subject: string
  html: string
  idempotencyKey: string
}

type NotificationDeliveryResult = {
  status: NotificationDeliveryStatus
  provider: string | null
  providerMessageId: string | null
  error: string | null
}

interface GroupBuyNotificationService {
  send(message: GroupBuyNotificationMessage): Promise<NotificationDeliveryResult>
}

class SiteNotificationService implements GroupBuyNotificationService {
  async send(): Promise<NotificationDeliveryResult> {
    return {
      status: 'notification_sent',
      provider: 'site',
      providerMessageId: null,
      error: null,
    }
  }
}

class ResendEmailNotificationService implements GroupBuyNotificationService {
  async send(message: GroupBuyNotificationMessage): Promise<NotificationDeliveryResult> {
    const apiKey = String(process.env.RESEND_API_KEY || '').trim()
    const from = String(
      process.env.GROUP_BUY_EMAIL_FROM ||
      process.env.RESEND_FROM_EMAIL ||
      '',
    ).trim()
    const replyTo = String(process.env.GROUP_BUY_EMAIL_REPLY_TO || '').trim()

    if (!apiKey || !from) {
      return {
        status: 'notification_pending',
        provider: 'resend',
        providerMessageId: null,
        error: 'RESEND_EMAIL_NOT_CONFIGURED',
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const payload: Record<string, unknown> = {
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
      }
      if (replyTo) payload.reply_to = replyTo

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'RXV-GroupBuy/1.0',
          'Idempotency-Key': message.idempotencyKey.slice(0, 256),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      const data = await response.json().catch(() => ({} as any))
      if (!response.ok) {
        return {
          status: 'notification_failed',
          provider: 'resend',
          providerMessageId: null,
          error: `RESEND_${response.status}:${String((data as any)?.message || (data as any)?.error || 'SEND_FAILED')}`,
        }
      }

      return {
        status: 'notification_sent',
        provider: 'resend',
        providerMessageId: String((data as any)?.id || '') || null,
        error: null,
      }
    } catch (error: any) {
      return {
        status: 'notification_failed',
        provider: 'resend',
        providerMessageId: null,
        error: error?.name === 'AbortError'
          ? 'RESEND_REQUEST_TIMEOUT'
          : String(error?.message || 'RESEND_SEND_FAILED'),
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}

// 一般狀態保留站內通知；付款確認及已出貨另外寄送 Email。
function getGroupBuyNotificationService(sendEmail = false): GroupBuyNotificationService {
  return sendEmail
    ? new ResendEmailNotificationService()
    : new SiteNotificationService()
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''

const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  ''

function json(res: any, status: number, payload: any) {
  return res.status(status).json(payload)
}

function text(value: any, max = 5000) {
  return String(value ?? '').trim().slice(0, max)
}

function htmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function publicSiteUrl() {
  return String(
    process.env.PUBLIC_SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://pomodoro-app-eight-rouge.vercel.app',
  ).replace(/\/$/, '')
}

function customerOrderUrl(orderCode: string) {
  return `${publicSiteUrl()}/group-buy/order/${encodeURIComponent(orderCode)}`
}

function formatNtd(value: unknown) {
  return `NT$${Number(value || 0).toLocaleString('zh-TW')}`
}

function emailActionButton(url: string, label: string) {
  const safeUrl = htmlEscape(url)
  return `<p style="margin:24px 0"><a href="${safeUrl}" style="display:inline-block;background:#0e7490;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700">${htmlEscape(label)}</a></p>`
}

function emailLayout(title: string, body: string) {
  return `<!doctype html>
<html lang="zh-Hant">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft JhengHei',sans-serif;color:#0f172a">
  <div style="max-width:620px;margin:0 auto;padding:28px 16px">
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px">
      <h1 style="font-size:22px;margin:0 0 18px">${htmlEscape(title)}</h1>
      ${body}
      <p style="margin:26px 0 0;color:#64748b;font-size:13px;line-height:1.7">此信由 RXV 團購網站自動寄送，訂單最新狀態請以網站「我的團購訂單」為準。</p>
    </div>
  </div>
</body>
</html>`
}


type XlsxCellValue = string | number | boolean | null | undefined

type XlsxSheet = {
  name: string
  rows: XlsxCellValue[][]
}

function xlsxXmlEscape(value: unknown) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function xlsxSafeSheetName(value: string, fallback: string) {
  const cleaned = String(value || fallback)
    .replace(/[\\/?*:[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 31)
  return cleaned || fallback
}

function xlsxColumnName(index: number) {
  let value = index + 1
  let result = ''
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

function xlsxDisplayWidth(value: unknown) {
  const source = String(value ?? '')
  let width = 0
  for (const char of source) width += /[^\x00-\xff]/.test(char) ? 2 : 1
  return width
}

function xlsxWorksheetXml(rows: XlsxCellValue[][]) {
  const rowCount = Math.max(1, rows.length)
  const columnCount = Math.max(1, ...rows.map((row) => row.length))
  const widths = Array.from({ length: columnCount }, (_, columnIndex) => {
    const maxWidth = Math.max(
      8,
      ...rows.map((row) => xlsxDisplayWidth(row[columnIndex])).filter(Number.isFinite),
    )
    return Math.min(42, maxWidth + 2)
  })

  const columnXml = widths
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join('')

  const rowXml = rows.map((row, rowIndex) => {
    const cellXml = row.map((value, columnIndex) => {
      const cellRef = `${xlsxColumnName(columnIndex)}${rowIndex + 1}`
      const styleId = rowIndex === 0 ? 1 : typeof value === 'number' ? 2 : 0

      if (typeof value === 'number' && Number.isFinite(value)) {
        return `<c r="${cellRef}" s="${styleId}" t="n"><v>${value}</v></c>`
      }

      if (typeof value === 'boolean') {
        return `<c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t>${value ? '是' : '否'}</t></is></c>`
      }

      const stringValue = String(value ?? '')
      const preserve = /^\s|\s$|\n/.test(stringValue) ? ' xml:space="preserve"' : ''
      return `<c r="${cellRef}" s="${styleId}" t="inlineStr"><is><t${preserve}>${xlsxXmlEscape(stringValue)}</t></is></c>`
    }).join('')

    return `<row r="${rowIndex + 1}">${cellXml}</row>`
  }).join('')

  const lastCell = `${xlsxColumnName(columnCount - 1)}${rowCount}`

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastCell}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A2" sqref="A2"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${columnXml}</cols>
  <sheetData>${rowXml}</sheetData>
  <autoFilter ref="A1:${lastCell}"/>
</worksheet>`
}

function xlsxStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Microsoft JhengHei"/><family val="2"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Microsoft JhengHei"/><family val="2"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD1D5DB"/></left>
      <right style="thin"><color rgb="FFD1D5DB"/></right>
      <top style="thin"><color rgb="FFD1D5DB"/></top>
      <bottom style="thin"><color rgb="FFD1D5DB"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1">
      <alignment vertical="center"/>
    </xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
}

function xlsxCrc32(buffer: Buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function xlsxDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear())
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { dosTime, dosDate }
}

function xlsxStoredZip(entries: Array<{ name: string; data: Buffer }>) {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0
  const { dosTime, dosDate } = xlsxDosDateTime()

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8')
    const dataBuffer = entry.data
    const crc = xlsxCrc32(dataBuffer)
    const flags = 0x0800

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(flags, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(dataBuffer.length, 18)
    localHeader.writeUInt32LE(dataBuffer.length, 22)
    localHeader.writeUInt16LE(nameBuffer.length, 26)
    localHeader.writeUInt16LE(0, 28)

    localParts.push(localHeader, nameBuffer, dataBuffer)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(flags, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime, 12)
    centralHeader.writeUInt16LE(dosDate, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(dataBuffer.length, 20)
    centralHeader.writeUInt32LE(dataBuffer.length, 24)
    centralHeader.writeUInt16LE(nameBuffer.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)

    centralParts.push(centralHeader, nameBuffer)
    offset += localHeader.length + nameBuffer.length + dataBuffer.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(offset, 16)
  end.writeUInt16LE(0, 20)

  return Buffer.concat([...localParts, centralDirectory, end])
}

function buildXlsxWorkbook(inputSheets: XlsxSheet[]) {
  const usedNames = new Set<string>()
  const sheets = inputSheets.map((sheet, index) => {
    let name = xlsxSafeSheetName(sheet.name, `工作表${index + 1}`)
    let suffix = 2
    while (usedNames.has(name)) {
      const base = name.slice(0, Math.max(1, 31 - String(suffix).length - 1))
      name = `${base}_${suffix}`
      suffix += 1
    }
    usedNames.add(name)
    return { ...sheet, name }
  })

  const workbookSheetXml = sheets
    .map((sheet, index) => `<sheet name="${xlsxXmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join('')

  const workbookRelationshipXml = sheets
    .map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`)
    .join('')

  const sheetContentTypes = sheets
    .map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`)
    .join('')

  const entries: Array<{ name: string; data: Buffer }> = [
    {
      name: '[Content_Types].xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetContentTypes}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`, 'utf8'),
    },
    {
      name: '_rels/.rels',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`, 'utf8'),
    },
    {
      name: 'xl/workbook.xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets>${workbookSheetXml}</sheets>
  <calcPr calcId="191029" fullCalcOnLoad="1"/>
</workbook>`, 'utf8'),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${workbookRelationshipXml}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`, 'utf8'),
    },
    { name: 'xl/styles.xml', data: Buffer.from(xlsxStylesXml(), 'utf8') },
    {
      name: 'docProps/core.xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>RXV 團購管理工具</dc:creator>
  <cp:lastModifiedBy>RXV 團購管理工具</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`, 'utf8'),
    },
    {
      name: 'docProps/app.xml',
      data: Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>RXV 團購管理工具</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>工作表</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>${sheets.length}</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${sheets.length}" baseType="lpstr">${sheets.map((sheet) => `<vt:lpstr>${xlsxXmlEscape(sheet.name)}</vt:lpstr>`).join('')}</vt:vector>
  </TitlesOfParts>
</Properties>`, 'utf8'),
    },
  ]

  sheets.forEach((sheet, index) => {
    entries.push({
      name: `xl/worksheets/sheet${index + 1}.xml`,
      data: Buffer.from(xlsxWorksheetXml(sheet.rows), 'utf8'),
    })
  })

  return xlsxStoredZip(entries)
}

function groupBuyOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    waiting_group: '等待成團',
    threshold_reached: '已達登記門檻',
    payment_open: '待付款',
    payment_reported: '付款核對中',
    payment_verified: '已確認付款',
    confirmed: '正式成團',
    supplier_ordered: '已向供應商訂貨',
    preparing: '備貨中',
    shipped: '已出貨',
    ready_for_pickup: '可取貨',
    completed: '已完成',
    cancelled: '已取消',
    refund_pending: '退款處理中',
    refunded: '已退款',
  }
  return labels[status] || status || '—'
}

function groupBuyPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    not_open: '尚未開放付款',
    pending: '待付款',
    reported: '核對中',
    verified: '已確認付款',
    rejected: '需重新回報',
    payment_overdue: '已逾期',
    refunded: '已退款',
  }
  return labels[status] || status || '—'
}

function groupBuyPaymentReportStatusLabel(status: string) {
  const labels: Record<string, string> = {
    reported: '待核對',
    verified: '已確認',
    rejected: '已退回',
  }
  return labels[status] || status || '—'
}

function formatTaipeiDate(value: any) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

function safeDownloadFileName(value: string) {
  return String(value || '團購')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function resolvedBank(campaign: any, workspace: any) {
  return {
    name: text(campaign?.bank_name || workspace?.default_bank_name || process.env.RXV_BANK_NAME, 100),
    code: text(campaign?.bank_code || workspace?.default_bank_code || process.env.RXV_BANK_CODE, 20),
    branch: text(campaign?.bank_branch || workspace?.default_bank_branch || process.env.RXV_BANK_BRANCH, 100) || null,
    account: text(campaign?.bank_account || workspace?.default_bank_account || process.env.RXV_BANK_ACCOUNT, 50),
    accountName: text(campaign?.bank_account_name || workspace?.default_bank_account_name || process.env.RXV_BANK_ACCOUNT_NAME, 100),
  }
}

function bodyOf(req: any) {
  if (!req?.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

async function db(path: string, init: RequestInit = {}) {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('SUPABASE_ENV_MISSING')
  return fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path.replace(/^\//, '')}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  })
}

async function rows(response: Response, errorName: string) {
  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(`${errorName}:${response.status}:${message}`)
  }
  const data = await response.json().catch(() => [])
  return Array.isArray(data) ? data : data ? [data] : []
}

function getBearer(req: any) {
  const value = String(req?.headers?.authorization || req?.headers?.Authorization || '')
  return value.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || ''
}

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GROUP_BUY_ADMIN_EMAILS = new Set(['ang2289@gmail.com', 'ang2289@yahoo.com.tw'])

async function createNotification(input: {
  campaignId?: string | null
  orderId?: string | null
  eventType: string
  recipientEmail: string
  subject: string
  html: string
  dedupeKey: string
  sendEmail?: boolean
}) {
  const delivery = await getGroupBuyNotificationService(input.sendEmail === true).send({
    eventType: input.eventType,
    to: input.recipientEmail,
    subject: input.subject,
    html: input.html,
    idempotencyKey: input.dedupeKey,
  })
  const response = await db('group_buy_notifications', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: input.campaignId || null,
      order_id: input.orderId || null,
      event_type: input.eventType,
      recipient_email: input.recipientEmail,
      status: delivery.status,
      provider: delivery.provider,
      provider_message_id: delivery.providerMessageId,
      attempt_count: delivery.status === 'notification_pending' ? 0 : 1,
      last_error: delivery.error,
      dedupe_key: input.dedupeKey,
      sent_at: delivery.status === 'notification_sent' ? new Date().toISOString() : null,
      failed_at: delivery.status === 'notification_failed' ? new Date().toISOString() : null,
    }),
  })
  if (!response.ok && response.status !== 409) {
    throw new Error(`NOTIFICATION_INSERT_FAILED:${await response.text()}`)
  }
  return delivery
}

async function currentUser(req: any) {
  const token = getBearer(req)
  if (!token) return null
  const tokenHash = sha256(token)
  const now = encodeURIComponent(new Date().toISOString())
  const sessionRows = await rows(
    await db(`user_sessions?select=user_id,expires_at&token_hash=eq.${tokenHash}&revoked_at=is.null&expires_at=gt.${now}&limit=1`, { method: 'GET' }),
    'SESSION_READ_FAILED',
  )
  const userId = sessionRows[0]?.user_id ? String(sessionRows[0].user_id) : ''
  if (!userId) return null
  const userRows = await rows(
    await db(`users?select=id,email&id=eq.${encodeURIComponent(userId)}&limit=1`, { method: 'GET' }),
    'USER_READ_FAILED',
  )
  const email = text(userRows[0]?.email, 200).toLowerCase()
  return email ? { userId, email } : null
}

async function myProfile(req: any, res: any) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員。' })
  return json(res, 200, { userId: user.userId, email: user.email })
}

function configuredAdminEmails() {
  return GROUP_BUY_ADMIN_EMAILS
}

async function requireUser(req: any, res: any) {
  const user = await currentUser(req)
  if (!user) {
    json(res, 401, { error: '登入已失效，請重新登入。' })
    return null
  }
  const admins = configuredAdminEmails()
  if (!admins.has(user.email)) {
    json(res, 403, { error: '目前團購工具僅開放管理者使用。' })
    return null
  }
  return user
}

async function ownerWorkspace(userId: string) {
  const result = await rows(
    await db(`group_buy_workspaces?select=*&owner_user_id=eq.${encodeURIComponent(userId)}&limit=1`, { method: 'GET' }),
    'WORKSPACE_READ_FAILED',
  )
  return result[0] || null
}

async function requireWorkspace(req: any, res: any) {
  const user = await requireUser(req, res)
  if (!user) return null
  const workspace = await ownerWorkspace(user.userId)
  if (!workspace) {
    json(res, 409, { error: '尚未建立團購工作空間，請先初始化。' })
    return null
  }
  return { user, workspace }
}

function camelCampaign(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    noticeText: row.notice_text,
    status: row.status,
    registrationStartsAt: row.registration_starts_at,
    registrationEndsAt: row.registration_ends_at,
    originalRegistrationEndsAt: row.original_registration_ends_at,
    registrationExtensionCount: Number(row.registration_extension_count || 0),
    lastRegistrationExtensionReason: row.last_registration_extension_reason,
    lastRegistrationExtendedAt: row.last_registration_extended_at,
    registrationClosedAt: row.registration_closed_at,
    paymentOpenedAt: row.payment_opened_at,
    paymentDeadline: row.payment_deadline,
    estimatedArrivalText: row.estimated_arrival_text,
    estimatedShipMinBusinessDays: Number(row.estimated_ship_min_business_days || 7),
    estimatedShipMaxBusinessDays: Number(row.estimated_ship_max_business_days || 14),
    estimatedEarliestShipAt: row.estimated_earliest_ship_at,
    estimatedLatestShipAt: row.estimated_latest_ship_at,
    supplierOrderedAt: row.supplier_ordered_at,
    supplierExpectedShipAt: row.supplier_expected_ship_at,
    shippingNotice: row.shipping_notice,
    shippingDelayReason: row.shipping_delay_reason,
    shippingNoticeUpdatedAt: row.shipping_notice_updated_at,
    organizerDisclaimer: row.organizer_disclaimer,
    thresholdMode: row.threshold_mode,
    minRegistrationValue: Number(row.min_registration_value || 0),
    minPaidValue: Number(row.min_paid_value || 0),
    allowMixedProducts: row.allow_mixed_products !== false,
    showProgress: Boolean(row.show_progress),
    addressCollectionStage: row.address_collection_stage,
    paymentOpenMode: row.payment_open_mode || 'manual',
    pickupDateSelectionOpen: Boolean(row.pickup_date_selection_open),
    pickupDateSelectionNotice: row.pickup_date_selection_notice || '',
    bankName: row.bank_name || '',
    bankCode: row.bank_code || '',
    bankBranch: row.bank_branch || '',
    bankAccount: row.bank_account || '',
    bankAccountName: row.bank_account_name || '',
  }
}

function camelProduct(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    unitLabel: row.unit_label,
    salePriceNtd: Number(row.sale_price_ntd || 0),
    costPriceNtd: row.cost_price_ntd == null ? null : Number(row.cost_price_ntd),
    minQuantityPerOrder: Number(row.min_quantity_per_order || 0),
    maxQuantityPerOrder: row.max_quantity_per_order == null ? null : Number(row.max_quantity_per_order),
    stockLimit: row.stock_limit == null ? null : Number(row.stock_limit),
    thresholdWeight: Number(row.threshold_weight || 1),
    isActive: Boolean(row.is_active),
  }
}

function camelShipping(row: any) {
  return {
    id: row.id,
    methodType: row.method_type,
    label: row.label,
    isActive: Boolean(row.is_active),
    feeMode: row.fee_mode,
    baseFeeNtd: Number(row.base_fee_ntd || 0),
    freeThresholdQuantity: row.free_threshold_quantity == null ? null : Number(row.free_threshold_quantity),
    freeThresholdAmountNtd: row.free_threshold_amount_ntd == null ? null : Number(row.free_threshold_amount_ntd),
    pickupName: row.pickup_name,
    pickupAddress: row.pickup_address,
    pickupPhone: row.pickup_phone,
    pickupMapUrl: row.pickup_map_url,
    pickupTimeText: row.pickup_time_text,
    pickupNotice: row.pickup_notice,
  }
}


function camelPickupStore(row: any) {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    storeCode: row.store_code,
    city: row.city,
    district: row.district,
    name: row.store_name,
    address: row.address,
    phone: row.phone,
    businessHours: row.business_hours,
    sourceUrl: row.source_url,
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order || 0),
  }
}

function camelPickupSlot(row: any) {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    pickupStoreId: row.pickup_store_id,
    pickupDate: row.pickup_date,
    startTime: row.start_time,
    endTime: row.end_time,
    notice: row.notice,
    capacity: row.capacity == null ? null : Number(row.capacity),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order || 0),
  }
}

async function campaignProgress(campaign: any) {
  const orderRows = await rows(
    await db(`group_buy_orders?select=id,threshold_value,total_amount_ntd,status,payment_status&campaign_id=eq.${encodeURIComponent(campaign.id)}&status=neq.cancelled`, { method: 'GET' }),
    'ORDER_PROGRESS_READ_FAILED',
  )
  const active = orderRows.filter((row) => !['cancelled', 'refunded'].includes(row.status))
  const paidOrderIds = new Set(active.filter((row) => row.payment_status === 'verified').map((row) => String(row.id)))

  let registrationValue = 0
  let paidValue = 0

  if (campaign.allow_mixed_products !== false) {
    registrationValue =
      campaign.threshold_mode === 'order_count'
        ? active.length
        : campaign.threshold_mode === 'amount'
          ? active.reduce((sum, row) => sum + Number(row.total_amount_ntd || 0), 0)
          : active.reduce((sum, row) => sum + Number(row.threshold_value || 0), 0)
    const paidRows = active.filter((row) => row.payment_status === 'verified')
    paidValue =
      campaign.threshold_mode === 'order_count'
        ? paidRows.length
        : campaign.threshold_mode === 'amount'
          ? paidRows.reduce((sum, row) => sum + Number(row.total_amount_ntd || 0), 0)
          : paidRows.reduce((sum, row) => sum + Number(row.threshold_value || 0), 0)
  } else if (active.length) {
    const orderIds = active.map((row) => String(row.id))
    const itemRows = await rows(
      await db(`group_buy_order_items?select=order_id,product_id,product_title,line_total_ntd,threshold_value&order_id=in.(${orderIds.join(',')})`, { method: 'GET' }),
      'ORDER_ITEM_PROGRESS_READ_FAILED',
    )
    const registrationGroups = new Map<string, number>()
    const paidGroups = new Map<string, number>()
    const registrationOrderSets = new Map<string, Set<string>>()
    const paidOrderSets = new Map<string, Set<string>>()

    for (const item of itemRows) {
      const productKey = String(item.product_id || item.product_title || 'unknown')
      const orderId = String(item.order_id)
      const value = campaign.threshold_mode === 'amount'
        ? Number(item.line_total_ntd || 0)
        : Number(item.threshold_value || 0)

      if (campaign.threshold_mode === 'order_count') {
        const set = registrationOrderSets.get(productKey) || new Set<string>()
        set.add(orderId)
        registrationOrderSets.set(productKey, set)
        if (paidOrderIds.has(orderId)) {
          const paidSet = paidOrderSets.get(productKey) || new Set<string>()
          paidSet.add(orderId)
          paidOrderSets.set(productKey, paidSet)
        }
      } else {
        registrationGroups.set(productKey, Number(registrationGroups.get(productKey) || 0) + value)
        if (paidOrderIds.has(orderId)) {
          paidGroups.set(productKey, Number(paidGroups.get(productKey) || 0) + value)
        }
      }
    }

    if (campaign.threshold_mode === 'order_count') {
      registrationValue = Math.max(0, ...Array.from(registrationOrderSets.values()).map((set) => set.size))
      paidValue = Math.max(0, ...Array.from(paidOrderSets.values()).map((set) => set.size))
    } else {
      registrationValue = Math.max(0, ...Array.from(registrationGroups.values()))
      paidValue = Math.max(0, ...Array.from(paidGroups.values()))
    }
  }

  return {
    registrationValue,
    paidValue,
    activeOrderCount: active.length,
    verifiedOrderCount: paidOrderIds.size,
    allActiveOrdersPaid: active.length > 0 && paidOrderIds.size === active.length,
    registrationPercent: Math.round((registrationValue / Number(campaign.min_registration_value || 1)) * 100),
    paidPercent: Math.round((paidValue / Number(campaign.min_paid_value || 1)) * 100),
  }
}

async function readCampaignBySlug(slug: string) {
  const result = await rows(
    await db(`group_buy_campaigns?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  return result[0] || null
}

async function publicCampaign(res: any, slug: string) {
  const campaign = await readCampaignBySlug(slug)
  if (!campaign || campaign.status === 'draft') return json(res, 404, { error: '找不到此團購活動。' })

  const productRows = await rows(
    await db(`group_buy_products?select=*&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true&order=sort_order.asc,created_at.asc`, { method: 'GET' }),
    'PRODUCT_READ_FAILED',
  )
  const [shippingRows, pickupStoreRows] = await Promise.all([
    rows(
      await db(`group_buy_shipping_methods?select=*&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true&order=sort_order.asc,created_at.asc`, { method: 'GET' }),
      'SHIPPING_READ_FAILED',
    ),
    rows(
      await db(`group_buy_pickup_stores?select=*&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true&order=city.asc,sort_order.asc,store_name.asc`, { method: 'GET' }),
      'PICKUP_STORE_READ_FAILED',
    ),
  ])

  return json(res, 200, {
    campaign: {
      ...camelCampaign(campaign),
      progress: await campaignProgress(campaign),
      products: productRows.map(camelProduct),
      shippingMethods: shippingRows.map(camelShipping),
      pickupStores: pickupStoreRows.map(camelPickupStore),
    },
  })
}

function calculateShipping(method: any, totalQuantity: number, subtotal: number) {
  if (method.method_type === 'store_pickup') return Number(method.base_fee_ntd || 0)
  if (method.fee_mode === 'quantity_free_threshold' && method.free_threshold_quantity) {
    return totalQuantity >= Number(method.free_threshold_quantity) ? 0 : Number(method.base_fee_ntd || 0)
  }
  if (method.fee_mode === 'amount_free_threshold' && method.free_threshold_amount_ntd) {
    return subtotal >= Number(method.free_threshold_amount_ntd) ? 0 : Number(method.base_fee_ntd || 0)
  }
  return Number(method.base_fee_ntd || 0)
}

async function registerOrder(req: any, res: any, body: any) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員後再送出團購登記。' })

  const campaign = await readCampaignBySlug(text(body.campaignSlug, 100))
  if (!campaign || campaign.status !== 'registration_open') return json(res, 409, { error: '此團目前未開放登記。' })

  const now = Date.now()
  if (campaign.registration_starts_at && new Date(campaign.registration_starts_at).getTime() > now) {
    return json(res, 409, { error: '團購尚未開始。' })
  }
  if (campaign.registration_ends_at && new Date(campaign.registration_ends_at).getTime() < now) {
    return json(res, 409, { error: '團購登記已截止。' })
  }

  const customerName = text(body.customerName, 80)
  const customerPhone = text(body.customerPhone, 30).replace(/\D/g, '')
  if (!customerName || !/^09\d{8}$/.test(customerPhone)) return json(res, 400, { error: '姓名或手機格式不正確。' })
  const customerEmail = user.email
  if (body.rulesAccepted !== true) return json(res, 400, { error: '請先同意團購規則。' })

  const productRows = await rows(
    await db(`group_buy_products?select=*&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true`, { method: 'GET' }),
    'PRODUCT_READ_FAILED',
  )
  const productMap = new Map(productRows.map((row) => [String(row.id), row]))
  const requestedItems = Array.isArray(body.items) ? body.items : []
  const items: any[] = []
  let subtotal = 0
  let totalQuantity = 0
  let thresholdValue = 0

  for (const requested of requestedItems) {
    const product = productMap.get(String(requested?.productId || ''))
    const quantity = Math.floor(Number(requested?.quantity || 0))
    if (!product || quantity <= 0) continue
    if (Number(product.min_quantity_per_order || 0) > 0 && quantity < Number(product.min_quantity_per_order)) {
      return json(res, 400, { error: `${product.title} 每筆至少需訂購 ${product.min_quantity_per_order}${product.unit_label}。` })
    }
    if (product.max_quantity_per_order && quantity > Number(product.max_quantity_per_order)) {
      return json(res, 400, { error: `${product.title} 超過每筆訂單可購買上限。` })
    }
    const lineTotal = Number(product.sale_price_ntd || 0) * quantity
    const unitCost = product.cost_price_ntd == null ? null : Number(product.cost_price_ntd)
    const lineCost = unitCost == null ? null : unitCost * quantity
    const lineThreshold = product.counts_toward_threshold ? Number(product.threshold_weight || 1) * quantity : 0
    subtotal += lineTotal
    totalQuantity += quantity
    thresholdValue += lineThreshold
    items.push({
      product_id: product.id,
      product_title: product.title,
      unit_label: product.unit_label,
      unit_price_ntd: Number(product.sale_price_ntd || 0),
      unit_cost_ntd: unitCost,
      quantity,
      line_total_ntd: lineTotal,
      line_cost_ntd: lineCost,
      threshold_weight: Number(product.threshold_weight || 1),
      threshold_value: lineThreshold,
    })
  }

  if (!items.length) return json(res, 400, { error: '請至少選擇一項商品。' })

  const shippingRows = await rows(
    await db(`group_buy_shipping_methods?select=*&id=eq.${encodeURIComponent(text(body.shippingMethodId, 80))}&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true&limit=1`, { method: 'GET' }),
    'SHIPPING_READ_FAILED',
  )
  const shipping = shippingRows[0]
  if (!shipping) return json(res, 400, { error: '配送方式不存在或未開放。' })

  let pickupStore: any = null
  if (shipping.method_type === 'store_pickup') {
    const pickupStoreId = text(body.pickupStoreId, 80)
    if (!pickupStoreId) return json(res, 400, { error: '請選擇門市自取地點。' })
    const pickupStoreRows = await rows(
      await db(
        `group_buy_pickup_stores?select=*&id=eq.${encodeURIComponent(pickupStoreId)}&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true&limit=1`,
        { method: 'GET' },
      ),
      'PICKUP_STORE_READ_FAILED',
    )
    pickupStore = pickupStoreRows[0]
    if (!pickupStore) return json(res, 400, { error: '此門市目前未開放本團取貨，請重新選擇。' })
  }

  const recipientName = text(body.recipientName, 80)
  const recipientPhone = text(body.recipientPhone, 30)
  const shippingAddress = text(body.shippingAddress, 300)
  if (
    campaign.address_collection_stage === 'registration' &&
    shipping.method_type === 'home_delivery' &&
    (!recipientName || !recipientPhone || !shippingAddress)
  ) {
    return json(res, 400, { error: '宅配訂單請先填寫完整收件資料。' })
  }

  const fee = calculateShipping(shipping, totalQuantity, subtotal)
  const accessToken = crypto.randomBytes(32).toString('hex')
  const orderInsert = await rows(
    await db('group_buy_orders', {
      method: 'POST',
      body: JSON.stringify({
        campaign_id: campaign.id,
        shipping_method_id: shipping.id,
        access_token_hash: sha256(accessToken),
        user_id: user.userId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        recipient_name: recipientName || null,
        recipient_phone: recipientPhone || null,
        postal_code: text(body.postalCode, 10) || null,
        shipping_address: shippingAddress || null,
        pickup_store_id: pickupStore?.id || null,
        pickup_store_name: pickupStore?.store_name || null,
        pickup_store_city: pickupStore?.city || null,
        pickup_store_address: pickupStore?.address || null,
        pickup_store_phone: pickupStore?.phone || null,
        item_subtotal_ntd: subtotal,
        shipping_fee_ntd: fee,
        total_amount_ntd: subtotal + fee,
        total_quantity: totalQuantity,
        threshold_value: campaign.threshold_mode === 'amount' ? subtotal : campaign.threshold_mode === 'order_count' ? 1 : thresholdValue,
        status: 'waiting_group',
        payment_status: 'not_open',
        customer_note: text(body.customerNote, 1000) || null,
        rules_accepted_at: new Date().toISOString(),
        rules_version: 'group-buy-v1',
      }),
    }),
    'ORDER_INSERT_FAILED',
  )
  const order = orderInsert[0]
  if (!order?.id) throw new Error('ORDER_INSERT_EMPTY')

  const itemResponse = await db('group_buy_order_items', {
    method: 'POST',
    body: JSON.stringify(items.map((item) => ({ ...item, order_id: order.id }))),
  })
  if (!itemResponse.ok) throw new Error(`ORDER_ITEMS_INSERT_FAILED:${await itemResponse.text()}`)

  await db('group_buy_order_events', {
    method: 'POST',
    body: JSON.stringify({
      order_id: order.id,
      actor_role: 'customer',
      event_type: 'registered',
      to_status: 'waiting_group',
      message: pickupStore
        ? `客戶完成團購數量登記，選擇門市自取：${pickupStore.store_name}。`
        : '客戶完成團購數量登記。',
      metadata: pickupStore ? {
        pickupStoreId: pickupStore.id,
        pickupStoreName: pickupStore.store_name,
        pickupStoreAddress: pickupStore.address,
      } : {},
    }),
  })

  const notification = await createNotification({
    campaignId: campaign.id,
    orderId: order.id,
    eventType: 'registration_confirmed',
    recipientEmail: customerEmail,
    subject: `團購登記完成：${order.order_code}`,
    html: `<p>您的團購登記已完成，訂單編號：${order.order_code}。目前不需匯款。</p>`,
    dedupeKey: `registration_confirmed:${order.id}`,
  })

  const progress = await campaignProgress(campaign)
  const thresholdReached = progress.registrationValue >= Number(campaign.min_registration_value || 0)
  if (thresholdReached && campaign.payment_open_mode !== 'automatic') {
    await db(`group_buy_orders?campaign_id=eq.${encodeURIComponent(campaign.id)}&status=eq.waiting_group`, {
      method: 'PATCH', body: JSON.stringify({ status: 'threshold_reached' }),
    })
  }
  const registrationBank = resolvedBank(campaign, null)
  const bankComplete = registrationBank.name && registrationBank.code && registrationBank.account && registrationBank.accountName
  if (
    campaign.payment_open_mode === 'automatic' &&
    thresholdReached && bankComplete &&
    campaign.payment_deadline && new Date(campaign.payment_deadline).getTime() > Date.now()
  ) {
    await db(`group_buy_campaigns?id=eq.${encodeURIComponent(campaign.id)}&status=eq.registration_open`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'payment_open' }),
    })
    const autoOrders = await rows(await db(`group_buy_orders?select=id,order_code,customer_email&campaign_id=eq.${encodeURIComponent(campaign.id)}&payment_status=eq.not_open`, { method: 'GET' }), 'AUTO_PAYMENT_ORDER_READ_FAILED')
    await db(`group_buy_orders?campaign_id=eq.${encodeURIComponent(campaign.id)}&payment_status=eq.not_open`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'payment_open', payment_status: 'pending' }),
    })
    for (const autoOrder of autoOrders) {
      await createNotification({
        campaignId: campaign.id,
        orderId: autoOrder.id,
        eventType: 'payment_opened',
        recipientEmail: autoOrder.customer_email,
        subject: `團購已開放付款：${autoOrder.order_code}`,
        html: `<p>訂單 ${autoOrder.order_code} 已開放付款，請使用專屬訂單查詢連結查看付款資料。</p>`,
        dedupeKey: `payment_opened:${autoOrder.id}`,
      })
    }
  }

  return json(res, 200, {
    orderCode: order.order_code,
    orderPath: `/group-buy/order/${encodeURIComponent(order.order_code)}`,
    status: thresholdReached ? (campaign.payment_open_mode === 'automatic' && bankComplete ? 'payment_open' : 'threshold_reached') : 'waiting_group',
    notificationStatus: notification.status,
  })
}

async function findOrder(orderCode: string, accessToken: string) {
  const tokenHash = sha256(accessToken)
  const result = await rows(
    await db(`group_buy_orders?select=*&order_code=eq.${encodeURIComponent(orderCode)}&access_token_hash=eq.${tokenHash}&limit=1`, { method: 'GET' }),
    'ORDER_READ_FAILED',
  )
  return result[0] || null
}

async function orderDetail(req: any, res: any, orderCode: string) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員。' })

  const orderRows = await rows(
    await db(
      `group_buy_orders?select=*&order_code=eq.${encodeURIComponent(orderCode.toUpperCase())}&user_id=eq.${encodeURIComponent(user.userId)}&limit=1`,
      { method: 'GET' },
    ),
    'MY_ORDER_READ_FAILED',
  )
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到目前會員名下的訂單。' })

  const campaignRows = await rows(
    await db(`group_buy_campaigns?select=*&id=eq.${encodeURIComponent(order.campaign_id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaignRows[0]
  if (!campaign) return json(res, 500, { error: '訂單關聯的團購資料不存在。' })

  const [shippingRows, itemRows, paymentRows, workspaceRows, eventRows, notificationRows] = await Promise.all([
    rows(await db(`group_buy_shipping_methods?select=*&id=eq.${encodeURIComponent(order.shipping_method_id)}&limit=1`, { method: 'GET' }), 'SHIPPING_READ_FAILED'),
    rows(await db(`group_buy_order_items?select=*&order_id=eq.${encodeURIComponent(order.id)}&order=created_at.asc`, { method: 'GET' }), 'ITEM_READ_FAILED'),
    rows(await db(`group_buy_payment_reports?select=*&order_id=eq.${encodeURIComponent(order.id)}&order=created_at.desc`, { method: 'GET' }), 'PAYMENT_READ_FAILED'),
    rows(await db(`group_buy_workspaces?select=*&id=eq.${encodeURIComponent(campaign.workspace_id)}&limit=1`, { method: 'GET' }), 'WORKSPACE_READ_FAILED'),
    rows(await db(`group_buy_order_events?select=*&order_id=eq.${encodeURIComponent(order.id)}&order=created_at.asc`, { method: 'GET' }), 'EVENT_READ_FAILED'),
    rows(await db(`group_buy_notifications?select=id,event_type,status,created_at,sent_at,failed_at,last_error&order_id=eq.${encodeURIComponent(order.id)}&order=created_at.desc`, { method: 'GET' }), 'NOTIFICATION_READ_FAILED'),
  ])

  const shipping = shippingRows[0]
  const workspace = workspaceRows[0]
  if (!campaign || !shipping) return json(res, 500, { error: '訂單關聯資料不完整。' })

  let pickupStore: any = null
  let pickupSlotRows: any[] = []
  if (shipping.method_type === 'store_pickup' && order.pickup_store_id) {
    const storeRows = await rows(
      await db(`group_buy_pickup_stores?select=*&id=eq.${encodeURIComponent(order.pickup_store_id)}&campaign_id=eq.${encodeURIComponent(campaign.id)}&limit=1`, { method: 'GET' }),
      'PICKUP_STORE_READ_FAILED',
    )
    pickupStore = storeRows[0] || null
    if (campaign.pickup_date_selection_open) {
      pickupSlotRows = await rows(
        await db(`group_buy_pickup_slots?select=*&campaign_id=eq.${encodeURIComponent(campaign.id)}&pickup_store_id=eq.${encodeURIComponent(order.pickup_store_id)}&is_active=eq.true&pickup_date=gte.${new Date().toISOString().slice(0, 10)}&order=pickup_date.asc,start_time.asc,sort_order.asc`, { method: 'GET' }),
        'PICKUP_SLOT_READ_FAILED',
      )
    }
  }

  const showBank = campaign.status === 'payment_open' && campaign.show_bank_after_payment_open
  const resolvedPaymentBank = showBank ? resolvedBank(campaign, workspace) : null
  const bankReady = Boolean(
    resolvedPaymentBank?.name &&
    resolvedPaymentBank?.code &&
    resolvedPaymentBank?.account &&
    resolvedPaymentBank?.accountName,
  )

  // 收款帳號未完整設定時，不可讓整張會員訂單頁直接失敗。
  // 付款回報被退回後，客戶仍須能查看退回原因並重新填寫匯款資料。
  const bank = bankReady ? resolvedPaymentBank : null

  return json(res, 200, {
    order: {
      orderCode: order.order_code,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      recipientName: order.recipient_name,
      recipientPhone: order.recipient_phone,
      postalCode: order.postal_code,
      shippingAddress: order.shipping_address,
      itemSubtotalNtd: Number(order.item_subtotal_ntd || 0),
      shippingFeeNtd: Number(order.shipping_fee_ntd || 0),
      totalAmountNtd: Number(order.total_amount_ntd || 0),
      totalQuantity: Number(order.total_quantity || 0),
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      adminNote: order.admin_note,
      promisedShipBy: order.promised_ship_by,
      shippedAt: order.shipped_at,
      shippingCarrier: order.shipping_carrier,
      trackingNumber: order.tracking_number,
      shipmentNote: order.shipment_note,
      pickupStoreId: order.pickup_store_id,
      pickupStoreName: order.pickup_store_name,
      pickupStoreCity: order.pickup_store_city,
      pickupStoreAddress: order.pickup_store_address,
      pickupStorePhone: order.pickup_store_phone,
      pickupSlotId: order.pickup_slot_id,
      pickupDate: order.pickup_date,
      pickupDateSelectedAt: order.pickup_date_selected_at,
    },
    campaign: {
      title: campaign.title,
      slug: campaign.slug,
      status: campaign.status,
      paymentDeadline: campaign.payment_deadline,
      addressCollectionStage: campaign.address_collection_stage,
      supplierOrderedAt: campaign.supplier_ordered_at,
      supplierExpectedShipAt: campaign.supplier_expected_ship_at,
      estimatedEarliestShipAt: campaign.estimated_earliest_ship_at,
      estimatedShipMinBusinessDays: Number(campaign.estimated_ship_min_business_days || 7),
      estimatedShipMaxBusinessDays: Number(campaign.estimated_ship_max_business_days || 14),
      estimatedLatestShipAt: campaign.estimated_latest_ship_at,
      shippingNotice: campaign.shipping_notice,
      shippingDelayReason: campaign.shipping_delay_reason,
      shippingNoticeUpdatedAt: campaign.shipping_notice_updated_at,
      pickupDateSelectionOpen: Boolean(campaign.pickup_date_selection_open),
      pickupDateSelectionNotice: campaign.pickup_date_selection_notice || '',
    },
    shippingMethod: camelShipping(shipping),
    pickupStore: pickupStore ? camelPickupStore(pickupStore) : (order.pickup_store_id ? {
      id: order.pickup_store_id,
      city: order.pickup_store_city || '',
      name: order.pickup_store_name || '',
      address: order.pickup_store_address || '',
      phone: order.pickup_store_phone || null,
      isActive: false,
    } : null),
    pickupSlots: pickupSlotRows.map(camelPickupSlot),
    items: itemRows.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productTitle: item.product_title,
      unitLabel: item.unit_label,
      unitPriceNtd: Number(item.unit_price_ntd || 0),
      quantity: Number(item.quantity || 0),
      lineTotalNtd: Number(item.line_total_ntd || 0),
    })),
    bank,
    bankSetupIncomplete: showBank && !bankReady,
    paymentReports: paymentRows.map((report) => ({
      id: report.id,
      payerName: report.payer_name,
      amountNtd: Number(report.amount_ntd || 0),
      accountLastFive: report.account_last_five,
      transferredAt: report.transferred_at,
      status: report.status,
      reviewNote: report.review_note,
    })),
    events: eventRows.map((event) => ({
      id: event.id,
      eventType: event.event_type,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      message: event.message,
      createdAt: event.created_at,
    })),
    notifications: notificationRows.map((notification) => ({
      id: notification.id,
      eventType: notification.event_type,
      status: notification.status,
      createdAt: notification.created_at,
      sentAt: notification.sent_at,
      failedAt: notification.failed_at,
      lastError: notification.last_error,
    })),
  })
}


async function selectPickupSlot(req: any, res: any, body: any) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員。' })

  const orderCode = text(body.orderCode, 80).toUpperCase()
  const pickupSlotId = text(body.pickupSlotId, 80)
  if (!orderCode || !pickupSlotId) return json(res, 400, { error: '請選擇取貨日期。' })

  const orderRows = await rows(
    await db(
      `group_buy_orders?select=*&order_code=eq.${encodeURIComponent(orderCode)}&user_id=eq.${encodeURIComponent(user.userId)}&limit=1`,
      { method: 'GET' },
    ),
    'MY_ORDER_READ_FAILED',
  )
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到目前會員名下的訂單。' })
  if (!order.pickup_store_id) return json(res, 409, { error: '此訂單不是門市自取。' })
  if (order.payment_status !== 'verified') return json(res, 409, { error: '付款確認完成後才能選擇取貨日期。' })
  if (['cancelled', 'refunded', 'completed'].includes(String(order.status || ''))) {
    return json(res, 409, { error: '目前訂單狀態無法變更取貨日期。' })
  }

  const campaignRows = await rows(
    await db(`group_buy_campaigns?select=*&id=eq.${encodeURIComponent(order.campaign_id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaignRows[0]
  if (!campaign?.pickup_date_selection_open) {
    return json(res, 409, { error: '主辦方尚未開放選擇取貨日期。' })
  }

  const slotRows = await rows(
    await db(
      `group_buy_pickup_slots?select=*&id=eq.${encodeURIComponent(pickupSlotId)}&campaign_id=eq.${encodeURIComponent(order.campaign_id)}&pickup_store_id=eq.${encodeURIComponent(order.pickup_store_id)}&is_active=eq.true&limit=1`,
      { method: 'GET' },
    ),
    'PICKUP_SLOT_READ_FAILED',
  )
  const slot = slotRows[0]
  if (!slot) return json(res, 400, { error: '此取貨日期不存在、已關閉或不屬於所選門市。' })
  if (new Date(`${slot.pickup_date}T23:59:59+08:00`).getTime() < Date.now()) {
    return json(res, 409, { error: '此取貨日期已過期，請重新選擇。' })
  }

  if (slot.capacity != null) {
    const selectedRows = await rows(
      await db(`group_buy_orders?select=id&pickup_slot_id=eq.${encodeURIComponent(slot.id)}&status=not.in.(cancelled,refunded)&limit=${Math.max(1, Number(slot.capacity) + 1)}`, { method: 'GET' }),
      'PICKUP_SLOT_CAPACITY_READ_FAILED',
    )
    const alreadySelected = String(order.pickup_slot_id || '') === String(slot.id)
    if (!alreadySelected && selectedRows.length >= Number(slot.capacity)) {
      return json(res, 409, { error: '此取貨日期名額已滿，請選擇其他日期。' })
    }
  }

  const selectedAt = new Date().toISOString()
  const update = await db(`group_buy_orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      pickup_slot_id: slot.id,
      pickup_date: slot.pickup_date,
      pickup_date_selected_at: selectedAt,
      updated_at: selectedAt,
    }),
  })
  if (!update.ok) throw new Error(`PICKUP_DATE_UPDATE_FAILED:${await update.text()}`)

  await db('group_buy_order_events', {
    method: 'POST',
    body: JSON.stringify({
      order_id: order.id,
      actor_user_id: user.userId,
      actor_role: 'customer',
      event_type: 'pickup_date_selected',
      from_status: order.status,
      to_status: order.status,
      message: `客戶選擇門市取貨日期：${slot.pickup_date}。`,
      metadata: {
        pickupSlotId: slot.id,
        pickupStoreId: order.pickup_store_id,
        pickupDate: slot.pickup_date,
      },
    }),
  })

  return json(res, 200, { ok: true, pickupDate: slot.pickup_date })
}

async function reportPayment(req: any, res: any, body: any) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員。' })

  const orderRows = await rows(
    await db(
      `group_buy_orders?select=*&order_code=eq.${encodeURIComponent(text(body.orderCode, 50).toUpperCase())}&user_id=eq.${encodeURIComponent(user.userId)}&limit=1`,
      { method: 'GET' },
    ),
    'MY_ORDER_READ_FAILED',
  )
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到目前會員名下的訂單。' })

  const campaignRows = await rows(
    await db(`group_buy_campaigns?select=*&id=eq.${encodeURIComponent(order.campaign_id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaignRows[0]
  if (['cancelled', 'refunded'].includes(String(order.status || ''))) {
    return json(res, 409, { error: '此訂單已取消，無法回報付款。' })
  }
  if (order.payment_status === 'verified') {
    return json(res, 409, { error: '此訂單已完成付款確認，不需再次回報。' })
  }
  if (order.payment_status === 'reported') {
    return json(res, 409, { error: '付款資料正在核對中，請勿重複回報。' })
  }
  const isRejectedResubmission = order.payment_status === 'rejected'
  if (!isRejectedResubmission && (!campaign || campaign.status !== 'payment_open')) {
    return json(res, 409, { error: '目前尚未開放付款。' })
  }
  if (
    !isRejectedResubmission &&
    campaign.payment_deadline &&
    new Date(campaign.payment_deadline).getTime() < Date.now()
  ) {
    return json(res, 409, { error: '付款期限已截止，請使用網站站內聯絡功能詢問。' })
  }

  const amount = Number(body.amountNtd || 0)
  const lastFive = text(body.accountLastFive, 5)
  if (amount !== Number(order.total_amount_ntd || 0)) return json(res, 400, { error: '匯款金額與訂單金額不符。' })
  if (!/^\d{5}$/.test(lastFive)) return json(res, 400, { error: '請輸入帳號後五碼。' })

  const shippingRows = await rows(
    await db(`group_buy_shipping_methods?select=*&id=eq.${encodeURIComponent(order.shipping_method_id)}&limit=1`, { method: 'GET' }),
    'SHIPPING_READ_FAILED',
  )
  const shipping = shippingRows[0]
  const recipientName = text(body.recipientName, 80)
  const recipientPhone = text(body.recipientPhone, 30)
  const shippingAddress = text(body.shippingAddress, 300)
  if (shipping?.method_type === 'home_delivery' && (!recipientName || !recipientPhone || !shippingAddress)) {
    return json(res, 400, { error: '宅配訂單請填寫完整收件資料。' })
  }

  await rows(
    await db('group_buy_payment_reports', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.id,
        payer_name: text(body.payerName, 80) || order.customer_name,
        amount_ntd: amount,
        account_last_five: lastFive,
        transferred_at: body.transferredAt || new Date().toISOString(),
        note: text(body.note, 1000) || null,
        status: 'reported',
      }),
    }),
    'PAYMENT_INSERT_FAILED',
  )

  const update = await db(`group_buy_orders?id=eq.${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      recipient_name: recipientName || order.recipient_name,
      recipient_phone: recipientPhone || order.recipient_phone,
      postal_code: text(body.postalCode, 10) || order.postal_code,
      shipping_address: shippingAddress || order.shipping_address,
      status: 'payment_reported',
      payment_status: 'reported',
    }),
  })
  if (!update.ok) throw new Error(`ORDER_PAYMENT_UPDATE_FAILED:${await update.text()}`)

  await db('group_buy_order_events', {
    method: 'POST',
    body: JSON.stringify({
      order_id: order.id,
      actor_role: 'customer',
      event_type: 'payment_reported',
      from_status: order.status,
      to_status: 'payment_reported',
      message: '客戶已回報匯款資料，等待管理員核對。',
    }),
  })

  return json(res, 200, { ok: true })
}

async function requestOrderRecovery(res: any, body: any) {
  const orderCode = text(body.orderCode, 80).toUpperCase()
  const email = text(body.email, 180).toLowerCase()
  if (!orderCode || !EMAIL_RE.test(email)) return json(res, 400, { error: '請輸入訂單編號與正確的 Email。' })

  const orderRows = await rows(
    await db(`group_buy_orders?select=id,order_code,campaign_id,customer_email&order_code=eq.${encodeURIComponent(orderCode)}&limit=1`, { method: 'GET' }),
    'ORDER_RECOVERY_READ_FAILED',
  )
  const order = orderRows[0]
  if (order && String(order.customer_email || '').toLowerCase() === email) {
    const recoveryToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    await db('group_buy_order_recovery_tokens', {
      method: 'POST',
      body: JSON.stringify({ order_id: order.id, token_hash: sha256(recoveryToken), expires_at: expiresAt }),
    })
    const siteUrl = text(process.env.PUBLIC_SITE_URL || process.env.VITE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL, 500).replace(/\/$/, '')
    const path = `/group-buy/recover?orderCode=${encodeURIComponent(order.order_code)}&token=${encodeURIComponent(recoveryToken)}`
    await createNotification({
      campaignId: order.campaign_id,
      orderId: order.id,
      eventType: 'registration_confirmed',
      recipientEmail: email,
      subject: `團購訂單查詢連結：${order.order_code}`,
      html: `<p>請在 30 分鐘內使用此連結重新取得訂單查詢權限：</p><p><a href="${siteUrl}${path}">${siteUrl}${path}</a></p>`,
      dedupeKey: `order_recovery:${order.id}:${Date.now()}`,
    })
  }

  return json(res, 200, {
    ok: true,
    notificationStatus: 'notification_pending',
    message: '若訂單編號與 Email 相符，系統會建立安全查詢通知。',
  })
}

async function consumeOrderRecovery(res: any, body: any) {
  const orderCode = text(body.orderCode, 80).toUpperCase()
  const recoveryToken = text(body.recoveryToken, 200)
  if (!orderCode || !recoveryToken) return json(res, 400, { error: '查詢驗證資料不完整。' })
  const now = new Date().toISOString()
  const tokenRows = await rows(
    await db(`group_buy_order_recovery_tokens?select=*,group_buy_orders!inner(order_code)&token_hash=eq.${sha256(recoveryToken)}&consumed_at=is.null&revoked_at=is.null&expires_at=gt.${encodeURIComponent(now)}&group_buy_orders.order_code=eq.${encodeURIComponent(orderCode)}&limit=1`, { method: 'GET' }),
    'ORDER_RECOVERY_TOKEN_READ_FAILED',
  )
  const tokenRow = tokenRows[0]
  if (!tokenRow) return json(res, 404, { error: '驗證連結無效或已過期。' })
  const accessToken = crypto.randomBytes(32).toString('hex')
  const updateOrder = await db(`group_buy_orders?id=eq.${encodeURIComponent(tokenRow.order_id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ access_token_hash: sha256(accessToken) }),
  })
  if (!updateOrder.ok) throw new Error(`ORDER_ACCESS_REFRESH_FAILED:${await updateOrder.text()}`)
  await db(`group_buy_order_recovery_tokens?id=eq.${encodeURIComponent(tokenRow.id)}`, {
    method: 'PATCH', body: JSON.stringify({ consumed_at: now }),
  })
  return json(res, 200, {
    orderPath: `/group-buy/order/${encodeURIComponent(orderCode)}?token=${encodeURIComponent(accessToken)}`,
  })
}

async function listMyOrders(req: any, res: any) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員。' })
  const orderRows = await rows(
    await db(`group_buy_orders?select=id,order_code,campaign_id,total_quantity,total_amount_ntd,status,payment_status,created_at&user_id=eq.${encodeURIComponent(user.userId)}&order=created_at.desc`, { method: 'GET' }),
    'MY_ORDERS_READ_FAILED',
  )
  const campaignIds = [...new Set(orderRows.map((row) => String(row.campaign_id)).filter(Boolean))]
  const campaignRows = campaignIds.length
    ? await rows(await db(`group_buy_campaigns?select=id,title,status&id=in.(${campaignIds.join(',')})`, { method: 'GET' }), 'CAMPAIGN_READ_FAILED')
    : []
  const campaigns = new Map(campaignRows.map((row) => [String(row.id), row]))
  return json(res, 200, { orders: orderRows.map((order) => ({
    orderCode: order.order_code,
    campaignTitle: campaigns.get(String(order.campaign_id))?.title || '團購',
    campaignStatus: campaigns.get(String(order.campaign_id))?.status || '',
    totalQuantity: Number(order.total_quantity || 0),
    totalAmountNtd: Number(order.total_amount_ntd || 0),
    status: order.status,
    paymentStatus: order.payment_status,
    createdAt: order.created_at,
  })) })
}

async function openMyOrder(req: any, res: any, body: any) {
  const user = await currentUser(req)
  if (!user) return json(res, 401, { error: '請先登入會員。' })

  const orderCode = text(body.orderCode, 80).toUpperCase()
  const orderRows = await rows(
    await db(
      `group_buy_orders?select=id,order_code&user_id=eq.${encodeURIComponent(user.userId)}&order_code=eq.${encodeURIComponent(orderCode)}&limit=1`,
      { method: 'GET' },
    ),
    'MY_ORDER_READ_FAILED',
  )
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到會員名下的訂單。' })

  return json(res, 200, {
    orderPath: `/group-buy/order/${encodeURIComponent(order.order_code)}`,
  })
}

async function adminBootstrap(req: any, res: any) {
  const user = await requireUser(req, res)
  if (!user) return
  let workspace = await ownerWorkspace(user.userId)
  if (!workspace) {
    const created = await rows(
      await db('group_buy_workspaces', {
        method: 'POST',
        body: JSON.stringify({
          owner_user_id: user.userId,
          name: 'RXV 團購工作空間',
          slug: `rxv-${user.userId.slice(0, 8)}`,
          default_bank_name: '中華郵政',
          default_bank_code: '700',
        }),
      }),
      'WORKSPACE_INSERT_FAILED',
    )
    workspace = created[0]
    await db('group_buy_workspace_members', {
      method: 'POST',
      body: JSON.stringify({
        workspace_id: workspace.id,
        user_id: user.userId,
        role: 'owner',
        status: 'active',
      }),
    })
  }
  return json(res, 200, { workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug } })
}

async function adminListCampaigns(req: any, res: any) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const campaignRows = await rows(
    await db(`group_buy_campaigns?select=*&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&order=created_at.desc`, { method: 'GET' }),
    'CAMPAIGN_LIST_FAILED',
  )
  const result = []
  for (const campaign of campaignRows) {
    const progress = await campaignProgress(campaign)
    result.push({ ...camelCampaign(campaign), ...progress })
  }
  return json(res, 200, { campaigns: result })
}

async function adminGetCampaign(req: any, res: any, id: string) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const campaignRows = await rows(
    await db(`group_buy_campaigns?select=*&id=eq.${encodeURIComponent(id)}&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaignRows[0]
  if (!campaign) return json(res, 404, { error: '找不到團購。' })
  const [productRows, shippingRows, pickupStoreRows, pickupSlotRows] = await Promise.all([
    rows(await db(`group_buy_products?select=*&campaign_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`, { method: 'GET' }), 'PRODUCT_READ_FAILED'),
    rows(await db(`group_buy_shipping_methods?select=*&campaign_id=eq.${encodeURIComponent(id)}&order=sort_order.asc`, { method: 'GET' }), 'SHIPPING_READ_FAILED'),
    rows(await db(`group_buy_pickup_stores?select=*&campaign_id=eq.${encodeURIComponent(id)}&order=city.asc,sort_order.asc,store_name.asc`, { method: 'GET' }), 'PICKUP_STORE_READ_FAILED'),
    rows(await db(`group_buy_pickup_slots?select=*&campaign_id=eq.${encodeURIComponent(id)}&order=pickup_date.asc,start_time.asc,sort_order.asc`, { method: 'GET' }), 'PICKUP_SLOT_READ_FAILED'),
  ])
  return json(res, 200, {
    campaign: { ...camelCampaign(campaign), progress: await campaignProgress(campaign) },
    products: productRows.map(camelProduct),
    shippingMethods: shippingRows.map(camelShipping),
    pickupStores: pickupStoreRows.map(camelPickupStore),
    pickupSlots: pickupSlotRows.map(camelPickupSlot),
  })
}

async function adminSaveCampaign(req: any, res: any, body: any) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const slug = text(body.slug, 80).toLowerCase()
  const title = text(body.title, 200)
  if (!title) return json(res, 400, { error: '請填寫團購名稱。' })
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return json(res, 400, { error: '網址代碼格式不正確。' })

  const minRegistrationValue = Number(body.minRegistrationValue || 0)
  const minPaidValue = Number(body.minPaidValue || 0)
  if (!(minRegistrationValue > 0) || !(minPaidValue > 0)) {
    return json(res, 400, { error: '登記門檻與付款門檻必須大於 0。' })
  }

  const rawShippingMethods = Array.isArray(body.shippingMethods) ? body.shippingMethods : []
  const storePickupEnabled = rawShippingMethods.some((item: any) => item?.isActive !== false && item?.methodType === 'store_pickup')
  const rawPickupStores = Array.isArray(body.pickupStores) ? body.pickupStores : []
  const rawPickupSlots = Array.isArray(body.pickupSlots) ? body.pickupSlots : []
  if (storePickupEnabled && !rawPickupStores.some((store: any) =>
    store?.isActive !== false && text(store?.name || store?.storeName, 150) && text(store?.city, 50) && text(store?.address, 300)
  )) {
    return json(res, 400, { error: '已開放門市自取，請至少建立一間啟用中的可取貨門市。' })
  }
  if (body.pickupDateSelectionOpen === true && !rawPickupSlots.some((slot: any) =>
    slot?.isActive !== false && /^\d{4}-\d{2}-\d{2}$/.test(text(slot?.pickupDate, 20)) && text(slot?.pickupStoreId || slot?.pickupStoreRef, 100)
  )) {
    return json(res, 400, { error: '開放客戶選擇取貨日期前，至少需要一個啟用中的取貨日期。' })
  }

  const payload = {
    workspace_id: auth.workspace.id,
    title,
    slug,
    description: text(body.description, 10000) || null,
    cover_image_url: text(body.coverImageUrl, 2000) || null,
    notice_text: text(body.noticeText, 5000) || null,
    status: text(body.status, 50) || 'draft',
    registration_starts_at: body.registrationStartsAt || null,
    registration_ends_at: body.registrationEndsAt || null,
    payment_deadline: body.paymentDeadline || null,
    estimated_arrival_text: text(body.estimatedArrivalText, 500) || null,
    threshold_mode: ['quantity', 'order_count', 'amount', 'points'].includes(text(body.thresholdMode, 30)) ? text(body.thresholdMode, 30) : 'quantity',
    min_registration_value: minRegistrationValue,
    min_paid_value: minPaidValue,
    allow_mixed_products: body.allowMixedProducts !== false,
    show_progress: body.showProgress !== false,
    address_collection_stage: body.addressCollectionStage === 'registration' ? 'registration' : 'payment',
    payment_open_mode: body.paymentOpenMode === 'automatic' ? 'automatic' : 'manual',
    pickup_date_selection_open: body.pickupDateSelectionOpen === true,
    pickup_date_selection_notice: text(body.pickupDateSelectionNotice, 1000) || null,
    bank_name: text(body.bankName, 100) || null,
    bank_code: text(body.bankCode, 20) || null,
    bank_branch: text(body.bankBranch, 100) || null,
    bank_account: text(body.bankAccount, 50) || null,
    bank_account_name: text(body.bankAccountName, 100) || null,
    created_by_user_id: auth.user.userId,
  }

  let campaignId = text(body.id, 80)
  if (campaignId) {
    const updated = await rows(
      await db(`group_buy_campaigns?id=eq.${encodeURIComponent(campaignId)}&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
      'CAMPAIGN_UPDATE_FAILED',
    )
    if (!updated[0]) return json(res, 404, { error: '找不到可更新的團購。' })
  } else {
    const inserted = await rows(
      await db('group_buy_campaigns', { method: 'POST', body: JSON.stringify(payload) }),
      'CAMPAIGN_INSERT_FAILED',
    )
    campaignId = String(inserted[0]?.id || '')
  }
  if (!campaignId) throw new Error('CAMPAIGN_ID_MISSING')

  const submittedProducts = (Array.isArray(body.products) ? body.products : []).filter((item: any) => text(item?.title, 200))
  if (!submittedProducts.length) return json(res, 400, { error: '至少需要一項商品。' })
  const existingProducts = await rows(
    await db(`group_buy_products?select=id&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'GET' }),
    'PRODUCT_LIST_FAILED',
  )
  const existingProductIds = new Set(existingProducts.map((item: any) => String(item.id)))
  const keptProductIds = new Set<string>()
  for (let index = 0; index < submittedProducts.length; index += 1) {
    const item = submittedProducts[index]
    const itemPayload = {
      campaign_id: campaignId,
      title: text(item.title, 200),
      description: text(item.description, 5000) || null,
      image_url: text(item.imageUrl, 2000) || null,
      unit_label: text(item.unitLabel, 30) || '件',
      sale_price_ntd: Math.max(0, Math.floor(Number(item.salePriceNtd || 0))),
      cost_price_ntd: item.costPriceNtd == null || item.costPriceNtd === '' ? null : Math.max(0, Math.floor(Number(item.costPriceNtd))),
      min_quantity_per_order: Math.max(0, Math.floor(Number(item.minQuantityPerOrder || 0))),
      max_quantity_per_order: item.maxQuantityPerOrder ? Math.max(1, Math.floor(Number(item.maxQuantityPerOrder))) : null,
      stock_limit: item.stockLimit == null || item.stockLimit === '' ? null : Math.max(0, Math.floor(Number(item.stockLimit))),
      threshold_weight: Math.max(0, Number(item.thresholdWeight || 1)),
      is_active: item.isActive !== false,
      sort_order: index,
    }
    const itemId = text(item.id, 80)
    if (itemId && existingProductIds.has(itemId)) {
      await rows(
        await db(`group_buy_products?id=eq.${encodeURIComponent(itemId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', body: JSON.stringify(itemPayload) }),
        'PRODUCT_UPDATE_FAILED',
      )
      keptProductIds.add(itemId)
    } else {
      const inserted = await rows(await db('group_buy_products', { method: 'POST', body: JSON.stringify(itemPayload) }), 'PRODUCT_INSERT_FAILED')
      if (inserted[0]?.id) keptProductIds.add(String(inserted[0].id))
    }
  }
  for (const existingId of existingProductIds) {
    if (!keptProductIds.has(existingId)) {
      const response = await db(`group_buy_products?id=eq.${encodeURIComponent(existingId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', body: JSON.stringify({ is_active: false }) })
      if (!response.ok) throw new Error(`PRODUCT_DEACTIVATE_FAILED:${await response.text()}`)
    }
  }

  const submittedShipping = (Array.isArray(body.shippingMethods) ? body.shippingMethods : []).filter((item: any) => text(item?.label, 100))
  if (!submittedShipping.some((item: any) => item.isActive !== false)) return json(res, 400, { error: '至少需要開啟一種配送方式。' })
  const existingShipping = await rows(
    await db(`group_buy_shipping_methods?select=id&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'GET' }),
    'SHIPPING_LIST_FAILED',
  )
  const existingShippingIds = new Set(existingShipping.map((item: any) => String(item.id)))
  const keptShippingIds = new Set<string>()
  for (let index = 0; index < submittedShipping.length; index += 1) {
    const item = submittedShipping[index]
    const methodType = item.methodType === 'store_pickup' ? 'store_pickup' : 'home_delivery'
    const methodPayload = {
      campaign_id: campaignId,
      method_type: methodType,
      label: text(item.label, 100),
      is_active: item.isActive !== false,
      fee_mode: ['fixed', 'quantity_free_threshold', 'amount_free_threshold'].includes(item.feeMode) ? item.feeMode : 'fixed',
      base_fee_ntd: Math.max(0, Math.floor(Number(item.baseFeeNtd || 0))),
      free_threshold_quantity: item.freeThresholdQuantity ? Math.max(1, Math.floor(Number(item.freeThresholdQuantity))) : null,
      free_threshold_amount_ntd: item.freeThresholdAmountNtd ? Math.max(1, Math.floor(Number(item.freeThresholdAmountNtd))) : null,
      pickup_name: methodType === 'store_pickup' ? text(item.pickupName, 150) || null : null,
      pickup_address: methodType === 'store_pickup' ? text(item.pickupAddress, 300) || null : null,
      pickup_phone: methodType === 'store_pickup' ? text(item.pickupPhone, 30) || null : null,
      pickup_map_url: methodType === 'store_pickup' ? text(item.pickupMapUrl, 2000) || null : null,
      pickup_time_text: methodType === 'store_pickup' ? text(item.pickupTimeText, 500) || null : null,
      pickup_notice: methodType === 'store_pickup' ? text(item.pickupNotice, 1000) || null : null,
      sort_order: index,
    }
    const itemId = text(item.id, 80)
    if (itemId && existingShippingIds.has(itemId)) {
      await rows(
        await db(`group_buy_shipping_methods?id=eq.${encodeURIComponent(itemId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', body: JSON.stringify(methodPayload) }),
        'SHIPPING_UPDATE_FAILED',
      )
      keptShippingIds.add(itemId)
    } else {
      const inserted = await rows(await db('group_buy_shipping_methods', { method: 'POST', body: JSON.stringify(methodPayload) }), 'SHIPPING_INSERT_FAILED')
      if (inserted[0]?.id) keptShippingIds.add(String(inserted[0].id))
    }
  }
  for (const existingId of existingShippingIds) {
    if (!keptShippingIds.has(existingId)) {
      const response = await db(`group_buy_shipping_methods?id=eq.${encodeURIComponent(existingId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', body: JSON.stringify({ is_active: false }) })
      if (!response.ok) throw new Error(`SHIPPING_DEACTIVATE_FAILED:${await response.text()}`)
    }
  }

  const submittedPickupStores = (Array.isArray(body.pickupStores) ? body.pickupStores : [])
    .filter((item: any) => text(item?.name || item?.storeName, 150) && text(item?.address, 300))
  const existingPickupStores = await rows(
    await db(`group_buy_pickup_stores?select=id&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'GET' }),
    'PICKUP_STORE_LIST_FAILED',
  )
  const existingPickupStoreIds = new Set(existingPickupStores.map((item: any) => String(item.id)))
  const keptPickupStoreIds = new Set<string>()
  const pickupStoreReferenceMap = new Map<string, string>()

  for (let index = 0; index < submittedPickupStores.length; index += 1) {
    const item = submittedPickupStores[index]
    const itemPayload = {
      campaign_id: campaignId,
      store_code: text(item.storeCode, 100) || null,
      city: text(item.city, 50),
      district: text(item.district, 80) || null,
      store_name: text(item.name || item.storeName, 150),
      address: text(item.address, 300),
      phone: text(item.phone, 50) || null,
      business_hours: text(item.businessHours, 1000) || null,
      source_url: text(item.sourceUrl, 2000) || null,
      is_active: item.isActive !== false,
      sort_order: Math.max(0, Math.floor(Number(item.sortOrder ?? index))),
      updated_at: new Date().toISOString(),
    }
    if (!itemPayload.city) return json(res, 400, { error: `${itemPayload.store_name} 請填寫縣市。` })

    const itemId = text(item.id, 80)
    const clientKey = text(item.clientKey, 100)
    let savedId = ''
    if (itemId && existingPickupStoreIds.has(itemId)) {
      const updated = await rows(
        await db(`group_buy_pickup_stores?id=eq.${encodeURIComponent(itemId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', body: JSON.stringify(itemPayload) }),
        'PICKUP_STORE_UPDATE_FAILED',
      )
      savedId = String(updated[0]?.id || itemId)
    } else {
      const inserted = await rows(
        await db('group_buy_pickup_stores', { method: 'POST', body: JSON.stringify(itemPayload) }),
        'PICKUP_STORE_INSERT_FAILED',
      )
      savedId = String(inserted[0]?.id || '')
    }
    if (savedId) {
      keptPickupStoreIds.add(savedId)
      if (itemId) pickupStoreReferenceMap.set(itemId, savedId)
      if (clientKey) pickupStoreReferenceMap.set(clientKey, savedId)
      pickupStoreReferenceMap.set(savedId, savedId)
    }
  }

  for (const existingId of existingPickupStoreIds) {
    if (!keptPickupStoreIds.has(existingId)) {
      const response = await db(`group_buy_pickup_stores?id=eq.${encodeURIComponent(existingId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error(`PICKUP_STORE_DEACTIVATE_FAILED:${await response.text()}`)
    }
  }

  const submittedPickupSlots = (Array.isArray(body.pickupSlots) ? body.pickupSlots : [])
    .filter((item: any) => text(item?.pickupDate, 20) && text(item?.pickupStoreId || item?.pickupStoreRef, 100))
  const existingPickupSlots = await rows(
    await db(`group_buy_pickup_slots?select=id&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'GET' }),
    'PICKUP_SLOT_LIST_FAILED',
  )
  const existingPickupSlotIds = new Set(existingPickupSlots.map((item: any) => String(item.id)))
  const keptPickupSlotIds = new Set<string>()

  for (let index = 0; index < submittedPickupSlots.length; index += 1) {
    const item = submittedPickupSlots[index]
    const rawStoreRef = text(item.pickupStoreId || item.pickupStoreRef, 100)
    const pickupStoreId = pickupStoreReferenceMap.get(rawStoreRef) || (keptPickupStoreIds.has(rawStoreRef) ? rawStoreRef : '')
    if (!pickupStoreId) return json(res, 400, { error: '取貨日期所屬門市不存在，請先儲存門市資料。' })

    const pickupDate = text(item.pickupDate, 20)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) return json(res, 400, { error: '取貨日期格式不正確。' })
    const itemPayload = {
      campaign_id: campaignId,
      pickup_store_id: pickupStoreId,
      pickup_date: pickupDate,
      start_time: text(item.startTime, 20) || null,
      end_time: text(item.endTime, 20) || null,
      notice: text(item.notice, 1000) || null,
      capacity: item.capacity == null || item.capacity === '' ? null : Math.max(1, Math.floor(Number(item.capacity))),
      is_active: item.isActive !== false,
      sort_order: Math.max(0, Math.floor(Number(item.sortOrder ?? index))),
      updated_at: new Date().toISOString(),
    }
    const itemId = text(item.id, 80)
    if (itemId && existingPickupSlotIds.has(itemId)) {
      await rows(
        await db(`group_buy_pickup_slots?id=eq.${encodeURIComponent(itemId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'PATCH', body: JSON.stringify(itemPayload) }),
        'PICKUP_SLOT_UPDATE_FAILED',
      )
      keptPickupSlotIds.add(itemId)
    } else {
      const inserted = await rows(
        await db('group_buy_pickup_slots', { method: 'POST', body: JSON.stringify(itemPayload) }),
        'PICKUP_SLOT_INSERT_FAILED',
      )
      if (inserted[0]?.id) keptPickupSlotIds.add(String(inserted[0].id))
    }
  }

  for (const existingId of existingPickupSlotIds) {
    if (!keptPickupSlotIds.has(existingId)) {
      const response = await db(`group_buy_pickup_slots?id=eq.${encodeURIComponent(existingId)}&campaign_id=eq.${encodeURIComponent(campaignId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error(`PICKUP_SLOT_DEACTIVATE_FAILED:${await response.text()}`)
    }
  }

  if (body.pickupDateSelectionOpen === true && !submittedPickupSlots.some((slot: any) => slot.isActive !== false)) {
    return json(res, 400, { error: '開放客戶選擇取貨日期前，至少需要一個啟用中的取貨日期。' })
  }

  return json(res, 200, { id: campaignId, slug })
}

async function adminListOrders(req: any, res: any, campaignId: string) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const campaignRows = await rows(
    await db(`group_buy_campaigns?select=id&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&id=eq.${encodeURIComponent(campaignId)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  if (!campaignRows[0]) return json(res, 404, { error: '找不到團購。' })

  const [orderRows, shippingRows] = await Promise.all([
    rows(await db(`group_buy_orders?select=*&campaign_id=eq.${encodeURIComponent(campaignId)}&order=created_at.desc`, { method: 'GET' }), 'ORDER_LIST_FAILED'),
    rows(await db(`group_buy_shipping_methods?select=id,label,method_type&campaign_id=eq.${encodeURIComponent(campaignId)}`, { method: 'GET' }), 'SHIPPING_READ_FAILED'),
  ])
  const shippingMap = new Map(shippingRows.map((row) => [String(row.id), row.label]))
  const orderIds = orderRows.map((row: any) => String(row.id)).filter(Boolean)
  let paymentRows: any[] = []
  let itemRows: any[] = []
  let notificationRows: any[] = []
  if (orderIds.length) {
    const filter = `in.(${orderIds.join(',')})`
    ;[paymentRows, itemRows, notificationRows] = await Promise.all([
      rows(await db(`group_buy_payment_reports?select=*&order_id=${filter}&order=created_at.desc`, { method: 'GET' }), 'PAYMENT_READ_FAILED'),
      rows(await db(`group_buy_order_items?select=*&order_id=${filter}&order=created_at.asc`, { method: 'GET' }), 'ORDER_ITEM_READ_FAILED'),
      rows(await db(`group_buy_notifications?select=*&order_id=${filter}&order=created_at.desc`, { method: 'GET' }), 'NOTIFICATION_READ_FAILED'),
    ])
  }
  const paymentsByOrder = new Map<string, any[]>()
  for (const report of paymentRows) {
    const key = String(report.order_id)
    paymentsByOrder.set(key, [...(paymentsByOrder.get(key) || []), report])
  }
  const itemsByOrder = new Map<string, any[]>()
  for (const item of itemRows) {
    const key = String(item.order_id)
    itemsByOrder.set(key, [...(itemsByOrder.get(key) || []), item])
  }
  const notificationsByOrder = new Map<string, any[]>()
  for (const notification of notificationRows) {
    const key = String(notification.order_id)
    notificationsByOrder.set(key, [...(notificationsByOrder.get(key) || []), notification])
  }

  return json(res, 200, {
    orders: orderRows.map((order: any) => {
      const orderItems = itemsByOrder.get(String(order.id)) || []
      const reports = paymentsByOrder.get(String(order.id)) || []
      return {
        id: order.id,
        orderCode: order.order_code,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        adminNote: order.admin_note,
        customerNote: order.customer_note,
        recipientName: order.recipient_name,
        recipientPhone: order.recipient_phone,
        postalCode: order.postal_code,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        itemSubtotalNtd: Number(order.item_subtotal_ntd || 0),
        shippingFeeNtd: Number(order.shipping_fee_ntd || 0),
        totalQuantity: Number(order.total_quantity || 0),
        totalAmountNtd: Number(order.total_amount_ntd || 0),
        shippingLabel: shippingMap.get(String(order.shipping_method_id))?.label || '—',
        shippingMethodType: shippingMap.get(String(order.shipping_method_id))?.method_type || '',
        pickupStoreId: order.pickup_store_id,
        pickupStoreName: order.pickup_store_name,
        pickupStoreCity: order.pickup_store_city,
        pickupStoreAddress: order.pickup_store_address,
        pickupStorePhone: order.pickup_store_phone,
        pickupSlotId: order.pickup_slot_id,
        pickupDate: order.pickup_date,
        pickupDateSelectedAt: order.pickup_date_selected_at,
        status: order.status,
        paymentStatus: order.payment_status,
        itemSummary: orderItems.map((item: any) => `${item.product_title}×${item.quantity}`).join('、'),
        items: orderItems.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productTitle: item.product_title,
          unitLabel: item.unit_label,
          unitPriceNtd: Number(item.unit_price_ntd || 0),
          unitCostNtd: item.unit_cost_ntd == null ? null : Number(item.unit_cost_ntd),
          quantity: Number(item.quantity || 0),
          lineTotalNtd: Number(item.line_total_ntd || 0),
          lineCostNtd: item.line_cost_ntd == null ? null : Number(item.line_cost_ntd),
        })),
        estimatedProductCostNtd: orderItems.reduce((sum: number, item: any) => sum + Number(item.line_cost_ntd || 0), 0),
        estimatedProductGrossProfitNtd: Number(order.item_subtotal_ntd || 0) - orderItems.reduce((sum: number, item: any) => sum + Number(item.line_cost_ntd || 0), 0),
        orderPath: '',
        notifications: (notificationsByOrder.get(String(order.id)) || []).map((notification: any) => ({
          id: notification.id,
          eventType: notification.event_type,
          status: notification.status,
          createdAt: notification.created_at,
          lastError: notification.last_error,
        })),
        paymentReports: reports.map((report: any) => ({
          id: report.id,
          payerName: report.payer_name,
          amountNtd: Number(report.amount_ntd || 0),
          accountLastFive: report.account_last_five,
          transferredAt: report.transferred_at,
          status: report.status,
          reviewNote: report.review_note,
        })),
      }
    }),
  })
}


async function adminExportOrdersXlsx(req: any, res: any, campaignId: string) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return

  const campaignRows = await rows(
    await db(
      `group_buy_campaigns?select=*&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&id=eq.${encodeURIComponent(campaignId)}&limit=1`,
      { method: 'GET' },
    ),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaignRows[0]
  if (!campaign) return json(res, 404, { error: '找不到團購。' })

  const [orderRows, shippingRows] = await Promise.all([
    rows(
      await db(
        `group_buy_orders?select=*&campaign_id=eq.${encodeURIComponent(campaignId)}&order=created_at.desc`,
        { method: 'GET' },
      ),
      'ORDER_LIST_FAILED',
    ),
    rows(
      await db(
        `group_buy_shipping_methods?select=id,label,method_type&campaign_id=eq.${encodeURIComponent(campaignId)}`,
        { method: 'GET' },
      ),
      'SHIPPING_READ_FAILED',
    ),
  ])

  const shippingMap = new Map(shippingRows.map((row: any) => [String(row.id), row]))
  const orderIds = orderRows.map((row: any) => String(row.id)).filter(Boolean)

  let itemRows: any[] = []
  let paymentRows: any[] = []
  if (orderIds.length) {
    const filter = `in.(${orderIds.join(',')})`
    ;[itemRows, paymentRows] = await Promise.all([
      rows(
        await db(
          `group_buy_order_items?select=*&order_id=${filter}&order=created_at.asc`,
          { method: 'GET' },
        ),
        'ORDER_ITEM_READ_FAILED',
      ),
      rows(
        await db(
          `group_buy_payment_reports?select=*&order_id=${filter}&order=created_at.desc`,
          { method: 'GET' },
        ),
        'PAYMENT_READ_FAILED',
      ),
    ])
  }

  const search = text(req?.query?.search, 200).toLowerCase()
  const paymentStatus = text(req?.query?.paymentStatus, 50)
  const shippingLabel = text(req?.query?.shippingLabel, 200)
  const orderStatus = text(req?.query?.orderStatus, 50)

  const selectedOrders = orderRows.filter((order: any) => {
    const orderShippingLabel = String(shippingMap.get(String(order.shipping_method_id))?.label || '—')
    const matchesSearch = !search || [
      order.order_code,
      order.customer_name,
      order.customer_phone,
      order.customer_email,
    ].some((value) => String(value || '').toLowerCase().includes(search))

    return (
      matchesSearch &&
      (!paymentStatus || String(order.payment_status) === paymentStatus) &&
      (!shippingLabel || orderShippingLabel === shippingLabel) &&
      (!orderStatus || String(order.status) === orderStatus)
    )
  })

  const selectedOrderIds = new Set(selectedOrders.map((order: any) => String(order.id)))
  const selectedItems = itemRows.filter((item: any) => selectedOrderIds.has(String(item.order_id)))
  const selectedPayments = paymentRows.filter((payment: any) => selectedOrderIds.has(String(payment.order_id)))

  const itemsByOrder = new Map<string, any[]>()
  for (const item of selectedItems) {
    const key = String(item.order_id)
    itemsByOrder.set(key, [...(itemsByOrder.get(key) || []), item])
  }

  const paymentsByOrder = new Map<string, any[]>()
  for (const report of selectedPayments) {
    const key = String(report.order_id)
    paymentsByOrder.set(key, [...(paymentsByOrder.get(key) || []), report])
  }

  const orderById = new Map(selectedOrders.map((order: any) => [String(order.id), order]))

  const orderRowsForSheet: XlsxCellValue[][] = [
    [
      '訂單編號',
      '登記時間',
      '訂購人',
      '手機',
      'Email',
      '商品明細',
      '總數量',
      '商品小計',
      '運費',
      '應付總額',
      '配送方式',
      '自取門市',
      '門市地址',
      '取貨日期',
      '訂單狀態',
      '付款狀態',
      '客戶備註',
      '管理備註',
    ],
    ...selectedOrders.map((order: any) => {
      const orderItems = itemsByOrder.get(String(order.id)) || []
      const shipping = shippingMap.get(String(order.shipping_method_id))
      return [
        order.order_code,
        formatTaipeiDate(order.created_at),
        order.customer_name,
        order.customer_phone,
        order.customer_email,
        orderItems.map((item: any) => `${item.product_title}×${item.quantity}${item.unit_label || ''}`).join('、'),
        Number(order.total_quantity || 0),
        Number(order.item_subtotal_ntd || 0),
        Number(order.shipping_fee_ntd || 0),
        Number(order.total_amount_ntd || 0),
        shipping?.label || '—',
        order.pickup_store_name || '',
        order.pickup_store_address || '',
        order.pickup_date || '',
        groupBuyOrderStatusLabel(String(order.status || '')),
        groupBuyPaymentStatusLabel(String(order.payment_status || '')),
        order.customer_note || '',
        order.admin_note || '',
      ]
    }),
  ]

  const productSummary = new Map<string, {
    productTitle: string
    unitLabel: string
    totalQuantity: number
    paidQuantity: number
    salesAmount: number
    paidSalesAmount: number
    costAmount: number
    paidCostAmount: number
    costKnown: boolean
  }>()

  for (const item of selectedItems) {
    const order = orderById.get(String(item.order_id))
    if (!order || ['cancelled', 'refunded'].includes(String(order.status || ''))) continue

    const key = String(item.product_id || item.product_title)
    const current = productSummary.get(key) || {
      productTitle: String(item.product_title || '未命名商品'),
      unitLabel: String(item.unit_label || ''),
      totalQuantity: 0,
      paidQuantity: 0,
      salesAmount: 0,
      paidSalesAmount: 0,
      costAmount: 0,
      paidCostAmount: 0,
      costKnown: true,
    }

    const quantity = Number(item.quantity || 0)
    const lineTotal = Number(item.line_total_ntd || 0)
    const costKnown = item.line_cost_ntd != null
    const lineCost = costKnown ? Number(item.line_cost_ntd || 0) : 0
    const isPaid = String(order.payment_status || '') === 'verified'

    current.totalQuantity += quantity
    current.salesAmount += lineTotal
    current.costAmount += lineCost
    current.costKnown = current.costKnown && costKnown

    if (isPaid) {
      current.paidQuantity += quantity
      current.paidSalesAmount += lineTotal
      current.paidCostAmount += lineCost
    }

    productSummary.set(key, current)
  }

  const productRowsForSheet: XlsxCellValue[][] = [
    [
      '商品名稱',
      '單位',
      '已登記數量',
      '已付款數量',
      '未付款數量',
      '平均售價',
      '平均成本',
      '銷售總額',
      '已付款銷售額',
      '預估進貨成本',
      '已付款進貨成本',
      '預估毛利',
      '已付款毛利',
    ],
    ...Array.from(productSummary.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .map((item) => [
        item.productTitle,
        item.unitLabel,
        item.totalQuantity,
        item.paidQuantity,
        Math.max(0, item.totalQuantity - item.paidQuantity),
        item.totalQuantity ? Math.round(item.salesAmount / item.totalQuantity) : 0,
        item.costKnown && item.totalQuantity ? Math.round(item.costAmount / item.totalQuantity) : '',
        item.salesAmount,
        item.paidSalesAmount,
        item.costKnown ? item.costAmount : '',
        item.costKnown ? item.paidCostAmount : '',
        item.costKnown ? item.salesAmount - item.costAmount : '',
        item.costKnown ? item.paidSalesAmount - item.paidCostAmount : '',
      ]),
  ]

  const paymentRowsForSheet: XlsxCellValue[][] = [
    [
      '訂單編號',
      '客戶姓名',
      '應付金額',
      '匯款人',
      '帳號後五碼',
      '匯款時間',
      '回報金額',
      '回報狀態',
      '訂單付款狀態',
      '審核說明',
    ],
  ]

  for (const order of selectedOrders) {
    const reports = paymentsByOrder.get(String(order.id)) || []
    if (!reports.length) {
      paymentRowsForSheet.push([
        order.order_code,
        order.customer_name,
        Number(order.total_amount_ntd || 0),
        '',
        '',
        '',
        '',
        '尚未回報',
        groupBuyPaymentStatusLabel(String(order.payment_status || '')),
        '',
      ])
      continue
    }

    for (const report of reports) {
      paymentRowsForSheet.push([
        order.order_code,
        order.customer_name,
        Number(order.total_amount_ntd || 0),
        report.payer_name || '',
        report.account_last_five || '',
        formatTaipeiDate(report.transferred_at),
        Number(report.amount_ntd || 0),
        groupBuyPaymentReportStatusLabel(String(report.status || '')),
        groupBuyPaymentStatusLabel(String(order.payment_status || '')),
        report.review_note || '',
      ])
    }
  }

  const shippingRowsForSheet: XlsxCellValue[][] = [
    [
      '訂單編號',
      '收件人',
      '收件電話',
      '郵遞區號',
      '配送地址',
      '配送方式',
      '自取縣市',
      '自取門市',
      '門市地址',
      '門市電話',
      '取貨日期',
      '商品明細',
      '總數量',
      '運費',
      '訂單狀態',
      '付款狀態',
      '客戶備註',
      '管理備註',
    ],
    ...selectedOrders.map((order: any) => {
      const orderItems = itemsByOrder.get(String(order.id)) || []
      const shipping = shippingMap.get(String(order.shipping_method_id))
      return [
        order.order_code,
        order.recipient_name || order.customer_name || '',
        order.recipient_phone || order.customer_phone || '',
        order.postal_code || '',
        order.shipping_address || '',
        shipping?.label || '—',
        order.pickup_store_city || '',
        order.pickup_store_name || '',
        order.pickup_store_address || '',
        order.pickup_store_phone || '',
        order.pickup_date || '',
        orderItems.map((item: any) => `${item.product_title}×${item.quantity}${item.unit_label || ''}`).join('、'),
        Number(order.total_quantity || 0),
        Number(order.shipping_fee_ntd || 0),
        groupBuyOrderStatusLabel(String(order.status || '')),
        groupBuyPaymentStatusLabel(String(order.payment_status || '')),
        order.customer_note || '',
        order.admin_note || '',
      ]
    }),
  ]

  const pickupSummary = new Map<string, {
    city: string
    storeName: string
    address: string
    pickupDate: string
    totalOrders: number
    totalQuantity: number
    paidOrders: number
  }>()

  for (const order of selectedOrders) {
    if (!order.pickup_store_name) continue
    const key = `${order.pickup_store_id || order.pickup_store_name}|${order.pickup_date || ''}`
    const current = pickupSummary.get(key) || {
      city: order.pickup_store_city || '',
      storeName: order.pickup_store_name || '',
      address: order.pickup_store_address || '',
      pickupDate: order.pickup_date || '',
      totalOrders: 0,
      totalQuantity: 0,
      paidOrders: 0,
    }
    current.totalOrders += 1
    current.totalQuantity += Number(order.total_quantity || 0)
    if (order.payment_status === 'verified') current.paidOrders += 1
    pickupSummary.set(key, current)
  }

  const pickupSummaryRows: XlsxCellValue[][] = [
    ['縣市', '取貨門市', '門市地址', '取貨日期', '訂單筆數', '已付款筆數', '總條數'],
    ...Array.from(pickupSummary.values()).map((item) => [
      item.city,
      item.storeName,
      item.address,
      item.pickupDate,
      item.totalOrders,
      item.paidOrders,
      item.totalQuantity,
    ]),
  ]

  const workbook = buildXlsxWorkbook([
    { name: '訂單總表', rows: orderRowsForSheet },
    { name: '商品彙總', rows: productRowsForSheet },
    { name: '付款核對', rows: paymentRowsForSheet },
    { name: '配送名單', rows: shippingRowsForSheet },
    { name: '門市取貨彙總', rows: pickupSummaryRows },
  ])

  const stamp = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).replace(/-/g, '')
  const fileName = `${safeDownloadFileName(campaign.title)}_團購報表_${stamp}.xlsx`

  // Binary downloads must be written with the native response stream. Some local
  // dev adapters do not implement res.status(...).send(Buffer) correctly and
  // return HTTP 500 even though the workbook was generated successfully.
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="group-buy-report.xlsx"; filename*=UTF-8''${encodeURIComponent(fileName)}`)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Length', String(workbook.length))

  if (typeof res.end === 'function') {
    res.end(workbook)
    return
  }

  // Fallback for Vercel-compatible response objects.
  return res.status(200).send(workbook)
}

async function adminSetCampaignStatus(req: any, res: any, body: any) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const campaignId = text(body.campaignId, 80)
  const status = text(body.status, 50)
  const force = body.force === true
  const allowed = ['draft','registration_open','registration_closed','payment_open','payment_closed','confirmed','ordering','fulfilling','completed','cancelled']
  if (!allowed.includes(status)) return json(res, 400, { error: '團購狀態不正確。' })

  const campaigns = await rows(
    await db(`group_buy_campaigns?select=*&id=eq.${encodeURIComponent(campaignId)}&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaigns[0]
  if (!campaign) return json(res, 404, { error: '找不到團購。' })
  const progress = await campaignProgress(campaign)

  if (status === 'payment_open') {
    if (!force && progress.registrationValue < Number(campaign.min_registration_value || 0)) {
      return json(res, 409, { error: `目前已登記 ${progress.registrationValue}，尚未達通知付款門檻 ${campaign.min_registration_value}。` })
    }
    const bank = resolvedBank(campaign, auth.workspace)
    const bankComplete = bank.name && bank.code && bank.account && bank.accountName
    if (!bankComplete) return json(res, 400, { error: '開放付款前，請先完整填寫收款銀行、代碼、帳號及戶名。' })
    if (!campaign.payment_deadline) return json(res, 400, { error: '開放付款前，請先設定付款期限。' })
    if (new Date(campaign.payment_deadline).getTime() <= Date.now()) return json(res, 400, { error: '付款期限必須晚於目前時間。' })
  }
  if (status === 'confirmed' && progress.paidValue < Number(campaign.min_paid_value || 0)) {
    return json(res, 409, { error: `目前已確認付款 ${progress.paidValue}，尚未達正式成團門檻 ${campaign.min_paid_value}。` })
  }
  if (['confirmed', 'ordering', 'fulfilling'].includes(status) && !progress.allActiveOrdersPaid) {
    return json(res, 409, { error: `目前有效訂單已確認付款 ${progress.verifiedOrderCount}/${progress.activeOrderCount} 筆；必須全數確認付款後才能正式成團、訂貨或出貨。` })
  }

  const updated = await rows(
    await db(`group_buy_campaigns?id=eq.${encodeURIComponent(campaignId)}&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    'CAMPAIGN_STATUS_UPDATE_FAILED',
  )
  if (!updated[0]) return json(res, 404, { error: '找不到團購。' })

  if (status === 'payment_open') {
    const paymentOrders = await rows(await db(`group_buy_orders?select=id,order_code,customer_email&campaign_id=eq.${encodeURIComponent(campaignId)}&payment_status=eq.not_open`, { method: 'GET' }), 'PAYMENT_OPEN_ORDER_READ_FAILED')
    const response = await db(`group_buy_orders?campaign_id=eq.${encodeURIComponent(campaignId)}&status=in.(registered,waiting_group,threshold_reached)&payment_status=eq.not_open`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'payment_open', payment_status: 'pending' }),
    })
    if (!response.ok) throw new Error(`ORDER_PAYMENT_OPEN_FAILED:${await response.text()}`)
    for (const paymentOrder of paymentOrders) {
      await createNotification({
        campaignId,
        orderId: paymentOrder.id,
        eventType: 'payment_opened',
        recipientEmail: paymentOrder.customer_email,
        subject: `團購已開放付款：${paymentOrder.order_code}`,
        html: `<p>訂單 ${paymentOrder.order_code} 已開放付款，請使用專屬訂單查詢連結查看付款資料。</p>`,
        dedupeKey: `payment_opened:${paymentOrder.id}`,
      })
    }
  }
  if (status === 'confirmed') {
    const confirmedOrders = await rows(await db(`group_buy_orders?select=id,order_code,customer_email&campaign_id=eq.${encodeURIComponent(campaignId)}&payment_status=eq.verified`, { method: 'GET' }), 'CONFIRMED_ORDER_READ_FAILED')
    const response = await db(`group_buy_orders?campaign_id=eq.${encodeURIComponent(campaignId)}&payment_status=eq.verified`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'confirmed' }),
    })
    if (!response.ok) throw new Error(`ORDER_CONFIRM_FAILED:${await response.text()}`)
    for (const confirmedOrder of confirmedOrders) {
      await createNotification({
        campaignId,
        orderId: confirmedOrder.id,
        eventType: 'campaign_confirmed',
        recipientEmail: confirmedOrder.customer_email,
        subject: `團購正式成團：${confirmedOrder.order_code}`,
        html: `<p>訂單 ${confirmedOrder.order_code} 所屬團購已正式成團。</p>`,
        dedupeKey: `campaign_confirmed:${confirmedOrder.id}`,
      })
    }
  }

  return json(res, 200, { ok: true })
}

async function adminVerifyPayment(req: any, res: any, body: any) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const orderId = text(body.orderId, 80)
  const reportId = text(body.paymentReportId, 80)
  // 僅接受真正的 boolean true，避免字串 "false" 被 Boolean() 誤判為 true。
  const accepted = body.accepted === true

  const orderRows = await rows(
    await db(`group_buy_orders?select=*&id=eq.${encodeURIComponent(orderId)}&limit=1`, { method: 'GET' }),
    'ORDER_READ_FAILED',
  )
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到訂單。' })
  const campaigns = await rows(
    await db(`group_buy_campaigns?select=id,status&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&id=eq.${encodeURIComponent(order.campaign_id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaigns[0]
  if (!campaign) return json(res, 403, { error: '無權限。' })
  const reportRows = await rows(
    await db(`group_buy_payment_reports?select=*&id=eq.${encodeURIComponent(reportId)}&order_id=eq.${encodeURIComponent(orderId)}&limit=1`, { method: 'GET' }),
    'PAYMENT_READ_FAILED',
  )
  const report = reportRows[0]
  if (!report) return json(res, 404, { error: '找不到付款回報。' })

  if (accepted && Number(report.amount_ntd || 0) !== Number(order.total_amount_ntd || 0)) {
    return json(res, 400, { error: '回報金額與訂單應付金額不符，不能確認付款。' })
  }

  if (!accepted && ['confirmed', 'supplier_ordered', 'preparing', 'shipped', 'ready_for_pickup', 'completed', 'refund_pending', 'refunded'].includes(String(order.status || ''))) {
    return json(res, 409, { error: '此訂單已進入正式成團或出貨流程，不能直接退回付款；請先處理取消或退款流程。' })
  }

  const reviewedAt = new Date().toISOString()
  const nextOrderStatus = accepted ? 'payment_verified' : 'payment_open'
  const nextPaymentStatus = accepted ? 'verified' : 'rejected'
  const nextReportStatus = accepted ? 'verified' : 'rejected'
  const reviewNote = text(body.reviewNote, 1000) || (accepted ? null : '匯款資料不符，請重新回報。')

  // 先更新訂單，再更新付款回報；若第二步失敗，補償還原訂單，避免回報已退回但訂單仍顯示已付款。
  const orderResponse = await db(`group_buy_orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: nextOrderStatus,
      payment_status: nextPaymentStatus,
      payment_verified_at: accepted ? reviewedAt : null,
    }),
  })
  if (!orderResponse.ok) throw new Error(`ORDER_PAYMENT_REVIEW_FAILED:${await orderResponse.text()}`)

  const reportResponse = await db(`group_buy_payment_reports?id=eq.${encodeURIComponent(reportId)}&order_id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: nextReportStatus,
      reviewed_by_user_id: auth.user.userId,
      reviewed_at: reviewedAt,
      review_note: reviewNote,
    }),
  })
  if (!reportResponse.ok) {
    await db(`group_buy_orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: order.status,
        payment_status: order.payment_status,
        payment_verified_at: order.payment_verified_at,
      }),
    })
    throw new Error(`PAYMENT_REVIEW_FAILED:${await reportResponse.text()}`)
  }

  if (accepted) {
    const cancelOthers = await db(`group_buy_payment_reports?order_id=eq.${encodeURIComponent(orderId)}&id=neq.${encodeURIComponent(reportId)}&status=eq.reported`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled', reviewed_by_user_id: auth.user.userId, reviewed_at: reviewedAt, review_note: '已有其他付款回報確認完成。' }),
    })
    if (!cancelOthers.ok) throw new Error(`OTHER_PAYMENT_CANCEL_FAILED:${await cancelOthers.text()}`)
  }

  await db('group_buy_order_events', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      actor_user_id: auth.user.userId,
      actor_role: 'owner',
      event_type: accepted ? 'payment_verified' : 'payment_rejected',
      from_status: order.status,
      to_status: nextOrderStatus,
      message: accepted ? '管理者確認付款。' : `管理者退回付款回報：${reviewNote}`,
    }),
  })

  let notificationDelivery: NotificationDeliveryResult | null = null
  if (EMAIL_RE.test(String(order.customer_email || ''))) {
    const orderUrl = customerOrderUrl(order.order_code)
    notificationDelivery = await createNotification({
      campaignId: order.campaign_id,
      orderId,
      eventType: accepted ? 'payment_verified' : 'payment_rejected',
      recipientEmail: order.customer_email,
      subject: accepted
        ? `團購付款已確認｜${order.order_code}`
        : `站內通知｜付款資料需重新回報：${order.order_code}`,
      html: accepted
        ? emailLayout(
            '團購付款已確認',
            `<p style="line-height:1.8">${htmlEscape(order.customer_name || '您好')}，您的團購款項已完成核對。</p>
             <table style="width:100%;border-collapse:collapse;margin:18px 0">
               <tr><td style="padding:8px 0;color:#64748b">訂單編號</td><td style="padding:8px 0;font-weight:700;text-align:right">${htmlEscape(order.order_code)}</td></tr>
               <tr><td style="padding:8px 0;color:#64748b">確認金額</td><td style="padding:8px 0;font-weight:700;text-align:right">${htmlEscape(formatNtd(order.total_amount_ntd))}</td></tr>
               <tr><td style="padding:8px 0;color:#64748b">付款狀態</td><td style="padding:8px 0;font-weight:700;text-align:right;color:#047857">已確認付款</td></tr>
             </table>
             <p style="line-height:1.8">後續訂貨與出貨進度，可登入網站「我的團購訂單」查看。</p>
             ${emailActionButton(orderUrl, '查看我的團購訂單')}`,
          )
        : `<p>訂單 ${htmlEscape(order.order_code)} 的付款資料已退回，原因：${htmlEscape(reviewNote)}</p><p>付款回報表單已重新開放，請登入網站「我的團購訂單」修正資料後再次送出。</p>`,
      dedupeKey: accepted
        ? `payment_verified:${orderId}:${reportId}`
        : `payment_rejected:${reportId}:${Date.now()}`,
      sendEmail: accepted,
    })
  }

  return json(res, 200, {
    ok: true,
    orderStatus: nextOrderStatus,
    paymentStatus: nextPaymentStatus,
    paymentReportStatus: nextReportStatus,
    notificationStatus: notificationDelivery?.status || null,
    notificationProvider: notificationDelivery?.provider || null,
    notificationError: notificationDelivery?.error || null,
  })
}

async function adminUpdateOrderStatus(req: any, res: any, body: any) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const orderId = text(body.orderId, 80)
  const status = text(body.status, 50)
  const allowed = ['registered','waiting_group','confirmed','supplier_ordered','preparing','shipped','ready_for_pickup','completed','cancelled','refund_pending','refunded']
  if (['payment_open', 'payment_reported', 'payment_verified'].includes(status)) {
    return json(res, 400, { error: '待付款、付款核對中及已付款必須由付款流程自動更新，不能由訂單狀態下拉選單直接修改。' })
  }
  if (!allowed.includes(status)) return json(res, 400, { error: '訂單狀態不正確。' })
  const orderRows = await rows(
    await db(`group_buy_orders?select=*&id=eq.${encodeURIComponent(orderId)}&limit=1`, { method: 'GET' }),
    'ORDER_READ_FAILED',
  )
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到訂單。' })
  const campaigns = await rows(
    await db(`group_buy_campaigns?select=*&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&id=eq.${encodeURIComponent(order.campaign_id)}&limit=1`, { method: 'GET' }),
    'CAMPAIGN_READ_FAILED',
  )
  const campaign = campaigns[0]
  if (!campaign) return json(res, 403, { error: '無權限。' })
  const fulfillmentStatuses = ['confirmed', 'supplier_ordered', 'preparing', 'shipped', 'ready_for_pickup', 'completed']
  if (fulfillmentStatuses.includes(status)) {
    if (order.payment_status !== 'verified') {
      return json(res, 409, { error: '此訂單尚未確認付款，不能進入訂貨或出貨流程。' })
    }
    const progress = await campaignProgress(campaign)
    if (!progress.allActiveOrdersPaid) {
      return json(res, 409, { error: `全團尚未收齊款項（${progress.verifiedOrderCount}/${progress.activeOrderCount} 筆已確認），不能向供應商訂貨或出貨。` })
    }
  }
  const response = await db(`group_buy_orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status,
      shipped_at: status === 'shipped' ? new Date().toISOString() : undefined,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined,
      cancelled_at: status === 'cancelled' ? new Date().toISOString() : undefined,
    }),
  })
  if (!response.ok) throw new Error(`ORDER_STATUS_UPDATE_FAILED:${await response.text()}`)
  await db('group_buy_order_events', {
    method: 'POST',
    body: JSON.stringify({
      order_id: orderId,
      actor_user_id: auth.user.userId,
      actor_role: 'owner',
      event_type: 'status_changed',
      from_status: order.status,
      to_status: status,
      message: `管理員將訂單狀態更新為 ${status}。`,
    }),
  })
  const notificationEvent: Record<string, string> = {
    shipped: 'shipped', ready_for_pickup: 'ready_for_pickup', cancelled: 'cancelled', refunded: 'refunded',
  }
  let notificationDelivery: NotificationDeliveryResult | null = null
  if (notificationEvent[status] && EMAIL_RE.test(String(order.customer_email || ''))) {
    const orderUrl = customerOrderUrl(order.order_code)
    const shippedAt = status === 'shipped' ? new Date().toISOString() : null
    notificationDelivery = await createNotification({
      campaignId: order.campaign_id,
      orderId,
      eventType: notificationEvent[status],
      recipientEmail: order.customer_email,
      subject: status === 'shipped'
        ? `團購商品已出貨｜${order.order_code}`
        : status === 'ready_for_pickup'
          ? `站內通知｜團購商品可取貨：${order.order_code}`
          : `站內通知｜團購訂單狀態更新：${order.order_code}`,
      html: status === 'shipped'
        ? emailLayout(
            '團購商品已出貨',
            `<p style="line-height:1.8">${htmlEscape(order.customer_name || '您好')}，您的團購商品已安排出貨。</p>
             <table style="width:100%;border-collapse:collapse;margin:18px 0">
               <tr><td style="padding:8px 0;color:#64748b">訂單編號</td><td style="padding:8px 0;font-weight:700;text-align:right">${htmlEscape(order.order_code)}</td></tr>
               <tr><td style="padding:8px 0;color:#64748b">出貨時間</td><td style="padding:8px 0;font-weight:700;text-align:right">${htmlEscape(formatTaipeiDate(shippedAt))}</td></tr>
               ${order.shipping_carrier ? `<tr><td style="padding:8px 0;color:#64748b">物流公司</td><td style="padding:8px 0;font-weight:700;text-align:right">${htmlEscape(order.shipping_carrier)}</td></tr>` : ''}
               ${order.tracking_number ? `<tr><td style="padding:8px 0;color:#64748b">物流單號</td><td style="padding:8px 0;font-weight:700;text-align:right">${htmlEscape(order.tracking_number)}</td></tr>` : ''}
             </table>
             <p style="line-height:1.8">配送進度請以物流實際作業為準；收到商品後，請依商品包裝上的保存方式處理。</p>
             ${emailActionButton(orderUrl, '查看配送進度')}`,
          )
        : status === 'ready_for_pickup'
          ? `<p>訂單 ${htmlEscape(order.order_code)} 的商品已可取貨。</p><p>請登入網站「我的團購訂單」查看取貨資訊。</p>`
          : `<p>訂單 ${htmlEscape(order.order_code)} 的狀態已更新，請登入網站「我的團購訂單」查看。</p>`,
      dedupeKey: `${notificationEvent[status]}:${orderId}`,
      sendEmail: status === 'shipped',
    })
  }
  return json(res, 200, {
    ok: true,
    notificationStatus: notificationDelivery?.status || null,
    notificationProvider: notificationDelivery?.provider || null,
    notificationError: notificationDelivery?.error || null,
  })
}

async function adminUpdateOrderNote(req: any, res: any, body: any) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return
  const orderId = text(body.orderId, 80)
  const orderRows = await rows(await db(`group_buy_orders?select=id,campaign_id&id=eq.${encodeURIComponent(orderId)}&limit=1`, { method: 'GET' }), 'ORDER_READ_FAILED')
  const order = orderRows[0]
  if (!order) return json(res, 404, { error: '找不到訂單。' })
  const campaigns = await rows(await db(`group_buy_campaigns?select=id&id=eq.${encodeURIComponent(order.campaign_id)}&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&limit=1`, { method: 'GET' }), 'CAMPAIGN_READ_FAILED')
  if (!campaigns[0]) return json(res, 403, { error: '無權限。' })
  const response = await db(`group_buy_orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: 'PATCH', body: JSON.stringify({ admin_note: text(body.adminNote, 2000) || null }),
  })
  if (!response.ok) throw new Error(`ORDER_NOTE_UPDATE_FAILED:${await response.text()}`)
  return json(res, 200, { ok: true })
}


const GROUP_BUY_PRODUCT_IMAGE_TYPES = [
  'hero',
  'cutaway',
  'size_diagram',
  'afternoon_tea',
  'family_lakeside',
  'office_sharing',
] as const

type GroupBuyProductImageType = typeof GROUP_BUY_PRODUCT_IMAGE_TYPES[number]

const GROUP_BUY_IMAGE_BUCKET = text(process.env.GROUP_BUY_IMAGE_BUCKET || 'images', 100) || 'images'
const GROUP_BUY_IMAGE_MAX_BYTES = 2 * 1024 * 1024

function groupBuyImageType(value: any): GroupBuyProductImageType | null {
  const result = text(value, 50) as GroupBuyProductImageType
  return GROUP_BUY_PRODUCT_IMAGE_TYPES.includes(result) ? result : null
}

function decodeGroupBuyImage(input: any) {
  const raw = text(input, 10 * 1024 * 1024)
  const match = raw.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=\r\n]+)$/i)

  if (!match) throw new Error('IMAGE_DATA_FORMAT_INVALID:400:圖片資料格式不正確。')

  const mimeType = match[1].toLowerCase().replace('image/jpg', 'image/jpeg')
  const buffer = Buffer.from(match[2].replace(/\s+/g, ''), 'base64')
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'

  if (!buffer.length) throw new Error('IMAGE_DATA_EMPTY:400:圖片內容為空。')
  if (buffer.length > GROUP_BUY_IMAGE_MAX_BYTES) {
    throw new Error('IMAGE_TOO_LARGE:400:圖片處理後仍超過 2MB。')
  }

  const isJpeg =
    mimeType === 'image/jpeg' &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff

  const isPng =
    mimeType === 'image/png' &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))

  const isWebp =
    mimeType === 'image/webp' &&
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'

  if (!isJpeg && !isPng && !isWebp) {
    throw new Error('IMAGE_CONTENT_INVALID:400:檔案內容不是有效圖片。')
  }

  return { buffer, mimeType, extension }
}

async function groupBuyAdminProductContext(req: any, res: any, productId: string) {
  const auth = await requireWorkspace(req, res)
  if (!auth) return null

  if (!productId) {
    json(res, 400, { error: '缺少商品編號。' })
    return null
  }

  const productRows = await rows(
    await db(`group_buy_products?select=*&id=eq.${encodeURIComponent(productId)}&limit=1`, {
      method: 'GET',
    }),
    'PRODUCT_READ_FAILED',
  )

  const product = productRows[0]
  if (!product) {
    json(res, 404, { error: '找不到商品。' })
    return null
  }

  const campaignRows = await rows(
    await db(
      `group_buy_campaigns?select=id,slug,title,workspace_id&id=eq.${encodeURIComponent(product.campaign_id)}&workspace_id=eq.${encodeURIComponent(auth.workspace.id)}&limit=1`,
      { method: 'GET' },
    ),
    'CAMPAIGN_READ_FAILED',
  )

  const campaign = campaignRows[0]
  if (!campaign) {
    json(res, 403, { error: '無權限管理此商品。' })
    return null
  }

  return { auth, product, campaign }
}

async function uploadGroupBuyImageObject(productId: string, imageBase64: string) {
  const { buffer, mimeType, extension } = decodeGroupBuyImage(imageBase64)
  const objectPath = `group-buy/products/${productId}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const storageUrl =
    `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${GROUP_BUY_IMAGE_BUCKET}/${objectPath}`

  const uploadResponse = await fetch(storageUrl, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': mimeType,
      'Cache-Control': '31536000',
      'x-upsert': 'false',
    },
    body: buffer,
  })

  if (!uploadResponse.ok) {
    throw new Error(`GROUP_BUY_IMAGE_UPLOAD_FAILED:${uploadResponse.status}:${await uploadResponse.text()}`)
  }

  return {
    imageUrl:
      `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${GROUP_BUY_IMAGE_BUCKET}/${objectPath}`,
    objectPath,
    sizeBytes: buffer.length,
  }
}

function groupBuyStorageObjectPath(imageUrl: string) {
  try {
    const parsed = new URL(imageUrl)
    const marker = `/storage/v1/object/public/${GROUP_BUY_IMAGE_BUCKET}/`
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex < 0) return ''
    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length))
  } catch {
    return ''
  }
}

async function deleteGroupBuyImageObject(imageUrl: string) {
  const objectPath = groupBuyStorageObjectPath(imageUrl)
  if (!objectPath) return

  const deleteResponse = await fetch(
    `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/${GROUP_BUY_IMAGE_BUCKET}/${objectPath}`,
    {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    },
  )

  if (!deleteResponse.ok && deleteResponse.status !== 404) {
    console.error(
      'GROUP_BUY_IMAGE_STORAGE_DELETE_FAILED',
      deleteResponse.status,
      await deleteResponse.text().catch(() => ''),
    )
  }
}


async function syncGroupBuyProductCover(productId: string) {
  const imageRows = await rows(
    await db(
      `group_buy_product_images?select=image_url&product_id=eq.${encodeURIComponent(productId)}&is_active=eq.true&order=sort_order.asc,created_at.asc&limit=1`,
      { method: 'GET' },
    ),
    'PRODUCT_IMAGE_COVER_READ_FAILED',
  )

  const coverUrl = text(imageRows[0]?.image_url, 3000) || null
  const response = await db(
    `group_buy_products?id=eq.${encodeURIComponent(productId)}`,
    { method: 'PATCH', body: JSON.stringify({ image_url: coverUrl }) },
  )

  if (!response.ok) throw new Error(`PRODUCT_COVER_UPDATE_FAILED:${await response.text()}`)
}

async function publicProductDetail(
  res: any,
  campaignSlug: string,
  productId: string,
) {
  const campaignRows = await rows(
    await db(
      `group_buy_campaigns?select=*&slug=eq.${encodeURIComponent(campaignSlug)}&limit=1`,
      { method: 'GET' },
    ),
    'CAMPAIGN_READ_FAILED',
  )

  const campaign = campaignRows[0]
  if (!campaign) return json(res, 404, { error: '找不到團購活動。' })

  const productRows = await rows(
    await db(
      `group_buy_products?select=*&id=eq.${encodeURIComponent(productId)}&campaign_id=eq.${encodeURIComponent(campaign.id)}&is_active=eq.true&limit=1`,
      { method: 'GET' },
    ),
    'PRODUCT_READ_FAILED',
  )

  const product = productRows[0]
  if (!product) return json(res, 404, { error: '找不到商品。' })

  const imageRows = await rows(
    await db(
      `group_buy_product_images?select=*&product_id=eq.${encodeURIComponent(product.id)}&is_active=eq.true&order=sort_order.asc,created_at.asc`,
      { method: 'GET' },
    ),
    'PRODUCT_IMAGE_LIST_FAILED',
  )

  return json(res, 200, {
    campaign: {
      id: campaign.id,
      slug: campaign.slug,
      title: campaign.title,
      status: campaign.status,
    },
    product: {
      ...camelProduct(product),
      shortDescription: product.short_description || '',
      longDescription: product.long_description || '',
      originalPriceNtd:
        product.original_price_ntd == null
          ? null
          : Number(product.original_price_ntd),
      weightText: product.weight_text || '',
      dimensionsText: product.dimensions_text || '',
      storageText: product.storage_text || '',
      vegetarianText: product.vegetarian_text || '',
      allergenText: product.allergen_text || '',
      ingredientsSummary: product.ingredients_summary || '',
      servingSuggestion: product.serving_suggestion || '',
      productNotice: product.product_notice || '',
      contentReviewStatus: product.content_review_status || '',
      detailSlug: product.detail_slug || '',
    },
    images: imageRows.map((image: any) => ({
      id: image.id,
      imageType: image.image_type,
      imageUrl: image.image_url,
      altText: image.alt_text || product.title,
      sortOrder: Number(image.sort_order || 0),
      isAiGenerated: Boolean(image.is_ai_generated),
    })),
  })
}

async function adminGenerateProductImagePrompts(req: any, res: any, body: any) {
  const productId = text(body.productId, 80)
  const context = await groupBuyAdminProductContext(req, res, productId)
  if (!context) return

  const { product, campaign } = context
  const title = text(product.title, 200)
  const description = text(product.description, 1000)

  const promptText: Record<GroupBuyProductImageType, string> = {
    hero: `高級商業食品攝影，${title}完整商品搭配一至二片切片，奶油白背景，忠實呈現商品外觀與配料，商品占畫面60%至75%，不要人物、文字、Logo、浮水印或品牌包裝。商品資料：${description}`,
    cutaway: `近距離寫實切面攝影，忠實呈現${title}的蛋糕體、奶霜與資料中已確認配料，不得自行增加成分，不要人物、文字、Logo或浮水印。商品資料：${description}`,
    size_diagram: `尺寸示意底圖，只呈現一條完整${title}，乾淨淺色背景，商品比例自然，圖片本體不要任何文字、箭頭或數字，尺寸資料由網站介面另外疊加。`,
    afternoon_tea: `明亮窗邊下午茶情境，一位成年女性完整頭部入鏡，人物四周保留安全空間，前景清楚呈現${title}完整商品與切片，人物為輔，不要文字、Logo、品牌包裝或浮水印。`,
    family_lakeside: `一家四口湖邊郊外分享${title}，父母與兩位孩子頭部完整入鏡，前景商品和切片外觀一致，湖泊、樹木、草地與自然光，溫馨寫實，不要文字、Logo或浮水印。`,
    office_sharing: `三至五位成年上班族在明亮辦公室分享${title}，所有人物頭部完整入鏡，桌面前景清楚呈現完整商品與數片一致切片，氣氛自然，不要文字、Logo或浮水印。`,
  }

  return json(res, 200, {
    prompts: {
      campaignId: campaign.id,
      campaignSlug: campaign.slug,
      productId: product.id,
      productTitle: title,
      generatedAt: new Date().toISOString(),
      images: GROUP_BUY_PRODUCT_IMAGE_TYPES.map((imageType) => ({
        imageType,
        prompt: promptText[imageType],
      })),
    },
    generatedImage: false,
    provider: null,
  })
}

async function adminListProductImages(req: any, res: any, productId: string) {
  const context = await groupBuyAdminProductContext(req, res, productId)
  if (!context) return

  const imageRows = await rows(
    await db(
      `group_buy_product_images?select=*&product_id=eq.${encodeURIComponent(productId)}&order=sort_order.asc,created_at.asc`,
      { method: 'GET' },
    ),
    'PRODUCT_IMAGE_LIST_FAILED',
  )

  return json(res, 200, { images: imageRows })
}

async function adminUploadProductImage(req: any, res: any, body: any) {
  const productId = text(body.productId, 80)
  const context = await groupBuyAdminProductContext(req, res, productId)
  if (!context) return

  const uploaded = await uploadGroupBuyImageObject(
    productId,
    text(body.imageBase64, 10 * 1024 * 1024),
  )

  return json(res, 200, uploaded)
}

async function adminSaveProductImage(req: any, res: any, body: any) {
  const productId = text(body.productId, 80)
  const context = await groupBuyAdminProductContext(req, res, productId)
  if (!context) return

  const imageType = groupBuyImageType(body.imageType)
  if (!imageType) return json(res, 400, { error: '圖片類型不正確。' })

  const imageUrl = text(body.imageUrl, 3000)
  if (!imageUrl) return json(res, 400, { error: '缺少圖片網址。' })

  const requestedId = text(body.id, 80)
  let existing: any = null

  if (requestedId) {
    const existingRows = await rows(
      await db(
        `group_buy_product_images?select=*&id=eq.${encodeURIComponent(requestedId)}&product_id=eq.${encodeURIComponent(productId)}&limit=1`,
        { method: 'GET' },
      ),
      'PRODUCT_IMAGE_READ_FAILED',
    )
    existing = existingRows[0] || null
  }

  if (!existing) {
    const sameTypeRows = await rows(
      await db(
        `group_buy_product_images?select=*&product_id=eq.${encodeURIComponent(productId)}&image_type=eq.${encodeURIComponent(imageType)}&order=created_at.asc&limit=1`,
        { method: 'GET' },
      ),
      'PRODUCT_IMAGE_READ_FAILED',
    )
    existing = sameTypeRows[0] || null
  }

  const payload = {
    product_id: productId,
    image_type: imageType,
    image_url: imageUrl,
    alt_text: text(body.altText, 500) || `${context.product.title}－${imageType}`,
    sort_order: Math.max(
      1,
      Math.min(
        6,
        Number(body.sortOrder || GROUP_BUY_PRODUCT_IMAGE_TYPES.indexOf(imageType) + 1),
      ),
    ),
    is_active: true,
    is_ai_generated: body.isAiGenerated !== false,
    review_status: 'approved',
    generation_prompt: text(body.generationPrompt, 10000) || null,
  }

  const oldImageUrl = text(existing?.image_url, 3000)
  const response = existing
    ? await db(
        `group_buy_product_images?id=eq.${encodeURIComponent(existing.id)}&product_id=eq.${encodeURIComponent(productId)}`,
        { method: 'PATCH', body: JSON.stringify(payload) },
      )
    : await db('group_buy_product_images', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

  const savedRows = await rows(response, 'PRODUCT_IMAGE_SAVE_FAILED')

  if (oldImageUrl && oldImageUrl !== imageUrl) {
    await deleteGroupBuyImageObject(oldImageUrl).catch((error) =>
      console.error('GROUP_BUY_OLD_IMAGE_DELETE_FAILED', error),
    )
  }

  await syncGroupBuyProductCover(productId)

  return json(res, 200, { ok: true, image: savedRows[0] || null })
}

async function adminDeleteProductImage(req: any, res: any, body: any) {
  const productId = text(body.productId, 80)
  const imageId = text(body.imageId, 80)
  const context = await groupBuyAdminProductContext(req, res, productId)
  if (!context) return

  if (!imageId) return json(res, 400, { error: '缺少圖片編號。' })

  const imageRows = await rows(
    await db(
      `group_buy_product_images?select=*&id=eq.${encodeURIComponent(imageId)}&product_id=eq.${encodeURIComponent(productId)}&limit=1`,
      { method: 'GET' },
    ),
    'PRODUCT_IMAGE_READ_FAILED',
  )

  const image = imageRows[0]
  if (!image) return json(res, 404, { error: '找不到圖片。' })

  await rows(
    await db(
      `group_buy_product_images?id=eq.${encodeURIComponent(imageId)}&product_id=eq.${encodeURIComponent(productId)}`,
      { method: 'DELETE' },
    ),
    'PRODUCT_IMAGE_DELETE_FAILED',
  )

  await deleteGroupBuyImageObject(text(image.image_url, 3000)).catch((error) =>
    console.error('GROUP_BUY_IMAGE_STORAGE_DELETE_FAILED', error),
  )

  await syncGroupBuyProductCover(productId)

  return json(res, 200, { ok: true })
}


async function processPaymentDeadlines(req: any, res: any) {
  const secret = text(process.env.CRON_SECRET, 500)
  if (!secret || getBearer(req) !== secret) return json(res, 401, { error: 'Unauthorized' })
  const now = new Date().toISOString()
  const campaigns = await rows(
    await db(`group_buy_campaigns?select=id&status=eq.payment_open&payment_deadline=lt.${encodeURIComponent(now)}`, { method: 'GET' }),
    'DEADLINE_CAMPAIGN_READ_FAILED',
  )
  let updatedOrders = 0
  for (const campaign of campaigns) {
    const orders = await rows(
      await db(`group_buy_orders?select=id,status&campaign_id=eq.${encodeURIComponent(campaign.id)}&payment_status=in.(pending,rejected)`, { method: 'GET' }),
      'DEADLINE_ORDER_READ_FAILED',
    )
    for (const order of orders) {
      const response = await db(`group_buy_orders?id=eq.${encodeURIComponent(order.id)}`, {
        method: 'PATCH', body: JSON.stringify({ payment_status: 'payment_overdue' }),
      })
      if (!response.ok) throw new Error(`PAYMENT_OVERDUE_UPDATE_FAILED:${await response.text()}`)
      await db('group_buy_order_events', {
        method: 'POST',
        body: JSON.stringify({
          order_id: order.id,
          actor_role: 'system',
          event_type: 'payment_overdue',
          from_status: order.status,
          to_status: order.status,
          message: '付款期限已到，訂單保留並標記為逾期。',
        }),
      })
      updatedOrders += 1
    }
  }
  return json(res, 200, { ok: true, campaigns: campaigns.length, updatedOrders })
}

export async function handleGroupBuyAction(req: any, res: any, body: any, fullAction: string) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS')
    return res.status(204).end()
  }

  try {
    const action = text(fullAction, 100).replace(/^group-buy-/, '')

    switch (action) {
      case 'public-campaign':
        return publicCampaign(res, text(req?.query?.slug, 100))
      case 'public-product-detail':
        return publicProductDetail(
          res,
          text(req?.query?.campaignSlug, 100),
          text(req?.query?.productId, 80),
        )
      case 'my-profile':
        return myProfile(req, res)
      case 'register':
        return registerOrder(req, res, body)
      case 'get-order':
        return orderDetail(req, res, text(req?.query?.orderCode, 80))
      case 'report-payment':
        return reportPayment(req, res, body)
      case 'select-pickup-slot':
        return selectPickupSlot(req, res, body)
      case 'request-order-recovery':
      case 'consume-order-recovery':
        return json(res, 410, { error: '訂單查詢已改為登入會員後查看「我的團購訂單」。' })
      case 'my-orders':
        return listMyOrders(req, res)
      case 'open-my-order':
        return openMyOrder(req, res, body)
      case 'process-payment-deadlines':
        return processPaymentDeadlines(req, res)

      case 'admin-bootstrap':
        return adminBootstrap(req, res)
      case 'admin-list-campaigns':
        return adminListCampaigns(req, res)
      case 'admin-get-campaign':
        return adminGetCampaign(req, res, text(req?.query?.id, 80))
      case 'admin-save-campaign':
        return adminSaveCampaign(req, res, body)
      case 'admin-list-orders':
        return adminListOrders(req, res, text(req?.query?.campaignId, 80))
      case 'admin-export-orders-xlsx':
        return adminExportOrdersXlsx(req, res, text(req?.query?.campaignId, 80))
      case 'admin-set-campaign-status':
        return adminSetCampaignStatus(req, res, body)
      case 'admin-verify-payment':
        return adminVerifyPayment(req, res, body)
      case 'admin-update-order-status':
        return adminUpdateOrderStatus(req, res, body)
      case 'admin-update-order-note':
        return adminUpdateOrderNote(req, res, body)
      case 'admin-generate-product-image-prompts':
        return adminGenerateProductImagePrompts(req, res, body)
      case 'admin-list-product-images':
        return adminListProductImages(req, res, text(req?.query?.productId, 80))
      case 'admin-upload-product-image':
        return adminUploadProductImage(req, res, body)
      case 'admin-save-product-image':
        return adminSaveProductImage(req, res, body)
      case 'admin-delete-product-image':
        return adminDeleteProductImage(req, res, body)
      default:
        return json(res, 400, { error: '未知的團購 API 動作。' })
    }
  } catch (error: any) {
    console.error('GROUP_BUY_API_FAILED', error)
    const message = String(error?.message || '團購服務暫時無法使用。')
    const status = message.includes(':409:') ? 409 : message.includes(':400:') ? 400 : 500
    return json(res, status, { error: message })
  }
}

export default async function handler(req: any, res: any) {
  return handleGroupBuyAction(req, res, bodyOf(req), text(req?.query?.action, 100))
}
