import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

/**
 * 切换菜谱收藏状态
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 验证 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { isFavorite } = await request.json();

    // 更新菜谱收藏状态
    const recipe = await prisma.recipe.update({
      where: { id },
      data: { isFavorite },
    });

    return NextResponse.json({
      success: true,
      isFavorite: recipe.isFavorite,
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}
