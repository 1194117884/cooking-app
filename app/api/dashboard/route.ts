import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取统计数据
    const [
      recipeCount,
      memberCount,
      favoriteCount,
      ingredientCount
    ] = await Promise.all([
      prisma.recipe.count(),
      prisma.familyMember.count({ where: { isActive: true } }),
      prisma.recipe.count({ where: { isFavorite: true } }),
      prisma.ingredient.count()
    ]);

    // 获取本周计划
    const today = new Date();
    const dayOfWeek = today.getDay() || 7; // 1-7 (Monday=1)
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        weekStartDate: monday,
      },
      include: {
        recipe: true,
      },
    });

    // 获取热门菜谱
    const popularRecipes = await prisma.recipe.findMany({
      take: 5,
      orderBy: { popularity: 'desc' },
    });

    return NextResponse.json({
      stats: {
        recipeCount,
        memberCount,
        favoriteCount,
        ingredientCount,
        mealPlanCount: mealPlans.length,
      },
      mealPlans,
      popularRecipes,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
