import Link from "next/link";
import {
  ACTIVE_CARD_STATUSES,
  CARD_CONDITIONS,
  CARD_GAMES,
  CARD_LANGUAGES,
  GRADING_COMPANIES,
} from "@/lib/cards";
import { createCard } from "./actions";

function TextInput(props: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{props.label}</span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        placeholder={props.placeholder}
        step={props.step}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function SelectInput(props: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{props.label}</span>
      <select
        name={props.name}
        required={props.required}
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

export default function AddCardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-slate-900 sm:py-6">
      <div className="mx-auto min-h-screen max-w-md bg-slate-50 px-4 pb-8 pt-5 shadow-2xl shadow-slate-900/10 sm:rounded-3xl sm:ring-1 sm:ring-white">
        <header className="mb-6 rounded-3xl bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm ring-1 ring-emerald-100">
          <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-950">
            返回首页
          </Link>
          <h1 className="mt-4 text-3xl font-black tracking-tight">添加新卡牌</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            记录卡牌的基础信息、买入信息，以及后续售出信息。
          </p>
        </header>

        <form action={createCard} encType="multipart/form-data" className="space-y-5">
          <FormSection title="卡牌图片">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-cyan-50/60 px-4 py-7 text-center transition hover:bg-cyan-50">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-cyan-600 shadow-sm ring-1 ring-cyan-100">
                +
              </span>
              <span className="mt-3 text-sm font-black text-slate-800">上传卡牌图片</span>
              <span className="mt-1 text-xs text-slate-500">支持 JPG、PNG、WEBP、GIF，最大 5MB</span>
              <input name="image" type="file" accept="image/*" className="sr-only" />
            </label>
          </FormSection>

          <FormSection title="卡牌基础信息">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="卡牌名称 *" name="name" required placeholder="例如：漫画香克斯" />
              <SelectInput label="卡牌游戏 *" name="game" options={CARD_GAMES} required />
              <TextInput label="系列 / 卡包" name="setName" placeholder="例如：OP01" />
              <TextInput label="卡牌编号" name="cardNumber" placeholder="例如：OP01-120" />
              <TextInput label="稀有度" name="rarity" placeholder="例如：SEC / SP / Manga" />
              <SelectInput label="语言" name="language" options={CARD_LANGUAGES} />
              <SelectInput label="品相" name="condition" options={CARD_CONDITIONS} />
              <SelectInput label="状态" name="status" options={ACTIVE_CARD_STATUSES} />
            </div>
          </FormSection>

          <FormSection title="评级信息">
            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput label="评级公司" name="gradingCompany" options={GRADING_COMPANIES} />
              <TextInput label="评级分数" name="grade" placeholder="例如：10 / 9.5 / 黑标" />
            </div>
          </FormSection>

          <FormSection title="买入信息">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="买入日期" name="purchaseDate" type="date" />
              <TextInput label="买入价格" name="purchasePrice" type="number" step="0.01" placeholder="例如：1200" />
              <TextInput label="买入平台" name="purchasePlatform" placeholder="例如：eBay / 闲鱼 / Cardmarket" />
              <TextInput label="买入运费 / 额外成本" name="purchaseShipping" type="number" step="0.01" placeholder="例如：20" />
            </div>
          </FormSection>

          <FormSection title="售出信息">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="售出日期" name="saleDate" type="date" />
              <TextInput label="售出价格" name="salePrice" type="number" step="0.01" placeholder="例如：1500" />
              <TextInput label="售出平台" name="salePlatform" placeholder="例如：eBay / 闲鱼 / 卡社" />
              <TextInput label="售出手续费 / 发货成本" name="saleShipping" type="number" step="0.01" placeholder="例如：100" />
            </div>
          </FormSection>

          <FormSection title="备注">
            <textarea
              name="notes"
              rows={4}
              placeholder="可以记录卡牌来源、品相细节、是否连号、是否准备长期收藏等。"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
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
              保存卡牌
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
