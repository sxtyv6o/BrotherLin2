const { VK } = require('vk-io');
const vk = new VK();
const commands = [];
const VKCOINAPI = require('node-vkcoinapi');
const vkcoin = new VKCOINAPI({
token: "vk1.a.oi_eUZk3pwBEZyf7fDaEnN53w2TiTE_Q48-hIE5mr8O4NVbHwUC47qUpkLwp3l9XFqRGLjLgwK_Uvg9bkuejnH6ADkvsX0f-TckJ03r8QgKiz7tTF2IXlIY_keGhu73f98CX-u7ZbH0l_BBeB5doRC2eirOHjDW_Eqviw7RbDHz-Uao-PiemT4Z-dd8k1RWEdBZHMskRtFSflceS4gZgKA",
 key: "9u39[Jv7#faZD5[,&Fqoa=F[O0t-.J!vR[0v9K#a2N.Rx7ydAG", 
 userId: 663349814});
const request = require('prequest');
const { updates, snippets } = vk;
const hd = require('humanize-duration');
const rq = require("prequest");
vk.setOptions({ token: 'vk1.a.UwtJ4bl_KzJ9znHXKKAF8ORg4BzgDS2r70sMX_22XIqswAWxPDl5bFFd1h8H-524kVAVMKEhELf8p-DC3RtWvBP03sTAHSDfROzf2ZQgczFIS7CQO1UX3Lls4rOgCqBe9328RUf2-QDlOH71H2BNgyqpjaQSYSK5s4gm5VsFm3PG4KvNZRttlECKpfd_LZmp-a2QqcM7f3NS6N8A5JLc_w', pollingGroupID:216854202});
let users = require('./users.json');
updates.startPolling();

let buttons = [];

const utils = {
	sp: (int) => {
		int = int.toString();
		return int.split('').reverse().join('').match(/[0-9]{1,3}/g).join('.').split('').reverse().join('');
	},
	rn: (int, fixed) => {
		if (int === null) return null;
		if (int === 0) return '0';
		fixed = (!fixed || fixed < 0) ? 0 : fixed;
		let b = (int).toPrecision(2).split('e'),
			k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3),
			c = k < 1 ? int.toFixed(0 + fixed) : (int / Math.pow(10, k * 3) ).toFixed(1 + fixed),
			d = c < 0 ? c : Math.abs(c),
			e = d + ['', 'тыс', 'млн', 'млрд', 'трлн'][k];

			e = e.replace(/e/g, '');
			e = e.replace(/\+/g, '');
			e = e.replace(/Infinity/g, 'Бессконечно');

		return e;
	},
	gi: (int) => {
		int = int.toString();

		let text = ``;
		for (let i = 0; i < int.length; i++)
		{
			text += `${int[i]}&#8419;`;
		}

		return text;
	},
	decl: (n, titles) => { return titles[(n % 10 === 1 && n % 100 !== 11) ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2] },
	random: (x, y) => {
		return y ? Math.round(Math.random() * (y - x)) + x : Math.round(Math.random() * x);
	},
	pick: (array) => {
		return array[utils.random(array.length - 1)];
	}
}

setInterval(async () => {
	await saveUsers();
	console.log('Аккаунты сохранены');
}, 25000);

async function saveUsers()
{
	require('fs').writeFileSync('./users.json', JSON.stringify(users, null, '\t'));
	return true;
}

updates.on('message', async (message) => {
	if(Number(message.senderId) <= 0) return;

	if(!users.find(x=> x.id === message.senderId))
	{
		const [user_info] = await vk.api.users.get({ user_id: message.senderId });
		const date = new Date();

		users.push({
			id: message.senderId,
			uid: users.length,
			balance: 0,
			deposit: 0,
			register: false,
			adm: 0,
			ban: false,
			mention: true,
			tag: user_info.first_name
		});
	}

	message.user = users.find(x=> x.id === message.senderId);
	if(message.user.ban) return;

	const name = (text, params) =>
	{
		return message.send(`${message.user.mention ? `@id${message.user.id} (${message.user.tag})` : `${message.user.tag}`}, ${text}`, params);
	}

	const command = commands.find(x=> x[0].test(message.text));
	if(!command) return;

	message.args = message.text.match(command[0]);
	await command[1](message, name);

	console.log(`Пользователь ${message.user.uid}: ${message.text}`)
});

const cmd = {
	hear: (p, f) => {
		commands.push([p, f]);
	}
}

cmd.hear(/^(?:🎮 Начать)$/i, async (message, name) => {	
	return message.send(`📌 Выберите действие:`,

		{
			keyboard:JSON.stringify(
		{
			"one_time": false,
			"buttons": [
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "💶 Пополнить"
		},
			"color": "positive"
		},
		{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "💴 Вывести"
		},
			"color": "positive"
		}],
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "👤 Профиль"
		},
			"color": "primary"
		}],
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "🔙 Назад"
		},
			"color": "negative"
		}]
		]
			})
});
});

cmd.hear(/(?:💶 Пополнить)$/i, async (message) => { 
const link = vkcoin.getLink(1000000, false);
await vkcoin.updates.startPolling(); 
vkcoin.updates.onTransfer((event) => { 
console.log(event); 

let user = users.find(x=> x.id === event.fromId); 
user.deposit += event.amount / 1000; 
vk.api.messages.send({ 
user_id: event.fromId, 
message: `На депосит поступило ${vkcoin.formatCoins(event.amount)} VK Coins. Теперь каждые сутки вам на баланс будет прибавляться 4%.` 
}); 
}); 
return message.send(`Ссылка для пополнения - ${link}.`);
});

cmd.hear(/^(?:💴 Вывести)$/i, async (message, name) => {	 

const balance = Math.floor(message.user.balance * 1.00); 

message.user.balance = 0;

await vkcoin.sendPayment(message.senderId, balance * 1000); 
await message.send(`Выведено ${utils.sp(balance)} VK Coins.\nЕсли деньги не пришли пишите в личные сообщения @id663349814 (Феде Ханжину).`);

});

cmd.hear(/^(?:выдать)\s([0-9]+)\s(.*)$/i, async (message, bot) => { 
message.args[2] = message.args[2].replace(/(\.|\,)/ig, ''); 
message.args[2] = message.args[2].replace(/(к|k)/ig, '000'); 
message.args[2] = message.args[2].replace(/(м|m)/ig, '000000'); 

if(message.senderId !== 416528201) return; 
if(!Number(message.args[2])) return; 
message.args[2] = Math.floor(Number(message.args[2])); 

if(message.args[2] <= 0) return; 

{ 
let user = users.find(x=> x.uid === Number(message.args[1])); 
if(!user) return bot(`неверный ID игрока`); 


user.balance += message.args[2]; 


await bot(`вы выдали игроку ${user.tag} ${utils.sp(message.args[2])}$`); 
if(user.notifications) vk.api.messages.send({ user_id: user.id, message: `[УВЕДОМЛЕНИЕ] 
Администратор ${message.user.tag} выдал вам ${utils.sp(message.args[2])}VKc! 
🔕 ` }); 
} 
});

cmd.hear(/^(?:проценты)$/i, async (message, name) => { 
 
if(message.senderId !== 416528201) return; 
 
 let dep = (user.deposit / 100) * 4;
 
users.map(user => { 
if(!user.balance); 
else 
{ 
user.balance += dep; 
} 
 
}); 
});

cmd.hear(/^(?:проценты убрать)$/i, async (message, name) => { 
 
 if(message.senderId !== 416528201) return;
 
 let dep = (user.deposit / 100) * 4;
 
users.map(user => { 
if(!user.balance); 
else 
{ 
user.balance -= dep; 
} 
 
}); 
});

cmd.hear(/^(?:id)\s([0-9]+)$/i, async (message, bot) => {
	let user = users.find(x=> x.id === Number(message.args[1]));
	if(message.user.adm < 1) return;
	if(!user) return bot(`укажите циферный ID страницы. ${smileerror}`);

	return bot(`id игрока ${user.tag}: ${user.uid}`);
});

cmd.hear(/^(?:передать)\s([0-9]+)\s(.*)$/i, async (message, bot) => {
	message.args[2] = message.args[2].replace(/(\.|\,)/ig, '');
	message.args[2] = message.args[2].replace(/(к|k)/ig, '000');
	message.args[2] = message.args[2].replace(/(м|m)/ig, '000000');
	message.args[2] = message.args[2].replace(/(вабанк|вобанк|все|всё)/ig, message.user.balance);

	if(!Number(message.args[2])) return;
	message.args[2] = Math.floor(Number(message.args[2]));

	if(message.args[2] <= 0) return;
	if(!message.user.settings.trade) return bot(`у вас установлен бан передачи ${smileerror}`);

	if(message.args[2] > message.user.balance) return bot(`недостаточно денег
💰 Баланс: ${utils.sp(message.user.balance)}VKc`);
	else if(message.args[2] <= message.user.balance)
	{
		let user = users.find(x=> x.uid === Number(message.args[1]));
		if(!user) return bot(`укажите ID игрока из его профиля. ${smileerror}`);

		if(user.uid === message.user.uid) return bot(`укажите ID игрока из его профиля. ${smileerror}`);

		message.user.balance -= message.args[2];
		user.balance += message.args[2];

		await bot(`вы перевели ${user.tag} ${utils.sp(message.args[2])}₽ ${smilesuccess}
		💰 Ваш баланс: ${utils.sp(message.user.balance)}₽`);
		if(user.notifications) vk.api.messages.send({ user_id: user.id, message: `[УВЕДОМЛЕНИЕ]
▶ Игрок ${message.user.tag} перевел вам ${utils.sp(message.args[2])}VKc!
🔕` });
	}
});

cmd.hear(/^(?:👤 Профиль)$/i, async (message, name) => {
	let text = ``;

	text += `🔎 ID: ${message.user.uid}.\n`;
	text += `💳 Баланс: ${utils.sp(message.user.balance)} VK Coins.\n`;

	return message.send(`Твой профиль:\n${text}
Завтра у вас на балансе будет: ${message.user.balance + (message.user.deposit / 100) * 4} VK Coins.`);
});

cmd.hear(/^(?:казино)\s(.*)$/i, async (message, bot) => {
	message.args[1] = message.args[1].replace(/(\.|\,)/ig, '');
	message.args[1] = message.args[1].replace(/(к|k)/ig, '000');
	message.args[1] = message.args[1].replace(/(м|m)/ig, '000000');
	message.args[1] = message.args[1].replace(/(вабанк|вобанк|все|всё)/ig, message.user.balance);
	let smilekazinobad2 = utils.pick([`😒`, `😯`, `😔`]);
	if(!Number(message.args[1])) return;
	message.args[1] = Math.floor(Number(message.args[1]));

	if(message.args[1] <= 0) return;

	if(message.args[1] > message.user.balance) return bot(`на вашем балансе нет столько коинов!`);
	else if(message.args[1] <= message.user.balance)
	{
		message.user.balance -= message.args[1];
		const multiply = utils.pick([0, 0, 0, 0, 0.25, 0.75, 0.5, 0.5, 0.5, 0.5, 0.50, 0.50, 0.75, 0.75, 0.25, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2, 2, 3]);

		message.user.balance += Math.floor(message.args[1] * multiply);
		return bot(`${multiply === 1 ? `ваши деньги остаются при вас ` : `${multiply < 1 ? `вы проиграли ${utils.sp(message.args[1] * multiply)}VKc` : `вы выиграли ${utils.sp(message.args[1] * multiply)}VKc`}`} (x${multiply})
		💰 Ваш баланс: ${utils.sp(message.user.balance)}₽`);
	}
});

cmd.hear(/^(?:🔙 Назад)$/i, async (message, name) => {	
	return message.send(`📌 Выберите действие:`,

		{
			keyboard:JSON.stringify(
		{
			"one_time": false,
			"buttons": [
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "🎮 Начать"
		},
			"color": "positive"
		}],
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "📢 О проекте"
		},
			"color": "default"
		},
		{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "📢 Правила"
		},
			"color": "default"
		}]
		]
			})
});
});

cmd.hear(/^(?:📢 О проекте)$/i, async (message, name) => {	
	return message.send(`
📌 О нашем проекте:
4% Platinum invest - это инвестиционный проект, в который вы вкладываете Vk Coins и получаете начисления.
_________________________
⚠ Наши преимущества: 
1) Выгодные вклады.
2) Вложив, вы окупаете свои затраты. 
_________________________ 
🌟 Узнать правила нашего проекта вы можете в разделе "📢 Правила". 🌟 
_________________________ `);
});

cmd.hear(/^(?:📢 Правила)$/i, async (message, name) => {	
	return message.send(`
📋 Правила:
1) Вкладывая Vk Coins в наш проект, вы автоматически соглашаетесь с нашими правилами. 
2) Не знание правил - не освобождает от ответственности. 
3) Начисления приходят каждые сутки.
4) Вы вклыдываете коины на свой страх и риск
_________________________
🆘 Если у вас возникли какие-либо вопросы, связанные с проектом, то зайдите в раздел "📢 О проекте".`);
});

cmd.hear(/^(.*)$/i, async (message, name) => {	
if(message.user.register === false)
{
	message.user.register = true;
	message.send(`✔ » Вы были успешно зарегистрированы. Выберите действие:`,

		{
			keyboard:JSON.stringify(
		{
			"one_time": false,
			"buttons": [
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "🎮 Начать"
		},
			"color": "positive"
		}],
		[{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "📢 О проекте"
		},
			"color": "default"
		},
		{
				"action": {
				"type": "text",
				"payload": "{\"button\": \"1\"}",
				"label": "📢 Правила"
		},
			"color": "default"
		}]
		]
			})
});
}
});