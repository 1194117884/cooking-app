import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { MealType } from '@prisma/client';
import { AppError, AppErrorCode, handleError, createErrorResponse } from '@/lib/errors';

/**
 * 智能生成周计划 API
 * 基于用户偏好自动生成一周菜单
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);

    if (!userId) {
      throw new AppError(
        '未授权访问',
        AppErrorCode.AUTHENTICATION_ERROR,
        401
      );
    }

    const body = await request.json();
    const { weekStartDate } = body;

    if (!weekStartDate) {
      throw new AppError(
        '请提供周开始日期',
        AppErrorCode.INVALID_INPUT,
        400
      );
    }

    const startOfWeek = new Date(weekStartDate);
    startOfWeek.setHours(0, 0, 0, 0);

    // 获取用户的家庭成员和偏好
    const members = await prisma.familyMember.findMany({
      where: { userId: userId },
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
      throw new AppError(
        '可用菜谱不足，请先添加更多菜谱',
        AppErrorCode.VALIDATION_ERROR,
        400
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
        let candidates = [...recipes]; // 创建副本避免直接修改

        // 对早餐进行适度筛选，不过于严格
        if (mealType === 'BREAKFAST') {
          // 调整早餐筛选条件，使其更宽松
          candidates = recipes.filter((r) => {
            // 早餐仍然倾向于选择简单、快速的菜谱，但条件更宽松
            return r.cookTimeMin <= 30; // 放宽到30分钟内
          });
        }

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

          // 对于早餐，简单易做的菜谱额外加分
          if (mealType === 'BREAKFAST' && recipe.difficulty === 'EASY') {
            score += 1.5;
          }

          return { recipe, score };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);

        // 选择得分最高的
        if (scoredCandidates.length > 0) {
          const selected = scoredCandidates[0].recipe;
          usedRecipes.add(selected.id);

          mealPlans.push({
            userId: userId,
            weekStartDate: startOfWeek,
            mealType,
            dayOfWeek: day,
            recipeId: selected.id,
            servingsActual: members.length > 0 ? members.length : 4,
          });
        } else {
          // 如果没有合适的菜谱，随机选择一个
          const randomIndex = Math.floor(Math.random() * recipes.length);
          const selected = recipes[randomIndex];
          mealPlans.push({
            userId: userId,
            weekStartDate: startOfWeek,
            mealType,
            dayOfWeek: day,
            recipeId: selected.id,
            servingsActual: members.length > 0 ? members.length : 4,
          });
        }
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
    const appError = handleError(error);

    return NextResponse.json(
      createErrorResponse(appError),
      { status: appError.statusCode }
    );
  }
}
