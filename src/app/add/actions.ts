"use server";

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

export async function createCard(formData: FormData) {
  const name = getString(formData, "name");
  const game = getString(formData, "game");
  const status = getString(formData, "status") ?? "持有中";

  if (!name || !game) {
    throw new Error("卡牌名称和卡牌游戏不能为空");
  }

  const imageUrl = await saveCardImage(formData);

  await prisma.cardItem.create({
    data: {
      name,
      game,
      setName: getString(formData, "setName"),
      cardNumber: getString(formData, "cardNumber"),
      rarity: getString(formData, "rarity"),
      language: getString(formData, "language"),
      condition: getString(formData, "condition"),
      imageUrl,
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

  redirect("/");
}

