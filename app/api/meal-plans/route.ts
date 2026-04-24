import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthenticatedRequest, withAuthAndErrorHandler } from '@/lib/api-wrapper';

// 获取本周计划
async function getMealPlans(req: AuthenticatedRequest, _context: { params: Promise<{}> }) {
  const userId = req.userId;

  const today = new Date();
  const dayOfWeek = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);

  const mealPlans = await prisma.mealPlan.findMany({
    where: {
      userId,
      weekStartDate: monday,
    },
    include: {
      recipe: true,
      ratings: {
        select: {
          rating: true,
          memberId: true,
        },
      },
    },
  });

  return NextResponse.json({
    mealPlans: mealPlans.map((mp) => ({
      id: mp.id,
      dayOfWeek: mp.dayOfWeek,
      mealType: mp.mealType,
      recipe: {
        id: mp.recipe.id,
        name: mp.recipe.name,
        cuisineType: mp.recipe.cuisineType,
        cookTimeMin: mp.recipe.cookTimeMin,
      },
      ratings: mp.ratings,
    })),
  });
}

// 添加餐食计划
async function createMealPlan(req: AuthenticatedRequest, _context: { params: Promise<{}> }) {
  const userId = req.userId;
  const body = await req.json();
  const { dayOfWeek, mealType, recipeId } = body;

  // 获取本周一
  const today = new Date();
  const dayOfWeekNum = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeekNum + 1);
  monday.setHours(0, 0, 0, 0);

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId,
      weekStartDate: monday,
      dayOfWeek,
      mealType,
      recipeId,
    },
    include: {
      recipe: true,
    },
  });

  return NextResponse.json({ mealPlan });
}

// 导出包装后的处理器
export const GET = withAuthAndErrorHandler(getMealPlans);
export const POST = withAuthAndErrorHandler(createMealPlan);
