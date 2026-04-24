import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isPurchased, quantityHave } = body;

    const updateData: any = {};
    if (typeof isPurchased === 'boolean') {
      updateData.isPurchased = isPurchased;
    }
    if (typeof quantityHave === 'number') {
      updateData.quantityHave = quantityHave;
      updateData.quantityToBuy = Math.max(0, updateData.quantityHave || 0);
    }

    const item = await prisma.shoppingListItem.update({
      where: { id },
      data: updateData,
      include: {
        ingredient: true,
      },
    });

    return NextResponse.json({
      item: {
        ...item,
        quantityNeeded: item.quantityNeeded.toNumber(),
        quantityHave: item.quantityHave.toNumber(),
        quantityToBuy: item.quantityToBuy.toNumber(),
      },
    });
  } catch (error) {
    console.error('Update shopping item error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}
