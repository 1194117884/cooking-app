import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取本周采购清单
export async function GET() {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    // 使用测试用户 ID
    const userId = '68ab6e5e-9583-4b49-8811-0b6367467c39';

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
  } catch (error) {
    console.error('Shopping list API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  }
}
