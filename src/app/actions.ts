"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isActiveCardStatus } from "@/lib/cards";
import { prisma } from "@/lib/prisma";
import { saveCardImage } from "@/lib/uploads";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  const text = value?.toString().trim();

  return text ? text : null;
}

function getNumber(formData: FormData, key: string) {
  const text = formData.get(key)?.toString().trim();
  if (!text) return null;

  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function getDate(formData: FormData, key: string) {
  const text = formData.get(key)?.toString().trim();
  return text ? new Date(text) : null;
}

function getInteger(formData: FormData, key: string) {
  const number = getNumber(formData, key);

  if (number === null) return null;

  return Number.isFinite(number) ? Math.max(1, Math.trunc(number)) : null;
}

export async function deleteCard(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("缺少卡牌 ID");
  }

  await prisma.cardItem.update({
    where: { id },
    data: { status: "已删除" },
  });

  revalidatePath("/");
}

export async function restoreCard(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("缺少卡牌 ID");
  }

  await prisma.cardItem.update({
    where: { id },
    data: { status: "持有中" },
  });

  revalidatePath("/");
}

export async function quickSellCard(formData: FormData) {
  const id = formData.get("id")?.toString();
  const salePrice = getNumber(formData, "salePrice");

  if (!id) {
    throw new Error("缺少卡牌 ID");
  }

  if (salePrice === null || salePrice < 0) {
    throw new Error("请输入有效的卖出价格");
  }

  const card = await prisma.cardItem.findUnique({
    where: { id },
    select: { saleDate: true },
  });

  if (!card) {
    throw new Error("找不到这张卡牌");
  }

  await prisma.cardItem.update({
    where: { id },
    data: {
      status: "已售出",
      salePrice,
      saleDate: card.saleDate ?? new Date(),
    },
  });

  revalidatePath("/");
}

export async function updateCard(formData: FormData) {
  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("缺少卡牌 ID");
  }

  const name = getString(formData, "name");
  const game = getString(formData, "game");
  const status = getString(formData, "status") ?? "持有中";

  if (!name || !game) {
    throw new Error("卡牌名称和卡牌游戏不能为空");
  }

  const imageUrl = await saveCardImage(formData);

  await prisma.cardItem.update({
    where: { id },
    data: {
      name,
      game,
      setName: getString(formData, "setName"),
      cardNumber: getString(formData, "cardNumber"),
      rarity: getString(formData, "rarity"),
      language: getString(formData, "language"),
      condition: getString(formData, "condition"),
      ...(imageUrl ? { imageUrl } : {}),
      quantity: getInteger(formData, "quantity") ?? 1,
      status: isActiveCardStatus(status) ? status : "持有中",

      gradingCompany: getString(formData, "gradingCompany"),
      grade: getString(formData, "grade"),

      purchaseDate: getDate(formData, "purchaseDate"),
      purchasePrice: getNumber(formData, "purchasePrice"),
      purchaseShipping: getNumber(formData, "purchaseShipping") ?? 0,
      purchasePlatform: getString(formData, "purchasePlatform"),

      saleDate: getDate(formData, "saleDate"),
      salePrice: getNumber(formData, "salePrice"),
      saleShipping: getNumber(formData, "saleShipping") ?? 0,
      salePlatform: getString(formData, "salePlatform"),

      notes: getString(formData, "notes"),
    },
  });

  revalidatePath("/");
  redirect("/");
}

