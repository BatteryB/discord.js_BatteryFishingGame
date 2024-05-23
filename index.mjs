import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import sqlite3 from 'sqlite3';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const db = new sqlite3.Database('db/fishingUser.db');
const data = new sqlite3.Database('db/fishingData.db');
const attendance = new sqlite3.Database('db/fishingAttendance.db');

const TOKEN = "TOKEN";

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});
await db.run('UPDATE user SET work = 0');
await db.run('UPDATE user SET resting = 0');


let fishRank = ['SS', 'S', 'A', 'B', 'C', 'D'];

let fishWeight = [
    { rank: 'SS', weight: 0.001 },
    { rank: 'S', weight: 0.03 },
    { rank: 'A', weight: 0.05 },
    { rank: 'B', weight: 0.17 },
    { rank: 'C', weight: 0.31 },
    { rank: 'D', weight: 0.439 }
]

client.on('interactionCreate', async interaction => {
    try {
        if (!interaction.isChatInputCommand()) return;

        if (interaction.commandName === "낚시정보") {
            await interaction.reply({ content: '이곳에서 배터리낚시봇의 정보를 확인하세요!\nhttps://1drv.ms/x/s!AsoeI6xV8urJg9kblo5ngqBGK844NA?e=t1KQWR', ephemeral: true });
            return;
        }

        if (interaction.commandName === "가입하기") {
            let join = await joinCheck(interaction.user.id);
            if (!join) {
                await db.run("INSERT INTO user(id, money) VALUES(?);", [interaction.user.id]);
                await db.run("INSERT INTO fish(id) VALUES(?)", [interaction.user.id]);
                await db.run("INSERT INTO item(id) VALUES(?)", [interaction.user.id]);
                await db.run("INSERT INTO ability(id) VALUES(?)", [interaction.user.id]);
                await interaction.reply({ content: "가입되었습니다.", ephemeral: true });
                return;
            } else {
                await interaction.reply({ content: '이미 가입하셨습니다.', ephemeral: true });
                return;
            }
        }

        if (interaction.isChatInputCommand()) {
            let ban = await banCheck(interaction.user.id);
            let banReason = await banCheck(interaction.user.id, 1)
            if (ban) {
                await interaction.reply({
                    content: `이용이 금지된 계정입니다.\n사유: ${banReason.사유}`,
                    ephemeral: true
                })
                return;
            }
        }

        if (interaction.commandName === "내정보") {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let userInfo = await getUserInfo(interaction.user.id);
                let userAbility = await getUserAbility(interaction.user.id);
                let abilityKey = Object.keys(userAbility);
                let fatiguePrint = '';
                for (let i = 0; i < (userInfo.fatigue / 10); i++) {
                    fatiguePrint += '■';
                }
                let embedText = '닉네임: ' + interaction.user.globalName +
                    (userInfo.rebirth > 0 ? '\n환생 횟수: ' + userInfo.rebirth + '회' : '') +
                    '\n돈: ' + NumberConversion(userInfo.money) + '원' +
                    '\n\n== 피로도 ==' +
                    '\n' + `( ${userInfo.fatigue} / 100 ) ${userInfo.resting == 1 ? '**휴식중..**' : ''}` +
                    '\n' + fatiguePrint +
                    '\n\n== 도구 정보 ==\n' +
                    '\n낚싯줄 레벨: ' + userInfo.fishingLine +
                    '\n낚싯바늘 레벨: ' + userInfo.fishingHook +
                    (userInfo.harpoon >= 1 ? '\n작살 레벨: ' + userInfo.harpoon : '') +
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

                embedText += '\n\n\n`누적 출석 횟수: ' + userInfo.attendance + '회`'

                let userEmbad = new EmbedBuilder()
                    .setTitle("낚시장")
                    .setDescription(embedText)
                    .setThumbnail(interaction.user.avatarURL())
                    .setTimestamp();
                await interaction.reply({ embeds: [userEmbad] });
                return;
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemral: true });
                return;
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
                return;
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemral: true });
                return;
            }
        }

        if (interaction.commandName === "출석") {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let userDate = await attendanceCheck(interaction.user.id);
                let nowDate = new Date();
                nowDate.setHours(0, 0, 0, 0);
                if (!userDate || nowDate > userDate) {
                    await attendance.run(`INSERT INTO attendance VALUES(?, ${nowDate.getFullYear()}, ${nowDate.getMonth() + 1}, ${nowDate.getDate()})`, [interaction.user.id]);
                    await db.run(`UPDATE user SET attendance = attendance + 1, money = money + 5000 WHERE id = ?`, [interaction.user.id]);
                    interaction.reply(`**${interaction.user.globalName}님이 출석하셨습니다.**\n\n출석 보너스: 돈 +5000원`);
                } else {
                    interaction.reply({ content: '이미 출석하셨습니다.', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }

        if (interaction.commandName === "활동") {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let work = interaction.options.getString('명령어');
                let toolUpList = await toolUpgrade(work);
                let userInfo = await getUserInfo(interaction.user.id);
                let userAbility = await getUserAbility(interaction.user.id);
                let itemAbility = await item();
                if (userInfo.work == 0) {
                    if (userInfo.fatigue > 3) {
                        let fatigueDamage = Math.floor(Math.random() * 7) + 4 // 피로도 4 ~ 10
                        userInfo.fatigue - fatigueDamage <= 0 ? fatigueDamage = userInfo.fatigue : null;
                        let fatigueReply = '', fatigueEditReply = '';
                        fatigueReply += `*피로도 -${fatigueDamage}*`
                        for (let i = 0; i < itemAbility.length; i++) {
                            if (itemAbility[i].fatigue == 1) {
                                if (userAbility[itemAbility[i].itemName] > 0) {
                                    if (itemAbility[i].plusFatigue != 0) {
                                        fatigueEditReply += `${itemAbility[i].itemName}: 피로도감소 -${itemAbility[i].plusFatigue}\n`
                                        fatigueDamage -= itemAbility[i].plusFatigue;
                                    }
                                }
                            }
                        }

                        if (work === 'fishingLine') { // 낚시
                            await db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                            let hook = await toolUpgrade('fishingHook') // 낚싯바늘 데이터 불러오기

                            let pickFish;
                            const ranNum = Math.random(); // 0~1 까지의 랜덤한 수 생성 예)0.346513...
                            let weightSum = 0;

                            for (const fish of fishWeight) { // fishWeight 의 배열 길이 만큼 for문 돌리기(forEach랑 비슷함) fish = fishWeight
                                weightSum += fish.weight; // 물고기 가중치 총합 구하기
                                if (ranNum < weightSum) { // 지금까지 더해진 가중치보다 랜덤 값이 더 크면 참 
                                    pickFish = await fishPickRank(fish.rank, 'fishing'); // 해당 가중치 만큼의 등급을 가져와서 해당 등급에 알맞는 물고기 데이터 불러오기
                                    break; // for문 빠져나가기
                                }
                            }
                            let fishIndex = Math.floor(Math.random() * pickFish.length); // 해당 등급의 물고기중에서 랜덤으로 값 생성 예) D등급이 5개라면 0~4
                            pickFish = pickFish[fishIndex]; // 생성된 숫자에 해당되는 물고기 가져오기

                            let fishingTimeObj = toolUpList.find(rodTime => rodTime.레벨 == userInfo.fishingLine); // 사용자의 낚싯줄 레벨과 같은 경우의 객체 가져오기
                            let catchingFishObj = hook.find(catchingCount => catchingCount.레벨 == userInfo.fishingHook); // 사용자의 낚싯바늘 레벨과 같은 경우의 객체 가져오기
                            let fishingTime = fishingTimeObj.소요시간; // 해당 객체의 소요시간으로 지정
                            let catchingFish = catchingFishObj.물고기갯수 + (userInfo.rebirth * 2); // 해당 객체의 물고기갯수 + (환생횟수 * 2) 예) (환생 1회, 물고기갯수 = 2) = 물고기 4마리
                            let reply = interaction.user.globalName + '이(가) 낚싯대를 던졌다.\n물고기가 잡히길 기다리자...\n\n'
                            let editReply = '**' + interaction.user.globalName + '이(가) ___' + pickFish.fishName + '___ 을(를) 낚았다!**\n\n' + fatigueReply + '\n\n'

                            for (let i = 0; i < itemAbility.length; i++) {
                                if (itemAbility[i].fishing == 1) { // 해당 아이템이 낚시에서 사용되는 아이템이면
                                    if (userAbility[itemAbility[i].itemName] > 0) { // 해당 아이템의 효과가 1 이상이면
                                        if (itemAbility[i].minusTime != 0) { // 해당 아이템의 시간 감소 효과가 0이 아니면
                                            fishingTime -= itemAbility[i].minusTime; // 해당 아이템의 능력 값 만큼 소요시간 감소
                                            reply += `${itemAbility[i].itemName}: 소요 시간 -${itemAbility[i].minusTime / 1000}초\n`
                                        }

                                        if (itemAbility[i].plusItem != 0) { // 해당 아이템의 추가 아이템 효과가 0이 아니면
                                            catchingFish += itemAbility[i].plusItem; // 해당 아이템의 능력 값 만큼 아이템 추가
                                            editReply += `${itemAbility[i].itemName}: ${pickFish.fishName} +${itemAbility[i].plusItem}개\n`
                                        }
                                        await db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]); // 해당 아이템의 능력 횟수 1 감소
                                    }
                                }
                            }

                            editReply += fatigueEditReply;
                            editReply += '\n';
                            for (let i = 0; i < itemAbility.length; i++) {
                                if (itemAbility[i].fishing == 1) {
                                    if (userAbility[itemAbility[i].itemName] == 1) {
                                        editReply += `___${itemAbility[i].itemName}의 지속시간이 끝났습니다.___\n`
                                    }
                                }
                            }

                            await interaction.reply(reply);
                            await setTimeout(() => {
                                db.run(`UPDATE user SET work = 0, fatigue = fatigue - ${fatigueDamage} WHERE id = ?`, [interaction.user.id]);
                                db.run(`UPDATE fish SET ${pickFish.fishName} = ${pickFish.fishName} + ${catchingFish} WHERE id = ?`, [interaction.user.id]);
                                interaction.editReply(editReply);
                                return;
                            }, fishingTime);

                        } else if (work === 'harpoon') { // 작살낚시
                            if (userInfo.harpoon >= 1) {
                                await db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                                let harpoonObj = toolUpList.find(harpoon => harpoon.레벨 == userInfo.harpoon);
                                let pickFish;
                                const ranNum = Math.random();
                                let weightSum = 0;

                                for (const fish of fishWeight) {
                                    weightSum += fish.weight;
                                    if (ranNum < weightSum) {
                                        pickFish = await fishPickRank(fish.rank, 'harpoon');
                                        break;
                                    }
                                }

                                let fishIndex = Math.floor(Math.random() * pickFish.length);
                                pickFish = pickFish[fishIndex];

                                let reply = interaction.user.globalName + '이(가) 작살을 가지고 물속으로 들어갔다...\n\n'
                                let editReply = '**' + interaction.user.globalName + '이(가) ___' + pickFish.fishName + '___ 을(를) 잡았다!**\n\n' + fatigueReply + '\n\n'

                                for (let i = 0; i < itemAbility.length; i++) {
                                    if (itemAbility[i].harpoon == 1) { // 해당 아이템이 낚시에서 사용되는 아이템이면
                                        if (userAbility[itemAbility[i].itemName] > 0) { // 해당 아이템의 효과가 1 이상이면
                                            if (itemAbility[i].minusTime != 0) { // 해당 아이템의 시간 감소 효과가 0이 아니면
                                                harpoonObj.소요시간 -= itemAbility[i].minusTime; // 해당 아이템의 능력 값 만큼 소요시간 감소
                                                reply += `${itemAbility[i].itemName}: 소요 시간 -${itemAbility[i].minusTime / 1000}초\n`
                                            }

                                            if (itemAbility[i].plusItem != 0) { // 해당 아이템의 추가 아이템 효과가 0이 아니면
                                                harpoonObj.물고기갯수 += itemAbility[i].plusItem; // 해당 아이템의 능력 값 만큼 아이템 추가
                                                editReply += `${itemAbility[i].itemName}: ${pickFish.fishName} +${itemAbility[i].plusItem}개\n`
                                            }
                                            await db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]); // 해당 아이템의 능력 횟수 1 감소
                                        }
                                    }
                                }
                                editReply += fatigueEditReply;
                                editReply += '\n';
                                for (let i = 0; i < itemAbility.length; i++) {
                                    if (itemAbility[i].harpoon == 1) { // 해당 `활동`에 해당되는 아이템만
                                        if (userAbility[itemAbility[i].itemName] == 1) {
                                            editReply += `___${itemAbility[i].itemName}의 지속시간이 끝났습니다.___\n`
                                        }
                                    }
                                }
                                await interaction.reply(reply)
                                await setTimeout(() => {
                                    db.run(`UPDATE user SET work = 0, fatigue = fatigue - ${fatigueDamage} WHERE id = ?`, [interaction.user.id]);
                                    db.run(`UPDATE fish SET ${pickFish.fishName} = ${pickFish.fishName} + ${harpoonObj.물고기갯수} WHERE id = ?`, [interaction.user.id]);
                                    interaction.editReply(editReply);
                                    return;
                                }, harpoonObj.소요시간)
                            } else {
                                let fishIndex = Math.floor(Math.random() * pickFish.length);
                                pickFish = pickFish[fishIndex];
                                await interaction.reply({ content: '작살을 가지고 있지 않습니다.\n먼저 작살을 제작해주세요.', ephemeral: true });
                                return;
                            }
                        } else { // 채집 or 채광
                            let activityKrName, activityEnName, itemName, toolKrName;
                            let toolLevel = work + 'Level';

                            switch (work) {
                                case 'goves':
                                    activityKrName = '채집';
                                    activityEnName = 'gathering';
                                    itemName = '실';
                                    toolKrName = '장갑';
                                    break;
                                case 'pick':
                                    activityKrName = '채광';
                                    activityEnName = 'mining';
                                    itemName = '철조각';
                                    toolKrName = '곡괭이'
                                    break;
                            }

                            if (userInfo[work] > 0) {
                                await db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                                let timeObj = toolUpList.find(toolTime => toolTime.레벨 == userInfo[toolLevel]);
                                let activeityTime = (Math.floor(Math.random() * 10001) + 35000 - timeObj.감소시간); // 35~45초
                                let totlaItem = Number(Math.floor(Math.random() * 3) + 3 + (userInfo.rebirth * 2)); // 3~5개
                                let toolDamage = Number(Math.floor(Math.random() * 4) + 5); // 5~8
                                userInfo[work] < toolDamage ? toolDamage = userInfo[work] : null;
                                let reply = interaction.user.globalName + `은(는) 자원을 ${activityKrName}하기 위해 여정을 떠났다...\n\n`
                                let editReply = `**${interaction.user.globalName}이(가) 여정에서 돌아왔다.**\n\n${fatigueReply}\n*${itemName} +${totlaItem}\n${toolKrName} 내구도 -${toolDamage}%*\n\n`;

                                for (let i = 0; i < itemAbility.length; i++) { // 낚시랑 같은 알고리즘
                                    if (itemAbility[i][activityEnName] == 1) {
                                        if (userAbility[itemAbility[i].itemName] > 0) {
                                            if (itemAbility[i].minusTime != 0) {
                                                activeityTime -= itemAbility[i].minusTime;
                                                reply += `${itemAbility[i].itemName}: 소요 시간 -${itemAbility[i].minusTime / 1000}초\n`
                                            }

                                            if (itemAbility[i].plusItem != 0) {
                                                totlaItem += itemAbility[i].plusItem;
                                                editReply += `${itemAbility[i].itemName}: ${itemName} +${itemAbility[i].plusItem}개\n`
                                            }
                                            await db.run(`UPDATE ability SET ${itemAbility[i].itemName} = ${itemAbility[i].itemName} - 1 WHERE id = ?`, [interaction.user.id]);
                                        }
                                    }
                                }
                                editReply += fatigueEditReply;
                                editReply += '\n';
                                for (let i = 0; i < itemAbility.length; i++) {
                                    if (itemAbility[i][activityEnName] == 1) { // 해당 `활동`에 해당되는 아이템만
                                        if (userAbility[itemAbility[i].itemName] == 1) {
                                            editReply += `___${itemAbility[i].itemName}의 지속시간이 끝났습니다.___\n`
                                        }
                                    }
                                }

                                await interaction.reply(reply);
                                await setTimeout(() => {
                                    db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]); // 활동중 0으로 변경
                                    db.run(`UPDATE item SET ${itemName} = ${itemName} + ${totlaItem} WHERE id = ?`, [interaction.user.id]); // 아이템 갯수 증가
                                    db.run(`UPDATE user SET ${work} = ${work} - ${toolDamage}, fatigue = fatigue - ${fatigueDamage} WHERE id = ?`, [interaction.user.id]); // 내구도 감소
                                    interaction.editReply(editReply);
                                    return;
                                }, activeityTime);

                            } else {
                                interaction.reply({ content: '장비의 내구도가 부족합니다.', ephemeral: true })
                            }
                        }
                    } else {
                        await interaction.reply({ content: '피로도가 낮습니다.', ephemeral: true });
                        return;
                    }
                } else {
                    await interaction.reply({ content: '이미 활동중 입니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }

        // if (interaction.commandName === "판매") {
        //     let join = await joinCheck(interaction.user.id);
        //     if (join) {
        //         let userInfo = await getUserInfo(interaction.user.id);
        //         if (userInfo.work == 0) {
        //             let fishCount = interaction.options.getNumber('갯수');
        //             let fishName = interaction.options.getString('물고기');
        //             let userFish = await getFishName(interaction.user.id, fishName);
        //             let fishArr = await fish();
        //             let fishPrice = fishArr.find(fish => fish.fishName == fishName);
        //             if (fishCount <= userFish[fishName]) {    
        //                 await db.run(`UPDATE user SET money = money + ${Math.floor(fishPrice.price * (1 + (0.2 * userInfo.rebirth))) * fishCount} WHERE id = ?`, [interaction.user.id]);
        //                 await db.run(`UPDATE fish SET ${fishName} = ${fishName} - ${fishCount} WHERE id = ?`, [interaction.user.id]);
        //                 await interaction.reply(`${interaction.user.globalName}님이 ${fishName} ${NumberConversion(fishCount)}개를 판매하였습니다.\n\n*-${fishName} ${NumberConversion(fishCount)}개\n+${NumberConversion((fishPrice.price * (1 + 0.2 * userInfo.rebirth)) * fishCount)}원*`);
        //                 return;
        //             } else if(fishPrice == undefined){
        //                 await interaction.reply({ content: '존재하지 않는 물고기 입니다.', ephemeral: true });
        //                 return;
        //             } else {
        //                 await interaction.reply({ content: '물고기의 갯수가 부족합니다.', ephemeral: true });
        //                 return;
        //             }
        //         } else {
        //             await interaction.reply({ content: '활동 중에는 상점 이용이 불가능합니다.', ephemeral: true });
        //             return;
        //         }
        //     } else {
        //         await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
        //         return;
        //     }
        // }

        if (interaction.commandName === "판매") {
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
                            return;
                        } else {
                            await interaction.reply({ content: '물고기가 없습니다.', ephemeral: true });
                            return;
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
                            return;
                        } else {
                            await interaction.reply({ content: `${rankChoice}등급의 물고기가 없습니다.`, ephemeral: true });
                            return;
                        }
                    }
                } else {
                    await interaction.reply({ content: '활동 중에는 상점 이용이 불가능합니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
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
                    return;
                } else {
                    await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }

        if (interaction.commandName === "제작") {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let userInfo = await getUserInfo(interaction.user.id);
                if (userInfo.work == 0) {
                    let itemName = interaction.options.getString('아이템');
                    let userItem = await getAllItem(interaction.user.id);
                    let makingItemArr = await making();
                    let itemArr = await item();
                    let makingItem = makingItemArr.find(item => item.itemName == itemName);
                    let itemDes = itemArr.find(item => item.itemName == itemName);
                    if (userInfo.rebirth >= makingItem.rebirth) {

                        if (userInfo.harpoon > 0 && itemName == '작살') {
                            interaction.reply('이미 작살을 제작하셨습니다.');
                            return;
                        }

                        if (userItem.실 >= makingItem.실 || userItem.철조각 >= makingItem.철조각 || userItem.천 >= makingItem.천 || userItem.철괴 >= makingItem.철괴) {
                            db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                            db.run(`UPDATE item SET 실 = 실 - ${makingItem.실}, 철조각 = 철조각 - ${makingItem.철조각}, 천 = 천 - ${makingItem.천}, 철괴 = 철괴 - ${makingItem.철괴} WHERE id = ?`, [interaction.user.id]);
                            await interaction.reply(`${interaction.user.globalName}이(가) ${makingItem.itemName}을(를) 제작하기 시작했다.\n\n남은 시간: ${makingItem.time / 1000}초`);

                            let rateTime = 1;
                            interaction.editReply(`${interaction.user.globalName}이(가) ${makingItem.itemName}을(를) 제작하기 시작했다.\n\n남은 시간: ${makingItem.time / 1000 - rateTime}초`);
                            let interval = setInterval(() => {
                                rateTime++
                                interaction.editReply(`${interaction.user.globalName}이(가) ${makingItem.itemName}을(를) 제작하기 시작했다.\n\n남은 시간: ${makingItem.time / 1000 - rateTime}초`);
                            }, 1000)

                            await setTimeout(() => {
                                clearInterval(interval);
                                if (itemName == '작살') {
                                    db.run(`UPDATE user SET harpoon = 1 WHERE id = ?`, [interaction.user.id]);
                                } else {
                                    db.run(`UPDATE item SET \`${makingItem.itemName}\` = \`${makingItem.itemName}\` + 1 WHERE id = ?`, [interaction.user.id]);
                                }

                                db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                                interaction.editReply(`${interaction.user.globalName}이(가) ${makingItem.itemName}을(를) 제작했다.\n\n${itemDes.description}`)
                            }, makingItem.time)
                        } else {
                            interaction.reply('재료가 부족합니다.');
                            return;
                        }
                    } else {
                        interaction.reply({ content: '해당 아이템을 제작하기 위한 환생 횟수가 부족합니다.', ephemeral: true });
                        return;
                    }
                } else {
                    await interaction.reply({ content: '활동 중에는 아이템 제작이 불가능합니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
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
                        let itemArr = await item();
                        let itemObj = itemArr.find(item => item.itemName == activeItem);
                        if (itemObj.fix == 1) {          // 도구 수리
                            let toolName = activeItem.split(' ');
                            let refinishing = 0
                            toolName[0] == '장갑' ? toolName = 'goves' : toolName = 'pick'; // 해당 아이템의 용도가 장갑이면 goves 곡괭이면 pickl
                            itemObj.refinishing + userInfo[toolName] > 100 ? refinishing = 100 - userInfo[toolName] : refinishing = itemObj.refinishing; // 아이템의 수리도 + 현재 내구도 = 100 일 때 100 - 현재 내구도 를 하여 내구도가 100을 넘지 않도록
                            db.run(`UPDATE user SET ${toolName} = ${toolName} + ${refinishing} WHERE id = ?`, [interaction.user.id]); // 쿼리문
                            await interaction.reply(`${replyTxt}*${itemObj.description}*`);
                            return;
                        } else {
                            db.run(`UPDATE ability SET ${activeItem} = ${itemObj.buffCount} WHERE id = ?`, [interaction.user.id]);
                            await interaction.reply(`${replyTxt}*${itemObj.description}*`);
                            return;
                        }
                    } else {
                        await interaction.reply({ content: '해당 아이템을 보유 하고있지 않습니다.', ephemeral: true });
                        return;
                    }
                } else {
                    await interaction.reply({ content: '활동 중에는 아이템 사용이 불가능합니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }

        if (interaction.commandName === '강화') {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let userInfo = await getUserInfo(interaction.user.id);
                let userItem = await getAllItem(interaction.user.id);
                let updrageItem = interaction.options.getString('도구');
                let toolUpgraded = await toolUpgrade(updrageItem)
                let upgradeMaterial;
                if (userInfo.work == 0) {
                    if (updrageItem == 'fishingLine') {
                        upgradeMaterial = toolUpgraded.find(rod => rod.레벨 == userInfo.fishingLine);
                        if (upgradeMaterial.최고레벨 != 1) {
                            if (userInfo.money < upgradeMaterial.가격) {
                                await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                                return;
                            } else if (userItem.실 < upgradeMaterial.실) {
                                await interaction.reply({ content: '실이 부족합니다.', ephemeral: true });
                                return;
                            } else {
                                db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, fishingLine = fishingLine + 1 WHERE id = ?`, [interaction.user.id]);
                                db.run(`UPDATE item SET 실 = 실 - ${upgradeMaterial.실} WHERE id = ?`, [interaction.user.id]);
                                await interaction.reply(`${interaction.user.globalName}님이 낚싯줄을 업그레이드 했습니다!\n**낚싯줄 레벨  ${userInfo.fishingLine} => ${Number(userInfo.fishingLine) + 1}\n낚시 소요시간 -5초**\n\n*실 -${NumberConversion(upgradeMaterial.실)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                return;
                            }
                        } else {
                            await interaction.reply({ content: interaction.user.globalName + '님은 낚싯줄은 현재 "최고레벨" 입니다.', ephemeral: true });
                            return;
                        }
                    } else if (updrageItem == 'fishingHook') {
                        upgradeMaterial = toolUpgraded.find(hook => hook.레벨 == userInfo.fishingHook);
                        if (upgradeMaterial.최고레벨 != 1) {
                            if (userInfo.money < upgradeMaterial.가격) {
                                await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                                return;
                            } else if (userItem.철조각 < upgradeMaterial.철조각) {
                                await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                                return;
                            } else {
                                db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, fishingHook = fishingHook + 1 WHERE id = ?`, [interaction.user.id]);
                                db.run(`UPDATE item SET 철조각 = 철조각 - ${upgradeMaterial.철조각} WHERE id = ?`, [interaction.user.id]);
                                await interaction.reply(`${interaction.user.globalName}님이 낚싯바늘을 업그레이드 했습니다!\n**낚싯바늘 레벨  ${userInfo.fishingHook} => ${Number(userInfo.fishingHook) + 1}\n낚시 추가 물고기 +1** \n\n*철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                return;
                            }
                        } else {
                            await interaction.reply({ content: interaction.user.globalName + '님은 낚싯바늘은 현재 "최고레벨" 입니다.', ephemeral: true });
                            return;
                        }
                    } else if (updrageItem == 'goves') {
                        upgradeMaterial = toolUpgraded.find(goves => goves.레벨 == userInfo.govesLevel);
                        if (upgradeMaterial.최고레벨 != 1) {
                            if (userInfo.money < upgradeMaterial.가격) {
                                await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                                return;
                            } else if (userItem.실 < upgradeMaterial.실) {
                                await interaction.reply({ content: '실이 부족합니다.', ephemeral: true });
                                return;
                            } else if (userItem.천 < upgradeMaterial.천) {
                                await interaction.reply({ content: '천이 부족합니다.', ephemeral: true });
                                return;
                            } else {
                                db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, govesLevel = govesLevel + 1 WHERE id = ?`, [interaction.user.id]);
                                db.run(`UPDATE item SET 실 = 실 - ${upgradeMaterial.실}, 천 = 천 - ${upgradeMaterial.천} WHERE id = ?`, [interaction.user.id]);
                                let upLevel = toolUpgraded.find(goves => goves.레벨 == (userInfo.govesLevel + 1));

                                if (userInfo.govesLevel <= 7) {
                                    await interaction.reply(`${interaction.user.globalName}님이 장갑을 업그레이드 했습니다!\n**장갑 레벨  ${userInfo.govesLevel} => ${Number(userInfo.govesLevel) + 1}\n\n채집 소요시간 ${Number(upLevel.감소시간) / 1000}초 감소**\n*실 -${NumberConversion(upgradeMaterial.실)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                    return;
                                } else {
                                    await interaction.reply(`${interaction.user.globalName}님이 장갑을 업그레이드 했습니다!\n**장갑 레벨  ${userInfo.govesLevel} => ${Number(userInfo.govesLevel) + 1}\n\채집 추가 자원 +${Number(upLevel.추가자원)}개**\n*천 -${NumberConversion(upgradeMaterial.천)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                    return;
                                }
                            }
                        } else {
                            await interaction.reply({ content: interaction.user.globalName + '님은 장갑은 현재 "최고레벨" 입니다.', ephemeral: true });
                            return;
                        }
                    } else if (updrageItem == 'pick') {
                        upgradeMaterial = toolUpgraded.find(pick => pick.레벨 == userInfo.pickLevel);
                        if (upgradeMaterial.최고레벨 != 1) {
                            if (userInfo.money < upgradeMaterial.가격) {
                                await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                                return;
                            } else if (userItem.철조각 < upgradeMaterial.철조각) {
                                await interaction.reply({ content: '철조각이 부족합니다.', ephemeral: true });
                                return;
                            } else if (userItem.철괴 < upgradeMaterial.철괴) {
                                await interaction.reply({ content: '철괴가 부족합니다.', ephemeral: true });
                                return;
                            } else {
                                db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, pickLevel = pickLevel + 1 WHERE id = ?`, [interaction.user.id]);
                                db.run(`UPDATE item SET 철조각 = 철조각 - ${upgradeMaterial.철조각}, 철괴 = 철괴 - ${upgradeMaterial.철괴} WHERE id = ?`, [interaction.user.id]);
                                let upLevel = toolUpgraded.find(pick => pick.레벨 == (userInfo.pickLevel + 1));
                                if (userInfo.pickLevel <= 7) {
                                    await interaction.reply(`${interaction.user.globalName}님이 곡괭이을 업그레이드 했습니다!\n**곡괭이 레벨  ${userInfo.pickLevel} => ${Number(userInfo.pickLevel) + 1}\n\n채광 소요시간 ${Number(upLevel.감소시간) / 1000}초 감소**\n*철조각 -${NumberConversion(upgradeMaterial.철조각)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                    return;
                                } else {
                                    await interaction.reply(`${interaction.user.globalName}님이 곡괭이을 업그레이드 했습니다!\n**곡괭이 레벨  ${userInfo.pickLevel} => ${Number(userInfo.pickLevel) + 1}\n\n채광 추가 자원 +${Number(upLevel.추가자원)}개**\n*철괴 -${NumberConversion(upgradeMaterial.철괴)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                    return;
                                }
                            }
                        } else {
                            await interaction.reply({ content: interaction.user.globalName + '님은 곡괭이은 현재 "최고레벨" 입니다.', ephemeral: true });
                            return;
                        }
                    } else if (updrageItem == 'harpoon') {
                        if (userInfo.harpoon >= 1) {
                            upgradeMaterial = toolUpgraded.find(harpoon => harpoon.레벨 == userInfo.harpoon);
                            if (upgradeMaterial.최고레벨 != 1) {
                                if (userInfo.money < upgradeMaterial.가격) {
                                    await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                                    return;
                                } else if (userItem.철조각 < upgradeMaterial.천) {
                                    await interaction.reply({ content: '천이 부족합니다.', ephemeral: true });
                                    return;
                                } else if (userItem.철조각 < upgradeMaterial.철괴) {
                                    await interaction.reply({ content: '철괴가 부족합니다.', ephemeral: true });
                                    return;
                                } else {
                                    db.run(`UPDATE user SET money = money - ${upgradeMaterial.가격}, harpoon = harpoon + 1 WHERE id = ?`, [interaction.user.id]);
                                    db.run(`UPDATE item SET 철괴 = 철괴 - ${upgradeMaterial.철괴}, 천 = 천 - ${upgradeMaterial.천} WHERE id = ?`, [interaction.user.id]);
                                    let upLevel = toolUpgraded.find(harpoon => harpoon.레벨 == (userInfo.harpoon + 1));
                                    await interaction.reply(`${interaction.user.globalName}님이 작살을 업그레이드 했습니다!\n**작살 레벨  ${userInfo.harpoon} => ${Number(userInfo.harpoon) + 1}\n\n작살낚시 소요시간 -5초**\n*천 -${NumberConversion(upgradeMaterial.천)}개\n철괴 -${NumberConversion(upgradeMaterial.철괴)}개\n돈 -${NumberConversion(upgradeMaterial.가격)}*`);
                                    return;
                                }
                            } else {
                                await interaction.reply({ content: interaction.user.globalName + '님은 곡괭이은 현재 "최고레벨" 입니다.', ephemeral: true });
                                return;
                            }
                        } else {
                            await interaction.reply({ content: '작살을 보유하고 있지 않습니다.\n먼저, 작살을 제작해주세요.', ephemeral: true });
                            return;
                        }
                    }
                } else {
                    await interaction.reply({ content: '활동중에는 강화를 진행할 수 없습니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }

        if (interaction.commandName === "휴식하기") {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let userInfo = await getUserInfo(interaction.user.id);
                if (userInfo.work == 0) {
                    let restName = interaction.options.getString('휴식');
                    if (restName == '쉬기') {
                        await interaction.reply({ content: '휴식을 시작합니다.', ephemeral: true })
                        await db.run('UPDATE user SET resting = 1, work = 1 WHERE id = ?', [interaction.user.id]);
                        let restRate = setInterval(async () => {
                            userInfo = await getUserInfo(interaction.user.id);
                            if (userInfo.fatigue < 100) {
                                let restCount = (userInfo.fatigue + 5) > 100 ? 100 - userInfo.fatigue : 5
                                await db.run(`UPDATE user SET fatigue = fatigue + ${restCount} WHERE id = ?`, [interaction.user.id]);
                            } else {
                                interaction.user.send('휴식을 완료했습니다!');
                                await db.run('UPDATE user SET resting = 0, work = 0 WHERE id = ?', [interaction.user.id]);
                                clearInterval(restRate);
                                return;
                            }
                        }, 30000);

                    } else {
                        let restList = await rest();
                        let resting = restList.filter(rest => rest.restName == restName);
                        if (userInfo.money > resting[0].price) {
                            await db.run('UPDATE user SET work = 1 WHERE id = ?', [interaction.user.id]);
                            interaction.reply(`${interaction.user.globalName}님이 **${resting[0].restName}** 휴식을 시작했습니다.`);
                            let query = (userInfo.fatigue + resting[0].recoveryCount) >= 100 ? '100' : `fatigue + ${resting[0].recoveryCount}`
                            await setTimeout(() => {
                                db.run(`UPDATE user SET money = money - ${resting[0].price}, fatigue = ${query} WHERE id = ?`, [interaction.user.id]);
                                db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
                                interaction.editReply(`**${interaction.user.globalName}님이 휴식을 끝마쳤습니다.\n${resting[0].description}\n\n피로도 +${resting[0].recoveryCount}\n-${resting[0].price}원**`)
                                return;
                            }, resting[0].time)
                        } else {
                            await interaction.reply({ content: '돈이 부족합니다.', ephemeral: true });
                            return;
                        }
                    }
                } else {
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }

        if (interaction.commandName === "환생하기") {
            let join = await joinCheck(interaction.user.id);
            if (join) {
                let userInfo = await getUserInfo(interaction.user.id);
                if (userInfo.work == 0) {
                    const confirmBtn = new ButtonBuilder()
                        .setCustomId('confirm')
                        .setLabel('확인')
                        .setStyle(ButtonStyle.Primary);

                    const cancelBtn = new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('취소')
                        .setStyle(ButtonStyle.Danger);


                    const btnRow = new ActionRowBuilder()
                        .addComponents(confirmBtn, cancelBtn);

                    let rebirthCondition = await rebirth();
                    let userRebirthCondition = rebirthCondition.find(rebirth => rebirth.count == userInfo.rebirth);
                    if (userRebirthCondition.max == 1) {
                        await interaction.reply({ content: '환생 최대 횟수에 도달하셨습니다.', ephemeral: true })
                        return;
                    }

                    let response = await interaction.reply({
                        content: `# 정말 환생하시겠습니까?\n# 환생하면 모든걸 잃고 처음부터 다시 시작합니다.\n## 현재 환생 횟수: ${userInfo.rebirth}회\n\n## == 환생 시 필요한 조건 ==\n${userRebirthCondition.condition}\n\n## === 새로운 능력 ===\n### 활동 시 추가로 얻는 모든 자원 +2\n### 물고기 판매 가격 +20%\n### 일부 아이템 제작 해금\n\n## ======`,
                        components: [btnRow],
                        ephemeral: true
                    })

                    const collectorFilter = i => i.user.id === interaction.user.id;

                    try {
                        const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 240_000 }); // 3분동안 버튼 클릭 여부 기다리기
                        if (confirmation.customId === 'confirm') {
                            if (
                                userInfo.fishingLine >= userRebirthCondition.fishingLine &&
                                userInfo.fishingHook >= userRebirthCondition.fishingHook &&
                                userInfo.govesLevel >= userRebirthCondition.govesLevel &&
                                userInfo.pickLevel >= userRebirthCondition.pickLevel &&
                                userInfo.harpoon >= userRebirthCondition.harpoon &&
                                userInfo.money >= userRebirthCondition.money
                            ) {
                                await confirmation.update({
                                    content: '***환생을 선택하여 모든걸 잃고 처음으로 되돌아갑니다.***',
                                    components: []
                                })

                                let userItem = await getAllItem(interaction.user.id);
                                let userAbility = await getUserAbility(interaction.user.id);
                                let userFish = await getAllFish(interaction.user.id);

                                let user = Object.keys(userInfo);
                                let item = Object.keys(userItem);
                                let ability = Object.keys(userAbility);
                                let fish = Object.keys(userFish);

                                user.shift(); // 맨 앞에 id 제거

                                user.pop(); // 맨 뒤에 2개 환생횟수, 출석횟수 제거
                                user.pop();

                                let userDefaultValues = [0, 1, 1, 0, 1, 1, 100, 100, 100, 0, 0];

                                for (let i = 0; i < user.length; i++) {
                                    let query = `UPDATE user SET \`${user[i]}\` = ${userDefaultValues[i]} WHERE id = ?`
                                    await db.run(query, [interaction.user.id]);
                                }

                                item.splice(0, 1, 'item');
                                ability.splice(0, 1, 'ability');
                                fish.splice(0, 1, 'fish');

                                let resetUser = [item, ability, fish]; //2차원 배열

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
                                return;
                            } else {
                                await confirmation.update({
                                    content: '***조건에 충족하지 못하여 환생을 할 수 없습니다.***',
                                    components: []
                                })
                                return;
                            }
                        } else {
                            await confirmation.update({
                                content: '***취소하였습니다.***',
                                components: []
                            })
                        }
                    } catch (e) {
                        await interaction.editReply({
                            content: '***취소하였습니다.***',
                            components: []
                        });
                        return;
                    }
                } else {
                    await interaction.reply({ content: '활동중에는 환생을 진행할 수 없습니다.', ephemeral: true });
                    return;
                }
            } else {
                await interaction.reply({ content: '먼저 가입을 해주세요.', ephemeral: true });
                return;
            }
        }
    } catch (e) {
        await db.run('UPDATE user SET work = 0 WHERE id = ?', [interaction.user.id]);
        await interaction.reply({ content: '오류가 발생했습니다.\n' + e })
    }
});

function NumberConversion(Num) { // 숫자 변환 예) 100000 => 100,000
    return Num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function joinCheck(id) {
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

async function attendanceCheck(id) {
    return new Promise((resolve, reject) => {
        attendance.get("SELECT * FROM attendance WHERE id = ? ORDER BY year DESC, month DESC, date DESC", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (!!row) {
                    row = new Date(row.year, row.month - 1, row.date);
                } else {
                    row = null;
                }
                resolve(row);
            }
        });
    });
}

async function banCheck(id, print) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM ban WHERE ID = ?", [id], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (print) {
                    resolve(row);
                } else {
                    resolve(!!row);
                }
            }
        });
    });
};

async function getUserInfo(id) {
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

async function getAllUser() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM user`, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            };
        });
    });
};

async function getFishName(id, fish) {
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

async function getAllFish(id) {
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

async function getUserItem(id, item) {
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

async function getAllItem(id) {
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

async function getUserAbility(id) {
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

async function rest() {
    return new Promise((resolve, reject) => {
        data.all('SELECT * FROM rest', (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function fishPickRank(rank, activity) {
    return new Promise((resolve, reject) => {
        data.all(`SELECT * FROM fish WHERE rank = ? AND ${activity} = 1`, [rank], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function toolUpgrade(tool) {
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

async function making() {
    return new Promise((resolve, reject) => {
        data.all('SELECT * FROM making', (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function rebirth() {
    return new Promise((resolve, reject) => {
        data.all('SELECT * FROM rebirth', (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

client.login(TOKEN);
