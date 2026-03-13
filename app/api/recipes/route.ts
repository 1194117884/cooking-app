import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

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

export async function POST(request: Request) {
  try {
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    if (!name || !cuisineType || !difficulty || !cookTimeMin || !servings || !steps) {
      return NextResponse.json(
        { error: '请填写所有必填项' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        cuisineType,
        difficulty,
        cookTimeMin,
        servings,
        caloriesPerServing,
        tags,
        coverImageUrl,
        steps,
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
