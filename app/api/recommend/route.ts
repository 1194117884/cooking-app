import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * 智能推荐算法
 * 基于用户偏好、菜谱热度、营养均衡进行推荐
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const mealType = searchParams.get('mealType'); // BREAKFAST/LUNCH/DINNER

    // 获取用户的所有偏好
    const members = await prisma.familyMember.findMany({
      where: { userId: decoded.userId },
      include: {
        preferences: true,
      },
    });

    // 收集所有喜欢和忌口
    const likes: string[] = [];
    const dislikes: string[] = [];
    
    members.forEach(member => {
      member.preferences.forEach(pref => {
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
          include: {
            ingredient: true,
          },
        },
      },
    });

    // 过滤忌口
    recipes = recipes.filter(recipe => {
      const recipeName = recipe.name.toLowerCase();
      const tags = recipe.tags.map(t => t.toLowerCase());
      const ingredients = recipe.ingredients.map(
        ri => ri.ingredient.name.toLowerCase()
      );

      // 检查是否包含忌口食材
      for (const dislike of dislikes) {
        if (
          recipeName.includes(dislike) ||
          tags.some(t => t.includes(dislike)) ||
          ingredients.some(i => i.includes(dislike))
        ) {
          return false;
        }
      }
      return true;
    });

    // 计算推荐分数
    const scoredRecipes = recipes.map(recipe => {
      let score = recipe.popularity / 1000; // 基础分 (热度)

      const recipeName = recipe.name.toLowerCase();
      const tags = recipe.tags.map(t => t.toLowerCase());
      const ingredients = recipe.ingredients.map(
        ri => ri.ingredient.name.toLowerCase()
      );
      const allText = [recipeName, ...tags, ...ingredients].join(' ');

      // 加分项：包含喜欢的食材
      for (const like of likes) {
        if (allText.includes(like)) {
          score += 2;
        }
      }

      // 加分项：烹饪时间短 (适合工作餐)
      if (mealType === 'LUNCH' && recipe.cookTimeMin <= 30) {
        score += 1;
      }

      // 加分项：难度适中
      if (recipe.difficulty === 'EASY') {
        score += 0.5;
      }

      return { ...recipe, score };
    });

    // 按分数排序
    scoredRecipes.sort((a, b) => b.score - a.score);

    // 返回前 N 个
    const recommended = scoredRecipes.slice(0, limit).map(r => ({
      id: r.id,
      name: r.name,
      cuisineType: r.cuisineType,
      difficulty: r.difficulty,
      cookTimeMin: r.cookTimeMin,
      servings: r.servings,
      caloriesPerServing: r.caloriesPerServing,
      tags: r.tags,
      coverImageUrl: r.coverImageUrl,
      popularity: r.popularity,
      score: Math.round(r.score * 100) / 100,
      reason: getRecommendReason(r, likes),
    }));

    return NextResponse.json({
      recommended,
      totalRecipes: recipes.length,
      filters: {
        likesCount: likes.length,
        dislikesCount: dislikes.length,
      },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: '推荐失败' },
      { status: 500 }
    );
  }
}

/**
 * 生成推荐理由
 */
function getRecommendReason(recipe: any, likes: string[]) {
  const reasons: string[] = [];

  // 检查是否包含喜欢的食材
  const ingredients = recipe.ingredients.map(
    (ri: any) => ri.ingredient.name.toLowerCase()
  );
  
  for (const like of likes) {
    if (ingredients.some((i: string) => i.includes(like))) {
      reasons.push(`含您喜欢的${like}`);
      break;
    }
  }

  // 热门菜谱
  if (recipe.popularity > 9000) {
    reasons.push('热门菜谱');
  }

  // 烹饪时间短
  if (recipe.cookTimeMin <= 20) {
    reasons.push('快手菜');
  }

  // 难度低
  if (recipe.difficulty === 'EASY') {
    reasons.push('简单易做');
  }

  return reasons.join(' · ') || '为您推荐';
}
