import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword, sanitizeInput } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 获取原始输入
    let { email, password, name } = body;

    // 输入类型验证
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string'
    ) {
      return NextResponse.json(
        { error: '邮箱、密码和姓名必须为字符串' },
        { status: 400 }
      );
    }

    // 清理输入
    email = sanitizeInput(email);
    name = sanitizeInput(name);

    // 验证输入
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '邮箱、密码和姓名不能为空' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码强度
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // 验证姓名长度
    if (name.length < 1 || name.length > 50) {
      return NextResponse.json(
        { error: '姓名长度必须在1-50个字符之间' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12); // 使用更高的 salt rounds

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // 创建默认家庭成员
    await prisma.familyMember.create({
      data: {
        userId: user.id,
        name: name,
        role: 'ADULT',
        avatarColor: '#3b82f6',
      },
    });

    return NextResponse.json({
      user,
      message: '注册成功',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
