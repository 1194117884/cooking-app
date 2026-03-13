import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { MealType } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * 智能生成周计划 API
 * 基于用户偏好自动生成一周菜单
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

    const body = await request.json();
    const { weekStartDate } = body;

    if (!weekStartDate) {
      return NextResponse.json({ error: '请提供周开始日期' }, { status: 400 });
    }

    const startOfWeek = new Date(weekStartDate);
    startOfWeek.setHours(0, 0, 0, 0);

    // 获取用户的家庭成员和偏好
    const members = await prisma.familyMember.findMany({
      where: { userId: decoded.userId },
      include: { preferences: true },
    });

    // 收集偏好数据
    const likes: string[] = [];
    const dislikes: string[] = [];

    members.forEach((member) => {
      member.preferences.forEach((pref) => {
        if (pref.type === 'LIKE' && pref.category === 'INGREDIENT') {
          likes.push(pref.value.toLowerCase());
        }
        if (pref.type === 'DISLIKE') {
          dislikes.push(pref.value.toLowerCase());
        }
      });
    });

    // 获取所有菜谱
    let recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });

    // 过滤掉包含忌口的菜谱
    recipes = recipes.filter((recipe) => {
      const ingredients = recipe.ingredients.map((ri) =>
        ri.ingredient.name.toLowerCase()
      );
      return !dislikes.some((dislike) =>
        ingredients.some((i) => i.includes(dislike))
      );
    });

    if (recipes.length < 7) {
      return NextResponse.json(
        { error: '可用菜谱不足，请先添加更多菜谱' },
        { status: 400 }
      );
    }

    // 为每顿饭选择菜谱
    const mealPlans = [];
    const usedRecipes = new Set<string>();

    // 生成早中晚三餐，共7天
    const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

    for (let day = 1; day <= 7; day++) {
      for (const mealType of mealTypes) {
        // 根据餐点类型筛选合适的菜谱
        let candidates = recipes.filter((r) => {
          // 早餐偏好简单快捷
          if (mealType === 'BREAKFAST') {
            return r.cookTimeMin <= 20 && r.difficulty === 'EASY';
          }
          // 午餐和晚餐可以更丰盛
          return true;
        });

        // 排除已使用的菜谱
        candidates = candidates.filter((r) => !usedRecipes.has(r.id));

        // 如果候选不足，允许重复使用
        if (candidates.length === 0) {
          candidates = recipes;
        }

        // 计算分数并排序
        const scoredCandidates = candidates.map((recipe) => {
          let score = recipe.popularity / 1000;

          // 包含喜欢的食材加分
          const ingredients = recipe.ingredients.map((ri) =>
            ri.ingredient.name.toLowerCase()
          );
          for (const like of likes) {
            if (ingredients.some((i) => i.includes(like))) {
              score += 2;
            }
          }

          // 烹饪时间短加分
          if (recipe.cookTimeMin <= 30) {
            score += 1;
          }

          return { recipe, score };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);

        // 选择得分最高的
        const selected = scoredCandidates[0].recipe;
        usedRecipes.add(selected.id);

        mealPlans.push({
          userId: decoded.userId,
          weekStartDate: startOfWeek,
          mealType,
          dayOfWeek: day,
          recipeId: selected.id,
          servingsActual: members.length > 0 ? members.length : 4,
        });
      }
    }

    // 批量创建计划
    const created = await prisma.$transaction(
      mealPlans.map((plan) =>
        prisma.mealPlan.create({
          data: plan,
          include: { recipe: true },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: created.length,
      plans: created.map((p) => ({
        id: p.id,
        dayOfWeek: p.dayOfWeek,
        mealType: p.mealType,
        recipeName: p.recipe.name,
      })),
    });
  } catch (error) {
    console.error('Generate meal plans error:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
