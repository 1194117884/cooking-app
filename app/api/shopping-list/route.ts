import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler, withErrorHandler } from '@/lib/api-wrapper';

// 获取本周采购清单
async function getShoppingList(req: AuthenticatedRequest) {
  const userId = req.userId;

  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  let shoppingList = await prisma.shoppingList.findUnique({
    where: {
      userId_weekStartDate: {
        userId,
        weekStartDate: monday,
      },
    },
    include: {
      items: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!shoppingList) {
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({
    items: shoppingList.items.map((item) => ({
      ...item,
      quantityNeeded: item.quantityNeeded.toNumber(),
      quantityHave: item.quantityHave.toNumber(),
      quantityToBuy: item.quantityToBuy.toNumber(),
    })),
  });
}

// 导出包装后的处理器
export const GET = withAuthAndErrorHandler(getShoppingList);
