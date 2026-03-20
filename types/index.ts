// ==========================
// 用户相关类型定义
// ==========================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  familyMembers: FamilyMember[];
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

// ==========================
// 家庭成员相关类型定义
// ==========================

export type MemberRole = 'ADULT' | 'CHILD' | 'ELDER';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  role: MemberRole;
  avatarColor: string;
  dietaryGoal?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFamilyMemberInput {
  name: string;
  role?: MemberRole;
  avatarColor?: string;
  dietaryGoal?: string;
}

// ==========================
// 口味偏好相关类型定义
// ==========================

export type PrefType = 'LIKE' | 'DISLIKE' | 'NEUTRAL';
export type PrefCategory = 'INGREDIENT' | 'CUISINE' | 'TASTE' | 'COOKING_METHOD';

export interface Preference {
  id: string;
  memberId: string;
  type: PrefType;
  category: PrefCategory;
  value: string;
  intensity: number; // 1-5
  createdAt: Date;
}

export interface CreatePreferenceInput {
  memberId: string;
  type: PrefType;
  category: PrefCategory;
  value: string;
  intensity?: number; // 默认为3
}

// ==========================
// 菜谱相关类型定义
// ==========================

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Recipe {
  id: string;
  userId?: string;
  name: string;
  cuisineType: string;
  difficulty: Difficulty;
  cookTimeMin: number;
  servings: number;
  caloriesPerServing?: number;
  protein?: Decimal; // Decimal 类型来自 Prisma
  carbs?: Decimal;
  fat?: Decimal;
  tags: string[];
  coverImageUrl?: string;
  sourceUrl?: string;
  popularity: number;
  isFavorite: boolean;
  steps: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: RecipeIngredient[];
  mealPlans?: MealPlan[];
  ratings?: MealRating[];
}

export interface CreateRecipeInput {
  name: string;
  cuisineType: string;
  difficulty: Difficulty;
  cookTimeMin: number;
  servings: number;
  caloriesPerServing?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tags: string[];
  coverImageUrl?: string;
  sourceUrl?: string;
  steps: string;
  ingredients?: CreateRecipeIngredientInput[];
}

export interface UpdateRecipeInput {
  name?: string;
  cuisineType?: string;
  difficulty?: Difficulty;
  cookTimeMin?: number;
  servings?: number;
  caloriesPerServing?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  tags?: string[];
  coverImageUrl?: string;
  sourceUrl?: string;
  steps?: string;
}

// ==========================
// 食材相关类型定义
// ==========================

export type IngredientCategory = 'VEGETABLE' | 'MEAT' | 'SEAFOOD' | 'GRAIN' | 'SEASONING' | 'FRUIT' | 'DAIRY' | 'OTHER';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  unit: string; // 如 'g', 'ml', '个', '勺'
  caloriesPer100g?: number;
  proteinPer100g?: Decimal;
  carbsPer100g?: Decimal;
  fatPer100g?: Decimal;
  createdAt: Date;
}

export interface CreateIngredientInput {
  name: string;
  category: IngredientCategory;
  unit?: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}

// ==========================
// 菜谱食材关联类型定义
// ==========================

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  quantity: Decimal; // 数量
  unit?: string; // 单位（覆盖食材默认单位）
  isOptional: boolean; // 是否可选
  note?: string; // 备注
  ingredient: Ingredient;
}

export interface CreateRecipeIngredientInput {
  ingredientId: string;
  quantity: number;
  unit?: string;
  isOptional?: boolean;
  note?: string;
}

// ==========================
// 周计划相关类型定义
// ==========================

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealPlan {
  id: string;
  userId: string;
  weekStartDate: Date;
  mealType: MealType;
  dayOfWeek: number; // 0-6 (星期日-星期六)
  recipeId: string;
  servingsActual?: number;
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  recipe: Recipe;
  ratings?: MealRating[];
}

export interface CreateMealPlanInput {
  weekStartDate: Date;
  mealType: MealType;
  dayOfWeek: number;
  recipeId: string;
  servingsActual?: number;
  notes?: string;
}

// ==========================
// 评分相关类型定义
// ==========================

export interface MealRating {
  id: string;
  mealPlanId: string;
  memberId: string;
  recipeId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
  mealPlan: MealPlan;
  member: FamilyMember;
  recipe: Recipe;
}

export interface CreateMealRatingInput {
  mealPlanId: string;
  memberId: string;
  recipeId: string;
  rating: number;
  comment?: string;
}

// ==========================
// 采购清单相关类型定义
// ==========================

export interface ShoppingList {
  id: string;
  userId: string;
  weekStartDate: Date;
  createdAt: Date;
  updatedAt: Date;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  ingredientId: string;
  quantityNeeded: Decimal;
  unit: string;
  quantityHave: Decimal;
  quantityToBuy: Decimal;
  isPurchased: boolean;
  aisle?: string;
  note?: string;
  ingredient: Ingredient;
}

export interface CreateShoppingListInput {
  weekStartDate: Date;
}

export interface UpdateShoppingItemInput {
  quantityHave?: number;
  quantityToBuy?: number;
  isPurchased?: boolean;
  aisle?: string;
  note?: string;
}

// ==========================
// 营养数据类型定义
// ==========================

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeeklyNutritionSummary {
  week: Date;
  dailyAverages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// ==========================
// 推荐系统类型定义
// ==========================

export interface RecommendationReason {
  type: 'LIKES' | 'DIETARY_RESTRICTIONS' | 'NUTRITION' | 'DIVERSITY' | 'POPULARITY';
  description: string;
  score: number; // 0-1
}

export interface RecipeRecommendation {
  recipe: Recipe;
  matchScore: number; // 0-1
  reasons: RecommendationReason[];
}

export interface RecommendOptions {
  memberId?: string;
  numberOfResults?: number;
  excludeRecipes?: string[];
}

// ==========================
// 通用响应类型定义
// ==========================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================
// 系统配置类型定义
// ==========================

export interface AppConfig {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    userRegistration: boolean;
    guestAccess: boolean;
    recommendations: boolean;
    nutritionTracking: boolean;
  };
}

// 为了兼容Prisma的Decimal类型，在前端我们使用number
export type Decimal = number;