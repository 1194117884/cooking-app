import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * 获取餐食评分列表
 */
export async function GET(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { searchParams } = new URL(request.url);
    const mealPlanId = searchParams.get('mealPlanId');

    const where: any = {};
    if (mealPlanId) {
      where.mealPlanId = mealPlanId;
    }

    // 获取用户的餐食评分
    const ratings = await prisma.mealRating.findMany({
      where,
      include: {
        member: true,
        recipe: {
          select: {
            id: true,
            name: true,
          },
        },
        mealPlan: {
          select: {
            id: true,
            dayOfWeek: true,
            mealType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ ratings });
  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: '获取评分失败' },
      { status: 500 }
    );
  }
}

/**
 * 提交餐食评分
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

    const { mealPlanId, memberId, rating, comment } = await request.json();

    if (!mealPlanId || !memberId || !rating) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '评分必须在 1-5 之间' },
        { status: 400 }
      );
    }

    // 获取餐食计划信息
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId: decoded.userId,
      },
      include: { recipe: true },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: '餐食计划不存在' },
        { status: 404 }
      );
    }

    // 创建或更新评分
    const mealRating = await prisma.mealRating.upsert({
      where: {
        mealPlanId_memberId: {
          mealPlanId,
          memberId,
        },
      },
      update: {
        rating,
        comment,
      },
      create: {
        mealPlanId,
        memberId,
        recipeId: mealPlan.recipeId,
        rating,
        comment,
      },
      include: {
        member: true,
        recipe: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      rating: mealRating,
    });
  } catch (error) {
    console.error('Create rating error:', error);
    return NextResponse.json(
      { error: '评分失败' },
      { status: 500 }
    );
  }
}
