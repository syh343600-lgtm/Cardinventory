"use client";

import { restoreCard } from "./actions";

type RestoreCardButtonProps = {
  id: string;
};

export default function RestoreCardButton({ id }: RestoreCardButtonProps) {
  return (
    <form action={restoreCard} className="contents">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
      >
        恢复
      </button>
    </form>
  );
}
