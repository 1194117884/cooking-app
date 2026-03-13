import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

// 获取本周计划
export async function GET(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    let userId = '68ab6e5e-9583-4b49-8811-0b6367467c39'; // 默认测试用户

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch {
        // 使用默认用户
      }
    }

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
  } catch (error) {
    console.error('Meal plans API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

// 添加餐食计划
export async function POST(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: '无效的 token' }, { status: 401 });
    }

    const body = await request.json();
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
  } catch (error: any) {
    console.error('Create meal plan error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '该时段已有安排' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}
