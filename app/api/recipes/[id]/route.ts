import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: params.id },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      recipe: {
        ...recipe,
        ingredients: recipe.ingredients.map((ri) => ({
          name: ri.ingredient.name,
          quantity: ri.quantity.toNumber(),
          unit: ri.unit || ri.ingredient.unit,
          note: ri.note,
        })),
      },
    });
  } catch (error) {
    console.error('Recipe detail API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}
