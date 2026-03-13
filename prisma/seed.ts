import { PrismaClient, IngredientCategory, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化数据库...');

  // ============================================
  // 1. 初始化基础食材库 (常用食材)
  // ============================================
  const ingredients = [
    // 蔬菜类
    { name: '鸡胸肉', category: IngredientCategory.MEAT, unit: 'g', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
    { name: '鸡蛋', category: IngredientCategory.OTHER, unit: '个', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
    { name: '西兰花', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
    { name: '番茄', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2 },
    { name: '青椒', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 20, proteinPer100g: 0.9, carbsPer100g: 4.6, fatPer100g: 0.2 },
    { name: '大蒜', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 149, proteinPer100g: 6.4, carbsPer100g: 33, fatPer100g: 0.5 },
    { name: '生姜', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 80, proteinPer100g: 1.8, carbsPer100g: 18, fatPer100g: 0.8 },
    { name: '葱', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 32, proteinPer100g: 1.8, carbsPer100g: 7.3, fatPer100g: 0.2 },
    { name: '花生米', category: IngredientCategory.OTHER, unit: 'g', caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49 },
    { name: '干辣椒', category: IngredientCategory.SEASONING, unit: 'g', caloriesPer100g: 282, proteinPer100g: 12, carbsPer100g: 50, fatPer100g: 17 },
    { name: '鲈鱼', category: IngredientCategory.SEAFOOD, unit: 'g', caloriesPer100g: 105, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 2 },
    { name: '豆腐', category: IngredientCategory.OTHER, unit: 'g', caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8 },
    { name: '猪肉', category: IngredientCategory.MEAT, unit: 'g', caloriesPer100g: 250, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 18 },
    { name: '牛肉', category: IngredientCategory.MEAT, unit: 'g', caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15 },
    { name: '虾仁', category: IngredientCategory.SEAFOOD, unit: 'g', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3 },
    { name: '大米', category: IngredientCategory.GRAIN, unit: 'g', caloriesPer100g: 365, proteinPer100g: 7, carbsPer100g: 80, fatPer100g: 0.7 },
    { name: '酱油', category: IngredientCategory.SEASONING, unit: 'ml', caloriesPer100g: 53, proteinPer100g: 8, carbsPer100g: 5, fatPer100g: 0 },
    { name: '醋', category: IngredientCategory.SEASONING, unit: 'ml', caloriesPer100g: 18, proteinPer100g: 0, carbsPer100g: 0.4, fatPer100g: 0 },
    { name: '料酒', category: IngredientCategory.SEASONING, unit: 'ml', caloriesPer100g: 80, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
    { name: '盐', category: IngredientCategory.SEASONING, unit: 'g', caloriesPer100g: 0, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 0 },
    { name: '糖', category: IngredientCategory.SEASONING, unit: 'g', caloriesPer100g: 387, proteinPer100g: 0, carbsPer100g: 100, fatPer100g: 0 },
    { name: '淀粉', category: IngredientCategory.SEASONING, unit: 'g', caloriesPer100g: 340, proteinPer100g: 0.3, carbsPer100g: 85, fatPer100g: 0.1 },
    { name: '食用油', category: IngredientCategory.SEASONING, unit: 'ml', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100 },
    { name: '土豆', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 77, proteinPer100g: 2, carbsPer100g: 17, fatPer100g: 0.1 },
    { name: '胡萝卜', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2 },
    { name: '洋葱', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1 },
    { name: '白菜', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 16, proteinPer100g: 1.5, carbsPer100g: 3, fatPer100g: 0.2 },
    { name: '菠菜', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4 },
    { name: '黄瓜', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1 },
    { name: '茄子', category: IngredientCategory.VEGETABLE, unit: 'g', caloriesPer100g: 25, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.2 },
  ];

  console.log('📦 导入食材库...');
  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { name_category: { name: ing.name, category: ing.category as any } },
      update: ing,
      create: ing,
    });
  }
  console.log(`✅ 导入 ${ingredients.length} 种食材`);

  // ============================================
  // 2. 导入内置菜谱 (下厨房热门菜)
  // ============================================
  const recipes = [
    {
      name: '宫保鸡丁',
      cuisineType: '川菜',
      difficulty: Difficulty.MEDIUM,
      cookTimeMin: 25,
      servings: 4,
      caloriesPerServing: 450,
      protein: 35,
      carbs: 15,
      fat: 28,
      tags: ['辣', '快手菜', '下饭'],
      popularity: 9500,
      steps: JSON.stringify([
        '鸡胸肉切丁，加盐、料酒、淀粉腌制 15 分钟',
        '花生米炸香备用',
        '干辣椒剪段，葱姜蒜切末',
        '热锅凉油，下鸡丁滑炒至变色',
        '加入干辣椒、葱姜蒜炒香',
        '调入酱油、醋、糖、料酒',
        '最后加入花生米，翻炒均匀出锅'
      ]),
      ingredients: [
        { name: '鸡胸肉', quantity: 400, unit: 'g', note: '切丁' },
        { name: '花生米', quantity: 80, unit: 'g', note: '炸香' },
        { name: '干辣椒', quantity: 15, unit: 'g', note: '剪段' },
        { name: '大蒜', quantity: 20, unit: 'g', note: '切末' },
        { name: '生姜', quantity: 10, unit: 'g', note: '切末' },
        { name: '葱', quantity: 15, unit: 'g', note: '切段' },
        { name: '酱油', quantity: 15, unit: 'ml' },
        { name: '醋', quantity: 10, unit: 'ml' },
        { name: '糖', quantity: 10, unit: 'g' },
        { name: '料酒', quantity: 10, unit: 'ml' },
        { name: '淀粉', quantity: 10, unit: 'g' },
        { name: '盐', quantity: 3, unit: 'g' },
        { name: '食用油', quantity: 30, unit: 'ml' },
      ]
    },
    {
      name: '清蒸鲈鱼',
      cuisineType: '粤菜',
      difficulty: Difficulty.EASY,
      cookTimeMin: 20,
      servings: 3,
      caloriesPerServing: 320,
      protein: 40,
      carbs: 5,
      fat: 15,
      tags: ['清淡', '海鲜', '健康', '儿童适宜'],
      popularity: 8800,
      steps: JSON.stringify([
        '鲈鱼处理干净，两面划刀',
        '鱼身抹盐、料酒，放姜片腌制 10 分钟',
        '水开后上锅蒸 8-10 分钟',
        '倒掉盘中多余水分',
        '撒上葱姜丝，淋上蒸鱼豉油',
        '烧热油，浇在葱姜丝上即可'
      ]),
      ingredients: [
        { name: '鲈鱼', quantity: 500, unit: 'g', note: '1 条' },
        { name: '生姜', quantity: 30, unit: 'g', note: '切片 + 切丝' },
        { name: '葱', quantity: 30, unit: 'g', note: '切丝' },
        { name: '料酒', quantity: 15, unit: 'ml' },
        { name: '盐', quantity: 5, unit: 'g' },
        { name: '酱油', quantity: 30, unit: 'ml', note: '蒸鱼豉油' },
        { name: '食用油', quantity: 20, unit: 'ml' },
      ]
    },
    {
      name: '麻婆豆腐',
      cuisineType: '川菜',
      difficulty: Difficulty.MEDIUM,
      cookTimeMin: 20,
      servings: 4,
      caloriesPerServing: 380,
      protein: 18,
      carbs: 12,
      fat: 28,
      tags: ['辣', '下饭', '素食'],
      popularity: 9200,
      steps: JSON.stringify([
        '豆腐切块，开水焯烫去豆腥味',
        '猪肉剁成肉末',
        '热锅凉油，下肉末炒散',
        '加入豆瓣酱炒出红油',
        '加入葱姜蒜末炒香',
        '倒入豆腐，轻轻推动',
        '加入酱油、糖调味',
        '水淀粉勾芡，撒花椒粉、葱花出锅'
      ]),
      ingredients: [
        { name: '豆腐', quantity: 500, unit: 'g', note: '切块' },
        { name: '猪肉', quantity: 100, unit: 'g', note: '剁末' },
        { name: '大蒜', quantity: 15, unit: 'g', note: '切末' },
        { name: '葱', quantity: 15, unit: 'g', note: '切花' },
        { name: '生姜', quantity: 10, unit: 'g', note: '切末' },
        { name: '干辣椒', quantity: 10, unit: 'g' },
        { name: '酱油', quantity: 15, unit: 'ml' },
        { name: '糖', quantity: 5, unit: 'g' },
        { name: '淀粉', quantity: 10, unit: 'g' },
        { name: '食用油', quantity: 40, unit: 'ml' },
        { name: '盐', quantity: 3, unit: 'g' },
      ]
    },
    {
      name: '蒜蓉西兰花',
      cuisineType: '粤菜',
      difficulty: Difficulty.EASY,
      cookTimeMin: 10,
      servings: 3,
      caloriesPerServing: 120,
      protein: 5,
      carbs: 12,
      fat: 6,
      tags: ['清淡', '健康', '素食', '快手菜'],
      popularity: 7500,
      steps: JSON.stringify([
        '西兰花掰成小朵，盐水浸泡 10 分钟',
        '大蒜剁成蒜蓉',
        '水开加盐和油，下西兰花焯水 2 分钟',
        '热锅凉油，下蒜蓉炒香',
        '倒入西兰花快速翻炒',
        '加盐调味，出锅'
      ]),
      ingredients: [
        { name: '西兰花', quantity: 500, unit: 'g' },
        { name: '大蒜', quantity: 30, unit: 'g', note: '剁蓉' },
        { name: '盐', quantity: 5, unit: 'g' },
        { name: '食用油', quantity: 20, unit: 'ml' },
      ]
    },
    {
      name: '番茄炒蛋',
      cuisineType: '家常菜',
      difficulty: Difficulty.EASY,
      cookTimeMin: 10,
      servings: 3,
      caloriesPerServing: 220,
      protein: 14,
      carbs: 10,
      fat: 14,
      tags: ['快手菜', '家常', '儿童适宜'],
      popularity: 9800,
      steps: JSON.stringify([
        '番茄切块，鸡蛋打散加盐',
        '热锅热油，倒入蛋液炒散盛出',
        '锅中留底油，下番茄翻炒出汁',
        '加入糖、盐调味',
        '倒入鸡蛋，翻炒均匀',
        '撒葱花出锅'
      ]),
      ingredients: [
        { name: '番茄', quantity: 400, unit: 'g', note: '3 个' },
        { name: '鸡蛋', quantity: 4, unit: '个' },
        { name: '葱', quantity: 10, unit: 'g' },
        { name: '盐', quantity: 5, unit: 'g' },
        { name: '糖', quantity: 10, unit: 'g' },
        { name: '食用油', quantity: 30, unit: 'ml' },
      ]
    },
    {
      name: '鱼香肉丝',
      cuisineType: '川菜',
      difficulty: Difficulty.HARD,
      cookTimeMin: 30,
      servings: 4,
      caloriesPerServing: 420,
      protein: 28,
      carbs: 20,
      fat: 25,
      tags: ['辣', '下饭', '经典'],
      popularity: 8900,
      steps: JSON.stringify([
        '猪肉切丝，加盐、料酒、淀粉腌制',
        '木耳、胡萝卜、青椒切丝',
        '调制鱼香汁：酱油、醋、糖、淀粉、水',
        '热锅凉油，下肉丝滑炒至变色盛出',
        '锅中留油，下豆瓣酱炒出红油',
        '加入葱姜蒜末炒香',
        '倒入蔬菜丝翻炒',
        '加入肉丝和鱼香汁，快速翻炒均匀'
      ]),
      ingredients: [
        { name: '猪肉', quantity: 300, unit: 'g', note: '切丝' },
        { name: '胡萝卜', quantity: 100, unit: 'g', note: '切丝' },
        { name: '青椒', quantity: 100, unit: 'g', note: '切丝' },
        { name: '大蒜', quantity: 20, unit: 'g', note: '切末' },
        { name: '生姜', quantity: 10, unit: 'g', note: '切末' },
        { name: '葱', quantity: 15, unit: 'g', note: '切末' },
        { name: '酱油', quantity: 20, unit: 'ml' },
        { name: '醋', quantity: 15, unit: 'ml' },
        { name: '糖', quantity: 15, unit: 'g' },
        { name: '淀粉', quantity: 15, unit: 'g' },
        { name: '料酒', quantity: 10, unit: 'ml' },
        { name: '盐', quantity: 3, unit: 'g' },
        { name: '食用油', quantity: 40, unit: 'ml' },
      ]
    },
    {
      name: '红烧肉',
      cuisineType: '家常菜',
      difficulty: Difficulty.HARD,
      cookTimeMin: 90,
      servings: 6,
      caloriesPerServing: 580,
      protein: 25,
      carbs: 15,
      fat: 45,
      tags: ['经典', '下饭', '硬菜'],
      popularity: 9600,
      steps: JSON.stringify([
        '五花肉切块，冷水下锅焯水',
        '捞出沥干，锅中不放油煸炒出油',
        '加入冰糖炒糖色',
        '倒入肉块翻炒上色',
        '加入葱姜、八角、桂皮',
        '倒入料酒、酱油',
        '加热水没过肉，大火烧开转小火炖 1 小时',
        '大火收汁即可'
      ]),
      ingredients: [
        { name: '猪肉', quantity: 600, unit: 'g', note: '五花肉' },
        { name: '生姜', quantity: 30, unit: 'g', note: '切片' },
        { name: '葱', quantity: 30, unit: 'g', note: '打结' },
        { name: '料酒', quantity: 40, unit: 'ml' },
        { name: '酱油', quantity: 50, unit: 'ml' },
        { name: '糖', quantity: 40, unit: 'g', note: '冰糖' },
        { name: '盐', quantity: 5, unit: 'g' },
      ]
    },
    {
      name: '地三鲜',
      cuisineType: '东北菜',
      difficulty: Difficulty.MEDIUM,
      cookTimeMin: 25,
      servings: 4,
      caloriesPerServing: 350,
      protein: 6,
      carbs: 45,
      fat: 16,
      tags: ['素食', '下饭', '经典'],
      popularity: 7800,
      steps: JSON.stringify([
        '土豆、茄子去皮切块，青椒切块',
        '土豆炸至金黄捞出',
        '茄子炸软捞出',
        '锅中留底油，下葱姜蒜爆香',
        '倒入炸好的食材',
        '加入酱油、糖、盐调味',
        '水淀粉勾芡，翻炒均匀'
      ]),
      ingredients: [
        { name: '土豆', quantity: 300, unit: 'g' },
        { name: '茄子', quantity: 300, unit: 'g' },
        { name: '青椒', quantity: 150, unit: 'g' },
        { name: '大蒜', quantity: 20, unit: 'g' },
        { name: '生姜', quantity: 10, unit: 'g' },
        { name: '葱', quantity: 15, unit: 'g' },
        { name: '酱油', quantity: 20, unit: 'ml' },
        { name: '糖', quantity: 10, unit: 'g' },
        { name: '淀粉', quantity: 10, unit: 'g' },
        { name: '盐', quantity: 5, unit: 'g' },
        { name: '食用油', quantity: 80, unit: 'ml' },
      ]
    },
  ];

  console.log('📖 导入菜谱库...');
  for (const recipe of recipes) {
    const { ingredients: ingList, ...recipeData } = recipe;
    
    // 创建菜谱
    const createdRecipe = await prisma.recipe.create({
      data: recipeData,
    });

    // 添加食材关联
    for (const ing of ingList) {
      const ingredient = await prisma.ingredient.findUnique({
        where: { name_category: { name: ing.name, category: 'OTHER' } },
      });
      
      // 如果在 OTHER 没找到，尝试在其他分类找
      const finalIngredient = ingredient || await prisma.ingredient.findFirst({
        where: { name: ing.name },
      });

      if (finalIngredient) {
        await prisma.recipeIngredient.create({
          data: {
            recipeId: createdRecipe.id,
            ingredientId: finalIngredient.id,
            quantity: ing.quantity,
            unit: ing.unit,
            note: ing.note,
          },
        });
      }
    }
  }
  console.log(`✅ 导入 ${recipes.length} 道菜谱`);

  console.log('🎉 数据库初始化完成!');
}

main()
  .catch((e) => {
    console.error('❌ 初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
