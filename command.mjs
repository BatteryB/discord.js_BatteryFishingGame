import { REST, Routes } from 'discord.js';
import sqlite3 from 'sqlite3';

const CLIENT_ID = "CLIENT_ID";
const TOKEN = "TOKEN";

const data = new sqlite3.Database('db/fishingData.db');

let fishName = await fish();
let fishObj;
let fishList = [];
for (let i = 0; i < fishName.length; i++) {
    fishObj = {
        name: fishName[i].fishName,
        description: '물고기',
        value: fishName[i].fishName
    }
    fishList.push(fishObj)
}

let itemName = await item();
let itemObj;
let itemList = [];
for (let i = 0; i < itemName.length; i++) {
    itemObj = {
        name: itemName[i].itemName,
        description: '물고기',
        value: itemName[i].itemName
    }
    itemList.push(itemObj)
}

let restName = await resting();
let restObj;
let restList = [
    {
        name: '쉬기',
        description: '30초마다 피로도가 5씩 채워집니다, 피로도가 100이 되면 자동으로 해제됩니다.`',
        value: '쉬기'
    }
];
for (let i = 0; i < restName.length; i++) {
    restObj = {
        name: restName[i].restName,
        description: '휴식',
        value: restName[i].restName
    }
    restList.push(restObj)
}

const commands = [
    {
        name: '낚시정보',
        description: '낚시봇의 정보를 이곳에서 확인하세요',
    },
    {
        name: '가입하기',
        description: '낚시봇을 플레이하기 위해 가입을 먼저 해주세요!',
    },
    {
        name: '출석',
        description: '일일 출석체크를 합니다.'  
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
                        value: 'fishingLine'
                    },
                    {
                        name: '채집',
                        description: '채집 소요 시간: 10초 ~ 20초 || 장갑 파손정도: 7% ~ 10% || 1회당 아이템 1개 ~ 5개',
                        value: 'goves'
                    },
                    {
                        name: '채광',
                        description: '채광 소요 시간: 30초 ~ 40초 || 곡괭이 파손정도: 3% ~ 5% || 1회당 아이템 1개 ~ 3개',
                        value: 'pick'
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
                choices: fishList
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
                name: '등급',
                description: '판매 할 등급을 골라주세요.',
                type: 3,
                required: true,
                choices: [
                    {
                        name: '전체판매',
                        description: '일괄판매',
                        value: '전체판매'
                    },
                    {
                        name: 'S',
                        description: '일괄판매',
                        value: 'S'
                    },
                    {
                        name: 'A',
                        description: '일괄판매',
                        value: 'A'
                    },
                    {
                        name: 'B',
                        description: '일괄판매',
                        value: 'B'
                    },
                    {
                        name: 'C',
                        description: '일괄판매',
                        value: 'C'
                    },
                    {
                        name: 'D',
                        description: '일괄판매',
                        value: 'D'
                    },

                ]
            },
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
                choices: itemList
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
                description: '사용 할 아이템을 골라주세요.',
                type: 3,
                required: true,
                choices: itemList
            }
        ]
    },
    {
        name: '강화',
        description: '도구를 강화합니다.',
        options: [
            {
                name: '도구',
                description: '강화 할 아이템을 골라주세요',
                type: 3,
                required: true,
                choices: [
                    {
                        name: '낚싯줄강화',
                        description: '낚싯줄을 강화합니다.',
                        value: 'fishingLine'
                    },
                    {
                        name: '낚싯바늘강화',
                        description: '낚싯바늘를 강화합니다.',
                        value: 'fishingHook'
                    },
                    {
                        name: '장갑강화',
                        description: '장갑을 강화합니다.',
                        value: 'goves'
                    },
                    {
                        name: '곡괭이강화',
                        description: '곡괭이를 강화합니다.',
                        value: 'pick'
                    }
                ]
            }
        ]
    },
    {
        name: '휴식하기',
        description: '휴식을 취하여 피로도를 회복합니다.',
        options: [
            {
                name: '휴식',
                description: '휴식 방식을 선택합니다.',
                type: 3,
                required: true,
                choices: restList
            }
        ]
    },
    {
        name: '환생하기',
        description: '모든걸 잃고 처음으로 되돌아갑니다. 일부 스택은 유지됩니다.'
    },
];


async function fish() {
    return new Promise((resolve, reject) => {
        data.all("SELECT * FROM fish ORDER BY CASE rank WHEN 'S' THEN 0 ELSE 1 END, rank ASC", (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function item() {
    return new Promise((resolve, reject) => {
        data.all('SELECT * FROM item', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function resting() {
    return new Promise((resolve, reject) => {
        data.all('SELECT * FROM rest', (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
