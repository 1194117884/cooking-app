import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, sanitizeInput, sanitizeRichInput } from '@/lib/auth';
import { Difficulty } from '@prisma/client';

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      orderBy: { popularity: 'desc' },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return NextResponse.json({
      recipes: recipes.map((recipe) => ({
        ...recipe,
        ingredients: recipe.ingredients.map((ri) => ({
          name: ri.ingredient.name,
          quantity: ri.quantity,
          unit: ri.unit || ri.ingredient.unit,
          note: ri.note,
        })),
      })),
    });
  } catch (error) {
    console.error('Recipes API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyToken(request);

    if (!userId) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();

    // 清理并验证输入
    const {
      name,
      cuisineType,
      difficulty,
      cookTimeMin,
      servings,
      caloriesPerServing,
      tags,
      coverImageUrl,
      steps,
    } = body;

    if (
      !name || typeof name !== 'string' ||
      !cuisineType || typeof cuisineType !== 'string' ||
      !difficulty || typeof difficulty !== 'string' ||
      typeof cookTimeMin !== 'number' ||
      typeof servings !== 'number' ||
      !steps || (typeof steps !== 'string' && typeof steps !== 'object')
    ) {
      return NextResponse.json(
        { error: '请填写所有必填项且类型正确' },
        { status: 400 }
      );
    }

    // 清理输入数据 with enhanced sanitization
    const sanitizedName = sanitizeInput(name);
    const sanitizedCuisineType = sanitizeInput(cuisineType);
    const sanitizedCoverImageUrl = coverImageUrl ? sanitizeInput(coverImageUrl as string) : null;
    const sanitizedTags = Array.isArray(tags) ? tags.map(tag => sanitizeInput(String(tag))) : [];
    // steps can be JSON object (from rich text editor) or string (legacy format)
    const sanitizedSteps = typeof steps === 'object' ? steps : sanitizeRichInput(steps);

    // 验证数据范围
    if (cookTimeMin <= 0 || servings <= 0) {
      return NextResponse.json(
        { error: '烹饪时间和服务份数必须大于0' },
        { status: 400 }
      );
    }

    if (caloriesPerServing && (typeof caloriesPerServing !== 'number' || caloriesPerServing <= 0)) {
      return NextResponse.json(
        { error: '卡路里必须为正数' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        name: sanitizedName,
        cuisineType: sanitizedCuisineType,
        difficulty: difficulty as Difficulty,
        cookTimeMin,
        servings,
        caloriesPerServing: caloriesPerServing || null,
        tags: sanitizedTags,
        coverImageUrl: sanitizedCoverImageUrl || null,
        steps: sanitizedSteps,
        userId,
        popularity: 0,
        isFavorite: false,
      },
    });

    return NextResponse.json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    return NextResponse.json(
      { error: '创建失败' },
      { status: 500 }
    );
  }
}
