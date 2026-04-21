import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, validateEmail } from '@/lib/auth';
import { RateLimiter } from '@/lib/rate-limiter';

// Create a rate limiter for login attempts (max 5 attempts per 15 minutes)
const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: '登录尝试次数过多，请稍后再试'
});

export async function POST(request: Request) {
  try {
    // Extract IP address for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim() : '127.0.0.1';

    // Check rate limit
    const rateLimitResult = loginRateLimiter.check(`login:${ip}`);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '邮箱和密码不能为空且必须为字符串' },
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

    // 验证密码长度
    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: '密码长度必须在6-128位之间' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });

    if (!user) {
      // 为安全起见，延迟响应时间以防止用户枚举攻击
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT
    const token = generateToken({ userId: user.id, email: user.email });

    // 返回 token，由前端存储到 localStorage
    // 不再设置 cookie，改为通过 ck-token header 传递
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);

    // In production, don't return specific error details to prevent information disclosure
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: '登录过程中发生错误，请稍后重试' },
        { status: 500 }
      );
    } else {
      // In development, return more detailed error information
      return NextResponse.json(
        {
          error: '登录失败，请稍后重试',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }
}
