import type { RegistrationPhase } from './groupBuyRules'

export type CampaignStatus =
  | 'draft'
  | 'registration_open'
  | 'registration_closed'
  | 'payment_open'
  | 'payment_closed'
  | 'confirmed'
  | 'ordering'
  | 'fulfilling'
  | 'completed'
  | 'cancelled'

export type Product = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  unitLabel: string
  salePriceNtd: number
  minQuantityPerOrder: number
  maxQuantityPerOrder?: number | null
  stockLimit?: number | null
  thresholdWeight: number
  shortDescription?: string | null
  longDescription?: string | null
  originalPriceNtd?: number | null
  weightText?: string | null
  dimensionsText?: string | null
  storageText?: string | null
  vegetarianText?: string | null
  allergenText?: string | null
  ingredientsSummary?: string | null
  servingSuggestion?: string | null
  productNotice?: string | null
  contentSourceCheckedAt?: string | null
  contentReviewStatus?: 'draft' | 'needs_review' | 'published' | 'rejected'
  imagePromptJson?: Record<string, unknown>
  detailSlug?: string | null
}

export type ProductImage = {
  id: string
  productId?: string
  imageType: 'hero' | 'cutaway' | 'size_diagram' | 'afternoon_tea' | 'family_lakeside' | 'office_sharing'
  imageUrl: string
  altText?: string | null
  isAiGenerated: boolean
  sortOrder?: number
  isActive?: boolean
  reviewStatus?: 'draft' | 'approved' | 'rejected'
  generationPrompt?: string | null
}


export type PickupStore = {
  id: string
  campaignId?: string
  storeCode?: string | null
  city: string
  district?: string | null
  name: string
  address: string
  phone?: string | null
  businessHours?: string | null
  sourceUrl?: string | null
  isActive: boolean
  sortOrder?: number
}

export type PickupSlot = {
  id: string
  campaignId?: string
  pickupStoreId: string
  pickupDate: string
  startTime?: string | null
  endTime?: string | null
  notice?: string | null
  capacity?: number | null
  isActive: boolean
  sortOrder?: number
}

export type ShippingMethod = {
  id: string
  methodType: 'home_delivery' | 'store_pickup'
  label: string
  feeMode: 'fixed' | 'quantity_free_threshold' | 'amount_free_threshold'
  baseFeeNtd: number
  freeThresholdQuantity?: number | null
  freeThresholdAmountNtd?: number | null
  pickupName?: string | null
  pickupAddress?: string | null
  pickupPhone?: string | null
  pickupMapUrl?: string | null
  pickupTimeText?: string | null
  pickupNotice?: string | null
}

export type Campaign = {
  id: string
  title: string
  slug: string
  description?: string | null
  coverImageUrl?: string | null
  noticeText?: string | null
  organizerDisclaimer?: string | null
  status: CampaignStatus
  registrationStartsAt?: string | null
  registrationEndsAt?: string | null
  originalRegistrationEndsAt?: string | null
  registrationExtensionCount: number
  lastRegistrationExtensionReason?: string | null
  lastRegistrationExtendedAt?: string | null
  registrationClosedAt?: string | null
  registrationPhase: RegistrationPhase
  paymentOpenedAt?: string | null
  paymentDeadline?: string | null
  estimatedArrivalText?: string | null
  estimatedShipMinBusinessDays: number
  estimatedShipMaxBusinessDays: number
  estimatedEarliestShipAt?: string | null
  estimatedLatestShipAt?: string | null
  supplierOrderedAt?: string | null
  supplierExpectedShipAt?: string | null
  shippingNotice?: string | null
  shippingDelayReason?: string | null
  shippingNoticeUpdatedAt?: string | null
  thresholdMode: 'quantity' | 'order_count' | 'amount' | 'points'
  minRegistrationValue: number
  minPaidValue: number
  showProgress: boolean
  addressCollectionStage: 'registration' | 'payment'
  paymentOpenMode: 'manual' | 'automatic'
  pickupDateSelectionOpen: boolean
  pickupDateSelectionNotice?: string | null
  pickupStores: PickupStore[]
  pickupSlots?: PickupSlot[]
  progress: {
    registrationValue: number
    paidValue: number
    registrationPercent: number
    paidPercent: number
  }
  products: Product[]
  shippingMethods: ShippingMethod[]
}

export type OrderItem = {
  id?: string
  productId?: string | null
  productTitle: string
  unitLabel: string
  unitPriceNtd: number
  quantity: number
  lineTotalNtd: number
}

export type OrderDetail = {
  order: {
    orderCode: string
    customerName: string
    customerPhone: string
    customerEmail: string
    recipientName?: string | null
    recipientPhone?: string | null
    postalCode?: string | null
    shippingAddress?: string | null
    itemSubtotalNtd: number
    shippingFeeNtd: number
    totalAmountNtd: number
    totalQuantity: number
    status: string
    paymentStatus: string
    createdAt: string
    adminNote?: string | null
    promisedShipBy?: string | null
    shippedAt?: string | null
    shippingCarrier?: string | null
    trackingNumber?: string | null
    shipmentNote?: string | null
    pickupStoreId?: string | null
    pickupStoreName?: string | null
    pickupStoreCity?: string | null
    pickupStoreAddress?: string | null
    pickupStorePhone?: string | null
    pickupSlotId?: string | null
    pickupDate?: string | null
    pickupDateSelectedAt?: string | null
  }
  campaign: {
    title: string
    slug: string
    status: CampaignStatus
    paymentDeadline?: string | null
    addressCollectionStage: 'registration' | 'payment'
    supplierOrderedAt?: string | null
    supplierExpectedShipAt?: string | null
    estimatedEarliestShipAt?: string | null
    estimatedShipMinBusinessDays: number
    estimatedShipMaxBusinessDays: number
    estimatedLatestShipAt?: string | null
    shippingNotice?: string | null
    shippingDelayReason?: string | null
    shippingNoticeUpdatedAt?: string | null
    pickupDateSelectionOpen: boolean
    pickupDateSelectionNotice?: string | null
    latestShippingEstimateEvent?: {
      previousEstimatedLatestShipAt?: string | null
      newEstimatedLatestShipAt?: string | null
      reason?: string | null
      createdAt: string
    } | null
  }
  shippingMethod: ShippingMethod
  pickupStore?: PickupStore | null
  pickupSlots?: PickupSlot[]
  items: OrderItem[]
  bank?: {
    name: string
    code: string
    branch?: string | null
    account: string
    accountName: string
  } | null
  paymentReports: Array<{
    id: string
    payerName: string
    amountNtd: number
    accountLastFive: string
    transferredAt: string
    status: string
    reviewNote?: string | null
  }>
  events: Array<{
    id: string
    eventType: string
    fromStatus?: string | null
    toStatus?: string | null
    message?: string | null
    createdAt: string
  }>
  notifications: Array<{
    id: string
    eventType: string
    status: string
    createdAt: string
    sentAt?: string | null
    failedAt?: string | null
    lastError?: string | null
  }>
}
