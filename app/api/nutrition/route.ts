import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * 营养分析 API
 * 分析用户本周/本月的营养摄入情况
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
    const range = searchParams.get('range') || 'week'; // week/month

    // 计算日期范围
    const today = new Date();
    const startDate = new Date(today);
    if (range === 'week') {
      const dayOfWeek = today.getDay() || 7;
      startDate.setDate(today.getDate() - dayOfWeek + 1);
    } else {
      startDate.setDate(1);
    }
    startDate.setHours(0, 0, 0, 0);

    // 获取本周/本月的餐食计划
    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        userId: decoded.userId,
        weekStartDate: {
          gte: startDate,
        },
        isCompleted: true,
      },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // 计算营养数据
    const dailyNutrition: Record<string, {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      mealCount: number;
    }> = {};

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalMeals = 0;

    // 按日期分组统计
    mealPlans.forEach(plan => {
      const dateKey = plan.weekStartDate.toISOString().split('T')[0];
      
      if (!dailyNutrition[dateKey]) {
        dailyNutrition[dateKey] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          mealCount: 0,
        };
      }

      // 计算这顿饭的营养
      const recipe = plan.recipe;
      const servings = plan.servingsActual || recipe.servings;
      
      const calories = (recipe.caloriesPerServing || 0) * servings;
      const protein = recipe.protein ? parseFloat(recipe.protein.toString()) * servings : 0;
      const carbs = recipe.carbs ? parseFloat(recipe.carbs.toString()) * servings : 0;
      const fat = recipe.fat ? parseFloat(recipe.fat.toString()) * servings : 0;

      dailyNutrition[dateKey].calories += calories;
      dailyNutrition[dateKey].protein += protein;
      dailyNutrition[dateKey].carbs += carbs;
      dailyNutrition[dateKey].fat += fat;
      dailyNutrition[dateKey].mealCount += 1;

      totalCalories += calories;
      totalProtein += protein;
      totalCarbs += carbs;
      totalFat += fat;
      totalMeals += 1;
    });

    // 转换为图表数据
    const chartData = Object.entries(dailyNutrition)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        calories: Math.round(data.calories),
        protein: Math.round(data.protein),
        carbs: Math.round(data.carbs),
        fat: Math.round(data.fat),
        mealCount: data.mealCount,
      }));

    // 计算营养比例
    const macroRatio = {
      protein: totalProtein > 0 ? Math.round((totalProtein * 4 / totalCalories) * 100) || 0 : 0,
      carbs: totalCarbs > 0 ? Math.round((totalCarbs * 4 / totalCalories) * 100) || 0 : 0,
      fat: totalFat > 0 ? Math.round((totalFat * 9 / totalCalories) * 100) || 0 : 0,
    };

    // 计算每日平均
    const days = range === 'week' ? 7 : new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dailyAvg = {
      calories: Math.round(totalCalories / days),
      protein: Math.round(totalProtein / days),
      carbs: Math.round(totalCarbs / days),
      fat: Math.round(totalFat / days),
    };

    // 营养建议
    const suggestions = generateSuggestions(dailyAvg, macroRatio);

    return NextResponse.json({
      summary: {
        totalMeals,
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
      },
      dailyAvg,
      macroRatio,
      chartData,
      suggestions,
    });
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return NextResponse.json(
      { error: '分析失败' },
      { status: 500 }
    );
  }
}

/**
 * 生成营养建议
 */
function generateSuggestions(dailyAvg: any, macroRatio: any) {
  const suggestions: string[] = [];

  // 热量建议
  if (dailyAvg.calories < 1200) {
    suggestions.push('⚠️ 每日摄入热量偏低，建议适当增加营养');
  } else if (dailyAvg.calories > 2500) {
    suggestions.push('⚠️ 每日摄入热量偏高，注意控制饮食');
  } else {
    suggestions.push('✅ 热量摄入合理');
  }

  // 蛋白质建议
  if (macroRatio.protein < 15) {
    suggestions.push('💪 蛋白质摄入不足，建议增加肉类/蛋类/豆制品');
  } else if (macroRatio.protein > 35) {
    suggestions.push('⚠️ 蛋白质摄入偏高，注意均衡饮食');
  } else {
    suggestions.push('✅ 蛋白质摄入合理');
  }

  // 碳水建议
  if (macroRatio.carbs < 45) {
    suggestions.push('🍚 碳水化合物摄入偏低，建议增加主食');
  } else if (macroRatio.carbs > 65) {
    suggestions.push('⚠️ 碳水化合物摄入偏高，适当减少主食');
  } else {
    suggestions.push('✅ 碳水化合物摄入合理');
  }

  // 脂肪建议
  if (macroRatio.fat > 35) {
    suggestions.push('🥗 脂肪摄入偏高，建议减少油腻食物');
  } else {
    suggestions.push('✅ 脂肪摄入合理');
  }

  return suggestions;
}
