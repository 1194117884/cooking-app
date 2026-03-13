import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    // 使用测试用户 ID
    const userId = '68ab6e5e-9583-4b49-8811-0b6367467c39';

    // 获取本周餐食计划
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        userId,
        weekStartDate: monday,
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (mealPlans.length === 0) {
      return NextResponse.json({
        items: [],
        message: '本周还没有餐食计划',
      });
    }

    // 聚合食材需求
    const ingredientMap = new Map<
      string,
      { quantity: number; unit: string; ingredient: any }
    >();

    for (const plan of mealPlans) {
      for (const ri of plan.recipe.ingredients) {
        const key = ri.ingredientId;
        const existing = ingredientMap.get(key);
        if (existing) {
          existing.quantity += ri.quantity.toNumber();
        } else {
          ingredientMap.set(key, {
            quantity: ri.quantity.toNumber(),
            unit: ri.unit || ri.ingredient.unit,
            ingredient: ri.ingredient,
          });
        }
      }
    }

    // 获取或创建采购清单
    let shoppingList = await prisma.shoppingList.findUnique({
      where: {
        userId_weekStartDate: {
          userId,
          weekStartDate: monday,
        },
      },
    });

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: {
          userId,
          weekStartDate: monday,
        },
      });
    }

    // 创建或更新采购清单项目
    const items: any[] = [];
    for (const [ingredientId, data] of Array.from(ingredientMap.entries())) {
      const item = await prisma.shoppingListItem.upsert({
        where: {
          shoppingListId_ingredientId: {
            shoppingListId: shoppingList.id,
            ingredientId,
          },
        },
        update: {
          quantityNeeded: data.quantity,
          quantityToBuy: data.quantity,
        },
        create: {
          shoppingListId: shoppingList.id,
          ingredientId,
          quantityNeeded: data.quantity,
          unit: data.unit,
          quantityHave: 0,
          quantityToBuy: data.quantity,
          isPurchased: false,
        },
        include: {
          ingredient: true,
        },
      });
      items.push({
        ...item,
        quantityNeeded: item.quantityNeeded.toNumber(),
        quantityHave: item.quantityHave.toNumber(),
        quantityToBuy: item.quantityToBuy.toNumber(),
      });
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Generate shopping list error:', error);
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    );
  }
}
