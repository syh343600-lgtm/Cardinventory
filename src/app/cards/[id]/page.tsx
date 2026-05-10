import Link from "next/link";
import { notFound } from "next/navigation";
import QuickSellButton from "@/app/QuickSellButton";
import {
  calculateNetRevenue,
  calculateProfit,
  calculateTotalCost,
  formatMoney,
} from "@/lib/cards";
import { prisma } from "@/lib/prisma";

type CardDetailPageProps = {
  params: Promise<{ id: string }>;
};

const dayMs = 1000 * 60 * 60 * 24;

function getStatusStyle(status: string) {
  switch (status) {
    case "持有中":
      return "bg-cyan-50 text-cyan-700 ring-cyan-200";
    case "已售出":
      return "bg-lime-100 text-lime-800 ring-lime-200";
    case "准备出售":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    case "自留收藏":
      return "bg-violet-100 text-violet-800 ring-violet-200";
    case "已删除":
      return "bg-slate-100 text-slate-500 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getCardGradient(game: string) {
  switch (game) {
    case "海贼王卡牌":
      return "from-cyan-200 via-sky-400 to-blue-500";
    case "宝可梦卡牌":
      return "from-lime-200 via-yellow-300 to-cyan-500";
    case "万智牌":
      return "from-fuchsia-200 via-violet-400 to-indigo-500";
    case "WS 黑白双翼":
      return "from-rose-100 via-pink-300 to-fuchsia-500";
    default:
      return "from-slate-100 via-cyan-200 to-slate-400";
  }
}

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

function formatDate(date: Date | null) {
  if (!date) return "未填写";

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "-";

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function calculateHoldingDays(purchaseDate: Date | null, saleDate: Date | null) {
  if (!purchaseDate) return null;

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

  return Math.max(0, Math.ceil((endDay - startDay) / dayMs));
}

function Field(props: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <p className="text-xs font-bold text-slate-400">{props.label}</p>
      <div className="mt-1 break-words text-sm font-black text-slate-900">
        {props.value || "-"}
      </div>
    </div>
  );
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-3 text-base font-black text-slate-950">{props.title}</h2>
      {props.children}
    </section>
  );
}

function MetricCard(props: {
  label: string;
  value: string;
  tone?: "cyan" | "green" | "red" | "dark";
}) {
  const toneClass =
    props.tone === "green"
      ? "text-lime-600"
      : props.tone === "red"
        ? "text-red-600"
        : props.tone === "dark"
          ? "text-slate-950"
          : "text-cyan-600";

  return (
    <div className="rounded-2xl bg-white/85 p-3 shadow-sm ring-1 ring-slate-200/80">
      <p className="text-xs font-bold text-slate-500">{props.label}</p>
      <p className={`mt-1 break-words text-lg font-black ${toneClass}`}>
        {props.value}
      </p>
    </div>
  );
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;

  const card = await prisma.cardItem.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      game: true,
      setName: true,
      cardNumber: true,
      rarity: true,
      language: true,
      condition: true,
      imageUrl: true,
      status: true,
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

  if (!card) {
    notFound();
  }

  const totalCost = calculateTotalCost(card);
  const netRevenue = calculateNetRevenue(card);
  const hasSaleInfo = card.status === "已售出" || card.salePrice !== null || card.saleDate !== null;
  const profit = hasSaleInfo ? calculateProfit(card) : null;
  const roi = profit !== null && totalCost > 0 ? (profit / totalCost) * 100 : null;
  const holdingDays = calculateHoldingDays(card.purchaseDate, card.saleDate);
  const ratingLabel =
    card.gradingCompany && card.gradingCompany !== "未评级"
      ? [card.gradingCompany, card.grade].filter(Boolean).join(" ")
      : null;
  const detailLine = [card.setName, card.cardNumber].filter(Boolean).join(" · ");

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-slate-950 sm:py-6">
      <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 pb-10 pt-5 shadow-2xl shadow-slate-900/10 sm:rounded-3xl sm:ring-1 sm:ring-white">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-950">
              返回首页
            </Link>
            <h1 className="mt-3 line-clamp-2 text-3xl font-black tracking-tight">
              {card.name}
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {detailLine || card.game}
            </p>
          </div>
          <Link
            href={`/cards/${card.id}/edit`}
            className="shrink-0 rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-lime-300/25 transition hover:bg-lime-200"
          >
            编辑
          </Link>
        </header>

        <section
          className={`relative overflow-hidden rounded-[2rem] ${
            card.imageUrl
              ? "bg-slate-200 bg-cover bg-center"
              : `bg-gradient-to-br ${getCardGradient(card.game)}`
          } p-4 text-white shadow-2xl shadow-slate-900/20`}
          style={{
            aspectRatio: "3 / 4",
            ...(card.imageUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.52)), url(${card.imageUrl})`,
                }
              : {}),
          }}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="absolute inset-3 rounded-[1.5rem] border border-white/35" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <span className="max-w-40 truncate rounded-full bg-white/60 px-3 py-1.5 text-xs font-black text-slate-900 backdrop-blur">
                {card.game}
              </span>
              {ratingLabel && (
                <span className="max-w-32 truncate rounded-full bg-lime-300 px-3 py-1.5 text-xs font-black text-slate-950 shadow-lg shadow-lime-300/30">
                  {ratingLabel}
                </span>
              )}
            </div>

            {!card.imageUrl && (
              <div>
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/35 text-3xl font-black shadow-inner backdrop-blur">
                  {getInitials(card.name)}
                </div>
                <p className="line-clamp-3 text-3xl font-black leading-tight drop-shadow">
                  {card.name}
                </p>
                <p className="mt-2 text-sm font-bold text-white/85">
                  {detailLine || "未填写系列"}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-3xl bg-gradient-to-br from-white via-emerald-50 to-sky-50 p-4 shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${getStatusStyle(card.status)}`}>
              {card.status}
            </span>
            {card.rarity && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                {card.rarity}
              </span>
            )}
            {card.condition && (
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                {card.condition}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <MetricCard label="利润" value={profit === null ? "-" : formatMoney(profit)} tone={profit === null ? "dark" : profit >= 0 ? "green" : "red"} />
            <MetricCard label="ROI" value={formatPercent(roi)} tone={roi === null ? "dark" : roi >= 0 ? "green" : "red"} />
            <MetricCard label="持有天数" value={holdingDays === null ? "-" : `${holdingDays} 天`} tone="dark" />
            <MetricCard label="买入成本" value={formatMoney(totalCost)} />
          </div>
        </section>

        <div className="mt-5 space-y-5">
          <Section title="基本信息">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="卡牌游戏" value={card.game} />
              <Field label="状态" value={card.status} />
              <Field label="系列 / 卡包" value={card.setName} />
              <Field label="卡牌编号" value={card.cardNumber} />
              <Field label="稀有度" value={card.rarity} />
              <Field label="语言" value={card.language} />
              <Field label="品相" value={card.condition} />
              <Field label="评级" value={ratingLabel ?? "未评级"} />
            </div>
          </Section>

          <Section title="买入信息">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="买入日期" value={formatDate(card.purchaseDate)} />
              <Field label="买入平台" value={card.purchasePlatform} />
              <Field label="买入价格" value={formatMoney(card.purchasePrice)} />
              <Field label="运费 / 额外成本" value={formatMoney(card.purchaseShipping)} />
              <Field label="买入总成本" value={formatMoney(totalCost)} />
              <Field label="持有天数" value={holdingDays === null ? "-" : `${holdingDays} 天`} />
            </div>
          </Section>

          <Section title="卖出信息">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="卖出日期" value={formatDate(card.saleDate)} />
              <Field label="卖出平台" value={card.salePlatform} />
              <Field label="卖出价格" value={hasSaleInfo ? formatMoney(card.salePrice) : "-"} />
              <Field label="手续费 / 发货成本" value={hasSaleInfo ? formatMoney(card.saleShipping) : "-"} />
              <Field label="净卖出金额" value={hasSaleInfo ? formatMoney(netRevenue) : "-"} />
              <Field label="卖出状态" value={hasSaleInfo ? "已有卖出记录" : "尚未卖出"} />
            </div>
          </Section>

          <Section title="利润">
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="买入总成本" value={formatMoney(totalCost)} />
              <Field label="净卖出金额" value={hasSaleInfo ? formatMoney(netRevenue) : "-"} />
              <Field
                label="已实现利润"
                value={
                  <span className={profit !== null && profit >= 0 ? "text-lime-600" : profit !== null ? "text-red-600" : ""}>
                    {profit === null ? "-" : formatMoney(profit)}
                  </span>
                }
              />
              <Field
                label="ROI"
                value={
                  <span className={roi !== null && roi >= 0 ? "text-lime-600" : roi !== null ? "text-red-600" : ""}>
                    {formatPercent(roi)}
                  </span>
                }
              />
            </div>
          </Section>

          <Section title="备注">
            <p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">
              {card.notes?.trim() || "暂无备注"}
            </p>
          </Section>
        </div>

        {card.status !== "已删除" && (
          <div className="sticky bottom-0 -mx-4 mt-6 grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur">
            <QuickSellButton
              id={card.id}
              name={card.name}
              salePrice={card.salePrice}
              status={card.status}
            />
            <Link
              href={`/cards/${card.id}/edit`}
              className="rounded-full bg-cyan-50 px-4 py-2 text-center text-xs font-black text-cyan-700 ring-1 ring-cyan-100 transition hover:bg-cyan-100"
            >
              编辑详细信息
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
