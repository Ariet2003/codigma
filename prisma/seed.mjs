import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Очищаем таблицы в правильном порядке
  console.log('Очистка базы данных...');
  await prisma.taskSubmission.deleteMany();
  await prisma.hackathonParticipant.deleteMany();
  await prisma.participationRequest.deleteMany();
  await prisma.codeTemplate.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Создаем тестовых пользователей
  console.log('Создание тестовых пользователей...');
  const adminPassword = await hash('admin123', 12);
  const userPassword = await hash('user123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'Test User 1',
      password: userPassword,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'Test User 2',
      password: userPassword,
      role: 'USER',
    },
  });

  // Создаем тестовые задачи
  const task1 = await prisma.task.create({
    data: {
      title: 'Сложение двух чисел',
      difficulty: 'easy',
      description: 'Напишите функцию, которая принимает два числа и возвращает их сумму.',
      functionName: 'sum',
      inputParams: { a: 'number', b: 'number' },
      outputParams: { result: 'number' },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Поиск максимального элемента',
      difficulty: 'medium',
      description: 'Напишите функцию, которая находит максимальный элемент в массиве.',
      functionName: 'findMax',
      inputParams: { arr: 'number[]' },
      outputParams: { max: 'number' },
    },
  });

  // Создаем открытый и закрытый хакатоны
  const openHackathon = await prisma.hackathon.create({
    data: {
      title: 'Открытый хакатон',
      description: 'Тестовый открытый хакатон',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
      isOpen: true,
      tasks: [task1.id, task2.id],
    },
  });

  const closedHackathon = await prisma.hackathon.create({
    data: {
      title: 'Закрытый хакатон',
      description: 'Тестовый закрытый хакатон',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isOpen: false,
      tasks: [task1.id, task2.id],
    },
  });

  // Создаем заявки на участие в закрытом хакатоне
  await prisma.participationRequest.create({
    data: {
      userId: user1.id,
      hackathonId: closedHackathon.id,
      status: 'PENDING',
      message: 'Прошу принять меня в хакатон',
    },
  });

  await prisma.participationRequest.create({
    data: {
      userId: user2.id,
      hackathonId: closedHackathon.id,
      status: 'APPROVED',
      message: 'Хочу участвовать в хакатоне',
    },
  });

  // Добавляем участников в открытый хакатон
  const participant1 = await prisma.hackathonParticipant.create({
    data: {
      userId: user1.id,
      hackathonId: openHackathon.id,
    },
  });

  const participant2 = await prisma.hackathonParticipant.create({
    data: {
      userId: user2.id,
      hackathonId: openHackathon.id,
    },
  });

  // Создаем тестовые решения задач
  await prisma.taskSubmission.create({
    data: {
      participantId: participant1.id,
      taskId: task1.id,
      hackathonId: openHackathon.id,
      code: 'function sum(a, b) { return a + b; }',
      language: 'javascript',
      status: 'pending',
      memory: 1024,
      executionTime: 100,
      testsTotal: 5,
      testsPassed: 3,
    },
  });

  await prisma.taskSubmission.create({
    data: {
      participantId: participant2.id,
      taskId: task2.id,
      hackathonId: openHackathon.id,
      code: 'function findMax(arr) { return Math.max(...arr); }',
      language: 'javascript',
      status: 'pending',
      memory: 2048,
      executionTime: 150,
      testsTotal: 8,
      testsPassed: 6,
    },
  });

  console.log('База данных успешно заполнена тестовыми данными');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 