import {
  calculateNetRevenue,
  calculateProfit,
  calculateTotalCost,
} from "@/lib/cards";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ExportType = "all" | "holding" | "sold" | "deleted" | "backup";

type ExportCard = {
  name: string;
  game: string;
  setName: string | null;
  cardNumber: string | null;
  rarity: string | null;
  language: string | null;
  condition: string | null;
  status: string;
  quantity: number;
  gradingCompany: string | null;
  grade: string | null;
  purchaseDate: Date | null;
  purchasePrice: number | null;
  purchaseShipping: number | null;
  purchasePlatform: string | null;
  saleDate: Date | null;
  salePrice: number | null;
  saleShipping: number | null;
  salePlatform: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const columns = [
  "卡牌名称",
  "游戏",
  "系列",
  "编号",
  "稀有度",
  "语言",
  "品相",
  "状态",
  "数量",
  "评级公司",
  "评级分数",
  "买入日期",
  "单张买入价格",
  "买入运费",
  "买入平台",
  "卖出日期",
  "单张卖出价格",
  "卖出费用",
  "卖出平台",
  "买入总成本",
  "净卖出金额",
  "利润",
  "ROI",
  "持有天数",
  "备注",
  "创建时间",
  "更新时间",
];

function getExportType(value: string | null): ExportType {
  if (
    value === "all" ||
    value === "holding" ||
    value === "sold" ||
    value === "deleted" ||
    value === "backup"
  ) {
    return value;
  }

  return "all";
}

function getWhereByType(type: ExportType) {
  switch (type) {
    case "holding":
      return { status: { in: ["持有中", "准备出售", "自留收藏"] } };
    case "sold":
      return { status: { in: ["已售出", "已卖出"] } };
    case "deleted":
      return { status: "已删除" };
    case "backup":
      return {};
    case "all":
    default:
      return { status: { not: "已删除" } };
  }
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function formatDate(date: Date | null) {
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "";
  }

  return value.toFixed(2);
}

function calculateHoldingDays(purchaseDate: Date | null, saleDate: Date | null) {
  if (!purchaseDate) return "";

  const dayMs = 1000 * 60 * 60 * 24;
  const endDate = saleDate ?? new Date();
  const startDay = Date.UTC(
    purchaseDate.getFullYear(),
    purchaseDate.getMonth(),
    purchaseDate.getDate(),
  );
  const endDay = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  return Math.max(0, Math.ceil((endDay - startDay) / dayMs)).toString();
}

function escapeCsvCell(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : value.toString();

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function toCsvRow(values: Array<string | number | null | undefined>) {
  return values.map(escapeCsvCell).join(",");
}

function cardToRow(card: ExportCard) {
  const isSold = card.status === "已售出" || card.status === "已卖出";
  const totalCost = calculateTotalCost(card);
  const netRevenue = isSold ? calculateNetRevenue(card) : null;
  const profit = isSold ? calculateProfit(card) : null;
  const roi = profit !== null && totalCost > 0 ? (profit / totalCost) * 100 : null;

  return [
    card.name,
    card.game,
    card.setName,
    card.cardNumber,
    card.rarity,
    card.language,
    card.condition,
    card.status,
    card.quantity,
    card.gradingCompany,
    card.grade,
    formatDate(card.purchaseDate),
    formatNumber(card.purchasePrice),
    formatNumber(card.purchaseShipping),
    card.purchasePlatform,
    isSold ? formatDate(card.saleDate) : "",
    isSold ? formatNumber(card.salePrice) : "",
    isSold ? formatNumber(card.saleShipping) : "",
    isSold ? card.salePlatform : "",
    formatNumber(totalCost),
    isSold ? formatNumber(netRevenue) : "",
    isSold ? formatNumber(profit) : "",
    roi === null ? "" : `${roi.toFixed(2)}%`,
    calculateHoldingDays(card.purchaseDate, card.saleDate),
    card.notes,
    formatDateTime(card.createdAt),
    formatDateTime(card.updatedAt),
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = getExportType(searchParams.get("type"));
  const today = formatDate(new Date());
  const cards = await prisma.cardItem.findMany({
    where: getWhereByType(type),
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      game: true,
      setName: true,
      cardNumber: true,
      rarity: true,
      language: true,
      condition: true,
      status: true,
      quantity: true,
      gradingCompany: true,
      grade: true,
      purchaseDate: true,
      purchasePrice: true,
      purchaseShipping: true,
      purchasePlatform: true,
      saleDate: true,
      salePrice: true,
      saleShipping: true,
      salePlatform: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const csv = [
    toCsvRow(columns),
    ...cards.map((card) => toCsvRow(cardToRow(card))),
  ].join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="card-inventory-export-${today}.csv"`,
    },
  });
}

