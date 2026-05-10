"use client";

import { deleteCard } from "./actions";

type DeleteCardButtonProps = {
  id: string;
  name: string;
};

export default function DeleteCardButton({ id, name }: DeleteCardButtonProps) {
  return (
    <form
      action={deleteCard}
      className="contents"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `确定要删除「${name}」吗？\n\n删除后会进入回收站，可以恢复。`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="w-full rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
      >
        删除
      </button>
    </form>
  );
}
