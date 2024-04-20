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
        가격: 4000
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
        가격: 25000,
        지속시간: 10,
        설명: '*낚시 활동 시 10회 동안 물고기를 추가로 1마리씩 더 낚습니다*'
    },
    {
        상품명: '고급미끼',
        가격: 35000,
        지속시간: 10,
        설명: '*낚시 활동 시 10회 동안 물고기를 추가로 2마리 더 낚고, 낚시 소요시간이 5초 단축됩니다.*'
    },
    {
        상품명: '목장갑',
        가격: 35000,
        지속시간: 8,
        설명: '*8회동안 채집이면 자원을 3개, 채광이면 2개씩 더 얻습니다.*'
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
        레벨: 7, // 최고레벨
        소요시간: 10000
    }
]

const fishingHookUpgrade = [
    {
        레벨: 1,
        가격: 500000,
        철조각: 50,
        물고기갯수: 1
    },
    {
        레벨: 2,
        가격: 1000000,
        철조각: 100,
        물고기갯수: 2
    },
    {
        레벨: 3,
        가격: 1500000,
        철조각: 150,
        물고기갯수: 3
    },
    {
        레벨: 4,
        가격: 2000000,
        철조각: 200,
        물고기갯수: 4
    },
    {
        레벨: 5, // 최고레벨
        물고기갯수: 5
    },
]

let govesUpgrade = [
    {
        레벨: 1,
        가격: 250000,
        실: 150,
        감소시간: 0
    },
    {
        레벨: 2,
        가격: 500000,
        실: 300,
        감소시간: 10000
    },
    {
        레벨: 3,
        가격: 750000,
        실: 500,
        감소시간: 20000
    },
    {
        레벨: 4, // 최고레벨
        감소시간: 30000
    }
];

let pickUpgrade = [
    {
        레벨: 1,
        가격: 300000,
        철조각: 130,
        감소시간: 0
    },
    {
        레벨: 2,
        가격: 600000,
        철조각: 260,
        감소시간: 10000
    },
    {
        레벨: 3,
        가격: 900000,
        철조각: 390,
        감소시간: 20000
    },
    {
        레벨: 4, // 최고레벨
        감소시간: 30000
    },
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
            let userAbility = await getUserAbility(interaction.user.id);
            let abilityKey = Object.keys(userAbility);
            let embedText = '닉네임: ' + interaction.user.globalName +
                '\n낚싯대 레벨: ' + userInfo.fishingRod +
                '\n낚싯바늘 레벨: ' + userInfo.fishingHook +
                '\n돈: ' + NumberConversion(userInfo.money) + '원\n\n== 도구 정보 ==\n' +
                '\n장갑 레벨: ' + userInfo.govesLevel +
                '\n곡괭이 레벨: ' + userInfo.pickLevel + '\n' +
                '\n장갑 내구도: ' + userInfo.goves + '%' +
                '\n곡괭이 내구도: ' + userInfo.pick + '%';
            let key, isAbilityTxt = false;
            for (let i = 1; i <= abilityKey.length; i++) {
                key = abilityKey[i]
                if (userAbility[key] > 0) {
                    if (!isAbilityTxt) {
                        embedText += '\n\n== 남은 아이템 능력 횟수 ==\n';
                        isAbilityTxt = true;
                    }
                    embedText += '\n' + key + ': ' + userAbility[key] + '회';
                }
            }

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
                    let fishingTimeObj = fishingRodUpgrade.find(rodTime => rodTime.레벨 == userInfo.fishingRod);
                    let catchingFishObj = fishingHookUpgrade.find(catchingCount => catchingCount.레벨 == userInfo.fishingHook);
                    let fishingTime = fishingTimeObj.소요시간;
                    let catchingFish = catchingFishObj.물고기갯수;
                    let fishingReply = interaction.user.globalName + '이(가) 낚싯대를 던졌다.\n물고기가 잡히길 기다리자...\n\n'
                    let fishingEditReply = '**' + interaction.user.globalName + '이(가) ' + pickFish + '를 낚았다!**\n\n';
                    if (userAbility.미끼 > 0) {
                        catchingFish += 1;
                        fishingEditReply += `미끼: ${pickFish} +1\n`;
                        db.run('UPDATE ability SET 미끼 = 미끼 - 1 WHERE id = ?', [interaction.user.id]);
                    }
                    if (userAbility.고급미끼 > 0) {
                        catchingFish += 2;
                        fishingTime -= 5000;
                        fishingReply += '고급미끼: 소요 시간 -5초'
                        fishingEditReply += `고급미끼: ${pickFish} +2\n`;
                        db.run('UPDATE ability SET 고급미끼 = 고급미끼 - 1 WHERE id = ?', [interaction.user.id]);
                    }
                    fishingEditReply += '\n';
                    if (userAbility.미끼 == 1) {
                        fishingEditReply += '___미끼의 지속시간이 끝났습니다.___\n';
                    }
                    if (userAbility.고급미끼 == 1) {
                        fishingEditReply += '___고급미끼의 지속시간이 끝났습니다.___\n';
                    }
                    await interaction.reply(fishingReply);
                    setTimeout(() => {
                        db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                        db.run(`UPDATE fish SET ${pickFish} = ${pickFish} + ${catchingFish} WHERE id = ?`, [interaction.user.id]);
                        interaction.editReply(fishingEditReply);
                    }, fishingTime);
                } else if (work === '채집') { // ==================================채집==================================
                    if (userInfo.goves > 0) {
                        db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                        let gatheringTime = (Math.floor(Math.random() * 10000) + 50000 - govesUpgrade[userInfo.govesLevel].감소시간); // 40~50초
                        let totlaItem = Number(Math.floor(Math.random() * 5) + 1); // 1~5개
                        let govesDamage = Number(Math.floor(Math.random() * 4) + 7); // 7~10
                        userInfo.goves < govesDamage ? govesDamage = userInfo.goves : null;
                        await interaction.reply(interaction.user.globalName + '은(는) 자원을 채집하기 위해 여정을 떠났다...');
                        let gatheringEditReply = `**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n*실 +${totlaItem}\n장갑 내구도 -${govesDamage}%*\n\n`;
                        if (userAbility.목장갑 > 0) {
                            db.run('UPDATE ability SET 목장갑 = 목장갑 - 1 WHERE id = ?', [interaction.user.id]);
                            totlaItem += 3;
                            gatheringEditReply += '목장갑: 실 +3\n'
                        }

                        gatheringEditReply += '\n'
                        if (userAbility.목장갑 == 1) {
                            gatheringEditReply += '___목장갑의 지속시간이 끝났습니다.___\n';
                        }
                        setTimeout(() => {
                            db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 실 = 실 + ${totlaItem} WHERE id = ?`, [interaction.user.id]);
                            db.run(`UPDATE user SET goves = goves - ${govesDamage} WHERE id = ?`, [interaction.user.id]);
                            interaction.editReply(gatheringEditReply);
                        }, gatheringTime);
                    } else {
                        interaction.reply({ content: '장비의 내구도가 부족합니다.', ephemeral: true })
                    }
                } else if (work === '채광') { // ==================================채광==================================
                    if (userInfo.pick > 0) {
                        db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                        let miningTime = (Math.floor(Math.random() * 10000) + 60000 - pickUpgrade[userInfo.pickLevel].감소시간); // 50~60초
                        let totlaItem = Number(Math.floor(Math.random() * 3) + 1); // 1~3개
                        let PickDamage = Number(Math.floor(Math.random() * 3) + 3); // 3~5
                        userInfo.pick < PickDamage ? PickDamage = userInfo.pick : null;
                        await interaction.reply(interaction.user.globalName + '은(는) 자원을 채광하기 위해 여정을 떠났다...');
                        let miningEditReply = `**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n*철조각 +${totlaItem}\n곡괭이 내구도 -${PickDamage}%*\n\n`;
                        if (userAbility.목장갑 > 0) {
                            db.run('UPDATE ability SET 목장갑 = 목장갑 - 1 WHERE id = ?', [interaction.user.id]);
                            totlaItem += 2;
                            miningEditReply += '목장갑: 철조각 +2\n'
                        }

                        miningEditReply += '\n'
                        if (userAbility.목장갑 == 1) {
                            miningEditReply += '___목장갑의 지속시간이 끝났습니다.___\n';
                        }
                        setTimeout(() => {
                            db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 철조각 = 철조각 + ${totlaItem} WHERE id = ?`, [interaction.user.id]);
                            db.run(`UPDATE user SET pick = pick - ${PickDamage} WHERE id = ?`, [interaction.user.id]);
                            interaction.editReply(miningEditReply);
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
                let userFish;
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
                    } else {
                        let itemObj = itemArr.find(item => item.상품명 == activeItem);
                        db.run(`UPDATE ability SET ${activeItem} = ${itemObj.지속시간} WHERE id = ?`, [interaction.user.id]);
                        await interaction.reply(`${replyTxt}${itemObj.설명}`);
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

    if (interaction.commandName === '강화') {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            let userItem = await getAllItem(interaction.user.id);
            let updrageItem = interaction.options.getString('도구');
            let upgradeMaterial, maxLevel;
            if (updrageItem == '낚싯대강화') {
                upgradeMaterial = fishingRodUpgrade.find(rod => rod.레벨 == userInfo.fishingRod);
                maxLevel = fishingRodUpgrade[fishingRodUpgrade.length - 1].레벨;
                if (upgradeMaterial.레벨 != maxLevel) {
                    if (userInfo.money < upgradeMaterial.가격) {
                        await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    } else if (userItem.실 < upgradeMaterial.실) {
                        await interaction.reply({ content: '실이 부족합니다.', ephemeral: true });
                    } else if (userItem.철조각 < upgradeMaterial.철조각) {
                        await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                    } else {
                        db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, fishingRod = fishingRod + 1 WHERE id = ?`, [interaction.user.id]);
                        db.run(`UPDATE item SET 실 = 실 - ${upgradeMaterial.실}, 철조각 = 철조각 - ${upgradeMaterial.철조각} WHERE id = ?`, [interaction.user.id]);
                        await interaction.reply(`${interaction.user.globalName}님이 낚싯대를 업그레이드 했습니다!\n**낚싯대 레벨  ${userInfo.fishingRod} => ${Number(userInfo.fishingRod) + 1}\n낚시 소요시간 -5초**\n\n*실 -${NumberConversion(upgradeMaterial.실)}개\n철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                    }
                } else {
                    await interaction.reply({ content: interaction.user.globalName + '님은 낚싯대는 현재 "최고레벨" 입니다.', ephemeral: true });
                }
            } else if (updrageItem == '낚싯바늘강화') {
                upgradeMaterial = fishingHookUpgrade.find(hook => hook.레벨 == userInfo.fishingHook);
                maxLevel = fishingHookUpgrade[fishingHookUpgrade.length - 1].레벨;
                if (upgradeMaterial.레벨 != maxLevel) {
                    if (userInfo.money < upgradeMaterial.가격) {
                        await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    } else if (userItem.철조각 < upgradeMaterial.철조각) {
                        await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                    } else {
                        db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, fishingHook = fishingHook + 1 WHERE id = ?`, [interaction.user.id]);
                        db.run(`UPDATE item SET 철조각 = 철조각 - ${upgradeMaterial.철조각} WHERE id = ?`, [interaction.user.id]);
                        await interaction.reply(`${interaction.user.globalName}님이 낚싯바늘을 업그레이드 했습니다!\n**낚싯바늘 레벨  ${userInfo.fishingHook} => ${Number(userInfo.fishingHook) + 1}\n낚시 추가 물고기 +1** \n\n*철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                    }
                } else {
                    await interaction.reply({ content: interaction.user.globalName + '님은 낚싯바늘은 현재 "최고레벨" 입니다.', ephemeral: true });
                }
            } else if (updrageItem == '장갑강화') {
                upgradeMaterial = govesUpgrade.find(goves => goves.레벨 == userInfo.govesLevel);
                maxLevel = govesUpgrade[govesUpgrade.length - 1].레벨;
                if (upgradeMaterial.레벨 != maxLevel) {
                    if (userInfo.money < upgradeMaterial.가격) {
                        await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    } else if (userItem.실 < upgradeMaterial.실) {
                        await interaction.reply({ content: '실이 부족합니다.', ephemeral: true });
                    } else {
                        db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, govesLevel = govesLevel + 1 WHERE id = ?`, [interaction.user.id]);
                        db.run(`UPDATE item SET 실 = 실 - ${upgradeMaterial.실} WHERE id = ?`, [interaction.user.id]);
                        let upLevel = govesUpgrade.find(goves => goves.레벨 == (userInfo.govesLevel + 1));
                        await interaction.reply(`${interaction.user.globalName}님이 장갑을 업그레이드 했습니다!\n**장갑 레벨  ${userInfo.govesLevel} => ${Number(userInfo.govesLevel) + 1}\n\n채집 소요시간 ${Number(upLevel.감소시간) / 1000}초 감소**\n*실 -${NumberConversion(upgradeMaterial.실)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                    }
                } else {
                    await interaction.reply({ content: interaction.user.globalName + '님은 장갑은 현재 "최고레벨" 입니다.', ephemeral: true });
                }
            } else if (updrageItem == '곡괭이강화') {
                upgradeMaterial = pickUpgrade.find(pick => pick.레벨 == userInfo.pickLevel);
                maxLevel = pickUpgrade[pickUpgrade.length - 1].레벨;
                if (upgradeMaterial.레벨 != maxLevel) {
                    if (userInfo.money < upgradeMaterial.가격) {
                        await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    } else if (userItem.철조각 < upgradeMaterial.철조각) {
                        await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                    } else {
                        db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, pickLevel = pickLevel + 1 WHERE id = ?`, [interaction.user.id]);
                        db.run(`UPDATE item SET 철조각 = 철조각 - ${upgradeMaterial.철조각} WHERE id = ?`, [interaction.user.id]);
                        let upLevel = pickUpgrade.find(pick => pick.레벨 == (userInfo.pickLevel + 1));
                        await interaction.reply(`${interaction.user.globalName}님이 장갑을 업그레이드 했습니다!\n**장갑 레벨  ${userInfo.pickLevel} => ${Number(userInfo.pickLevel) + 1}\n\n채집 소요시간 ${Number(upLevel.감소시간) / 1000}초 감소**\n*철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                    }
                } else {
                    await interaction.reply({ content: interaction.user.globalName + '님은 장갑은 현재 "최고레벨" 입니다.', ephemeral: true });
                }
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
