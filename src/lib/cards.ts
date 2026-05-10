export const CARD_STATUSES = ["持有中", "已售出", "准备出售", "自留收藏", "已删除"] as const;

export const ACTIVE_CARD_STATUSES = CARD_STATUSES.filter(
  (status) => status !== "已删除",
);

export const CARD_GAMES = [
  "海贼王卡牌",
  "宝可梦卡牌",
  "万智牌",
  "WS 黑白双翼",
  "其他",
] as const;

export const CARD_LANGUAGES = ["日文", "英文", "中文", "其他"] as const;

export const CARD_CONDITIONS = [
  "NM 近全新",
  "LP 轻微使用",
  "MP 中度使用",
  "HP 重度使用",
  "DMG 损坏",
] as const;

export const GRADING_COMPANIES = ["未评级", "PSA", "BGS", "CGC", "ARS", "其他"] as const;

export function isActiveCardStatus(status: string): status is (typeof ACTIVE_CARD_STATUSES)[number] {
  return ACTIVE_CARD_STATUSES.some((activeStatus) => activeStatus === status);
}

export function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

export function calculateTotalCost(card: {
  purchasePrice: number | null;
  purchaseShipping: number | null;
}) {
  return (card.purchasePrice ?? 0) + (card.purchaseShipping ?? 0);
}

export function calculateNetRevenue(card: {
  salePrice: number | null;
  saleShipping: number | null;
}) {
  return (card.salePrice ?? 0) - (card.saleShipping ?? 0);
}

export function calculateProfit(card: {
  purchasePrice: number | null;
  purchaseShipping: number | null;
  salePrice: number | null;
  saleShipping: number | null;
}) {
  return calculateNetRevenue(card) - calculateTotalCost(card);
}
