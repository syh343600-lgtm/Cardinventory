import Link from "next/link";
import DeleteCardButton from "./DeleteCardButton";
import QuickSellButton from "./QuickSellButton";
import RestoreCardButton from "./RestoreCardButton";
import {
  CARD_GAMES,
  calculateNetRevenue,
  calculateProfit,
  calculateTotalCost,
  formatMoney,
} from "@/lib/cards";
import { prisma } from "@/lib/prisma";

type HomeProps = {
  searchParams?: Promise<{ game?: string; q?: string }>;
};

function buildInventoryHref({
  game,
  q,
}: {
  game?: string;
  q?: string;
}) {
  const urlParams = new URLSearchParams();
  const search = q?.trim();

  if (game && game !== "全部") {
    urlParams.set("game", game);
  }

  if (search) {
    urlParams.set("q", search);
  }

  const query = urlParams.toString();
  return query ? `/?${query}` : "/";
}

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
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function getInitials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
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

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const selectedGame = params?.game ?? "全部";
  const searchQuery = params?.q?.trim() ?? "";
  const normalizedSearchQuery = searchQuery.toLowerCase();

  const cards = await prisma.cardItem.findMany({
    orderBy: { createdAt: "desc" },
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

  const activeCards = cards.filter((card) => card.status !== "已删除");
  const deletedCards = cards.filter((card) => card.status === "已删除");
  const gameFilteredCards =
    selectedGame === "全部"
      ? activeCards
      : activeCards.filter((card) => card.game === selectedGame);
  const visibleCards = normalizedSearchQuery
    ? gameFilteredCards.filter((card) =>
        [
          card.name,
          card.setName,
          card.cardNumber,
          card.game,
          card.gradingCompany,
          card.grade,
        ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery)),
      )
    : gameFilteredCards;
  const visibleHoldingCards = visibleCards
    .filter((card) => card.status !== "已售出")
    .sort((a, b) => calculateTotalCost(b) - calculateTotalCost(a));
  const visibleSoldCards = visibleCards
    .filter((card) => card.status === "已售出")
    .sort((a, b) => (b.salePrice ?? 0) - (a.salePrice ?? 0));

  const holdingCards = activeCards.filter((card) => card.status === "持有中");
  const soldCards = activeCards.filter((card) => card.status === "已售出");

  const totalPurchaseCost = activeCards.reduce(
    (sum, card) => sum + calculateTotalCost(card),
    0,
  );
  const currentHoldingCost = holdingCards.reduce(
    (sum, card) => sum + calculateTotalCost(card),
    0,
  );
  const totalSalesRevenue = soldCards.reduce(
    (sum, card) => sum + (card.salePrice ?? 0),
    0,
  );
  const netSalesRevenue = soldCards.reduce(
    (sum, card) => sum + calculateNetRevenue(card),
    0,
  );
  const realisedProfit = soldCards.reduce(
    (sum, card) => sum + calculateProfit(card),
    0,
  );

  const tabs = ["全部", ...CARD_GAMES];
  const hasFilters = selectedGame !== "全部" || Boolean(searchQuery);
  const exportLinks = [
    { label: "导出全部", href: "/api/export?type=all" },
    { label: "导出当前库存", href: "/api/export?type=holding" },
    { label: "导出已卖出", href: "/api/export?type=sold" },
    { label: "导出完整备份", href: "/api/export?type=backup" },
  ];
  const stats = [
    { label: "拥有卡数", value: holdingCards.length.toString() },
    { label: "总投入", value: formatMoney(totalPurchaseCost) },
    { label: "持有成本", value: formatMoney(currentHoldingCost) },
    { label: "总卖出", value: formatMoney(totalSalesRevenue) },
    { label: "净卖出", value: formatMoney(netSalesRevenue) },
    { label: "已实现利润", value: formatMoney(realisedProfit), profit: realisedProfit },
  ];

  const renderCard = (card: (typeof cards)[number]) => {
    const totalCost = calculateTotalCost(card);
    const netRevenue = calculateNetRevenue(card);
    const profit = card.status === "已售出" ? calculateProfit(card) : null;
    const ratingLabel =
      card.gradingCompany && card.gradingCompany !== "未评级"
        ? [card.gradingCompany, card.grade].filter(Boolean).join(" ")
        : null;
    const cornerBadge = ratingLabel ?? card.rarity;

    return (
      <article
        key={card.id}
        className="overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10"
      >
        <div
          className={`relative overflow-hidden rounded-2xl ${
            card.imageUrl
              ? "bg-slate-200 bg-cover bg-center"
              : `bg-gradient-to-br ${getCardGradient(card.game)}`
          } p-2.5 text-white shadow-inner`}
          style={{
            aspectRatio: "3 / 4",
            ...(card.imageUrl
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.05), rgba(15, 23, 42, 0.48)), url(${card.imageUrl})`,
                }
              : {}),
          }}
        >
          <div className="absolute inset-0 bg-white/10" />
          <div className="absolute inset-2 rounded-xl border border-white/35" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-1.5">
              <span className="max-w-20 truncate rounded-full bg-white/55 px-2 py-1 text-xs font-black text-slate-800 backdrop-blur">
                {card.game}
              </span>
              {cornerBadge && (
                <span className="max-w-20 truncate rounded-full bg-white/65 px-2 py-1 text-xs font-black text-slate-800 backdrop-blur">
                  {cornerBadge}
                </span>
              )}
            </div>
            <div>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/35 text-lg font-black shadow-inner backdrop-blur">
                {getInitials(card.name)}
              </div>
              <p className="line-clamp-2 text-sm font-black leading-tight text-white drop-shadow">
                {card.name}
              </p>
              <p className="mt-1 line-clamp-1 text-xs font-bold text-white/85">
                {[card.setName, card.cardNumber].filter(Boolean).join(" · ") ||
                  "未填写系列"}
              </p>
            </div>
          </div>
        </div>
        <div className="px-1 pb-2 pt-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2 py-1 text-xs font-black ring-1 ${getStatusStyle(card.status)}`}>
              {card.status}
            </span>
            {card.condition && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                {card.condition}
              </span>
            )}
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div>
              <p className="text-xs text-slate-400">买入成本</p>
              <p className="font-black text-cyan-600">{formatMoney(totalCost)}</p>
            </div>
            {card.status === "已售出" && (
              <div className="rounded-2xl bg-slate-50 p-2">
                <p className="text-xs text-slate-400">卖出</p>
                <p className="font-bold text-slate-800">{formatMoney(netRevenue)}</p>
                <p className="mt-1 text-xs text-slate-400">利润</p>
                <p className={`font-black ${profit !== null && profit >= 0 ? "text-lime-600" : "text-red-600"}`}>
                  {profit === null ? "-" : formatMoney(profit)}
                </p>
              </div>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Link
              href={`/cards/${card.id}`}
              className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              详情
            </Link>
            <QuickSellButton
              id={card.id}
              name={card.name}
              salePrice={card.salePrice}
              status={card.status}
            />
            <Link
              href={`/cards/${card.id}/edit`}
              className="rounded-full bg-cyan-50 px-3 py-2 text-center text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
            >
              编辑
            </Link>
            <DeleteCardButton id={card.id} name={card.name} />
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-slate-950 sm:py-6">
      <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 pb-10 pt-5 shadow-2xl shadow-slate-900/10 sm:rounded-3xl sm:ring-1 sm:ring-white">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">
              Card Inventory
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              我拥有的
            </h1>
            <p className="mt-2 max-w-72 text-sm leading-5 text-slate-500">
              管理你的私人卡牌库存、买入成本、卖出收入和利润
            </p>
          </div>
          <Link
            href="/add"
            aria-label="添加卡牌"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime-300 text-xl font-black text-slate-950 shadow-lg shadow-emerald-300/30 transition hover:-translate-y-0.5"
          >
            +
          </Link>
        </header>

        <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2">
          {tabs.map((tab) => {
            const active = selectedGame === tab;
            const href = buildInventoryHref({ game: tab, q: searchQuery });

            return (
              <Link
                key={tab}
                href={href}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                  active
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-900/15"
                    : "bg-white/90 text-slate-600 ring-1 ring-slate-200 hover:text-slate-950"
                }`}
              >
                {tab}
              </Link>
            );
          })}
        </nav>

        <form action="/" className="mt-3 rounded-3xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
          {selectedGame !== "全部" && (
            <input type="hidden" name="game" value={selectedGame} />
          )}
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 ring-1 ring-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-300">
            <span className="text-sm font-black text-slate-400">搜索</span>
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="卡名 / 系列 / 编号 / 游戏 / 评级"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
            />
            {searchQuery && (
              <Link
                href={buildInventoryHref({ game: selectedGame })}
                className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-600 transition hover:bg-slate-300"
              >
                清除
              </Link>
            )}
            <button
              type="submit"
              className="shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white transition hover:bg-slate-800"
            >
              查找
            </button>
          </div>
        </form>

        <section className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-emerald-50 to-sky-50 p-5 text-slate-950 shadow-xl shadow-emerald-900/10 ring-1 ring-emerald-100">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-lime-300 to-emerald-300" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-500">Portfolio Profit</p>
                <p
                  className={`mt-1 text-3xl font-black tracking-tight ${
                    realisedProfit >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {formatMoney(realisedProfit)}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                {activeCards.length} 张
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/80">
                  <p className="text-xs font-medium text-slate-500">{item.label}</p>
                  <p
                    className={`mt-1 break-words text-sm font-black ${
                      typeof item.profit === "number"
                        ? item.profit >= 0
                          ? "text-emerald-600"
                          : "text-red-500"
                        : "text-slate-950"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm font-black text-slate-950">数据导出</h2>
              <p className="mt-0.5 text-xs text-slate-500">CSV 格式，可直接用 Excel 打开</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-black text-cyan-700 ring-1 ring-cyan-100">
              CSV
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {exportLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full bg-slate-50 px-3 py-2.5 text-center text-xs font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4">
            <h2 className="text-xl font-black tracking-tight">收藏卡册</h2>
            <p className="mt-1 text-sm text-slate-500">
              当前持有、准备出售和已卖出的卡牌明细
            </p>
          </div>

          {visibleCards.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-24 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-200 via-sky-400 to-lime-300 text-xl font-black text-white shadow-xl shadow-cyan-500/20">
                CI
              </div>
              <h3 className="mt-5 text-lg font-black">
                {hasFilters ? "没有找到匹配卡牌" : "还没有卡牌记录"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {hasFilters ? "换个关键词或清除筛选再试试" : "添加你的第一张收藏卡"}
              </p>
              <Link
                href={hasFilters ? "/" : "/add"}
                className="mt-6 inline-flex rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-lime-300/30 transition hover:bg-lime-200"
              >
                {hasFilters ? "清除筛选" : "添加第一张卡牌"}
              </Link>
            </div>
          ) : (
            <div className="space-y-7">
              {visibleHoldingCards.length > 0 && (
                <section>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-slate-950">持有卡牌</h3>
                      <p className="mt-0.5 text-xs text-slate-500">按买入成本从高到低排列</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">
                      {visibleHoldingCards.length} 张
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {visibleHoldingCards.map(renderCard)}
                  </div>
                </section>
              )}

              {visibleSoldCards.length > 0 && (
                <section>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-slate-950">已卖出卡牌</h3>
                      <p className="mt-0.5 text-xs text-slate-500">按卖出价格从高到低排列</p>
                    </div>
                    <span className="rounded-full bg-lime-50 px-3 py-1 text-xs font-black text-lime-700 ring-1 ring-lime-200">
                      {visibleSoldCards.length} 张
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {visibleSoldCards.map(renderCard)}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>

        {deletedCards.length > 0 && (
          <section className="mt-8 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4">
              <h2 className="text-lg font-black">回收站</h2>
              <p className="mt-1 text-sm text-slate-500">这里的记录没有永久删除，可以恢复</p>
            </div>
            <div className="space-y-2">
              {deletedCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-800">{card.name}</p>
                    <p className="truncate text-xs text-slate-500">
                      {[card.game, card.setName].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <RestoreCardButton id={card.id} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
