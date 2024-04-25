import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import sqlite3 from 'sqlite3';
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = new sqlite3.Database('db/fIshingUser.db');
const data = new sqlite3.Database('db/fishingData.db')

const developerId = 'ID';
const TOKEN = "TOKEN";


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

await db.run('UPDATE user SET work = 0');

let fishRank = ['S', 'A', 'B', 'C', 'D'];

let fishWeight = [
    { rank: 'S', weight: 0.03 },
    { rank: 'A', weight: 0.05 },
    { rank: 'B', weight: 0.17 },
    { rank: 'C', weight: 0.32 },
    { rank: 'D', weight: 0.43 }
]

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "낚시정보") {
        await interaction.reply({ content: '이곳에서 배터리낚시봇의 정보를 확인하세요!\nhttps://1drv.ms/x/s!AsoeI6xV8urJg9kblo5ngqBGK844NA?e=t1KQWR', ephemeral: true });
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
                (userInfo.rebirth > 0 ? '\n환생 횟수: ' + userInfo.rebirth : '') +
                '\n낚싯대 레벨: ' + userInfo.fishingRod +
                '\n낚싯바늘 레벨: ' + userInfo.fishingHook +
                '\n돈: ' + NumberConversion(userInfo.money) + '원\n\n== 도구 정보 ==\n' +
                '\n장갑 레벨: ' + userInfo.govesLevel +
                '\n곡괭이 레벨: ' + userInfo.pickLevel + '\n' +
                '\n장갑 내구도: ' + userInfo.goves + '%' +
                '\n곡괭이 내구도: ' + userInfo.pick + '%' + '\n\n== 기능 ==\n' +
                '\n아이템 자동 사용: ' + (userInfo.itemAutoActive == 0 ? '꺼짐' : '켜짐');
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
            let fishInfo = await getAllFish(interaction.user.id);
            let fishArr = await fish();
            let itemArr = await item();
            let invenKey = Object.keys(inven);
            let fishKey = Object.keys(fishInfo);
            fishKey.shift();
            let key, invenTxt = '';
            for (let i = 1; i < invenKey.length; i++) {
                key = invenKey[i];
                if (key == '실' || key == '철조각') {
                    invenTxt += key + ": " + NumberConversion(inven[key]) + "개\n";
                } else if (inven[key] != 0) {
                    invenTxt += key + ": " + NumberConversion(inven[key]) + "개\n";
                }
            }

            invenTxt += '============'
            for (let i = 0; i < fishRank.length; i++) {
                const fishFilter = fishArr.filter(fish => fish.rank == fishRank[i]).filter(fish => fishInfo[fish.fishName] > 0);
                if (fishFilter.length > 0) {
                    invenTxt += `\n**_${fishRank[i]}등급_**\n`;
                    fishFilter.forEach(item => {
                        if (fishInfo[item.fishName] > 0) {
                            const key = item.fishName;
                            invenTxt += `${key}: ${NumberConversion(fishInfo[key])}개\n`;
                        }
                    });
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
            let tool = await toolUpgrade(work);
            let userInfo = await getUserInfo(interaction.user.id);
            let userItem = await getAllItem(interaction.user.id);
            let userAbility = await getUserAbility(interaction.user.id);
            let itemAbility = await item();
            if (userInfo.work == 0) {
                if (work === 'fishingRod') {
                    db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                    let hook = await toolUpgrade('fishingHook') // 낚싯바늘 데이터 불러오기

                    let pickFish;
                    const ranNum = Math.random(); // 0~1 까지의 랜덤한 수 생성 예)0.346513...
                    let weightSum = 0;

                    for (const fish of fishWeight) { // fishWeight 의 배열 길이 만큼 for문 돌리기(forEach랑 비슷함) fish = fishWeight
                        weightSum += fish.weight; // 물고기 가중치 총합 구하기
                        if (ranNum < weightSum) { // 지금까지 더해진 가중치보다 랜덤 값이 더 크면 참 
                            pickFish = await fishPickRank(fish.rank); // 해당 가중치 만큼의 등급을 가져와서 해당 등급에 알맞는 물고기 데이터 불러오기
                            break; // for문 빠져나가기
                        }
                    }
                    let fishIndex = Math.floor(Math.random() * pickFish.length); // 해당 등급의 물고기중에서 랜덤으로 값 생성 예) D등급이 5개라면 0~4
                    pickFish = pickFish[fishIndex]; // 생성된 숫자에 해당되는 물고기 가져오기

                    let fishingTimeObj = tool.find(rodTime => rodTime.레벨 == userInfo.fishingRod);
                    let catchingFishObj = hook.find(catchingCount => catchingCount.레벨 == userInfo.fishingHook);
                    let fishingTime = fishingTimeObj.소요시간;
                    let catchingFish = catchingFishObj.물고기갯수 + (userInfo.rebirth * 2);
                    let reply = interaction.user.globalName + '이(가) 낚싯대를 던졌다.\n물고기가 잡히길 기다리자...\n\n'
                    let editReply = '**' + interaction.user.globalName + '이(가) ___' + pickFish.fishName + '___ 을(를) 낚았다!**\n\n';

                    for (let i = 0; i < itemAbility.length; i++) {
                        if (itemAbility[i].fishing == 1) {
                            if (userAbility[itemAbility[i].itemName] > 0) {
                                if (itemAbility[i].minusTime != 0) {
                                    fishingTime -= itemAbility[i].minusTime;
                                    reply += `${itemAbility[i].itemName}: 소요 시간 -${itemAbility[i].minusTime / 1000}초\n`
                                }

                                if (itemAbility[i].plusItem != 0) {
                                    catchingFish += itemAbility[i].plusItem;
                                    editReply += `${itemAbility[i].itemName}: ${pickFish.fishName} +${itemAbility[i].plusItem}개\n`
                                }
                                await db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]);
                            }
                        }
                    }

                    editReply += '\n';
                    for (let i = 0; i < itemAbility.length; i++) {
                        if (itemAbility[i].fishing == 1) {
                            if (userAbility[itemAbility[i].itemName] == 1) {
                                editReply += `___${itemAbility[i].itemName}의 지속시간이 끝났습니다.___\n`
                            }
                        }
                    }

                    if (userInfo.itemAutoActive == 1) {
                        editReply += '\n';
                        for (let i = 0; i < itemAbility.length; i++) {
                            if (itemAbility[i].fishing == 1) {
                                if (userAbility[itemAbility[i].itemName] == 1) {
                                    editReply += `**${itemAbility[i].itemName}이(가) 자동으로 사용되었습니다.**\n`
                                    db.run(`UPDATE item SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]);
                                    db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].buffCount} WHERE id = ?`, [interaction.user.id]);
                                }
                            }
                        }
                    }

                    await interaction.reply(reply);
                    await setTimeout(() => {
                        db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                        db.run(`UPDATE fish SET ${pickFish.fishName} = ${pickFish.fishName} + ${catchingFish} WHERE id = ?`, [interaction.user.id]);
                        interaction.editReply(editReply);
                    }, fishingTime);

                } else if (work === 'goves') {
                    if (userInfo.goves > 0) {
                        db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                        let timeObj = tool.find(pickTime => pickTime.레벨 == userInfo.govesLevel);
                        let gatheringTime = (Math.floor(Math.random() * 10000) + 50000 - timeObj.감소시간); // 40~50초
                        let totlaItem = Number(Math.floor(Math.random() * 5) + 1 + (userInfo.rebirth * 2)); // 1~5개
                        let govesDamage = Number(Math.floor(Math.random() * 4) + 7); // 7~10
                        userInfo.goves < govesDamage ? govesDamage = userInfo.goves : null;
                        let reply = interaction.user.globalName + '은(는) 자원을 채집하기 위해 여정을 떠났다...'
                        let editReply = `**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n*실 +${totlaItem}\n장갑 내구도 -${govesDamage}%*\n\n`;

                        for (let i = 0; i < itemAbility.length; i++) {
                            if (itemAbility[i].gathering == 1) {
                                if (userAbility[itemAbility[i].itemName] > 0) {
                                    if (itemAbility[i].minusTime != 0) {
                                        gatheringTime -= itemAbility[i].minusTime;
                                        reply += `${itemAbility[i].itemName}: 소요 시간 -${itemAbility[i].minusTime / 1000}초\n`
                                    }

                                    if (itemAbility[i].plusItem != 0) {
                                        totlaItem += itemAbility[i].plusItem;
                                        editReply += `${itemAbility[i].itemName}: 실 +${itemAbility[i].plusItem}개\n`
                                    }
                                    await db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]);
                                }
                            }
                        }

                        editReply += '\n';
                        for (let i = 0; i < itemAbility.length; i++) {
                            if (itemAbility[i].gathering == 1) {
                                if (userAbility[itemAbility[i].itemName] == 1) {
                                    editReply += `___${itemAbility[i].itemName}의 지속시간이 끝났습니다.___\n`
                                }
                            }
                        }

                        if (userInfo.itemAutoActive == 1) {
                            editReply += '\n';
                            for (let i = 0; i < itemAbility.length; i++) {
                                if (itemAbility[i].gathering == 1) {
                                    if (userAbility[itemAbility[i].itemName] == 1) {
                                        editReply += `**${itemAbility[i].itemName}이(가) 자동으로 사용되었습니다.**\n`
                                        db.run(`UPDATE item SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]);
                                        db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].buffCount} WHERE id = ?`, [interaction.user.id]);
                                    }
                                }
                            }
                        }

                        await interaction.reply(reply);
                        await setTimeout(() => {
                            db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 실 = 실 + ${totlaItem} WHERE id = ?`, [interaction.user.id]);
                            db.run(`UPDATE user SET goves = goves - ${govesDamage} WHERE id = ?`, [interaction.user.id]);
                            interaction.editReply(editReply);
                        }, gatheringTime);

                    } else {
                        interaction.reply({ content: '장비의 내구도가 부족합니다.', ephemeral: true })
                    }
                } else if (work === 'pick') {
                    if (userInfo.pick > 0) {
                        db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                        let timeObj = tool.find(pickTime => pickTime.레벨 == userInfo.pickLevel);
                        let miningTime = (Math.floor(Math.random() * 10000) + 60000 - timeObj.감소시간); // 50~60초
                        let totlaItem = Number(Math.floor(Math.random() * 3) + 1 + (userInfo.rebirth * 2)); // 1~3개
                        let PickDamage = Number(Math.floor(Math.random() * 3) + 3); // 3~5
                        userInfo.pick < PickDamage ? PickDamage = userInfo.pick : null;
                        let reply = interaction.user.globalName + '은(는) 자원을 채광하기 위해 여정을 떠났다...';
                        let editReply = `**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n*철조각 +${totlaItem}\n곡괭이 내구도 -${PickDamage}%*\n\n`;

                        for (let i = 0; i < itemAbility.length; i++) { // 아이템 갯수만큼 반복
                            if (itemAbility[i].mining == 1) { // 채광에 적용되는 아이템만
                                if (userAbility[itemAbility[i].itemName] > 0) { // 유저가 가지고있는 해당 아이템의 능력이 0보다 크면
                                    if (itemAbility[i].minusTime != 0) { // minusTime이 0이 아닐때
                                        miningTime -= itemAbility[i].minusTime;
                                        reply += `${itemAbility[i].itemName}: 소요 시간 -${itemAbility[i].minusTime / 1000}초\n`
                                    }

                                    if (itemAbility[i].plusItem != 0) { // plusItem이 0이 아닐때
                                        totlaItem += itemAbility[i].plusItem;
                                        editReply += `${itemAbility[i].itemName}: 철조각 +${itemAbility[i].plusItem}개\n`
                                    }
                                    await db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]);
                                }
                            }
                        }

                        editReply += '\n';
                        for (let i = 0; i < itemAbility.length; i++) {
                            if (itemAbility[i].mining == 1) { // 채광에 적용되는 아이템만
                                if (userAbility[itemAbility[i].itemName] == 1) { // 지속시간이 1일 때
                                    editReply += `___${itemAbility[i].itemName}의 지속시간이 끝났습니다.___\n`
                                }
                            }
                        }

                        if (userInfo.itemAutoActive == 1) { // 자동사용 여부가 1일때
                            editReply += '\n';
                            for (let i = 0; i < itemAbility.length; i++) { // 아이템 데이터의 길이만큼  
                                if (itemAbility[i].mining == 1) { // 채광에 적용되는 아이템만
                                    if (userAbility[itemAbility[i].itemName] == 1) { // 해당 아이템의 지속시간이 1일때
                                        let itemKey = itemAbility[i].itemName;
                                        if (userItem[itemKey] > 0) {
                                            editReply += `**${itemAbility[i].itemName}이(가) 자동으로 사용되었습니다.**\n`
                                            db.run(`UPDATE item SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]); // 해당 아이템 사용
                                            db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].buffCount} WHERE id = ?`, [interaction.user.id]); // 해당 아이템의 지속시간 적용
                                        } else {
                                            editReply += `__**${itemAbility[i].itemName}의 갯수가 부족합니다.**__\n`
                                        }
                                    }
                                }
                            }
                        }

                        await interaction.reply(reply);
                        await setTimeout(() => {
                            db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 철조각 = 철조각 + ${totlaItem} WHERE id = ?`, [interaction.user.id]);
                            db.run(`UPDATE user SET pick = pick - ${PickDamage} WHERE id = ?`, [interaction.user.id]);
                            interaction.editReply(editReply);
                        }, miningTime);

                    } else {
                        interaction.reply({ content: '장비의 내구도가 부족합니다.', ephemeral: true })
                    }
                }
            } else {
                await interaction.reply({ content: '이미 활동중 입니다.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
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
                    let fishArr = await fish();
                    let fishPrice = fishArr.find(fish => fish.fishName == fishName);
                    await db.run(`UPDATE user SET money = money + ${Math.floor(fishPrice.price * (1 + (0.2 * userInfo.rebirth))) * fishCount} WHERE id = ?`, [interaction.user.id]);
                    await db.run(`UPDATE fish SET ${fishName} = ${fishName} - ${fishCount} WHERE id = ?`, [interaction.user.id]);
                    await interaction.reply(`${interaction.user.globalName}님이 ${fishName} ${NumberConversion(fishCount)}개를 판매하였습니다.\n\n*-${fishName} ${NumberConversion(fishCount)}개\n+${NumberConversion((fishPrice.price * (1 + 0.2 * userInfo.rebirth)) * fishCount)}원*`);
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
                let fishArr = await fish();
                let userFish = await getAllFish(interaction.user.id);
                let rankChoice = interaction.options.getString('등급');
                if (rankChoice == '전체판매') {
                    let itemKey = Object.keys(userFish);
                    let fishPrice, obj, reven = 0;
                    for (let i = 1; i <= itemKey.length; i++) {
                        obj = itemKey[i];
                        if (userFish[obj] > 0) {
                            fishPrice = fishArr.find(fish => fish.fishName == obj);
                            reven += Math.floor(fishPrice.price * (1 + (0.2 * userInfo.rebirth))) * userFish[obj]; // 해당 물고기의 가격 * 가진 물고기의 갯수
                            await db.run(`UPDATE user SET money = money + ${Math.floor(fishPrice.price * (1 + (0.2 * userInfo.rebirth))) * userFish[obj]} WHERE id = ?`, [interaction.user.id]);
                            await db.run(`UPDATE fish SET ${obj} = 0 WHERE id = ?`, [interaction.user.id]);
                        }
                    }
                    if (reven > 0) {
                        await interaction.reply(`${interaction.user.globalName}님이 물고기를 모두 판매하였습니다.\n\n*+${NumberConversion(reven)}원*`)
                    } else {
                        await interaction.reply({ content: '물고기가 없습니다.', ephemeral: true });
                    }
                } else { // 전체판매가 아니라면 선택한 랭크를 모두 판매
                    const fishFilter = fishArr.filter(fish => fish.rank == rankChoice).filter(fish => userFish[fish.fishName] > 0); // fishArr.rank와 일괄판매할 랭크가 같고 해당 물고기가 0보다 큰것을 반환
                    if (fishFilter.length > 0) {
                        let reven = 0;
                        fishFilter.forEach(fish => {
                            if (userFish[fish.fishName] > 0) {
                                reven += Math.floor(fish.price * (1 + (0.2 * userInfo.rebirth))) * userFish[fish.fishName] // 필터로 가져온 물고기의 가격 x 해당 물고기의 갯수
                                db.run(`UPDATE fish SET ${fish.fishName} = ${fish.fishName} - ${userFish[fish.fishName]} WHERE id = ?`, [interaction.user.id]);
                                db.run(`UPDATE user SET money = money + ${Math.floor(fish.price * (1 + (0.2 * userInfo.rebirth))) * userFish[fish.fishName]} WHERE id = ?`, [interaction.user.id]);
                            }
                        });
                        await interaction.reply(`${interaction.user.globalName}님이 ${rankChoice}등급 물고기를 모두 판매하였습니다.\n\n*+${NumberConversion(reven)}원*`)
                    } else {
                        await interaction.reply({ content: `${rankChoice}등급의 물고기가 없습니다.`, ephemeral: true });
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
            let itemArr = await item();
            let itemPrice = itemArr.find(item => item.itemName == itemName);
            if (userInfo.money >= (itemPrice.price * itemCount)) {
                await db.run(`UPDATE item SET '${itemName}' = '${itemName}' + ${itemCount} WHERE id = ?`, [interaction.user.id]);
                await db.run(`UPDATE user SET money = money - ${itemPrice.price * itemCount} WHERE id = ?`, [interaction.user.id]);
                await interaction.reply(`${interaction.user.globalName}님이 ${itemName} ${NumberConversion(itemCount)}개를 구매했습니다.\n\n*+${itemName} ${NumberConversion(itemCount)}개\n-${NumberConversion(itemPrice.price * itemCount)}원*`)
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
                        let itemArr = await item();
                        let itemObj = itemArr.find(item => item.itemName == activeItem);
                        db.run(`UPDATE ability SET ${activeItem} = ${itemObj.buffCount} WHERE id = ?`, [interaction.user.id]);
                        await interaction.reply(`${replyTxt}${itemObj.description}`);
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

    if (interaction.commandName === "자동사용") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            let active = 0, activePrint = false;
            if (userInfo.itemAutoActive == 0) {
                active = 1;
                activePrint = true
            } else {
                active = 0;
                activePrint = false
            }

            db.run(`UPDATE user SET itemAutoActive = ${active} WHERE id = ?`, [interaction.user.id]);
            await interaction.reply(`${interaction.user.globalName}님이 자동사용 여부를 변경하였습니다.\n현재 자동사용 여부: ${activePrint}`);
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
            let toolUpgraded = await toolUpgrade(updrageItem)
            let upgradeMaterial, maxLevel;
            if (updrageItem == 'fishingRod') {
                upgradeMaterial = toolUpgraded.find(rod => rod.레벨 == userInfo.fishingRod);
                if (upgradeMaterial.최고레벨 != 1) {
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
            } else if (updrageItem == 'fishingHook') {
                upgradeMaterial = toolUpgraded.find(hook => hook.레벨 == userInfo.fishingHook);
                maxLevel = toolUpgraded[toolUpgraded.length - 1].레벨;
                if (upgradeMaterial.최고레벨 != 1) {
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
            } else if (updrageItem == 'goves') {
                upgradeMaterial = toolUpgraded.find(goves => goves.레벨 == userInfo.govesLevel);
                maxLevel = toolUpgraded[toolUpgraded.length - 1].레벨;
                if (upgradeMaterial.최고레벨 != 1) {
                    if (userInfo.money < upgradeMaterial.가격) {
                        await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    } else if (userItem.실 < upgradeMaterial.실) {
                        await interaction.reply({ content: '실이 부족합니다.', ephemeral: true });
                    } else {
                        db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, govesLevel = govesLevel + 1 WHERE id = ?`, [interaction.user.id]);
                        db.run(`UPDATE item SET 실 = 실 - ${upgradeMaterial.실} WHERE id = ?`, [interaction.user.id]);
                        let upLevel = toolUpgraded.find(goves => goves.레벨 == (userInfo.govesLevel + 1));
                        await interaction.reply(`${interaction.user.globalName}님이 장갑을 업그레이드 했습니다!\n**장갑 레벨  ${userInfo.govesLevel} => ${Number(userInfo.govesLevel) + 1}\n\n채집 소요시간 ${Number(upLevel.감소시간) / 1000}초 감소**\n*실 -${NumberConversion(upgradeMaterial.실)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                    }
                } else {
                    splice
                    await interaction.reply({ content: interaction.user.globalName + '님은 장갑은 현재 "최고레벨" 입니다.', ephemeral: true });
                }
            } else if (updrageItem == 'pick') {
                upgradeMaterial = toolUpgraded.find(pick => pick.레벨 == userInfo.pickLevel);
                maxLevel = toolUpgraded[toolUpgraded.length - 1].레벨;
                if (upgradeMaterial.최고레벨 != 1) {
                    if (userInfo.money < upgradeMaterial.가격) {
                        await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    } else if (userItem.철조각 < upgradeMaterial.철조각) {
                        await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                    } else {
                        db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, pickLevel = pickLevel + 1 WHERE id = ?`, [interaction.user.id]);
                        db.run(`UPDATE item SET 철조각 = 철조각 - ${upgradeMaterial.철조각} WHERE id = ?`, [interaction.user.id]);
                        let upLevel = toolUpgraded.find(pick => pick.레벨 == (userInfo.pickLevel + 1));
                        await interaction.reply(`${interaction.user.globalName}님이 곡괭이을 업그레이드 했습니다!\n**곡괭이 레벨  ${userInfo.pickLevel} => ${Number(userInfo.pickLevel) + 1}\n\n채광 소요시간 ${Number(upLevel.감소시간) / 1000}초 감소**\n*철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                    }
                } else {
                    await interaction.reply({ content: interaction.user.globalName + '님은 곡괭이은 현재 "최고레벨" 입니다.', ephemeral: true });
                }
            }
        } else {
            await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        }
    }

    if (interaction.commandName === "환생하기") {
        let join = await joinCheck(interaction.user.id);
        if (join) {
            let userInfo = await getUserInfo(interaction.user.id);
            let userItem = await getAllItem(interaction.user.id);

            const confirmBtn = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('환생하기')
                .setStyle(ButtonStyle.Danger);
            const btnRow = new ActionRowBuilder()
                .addComponents(confirmBtn);

            let response = await interaction.reply({
                content: `# 정말 환생하시겠습니까?\n# 환생하면 모든걸 잃고 처음부터 다시 시작합니다.\n## 현재 환생 횟수: ${userInfo.rebirth}회\n\n## == 환생 시 필요한 조건 ==\n### 낚싯대 7레벨 이상\n### 낚싯바늘 5레벨 이상\n### 장갑 4레벨 이상\n### 곡괭이 4레벨 이상\n### 돈 23,000,000원\n\n## === 새로운 능력 ===\n### 활동 시 추가로 얻는 모든 자원 +2\n### 물고기 판매 가격 +20%\n\n## ======\n### 환생을 원하지 않는다면 버튼을 누르지 마세요.`,
                components: [btnRow],
                ephemeral: true
            })

            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 240_000 }); // 3분동안 버튼 클릭 여부 기다리기
                if (confirmation.customId === 'confirm') {
                    if (userInfo.fishingRod >= 7 && userInfo.fishingHook >= 5 && userInfo.govesLevel >= 4 && userInfo.pickLevel >= 4 && userInfo.money >= 23000000) {
                        let userItem = await getAllItem(interaction.user.id);
                        let userAbility = await getUserAbility(interaction.user.id);
                        let userFish = await getAllFish(interaction.user.id);

                        let user = Object.keys(userInfo);
                        let item = Object.keys(userItem);
                        let ability = Object.keys(userAbility);
                        let fish = Object.keys(userFish);

                        user.shift();
                        let userDefaultValues = [1, 1, 0, 1, 1, 100, 100, 0, 0, 0];

                        item.splice(0, 1, 'item');
                        ability.splice(0, 1, 'ability');
                        fish.splice(0, 1, 'fish');

                        let resetUser = [item, ability, fish]; //2차원 배열

                        await confirmation.update({
                            content: '***환생을 선택하여 모든걸 잃고 처음으로 되돌아갑니다.***',
                            components: []
                        })

                        for (let i = 0; i < user.length; i++) {
                            let query = `UPDATE user SET \`${user[i]}\` = ${userDefaultValues[i]} WHERE id = ?`
                            await db.run(query, [interaction.user.id]);
                        }

                        for (let i = 0; i < resetUser.length; i++) {
                            for (let j = 1; j < resetUser[i].length; j++) {
                                let query = `UPDATE \`${resetUser[i][0]}\` SET \`${resetUser[i][j]}\` = 0 WHERE id = ?`
                                await db.run(query, [interaction.user.id]);
                            }
                        }

                        db.run('UPDATE user SET rebirth = rebirth + 1 WHERE id = ?', [interaction.user.id]);

                        if (interaction.channel != undefined) {
                            await interaction.channel.send(`***__${interaction.user.globalName} 님이 환생하셨습니다!__***`)
                        }
                    } else {
                        await confirmation.update({
                            content: '***조건에 충족하지 못하여 환생을 할 수 없습니다.***',
                            components: []
                        })
                    }
                }
            } catch (e) {
                await interaction.editReply({
                    content: '**__환생이 취소되었습니다.__**',
                    components: []
                });
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

//==========fishingData==========

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

async function fishPickRank(rank) {
    return new Promise((resolve, reject) => {
        data.all('SELECT * FROM fish WHERE rank = ?', [rank], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function item() {
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

function toolUpgrade(tool) {
    return new Promise((resolve, reject) => {
        data.all(`SELECT * FROM ${tool}`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

client.login(TOKEN);