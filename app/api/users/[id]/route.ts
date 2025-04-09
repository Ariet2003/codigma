import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name } = await request.json();

    const updatedUser = await db.user.update({
      where: {
        id: params.id
      },
      data: {
        name
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Удаляем все связанные данные
    await db.$transaction([
      // Удаляем все отправки пользователя
      db.taskSubmission.deleteMany({
        where: {
          participant: {
            userId: params.id
          }
        }
      }),
      // Удаляем все заявки на участие
      db.participationRequest.deleteMany({
        where: {
          userId: params.id
        }
      }),
      // Удаляем все участия в хакатонах
      db.hackathonParticipant.deleteMany({
        where: {
          userId: params.id
        }
      }),
      // Удаляем сессии пользователя
      db.session.deleteMany({
        where: {
          userId: params.id
        }
      }),
      // Удаляем аккаунты пользователя
      db.account.deleteMany({
        where: {
          userId: params.id
        }
      }),
      // Наконец, удаляем самого пользователя
      db.user.delete({
        where: {
          id: params.id
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 