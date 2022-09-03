/* start requirements */
const { Client, Intents,GatewayIntentBits} = require('discord.js');
const SQLite = require("sqlite3");
require('dotenv').config();
const sql = new SQLite.Database("./score.sqlite",SQLite.OPEN_READWRITE);
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,Intents.FLAGS.GUILD_MEMBERS] });
/*-------------------------------*/
/* variables */
let xp = 0
let lvl = 0
let xpmax = 0
const titles = ['Rookie','Member','Addicted','No Life']
let title = ''
let fighter1 = 0
let roless= {
  'fighter1':[],
  'fighter2':[]
}
let fighter2= 0
const prefix = '#'
/*----------------------*/
/* bot start msg*/
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.user.setActivity('#help',{type:'PLAYING'})
  client.user.setUsername('Ainzu')
 
})
/*----------------------------*/
/* handle welcoming */
client.on('guildCreate',async guild => {
  const embedmsg =  {
    author:{
      name:`Ainzu`
    },
    title: `Greetings`,
    color:' #E0115F',
    description:'Rules:\n 0- No Spam Commands Please',
    footer:{
      text:'ty,have a boring time.'
    },
    thumbnail:{
      url:client.user.avatarURL()
    }
  }
  guild.systemChannel.send({embeds:[embedmsg]})
  let id = `score${guild.id}`
  sql.exec(`DROP TABLE IF EXISTS ${id}`)
  const Guild = await client.guilds.fetch(guild.id)
  console.log(id)
  const members = await Guild.members.fetch()
   let query = "CREATE TABLE " + id + " (id INTEGER PRIMARY KEY, LvL INTEGER,xp INTEGER,xpmax INTEGER)";
  sql.exec(query)
  members.map((member)=>{
   sql.exec(`insert or Replace into ${id} (id,LvL,xp,xpmax) values(${member.user.id},0,0,2000)`)
  })
});
client.on('guildMemberAdd', async newMember => {
  sql.exec(`insert OR REPLACE into score${newMember.guild.id}(id,LvL,xp,xpmax) values(${newMember.id},0,0,2000)`)
  const welcomeChannel = newMember.guild.channels.cache.find(channel => channel.name === 'welcome')
   const embedmsg =  {
     title:`${newMember.user.tag}`,
    description: `Welcome To The Server ${newMember.user}`,
    color:' #E0115F',
    footer:{
      text:'have a boring time.'
    },
    thumbnail:{
      url:newMember.user.avatarURL()
    }
  }
  welcomeChannel.send({embeds:[embedmsg]})
})
client.on('guildMemberRemove',async oldMember=>{
  sql.exec(`DELETE from score${oldMember.guild.id} where id=${oldMember.id}`)
  const welcomeChannel = oldMember.guild.channels.cache.find(channel => channel.name === 'welcome')
  const embedmsg =  {
    title:`${oldMember.user.tag}`,
    description: `${oldMember.user} Left The Server`,
    color:' #E0115F',
    footer:{
      text:'have a good and fresh life'
    },
    thumbnail:{
      url:oldMember.user.avatarURL()
    }
  }
  welcomeChannel.send({embeds:[embedmsg]})
})
/*------------------------------*/
/*handle bot functioning */
client.on("message",async msg => {
  if(msg.author.bot)return;
   if(!msg.author.bot){
    sql.all(`SELECT * FROM score${msg.guild.id} where id=${msg.author.id}`, function(err, rows) {  
      rows.forEach(function (row) { 
        if(row.xp<=row.xpmax){
          xp = row.xp + 1000
          lvl = row.LvL
          /*not updating for server creator*/
          xpmax = row.xpmax
          sql.exec(`UPDATE score${msg.guild.id} SET xp=${xp} where id=${msg.author.id}`)
        }

        else{
          lvl =  row.LvL + 1
          xpmax = row.xpmax + 1000
          sql.exec(`UPDATE score${msg.guild.id} SET LvL=${lvl},xp=0,xpmax=${xpmax} where id=${msg.author.id}`)
          const embedmsg =  {
            author:{
              name:`${msg.author.username}`
            },
            title: `Achieved New LEVEL lvl ${lvl}`,
            color:' #E0115F',
            thumbnail:{
              url:msg.author.avatarURL()
            }

          }
          msg.reply({embeds:[embedmsg]})
        }
      })  
  });
  }
  if (msg.content.startsWith(prefix)) {
    try{
    const[commands, ...args] = msg.content.trim().substring(prefix.length).split(/\s+/)
    if(commands === 'LVL' && args[0]==undefined){
      console.log(msg.guild.id)
      console.log(msg.author.id)
      sql.all(`SELECT * FROM score${msg.guild.id} where id=${msg.author.id}`, function(err, rows) {  
        rows.forEach(function (row) { 
          const embedmsg =  {
            author:{
              name:`${msg.author.username}`
            },
            title: `
               LVL : ${row.LvL}\n
               xp : ${row.xp}/${row.xpmax}
            `,
            color:' #E0115F',
            thumbnail:{
              url:msg.author.avatarURL()
            }}
            msg.reply({embeds:[embedmsg]})

          
        })})
    }
    if(commands === 'HELP' && args[0]==undefined){
      const embedmsg =  {
        title: `Commands`,
        color:' #E0115F',
        description:"1 - #LVL\n 2- #LVL @username\n 3- #STATS\n 4- #declarewar @username (Losing Punichement: Reducing lvls if the least roles challenge above roles - kick if the user just joined server- removing roles if the above roles challenge least roles)",
        footer:{
          text:'ty,have a boring time.'
        }
      }
      msg.reply({embeds:[embedmsg]})
    }
    if(commands === 'LVL' && msg.guild.members.cache.get(args[0].slice(2,-1))){
      if(msg.guild.members.cache.get(args[0].slice(2,-1)).user.username== client.user.username){
        const embedmsg =  {
          author:{
            name:msg.guild.members.cache.get(args[0].slice(2,-1)).user.username
          },
          title: `
             LVL : 1000\n
             xp : 1002000/1002000
          `,
          color:' #E0115F',
          thumbnail:{
            url:msg.guild.members.cache.get(args[0].slice(2,-1)).user.avatarURL(),
          }}
          msg.reply({embeds:[embedmsg]})
      }
      else{
      sql.all(`SELECT * FROM score${msg.guild.id} where id=${msg.guild.members.cache.get(args[0].slice(2,-1)).id}`, function(err, rows) {  
        rows.forEach(function (row) { 
          const embedmsg =  {
            author:{
              name:msg.guild.members.cache.get(args[0].slice(2,-1)).user.username
            },
            title: `
               LVL : ${row.LvL}\n
               xp : ${row.xp}/${row.xpmax}
            `,
            color:' #E0115F',
            thumbnail:{
              url:msg.guild.members.cache.get(args[0].slice(2,-1)).user.avatarURL(),
            }}
            msg.reply({embeds:[embedmsg]})
            
          
        })})
      }
    }
    if(commands ==='STATS'){
      sql.all(`SELECT * FROM score${msg.guild.id} where id=${msg.author.id}`, function(err, rows) {  
        rows.forEach(function (row) { 
          if(row.LvL<=10){
            title = titles[0]
          }
          if(row.LvL<=30 && row.LvL > 10){
            title = titles[1]
          }
          if(row.LvL<=50 && row.LvL > 30){
            title = titles[2]
          }
          if(row.LvL>50){
            title = titles[3]
          }
          const embedmsg =  {
            author:{
              name:msg.author.username
            },
            title: `
               LVL : ${row.LvL}\n
               xp : ${row.xp}/${row.xpmax}
               Roles : ${msg.guild.members.cache.get(msg.author.id).roles.cache.map((r)=>{if(r.name!=='@everyone')return r.name})}
               Title : ${title}
            `,
            color:' #E0115F',
            thumbnail:{
              url:msg.author.avatarURL(),
            }}
            msg.reply({embeds:[embedmsg]})
            
          
        })})
    
    }
    if(commands === 'declarewar'){
      if(args.length  === 0) return msg.reply('please provide an username')
      else{
       let random = Math.floor(Math.random()*100)
      const member = msg.guild.members.cache.get(args[0].slice(2,-1))
      member.roles.cache.map((r)=>{
        if(!(roless.fighter2.includes(r.id))){
        roless.fighter2.push(r.id)
        }
        if(r.id!== undefined){
          fighter2+= r.position
        }
      })
       msg.guild.members.cache.get(msg.author.id).roles.cache.map((r)=>{
        if(!(roless.fighter1.includes(r.id))){
        roless.fighter1.push(r.id)
        }
        if(r.id!== undefined){
          fighter1+= r.position
        }
      })
      
      if(member){
        msg.reply(`war declared on ${args[0]}`)
       /* continue logic- fix bugs-delete unnecessary code*/
       /* if first fighter has more rules */
        if(fighter1>fighter2){
          console.log(random)
          if(random<20){
            msg.reply(args[0]+' '+'won')
            msg.reply('YOUR PUNICHED GO DOWN!!!')
            let randomrole = Math.floor(Math.random() * roless.fighter1.length)
            while(roless.fighter1[randomrole]=='998525359538589706'){
              randomrole = Math.floor(Math.random() * roless.fighter1.length)
            }
            msg.guild.members.cache.get(msg.author.id).roles.remove(roless.fighter1[randomrole])         
          }
          if(random>20){
            msg.reply(`<@${msg.author.id}> won`)
            if(roless.fighter2.length==1 && roless.fighter2.includes('998525359538589706')){
              msg.mentions.members.first().kick()
            }
            else{
              console.log(random)
              if(lvl!== 0){
             lvl = lvl - 1
             xpmax = xpmax - 1000
             /* remove roles of the least permissions and has roles member.roles.remove(role.id)*/
             sql.exec(`UPDATE score${msg.guild.id} SET LvL=${lvl},xpmax=${xpmax} where id=${member.id}`)
              }
              msg.reply(`${args[0]} HAHAHA YOU CAN'T KICK ME`)
            }
            
          }
        }
        /*---------------------------------------*/
        /* if the second fighter has more roles*/
        if(fighter1<fighter2){
          if(random<20){
            msg.reply(`<@${msg.author.id}> won`)
            msg.reply('YOUR PUNICHED GO DOWN!!!')
            let randomrole = Math.floor(Math.random() * roless.fighter2.length)
            while(roless.fighter2[randomrole]=='998525359538589706'){
              randomrole = Math.floor(Math.random() * roless.fighter2.length)
            }
            if(roless.fighter2[randomrole]!=='998525359538589706'){
            member.roles.remove(roless.fighter2[randomrole])
            }
          }
          if(random>20){
            msg.reply(args[0]+' '+'won')
            if(roless.fighter1.length==1 && roless.fighter1.includes('998525359538589706')){
              msg.member.kick()
            }
            else{
              lvl = lvl - 1
             xpmax = xpmax - 1000
              sql.exec(`UPDATE score${msg.guild.id} SET LvL=${lvl},xpmax=${xpmax} where id=${msg.author.id}`)
              msg.reply(`<@${msg.author.id}> HAHAHA YOU CAN'T KICK ME`)
            }
            
          }
        }
        /* -------------------------------------*/
        /* if roles equal */
        if(fighter1==fighter2){
          if(random<50){
            msg.reply(`<@${msg.author.id}> won`)
          }
          if(random>50){
            msg.reply(args[0]+' '+'won')
            
          }
        }
        /*----------------------------------- */
      }}
    }
    
  }

 
  catch(e){
    console.log(e)
  }

  }
  
})
/*---------------------------------------------*/

client.login(process.env.TOKEN)
