import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * 将单个菜谱添加到采购清单
 */
export async function POST(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { recipeId } = await request.json();

    if (!recipeId) {
      return NextResponse.json({ error: '请提供菜谱ID' }, { status: 400 });
    }

    // 获取菜谱详情
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: '菜谱不存在' }, { status: 404 });
    }

    // 获取或创建本周采购清单
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + 1);
    weekStart.setHours(0, 0, 0, 0);

    let shoppingList = await prisma.shoppingList.findUnique({
      where: {
        userId_weekStartDate: {
          userId: decoded.userId,
          weekStartDate: weekStart,
        },
      },
    });

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: {
          userId: decoded.userId,
          weekStartDate: weekStart,
        },
      });
    }

    // 添加食材到清单
    const items = [];
    for (const ri of recipe.ingredients) {
      const existingItem = await prisma.shoppingListItem.findFirst({
        where: {
          shoppingListId: shoppingList.id,
          ingredientId: ri.ingredientId,
        },
      });

      if (existingItem) {
        // 更新数量
        const updated = await prisma.shoppingListItem.update({
          where: { id: existingItem.id },
          data: {
            quantityNeeded: {
              increment: ri.quantity,
            },
            quantityToBuy: {
              increment: ri.quantity,
            },
          },
        });
        items.push(updated);
      } else {
        // 创建新项
        const created = await prisma.shoppingListItem.create({
          data: {
            shoppingListId: shoppingList.id,
            ingredientId: ri.ingredientId,
            quantityNeeded: ri.quantity,
            unit: ri.unit || ri.ingredient.unit,
            quantityToBuy: ri.quantity,
            aisle: ri.ingredient.category,
          },
        });
        items.push(created);
      }
    }

    return NextResponse.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('Add to shopping list error:', error);
    return NextResponse.json(
      { error: '添加失败' },
      { status: 500 }
    );
  }
}
