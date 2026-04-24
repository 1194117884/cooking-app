import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler } from '@/lib/api-wrapper';

// 手动添加物品到采购清单
async function addShoppingItem(
  req: AuthenticatedRequest,
  _context: { params: Promise<{}> }
) {
  const userId = req.userId;
  const body = await req.json();
  const { name, category, quantity, unit } = body;

  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      { error: '食材名称不能为空' },
      { status: 400 }
    );
  }

  // 获取本周一
  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

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

  // 查找或创建食材
  let ingredient = await prisma.ingredient.findFirst({
    where: {
      name: name.trim(),
    },
  });

  if (!ingredient) {
    ingredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        category: category || 'OTHER',
        unit: unit || '个',
      },
    });
  }

  // 检查是否已存在相同的购物项
  const existingItem = await prisma.shoppingListItem.findFirst({
    where: {
      shoppingListId: shoppingList.id,
      ingredientId: ingredient.id,
    },
  });

  let item;
  if (existingItem) {
    // 更新数量
    const newQuantityNeeded = existingItem.quantityNeeded.toNumber() + (quantity || 1);
    const newQuantityToBuy = newQuantityNeeded - existingItem.quantityHave.toNumber();

    item = await prisma.shoppingListItem.update({
      where: { id: existingItem.id },
      data: {
        quantityNeeded: newQuantityNeeded,
        quantityToBuy: Math.max(0, newQuantityToBuy),
      },
      include: {
        ingredient: true,
      },
    });
  } else {
    // 创建新购物项
    item = await prisma.shoppingListItem.create({
      data: {
        shoppingListId: shoppingList.id,
        ingredientId: ingredient.id,
        quantityNeeded: quantity || 1,
        unit: unit || '个',
        quantityHave: 0,
        quantityToBuy: quantity || 1,
        isPurchased: false,
      },
      include: {
        ingredient: true,
      },
    });
  }

  return NextResponse.json({
    item: {
      ...item,
      quantityNeeded: item.quantityNeeded.toNumber(),
      quantityHave: item.quantityHave.toNumber(),
      quantityToBuy: item.quantityToBuy.toNumber(),
    },
  });
}

// 导出包装后的处理器
export const POST = withAuthAndErrorHandler(addShoppingItem);
