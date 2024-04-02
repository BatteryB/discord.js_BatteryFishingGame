import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import sqlite3 from 'sqlite3';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = new sqlite3.Database('Fish.db');

const TOKEN = "TOKEN";


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const fishArr = [
    {
        물고기: "붕어",
        가격: 1000
    },
    {
        물고기: "송어",
        가격: 1500
    },
    {
        물고기: "잉어",
        가격: 3000
    },
    {
        물고기: "명태",
        가격: 2000
    },
    {
        물고기: "연어",
        가격: 4000
    },
    {
        물고기: "장어",
        가격: 4500
    },
    {
        물고기: "해파리",
        가격: 2500
    },
    {
        물고기: "광어",
        가격: 3000
    },
    {
        물고기: "오징어",
        가격: 5000
    },
    {
        물고기: "베스",
        가격: 2500
    },
    {
        물고기: "우럭",
        가격: 3500
    },
    {
        물고기: "고등어",
        가격: 3000
    },
    {
        물고기: "넙치",
        가격: 4000
    },
    {
        물고기: "청어",
        가격: 4500
    },
    {
        물고기: "새우",
        가격: 3500
    },
    {
        물고기: "청새치",
        가격: 6000
    }
]


const itemArr = [
    {
        상품명: '장갑 수리키트',
        가격: 20000
    },
    {
        상품명: '곡괭이 수리키트',
        가격: 30000
    },
    {
        상품명: '미끼',
        가격: 15000
    }
]

const fishingRodUpgrade = [
    {
        레벨: 1,
        가격: 100000,
        실: 20,
        철조각: 10,
        소요시간: 40000
    },
    {
        레벨: 2,
        가격: 250000,
        실: 40,
        철조각: 20,
        소요시간: 35000
    },
    {
        레벨: 3,
        가격: 500000,
        실: 60,
        철조각: 30,
        소요시간: 30000
    },
    {
        레벨: 4,
        가격: 750000,
        실: 80,
        철조각: 40,
        소요시간: 25000
    },
    {
        레벨: 5,
        가격: 1000000,
        실: 100,
        철조각: 50,
        소요시간: 20000
    },
    {
        레벨: 6,
        가격: 1250000,
        실: 120,
        철조각: 60,
        소요시간: 15000
    },
    {
        레벨: 7, // 현재 7레벨이 최고레벨
        소요시간: 10000
    }
]

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "가격보기") {
        await interaction.reply({ content: '이곳에서 배터리낚시 아이템의 가격, 정보를 확인하세요!\nhttps://1drv.ms/x/s!AsoeI6xV8urJg9kblo5ngqBGK844NA?e=t1KQWR', ephemeral: true })
    }

    if (interaction.commandName === "가입하기") {
        let join = await joinCheck(interaction.user.id);
        if (!join) {
            await db.run("INSERT INTO user(id) VALUES(?);", [interaction.user.id]);
            await db.run("INSERT INTO fish(id) VALUES(?)", [interaction.user.id]);
            await db.run("INSERT INTO item(id) VALUES(?)", [interaction.user.id]);
            await db.run("INSERT INTO ability(id) VALUES(?)", [interaction.user.id]);
            await interaction.reply({ content: "가입되었습니다.", ephemeral: true });
        } else {
            await interaction.reply({ content: '이미 가입하셨습니다.', ephemeral: true });
        }
    }

    if (interaction.commandName === "내정보") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            let embedText = '닉네임: ' + interaction.user.globalName +
                '\n낚싯대 레벨: ' + userInfo.fishingRod +
                '\n돈: ' + NumberConversion(userInfo.money) + '원\n============' +
                '\n장갑 내구도: ' + userInfo.goves + '%' +
                '\n곡괭이 내구도: ' + userInfo.pick + '%';
            let userEmbad = new EmbedBuilder()
                .setTitle("낚시장")
                .setDescription(embedText)
                .setThumbnail(interaction.user.avatarURL())
                .setTimestamp();
            await interaction.reply({ embeds: [userEmbad] });
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemral: true });
        }
    }

    if (interaction.commandName === "인벤") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let inven = await getAllItem(interaction.user.id);
            let fish = await getAllFish(interaction.user.id);
            let invenLen = Object.keys(inven);
            let fishLen = Object.keys(fish);
            let key, invenTxt = '';
            for (let i = 1; i < invenLen.length; i++) {
                key = invenLen[i];
                if (key == '실' || key == '철조각') {
                    invenTxt += key + ": " + NumberConversion(inven[key]) + "개\n";
                } else if (inven[key] != 0) {
                    invenTxt += key + ": " + NumberConversion(inven[key]) + "개\n";
                }
            }
            invenTxt += '============\n'
            for (let i = 1; i < fishLen.length; i++) {
                key = fishLen[i];
                if (fish[key] != 0) {
                    invenTxt += key + ": " + NumberConversion(fish[key]) + "개\n";
                }
            }
            let invenEmbed = new EmbedBuilder()
                .setTitle(interaction.user.globalName + '님의 인벤토리')
                .setDescription(invenTxt)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setTimestamp();
            await interaction.reply({ embeds: [invenEmbed] });
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemral: true });
        }
    }

    if (interaction.commandName === "활동") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let work = interaction.options.getString('명령어');
            let userInfo = await getUserInfo(interaction.user.id);
            let userAbility = await getUserAbility(interaction.user.id);
            if (userInfo.work == 0) {
                if (work === '낚시') {       // ==================================낚시==================================
                    db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                    let pickFish = String(fishArr[Math.floor(Math.random() * fishArr.length)].물고기);
                    let catchingFish = 1;
                    let fishingTimeObj = fishingRodUpgrade.find(rodTime => rodTime.레벨 == userInfo.fishingRod);
                    let fishingTime = fishingTimeObj.소요시간;
                    await interaction.reply(interaction.user.globalName + '이(가) 낚싯대를 던졌다.\n물고기가 잡히길 기다리자...');
                    let fishingReply = '**' + interaction.user.globalName + '이(가) ' + pickFish + '를 낚았다!**\n\n';
                    if (userAbility.미끼 > 0) {
                        catchingFish = 3;
                        fishingReply += '미끼: 물고기 +2\n';
                        db.run('UPDATE ability SET 미끼 = 미끼 - 1 WHERE id = ?', [interaction.user.id]);
                    }
                    fishingReply += '\n';
                    if (userAbility.미끼 == 1) {
                        fishingReply += '___미끼의 지속시간이 끝났습니다.___';
                    }
                    setTimeout(() => {
                        db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                        db.run(`UPDATE fish SET ${pickFish} = ${pickFish} + ${catchingFish} WHERE id = ?`, [interaction.user.id]);
                        interaction.editReply(fishingReply);
                    }, fishingTime);
                } else if (work === '채집') { // ==================================채집==================================
                    if (userInfo.goves > 0) {
                        db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                        let gatheringTime = Math.floor(Math.random() * 10000) + 20000; // 30~40초
                        let totlaItem = Number(Math.floor(Math.random() * 5) + 1); // 1~5개
                        let govesDamage = Number(Math.floor(Math.random() * 4) + 7); // 7~10
                        userInfo.goves < govesDamage ? govesDamage = userInfo.goves : null;
                        await interaction.reply(interaction.user.globalName + '은(는) 자원을 채집하기 위해 여정을 떠났다...');
                        setTimeout(() => {
                            db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 실 = 실 + ${totlaItem} WHERE id = ?`, [interaction.user.id]);
                            db.run(`UPDATE user SET goves = goves - ${govesDamage} WHERE id = ?`, [interaction.user.id]);
                            interaction.editReply(`**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n*실 +${totlaItem}\n장갑 내구도 -${govesDamage}%*`);
                        }, gatheringTime);
                    } else {
                        interaction.reply({ content: '장비의 내구도가 부족합니다.', ephemeral: true })
                    }
                } else if (work === '채광') { // ==================================채광==================================
                    if (userInfo.pick >= 0) {
                        db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                        let miningTime = Math.floor(Math.random() * 10000) + 30000; // 30~40초
                        let totlaItem = Number(Math.floor(Math.random() * 3) + 1); // 1~3개
                        let PickDamage = Number(Math.floor(Math.random() * 3) + 3); // 3~5
                        userInfo.pick < PickDamage ? PickDamage = userInfo.pick : null;
                        await interaction.reply(interaction.user.globalName + '은(는) 자원을 채광하기 위해 여정을 떠났다...');
                        setTimeout(() => {
                            db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 철조각 = 철조각 + ${totlaItem} WHERE id = ?`, [interaction.user.id]);
                            db.run(`UPDATE user SET pick = pick - ${PickDamage} WHERE id = ?`, [interaction.user.id]);
                            interaction.editReply(`**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n*철조각 +${totlaItem}\n곡괭이 내구도 -${PickDamage}%*`)
                        }, miningTime);
                    } else {
                        interaction.reply({ content: '장비의 내구도가 부족합니다.', ephemeral: true })
                    }
                }
            } else {
                await interaction.reply({ content: '이미 활동중 입니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemral: true });
        }
    }

    if (interaction.commandName === "판매") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            if (userInfo.work == 0) {
                let fishCount = interaction.options.getNumber('갯수');
                let fishName = interaction.options.getString('물고기');
                let userFish = await getFishName(interaction.user.id, fishName);
                if (fishCount <= userFish[fishName]) {
                    let fishPrice = fishArr.find(fish => fish.물고기 == fishName);
                    await db.run(`UPDATE user SET money = money + ${fishPrice.가격 * fishCount} WHERE id = ?`, [interaction.user.id]);
                    await db.run(`UPDATE fish SET ${fishName} = ${fishName} - ${fishCount} WHERE id = ?`, [interaction.user.id]);
                    await interaction.reply(`${interaction.user.globalName}님이 ${fishName} ${NumberConversion(fishCount)}개를 판매하였습니다.\n\n*-${fishName} ${NumberConversion(fishCount)}개\n+${NumberConversion(fishPrice.가격 * fishCount)}원*`);
                } else {
                    await interaction.reply({ content: '물고기의 갯수가 부족합니다.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: '활동 중에는 상점 이용이 불가능합니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

    if (interaction.commandName === "일괄판매") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            if (userInfo.work == 0) {
                let fishName = interaction.options.getString('물고기');
                let userFish;
                if (fishName != '전체판매') {
                    userFish = await getFishName(interaction.user.id, fishName);
                    if (userFish[fishName] > 0) {
                        let fishPrice = fishArr.find(fish => fish.물고기 == fishName);
                        await db.run(`UPDATE user SET money = money + ${fishPrice.가격 * userFish[fishName]} WHERE id = ?`, [interaction.user.id]);
                        await db.run(`UPDATE fish SET ${fishName} = ${fishName} - ${userFish[fishName]} WHERE id = ?`, [interaction.user.id]);
                        await interaction.reply(`${interaction.user.globalName}님이 ${fishName} ${NumberConversion(userFish[fishName])}개를 판매하였습니다.\n\n*-${fishName} ${NumberConversion(userFish[fishName])}개\n+${NumberConversion(fishPrice.가격 * userFish[fishName])}원*`);
                    } else {
                        await interaction.reply({ content: '해당 물고기를 보유하고 있지 않습니다', ephemeral: true });
                    }
                } else {
                    userFish = await getAllFish(interaction.user.id);
                    let itemLen = Object.keys(userFish);
                    let fishPrice, obj, reven = 0;
                    for (let i = 1; i <= itemLen.length; i++) {
                        obj = itemLen[i];
                        if (userFish[obj] > 0) {
                            fishPrice = fishArr.find(fish => fish.물고기 == obj);
                            await db.run(`UPDATE user SET money = money + ${fishPrice.가격 * userFish[obj]} WHERE id = ?`, [interaction.user.id]);
                            await db.run(`UPDATE fish SET ${obj} = 0 WHERE id = ?`, [interaction.user.id]);
                            reven += fishPrice.가격 * userFish[obj];
                        }
                    }
                    if (reven > 0) {
                        await interaction.reply(`${interaction.user.globalName}님이 모든 물고기를 판매하였습니다.\n\n*+${NumberConversion(reven)}원*`)
                    } else {
                        await interaction.reply({ content: '물고기가 없습니다.', ephemeral: true });
                    }
                }
            } else {
                await interaction.reply({ content: '활동 중에는 상점 이용이 불가능합니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }


    if (interaction.commandName === "구매") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            let itemName = interaction.options.getString('아이템');
            let itemCount = interaction.options.getNumber('갯수');
            let itemPrice = itemArr.find(item => item.상품명 == itemName);
            if (userInfo.money >= (itemPrice.가격 * itemCount)) {
                await db.run(`UPDATE item SET '${itemName}' = '${itemName}' + ${itemCount} WHERE id = ?`, [interaction.user.id]);
                await db.run(`UPDATE user SET money = money - ${itemPrice.가격 * itemCount} WHERE id = ?`, [interaction.user.id]);
                await interaction.reply(`${interaction.user.globalName}님이 ${itemName} ${NumberConversion(itemCount)}개를 구매했습니다.\n\n*+${itemName} ${NumberConversion(itemCount)}개\n-${NumberConversion(itemPrice.가격 * itemCount)}원*`)
            } else {
                await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

    if (interaction.commandName === "사용") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            if (userInfo.work == 0) {
                let activeItem = interaction.options.getString('아이템');
                let userItem = await getUserItem(interaction.user.id, activeItem);
                if (userItem[activeItem] > 0) {
                    let replyTxt = `${interaction.user.globalName}님이 ${activeItem}을 사용하였습니다.\n\n`; // 공통 출력
                    db.run(`UPDATE item SET \`${activeItem}\` = \`${activeItem}\` - 1 WHERE id = ?`, [interaction.user.id]); // 공통 쿼리문
                    if (activeItem == '장갑 수리키트') {          // 장갑 수리
                        db.run('UPDATE user SET goves = 100 WHERE id = ?', [interaction.user.id]);
                        await interaction.reply(`${replyTxt}*장갑 내구도 100%*`);
                    } else if (activeItem == '곡괭이 수리키트') { // 곡괭이 수리
                        db.run('UPDATE user SET pick = 100 WHERE id = ?', [interaction.user.id]);
                        await interaction.reply(`${replyTxt}*곡괭이 내구도 100%*`);
                    } else if (activeItem == '미끼') {           // 미끼
                        db.run('UPDATE ability SET 미끼 = 10 WHERE id = ?', [interaction.user.id]);
                        await interaction.reply(`${replyTxt}*낚시 활동 시 10회 동안 물고기를 3마리씩 낚습니다*`);
                    }
                } else {
                    await interaction.reply({ content: '해당 아이템을 보유 하고있지 않습니다.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: '활동 중에는 아이템 사용이 불가능합니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

    if (interaction.commandName === "낚싯대강화") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            let userItem = await getAllItem(interaction.user.id);
            let upgradeMaterial = fishingRodUpgrade.find(rod => rod.레벨 == userInfo.fishingRod);
            let maxLevel = fishingRodUpgrade[fishingRodUpgrade.length - 1].레벨;
            if (upgradeMaterial.레벨 != maxLevel) {
                if (userInfo.money < upgradeMaterial.가격) {
                    await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                } else if (userItem.실 < upgradeMaterial.실) {
                    await interaction.reply({ content: '실이 부족합니다.', ephemeral: true });
                } else if (userItem.철조각 < upgradeMaterial.철조각) {
                    await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                } else {
                    db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, fishingRod = fishingRod + 1 WHERE id = ?`, [interaction.user.id]);
                    db.run(`UPDATE item SET 실 = 실 - ${upgradeMaterial.실}, 철조각 = 철조각 - ${upgradeMaterial.철조각}`);
                    await interaction.reply(`${interaction.user.globalName}님이 낚싯대를 업그레이드 했습니다!\n**낚싯대 레벨  ${userInfo.fishingRod} => ${userInfo.fishingRod + 1}\n낚시 소요시간 -5초**\n\n*실 -${NumberConversion(upgradeMaterial.실)}개\n철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                }
            } else {
                await interaction.reply({ content: interaction.user.globalName + '님은 현재 "최고레벨" 입니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }
});

function NumberConversion(Num) { // 숫자 변환 예) 100000 => 100,000
    return Num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function joinCheck(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE ID = ?", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(!!row);
            }
        });
    });
};

function getUserInfo(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE ID = ?", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

function getFishName(id, fish) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT ${fish} FROM fish WHERE id = ?`, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            };
        });
    });
};

function getAllFish(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM fish WHERE id = ?`, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            };
        });
    });
}

function getUserItem(id, item) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT "${item}" FROM item WHERE id = ?`, [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getAllItem(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM item WHERE id = ?", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getUserAbility(id) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM ability WHERE id = ?", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

client.login(TOKEN);
