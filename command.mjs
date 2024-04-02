import { REST, Routes } from 'discord.js';
const CLIENT_ID = "CLIENT_ID";
const TOKEN = "TOKEN";

const commands = [
  {
    name: '가격보기',
    description: '낚시봇의 정보를 이곳에서 확인하세요',
  },
  {
    name: '가입하기',
    description: '낚시봇을 플레이하기 위해 가입을 먼저 해주세요!',
  },
  {
    name: '내정보',
    description: '내정보 확인',
  },
  {
    name: '인벤',
    description: '인벤토리를 본다'
  },
  {
    name: '활동',
    description: '활동을 한다',
    options: [
      {
        name: '명령어',
        description: "당신이 할 활동을 선택하세요",
        type: 3,
        required: true,
        choices: [
          {
            name: '낚시',
            description: '낚시 소요 시간: 5초 ~ 10초 || 1회당 1마리',
            value: '낚시'
          },
          {
            name: '채집',
            description: '채집 소요 시간: 10초 ~ 20초 || 장갑 파손정도: 7% ~ 10% || 1회당 아이템 1개 ~ 5개',
            value: '채집'
          },
          {
            name: '채광',
            description: '채광 소요 시간: 30초 ~ 40초 || 곡괭이 파손정도: 3% ~ 5% || 1회당 아이템 1개 ~ 3개',
            value: '채광'
          },
        ]
      },
    ]
  },
  {
    name: '판매',
    description: '물고기를 판매한다.',
    options: [
      {
        name: '물고기',
        description: "판매할 물고기를 선택하세요.",
        type: 3,
        required: true,
        choices: [
          {
            name: '붕어',
            description: '물고기',
            value: '붕어'
          },
          {
            name: '송어',
            description: '물고기',
            value: '송어'
          },
          {
            name: '잉어',
            description: '물고기',
            value: '잉어'
          },
          {
            name: '명태',
            description: '물고기',
            value: '명태'
          },
          {
            name: '연어',
            description: '물고기',
            value: '연어'
          },
          {
            name: '장어',
            description: '물고기',
            value: '장어'
          },
          {
            name: '해파리',
            description: '물고기',
            value: '해파리'
          },
          {
            name: '광어',
            description: '물고기',
            value: '광어'
          },
          {
            name: '오징어',
            description: '물고기',
            value: '오징어'
          },
          {
            name: '베스',
            description: '물고기',
            value: '베스'
          },
          {
            name: '우럭',
            description: '물고기',
            value: '우럭'
          },
          {
            name: '고등어',
            description: '물고기',
            value: '고등어'
          },
          {
            name: '넙치',
            description: '물고기',
            value: '넙치'
          },
          {
            name: '청어',
            description: '물고기',
            value: '청어'
          },
          {
            name: '새우',
            description: '물고기',
            value: '새우'
          },
          {
            name: '청새치',
            description: '물고기',
            value: '청새치'
          }
        ]
      },
      {
        name: '갯수',
        description: '판매할 물고기의 갯수를 적어주세요',
        type: 10,
        required: true
      }
    ]
  },
  {
    name: '일괄판매',
    description: '모든 물고기를 판매한다.',
    options: [
      {
        name: '물고기',
        description: "판매할 물고기를 선택하세요.",
        type: 3,
        required: true,
        choices: [
          {
            name: '전체판매',
            description: '가지고있는 모든 물고기를 판매합니다.',
            value: '전체판매'
          },
          {
            name: '붕어',
            description: '물고기',
            value: '붕어'
          },
          {
            name: '송어',
            description: '물고기',
            value: '송어'
          },
          {
            name: '잉어',
            description: '물고기',
            value: '잉어'
          },
          {
            name: '명태',
            description: '물고기',
            value: '명태'
          },
          {
            name: '연어',
            description: '물고기',
            value: '연어'
          },
          {
            name: '장어',
            description: '물고기',
            value: '장어'
          },
          {
            name: '해파리',
            description: '물고기',
            value: '해파리'
          },
          {
            name: '광어',
            description: '물고기',
            value: '광어'
          },
          {
            name: '오징어',
            description: '물고기',
            value: '오징어'
          },
          {
            name: '베스',
            description: '물고기',
            value: '베스'
          },
          {
            name: '우럭',
            description: '물고기',
            value: '우럭'
          },
          {
            name: '고등어',
            description: '물고기',
            value: '고등어'
          },
          {
            name: '넙치',
            description: '물고기',
            value: '넙치'
          },
          {
            name: '청어',
            description: '물고기',
            value: '청어'
          },
          {
            name: '새우',
            description: '물고기',
            value: '새우'
          },
          {
            name: '청새치',
            description: '물고기',
            value: '청새치'
          }
        ]
      }
    ]
  },
  {
    name: '구매',
    description: '아이템을 구입합니다.',
    options: [
      {
        name: '아이템',
        description: '구입할 아이템을 골라주세요',
        type: 3,
        required: true,
        choices: [
          {
            name: '장갑 수리키트',
            description: '장갑의 내구도를 100%로 수리합니다.',
            value: '장갑 수리키트'
          },
          {
            name: '곡괭이 수리키트',
            description: '곡괭이의 내구도를 100%로 수리합니다.',
            value: '곡괭이 수리키트'
          },
          {
            name: '미끼',
            description: '낚시 활동 시 10회 동안 물고기를 추가로 2마리 더 낚습니다',
            value: '미끼'
          }
        ]
      },
      {
        name: '갯수',
        description: '구입할 아이템의 갯수를 적어주세요',
        type: 10,
        required: true
      }
    ]
  },
  {
    name: '사용',
    description: '아이템을 사용한다.',
    options: [
      {
        name: '아이템',
        description: '사용할 아이템을 골라주세요',
        type: 3,
        required: true,
        choices: [
          {
            name: '장갑 수리키트',
            description: '장갑의 내구도를 100%로 수리합니다.',
            value: '장갑 수리키트'
          },
          {
            name: '곡괭이 수리키트',
            description: '곡괭이의 내구도를 100%로 수리합니다.',
            value: '곡괭이 수리키트'
          },
          {
            name: '미끼',
            description: '낚시 활동 시 10회 동안 물고기를 추가로 2마리 더 낚습니다',
            value: '미끼'
          }
        ]
      }
    ]
  },
  {
    name: '낚싯대강화',
    description: '낚싯대를 강화합니다.'
  }
];


const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}
