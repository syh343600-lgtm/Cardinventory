"use client";

import { useState } from "react";
import { quickSellCard } from "./actions";

type QuickSellButtonProps = {
  id: string;
  name: string;
  salePrice?: number | null;
  status: string;
};

export default function QuickSellButton({
  id,
  name,
  salePrice,
  status,
}: QuickSellButtonProps) {
  const [open, setOpen] = useState(false);
  const isSold = status === "已售出";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
      >
        {isSold ? "改售价" : "卖出"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 pb-4 backdrop-blur-sm sm:items-center sm:pb-0">
          <div className="w-full max-w-sm rounded-3xl bg-white p-4 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Quick Sale
                </p>
                <h2 className="mt-1 truncate text-xl font-black text-slate-950">
                  {isSold ? "更新卖出价" : "快捷卖出"}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-500 transition hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <form
              action={async (formData) => {
                await quickSellCard(formData);
                setOpen(false);
              }}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="id" value={id} />
              <label className="block">
                <span className="text-xs font-black text-slate-500">
                  卖出价格
                </span>
                <div className="mt-2 flex items-center rounded-2xl bg-slate-50 px-4 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-cyan-300">
                  <span className="text-sm font-black text-cyan-600">¥</span>
                  <input
                    name="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    autoFocus
                    defaultValue={salePrice ?? ""}
                    placeholder="0.00"
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-lg font-black text-slate-950 outline-none placeholder:text-slate-300"
                  />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-slate-100 px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-lime-300 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-lime-300/30 transition hover:bg-lime-200"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
