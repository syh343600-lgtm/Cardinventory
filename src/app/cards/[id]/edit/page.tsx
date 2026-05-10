import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ACTIVE_CARD_STATUSES,
  CARD_CONDITIONS,
  CARD_GAMES,
  CARD_LANGUAGES,
  GRADING_COMPANIES,
} from "@/lib/cards";
import { updateCard } from "@/app/actions";
import { prisma } from "@/lib/prisma";

type EditCardPageProps = {
  params: Promise<{ id: string }>;
};

function formatDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function TextInput(props: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        step={props.step}
        defaultValue={props.defaultValue ?? ""}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectInput(props: {
  label: string;
  name: string;
  options: readonly string[];
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{props.label}</span>
      <select
        name={props.name}
        required={props.required}
        defaultValue={props.defaultValue ?? props.options[0]}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      >
        {props.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function FormSection(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white/95 p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="mb-5 text-base font-black text-slate-950">{props.title}</h2>
      {props.children}
    </section>
  );
}

export default async function EditCardPage({ params }: EditCardPageProps) {
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
    },
  });

  if (!card) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-slate-900 sm:py-6">
      <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 pb-8 pt-5 shadow-2xl shadow-slate-900/10 sm:rounded-3xl sm:ring-1 sm:ring-white">
        <header className="mb-6 rounded-3xl bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-950">
            返回首页
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight">编辑卡牌</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            修改卡牌信息、买入信息、售出信息和当前状态。
          </p>
        </header>

        <form action={updateCard} encType="multipart/form-data" className="space-y-5">
          <input type="hidden" name="id" value={card.id} />

          <FormSection title="卡牌图片">
            <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
              <div
                className="rounded-2xl bg-gradient-to-br from-cyan-200 via-sky-400 to-lime-300 bg-cover bg-center shadow-sm ring-1 ring-slate-200"
                style={{
                  aspectRatio: "3 / 4",
                  ...(card.imageUrl ? { backgroundImage: `url(${card.imageUrl})` } : {}),
                }}
              />
              <label className="flex cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 px-4 py-5 transition hover:bg-cyan-50">
                <span className="text-sm font-black text-slate-800">
                  {card.imageUrl ? "更换卡牌图片" : "上传卡牌图片"}
                </span>
                <span className="mt-1 text-xs leading-5 text-slate-500">
                  不选择新图片会保留当前图片。支持 JPG、PNG、WEBP、GIF，最大 5MB。
                </span>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="mt-4 text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-bold file:text-cyan-700"
                />
              </label>
            </div>
          </FormSection>

          <FormSection title="卡牌基础信息">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="卡牌名称 *" name="name" required defaultValue={card.name} />
              <SelectInput label="卡牌游戏 *" name="game" options={CARD_GAMES} required defaultValue={card.game} />
              <TextInput label="系列 / 卡包" name="setName" defaultValue={card.setName} />
              <TextInput label="卡牌编号" name="cardNumber" defaultValue={card.cardNumber} />
              <TextInput label="稀有度" name="rarity" defaultValue={card.rarity} />
              <SelectInput label="语言" name="language" options={CARD_LANGUAGES} defaultValue={card.language} />
              <SelectInput label="品相" name="condition" options={CARD_CONDITIONS} defaultValue={card.condition} />
              <SelectInput label="状态" name="status" options={ACTIVE_CARD_STATUSES} defaultValue={card.status} />
            </div>
          </FormSection>

          <FormSection title="评级信息">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput
                label="评级公司"
                name="gradingCompany"
                options={GRADING_COMPANIES}
                defaultValue={card.gradingCompany}
              />
              <TextInput label="评级分数" name="grade" defaultValue={card.grade} />
            </div>
          </FormSection>

          <FormSection title="买入信息">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="买入日期" name="purchaseDate" type="date" defaultValue={formatDateInput(card.purchaseDate)} />
              <TextInput label="买入价格" name="purchasePrice" type="number" step="0.01" defaultValue={card.purchasePrice} />
              <TextInput label="买入平台" name="purchasePlatform" defaultValue={card.purchasePlatform} />
              <TextInput label="买入运费 / 额外成本" name="purchaseShipping" type="number" step="0.01" defaultValue={card.purchaseShipping} />
            </div>
          </FormSection>

          <FormSection title="售出信息">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="售出日期" name="saleDate" type="date" defaultValue={formatDateInput(card.saleDate)} />
              <TextInput label="售出价格" name="salePrice" type="number" step="0.01" defaultValue={card.salePrice} />
              <TextInput label="售出平台" name="salePlatform" defaultValue={card.salePlatform} />
              <TextInput label="售出手续费 / 发货成本" name="saleShipping" type="number" step="0.01" defaultValue={card.saleShipping} />
            </div>
          </FormSection>

          <FormSection title="备注">
            <textarea
              name="notes"
              rows={4}
              defaultValue={card.notes ?? ""}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
            />
          </FormSection>

          <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur">
            <Link
              href="/"
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              取消
            </Link>
            <button
              type="submit"
              className="rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-300/25 hover:brightness-105"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
