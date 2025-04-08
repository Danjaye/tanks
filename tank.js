const JSONdb = require('simple-json-db');
const db = new JSONdb('tanks.json');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{ cors: { origin: "*", methods: ["GET","POST"] } });// TODO: add cors here Gahook!
const jwt = require('jsonwebtoken');
//const fileUpload = require('express-fileupload');
const fs = require('fs');
const cors = require('cors');
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});

app.use(express.json());
app.use(cors());

const pSBC=(p,c0,c1,l)=>{
	//if(document.body.classList.contains("dark")) p = -p*0.05;
	let r,g,b,P,f,t,h,m=Math.round,a=typeof(c1)=="string";
	if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
	h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBC.pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBC.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
	if(!f||!t)return null;
	if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
	else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
	a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
	if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
	else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

pSBC.pSBCr=(d)=>{
	const i=parseInt;
	let n=d.length,x={};
	if(n>9){
		const [r, g, b, a] = (d = d.split(','));
			n = d.length;
		if(n<3||n>4)return null;
		x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
	}else{
		if(n==8||n==6||n<4)return null;
		if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
		d=i(d.slice(1),16);
		if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=Math.round((d&255)/0.255)/1000;
		else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
	}return x
};
class DanjayeHTMLTemplate {
	constructor(e,f,DANJAYE){
		this.referenceElement=e;
		this.f=f;
		this.DANJAYE=DANJAYE;
	}
	create(d){
		let c=this.referenceElement.cloneNode(true);
		this.f.call(c,d,this.DANJAYE);
		return c;
	}
}
class Barrel {
	constructor(width,length,rotation,firePriority=0,owner,firerate,horizOffset=0,recoil=2,bullet=null,bc=Bullet,maxDrones=1,spread=null,funnelAngle=null,vertOffset=0,reloadBeforeFiringOtherBarrels=true,canControlDrones=true) {
		this.width = width;
		this.length = length;
		this.rotation = rotation;
		this.firePriority = firePriority;
		this.owner = owner;
		this.lastFireTime = -999;
		this.firerate = firerate;
		this.horizOffset = horizOffset;
		this.recoil = recoil;
		this.bullet = bullet || {speed:7,damage:2,hp:1,mass:10};
		this.bulletConstructor = bc;
		this.maxDrones = maxDrones;
		this.drones = [];
		this.spread = spread;
		this.funnelAngle = funnelAngle;
		if(this.funnelAngle==null&&(spread!=null||bc!=Bullet)) this.funnelAngle = 0.3;
		this.vertOffset = vertOffset;
		this.reloadBeforeFiringOtherBarrels = reloadBeforeFiringOtherBarrels;
		this.canControlDrones = canControlDrones;
	}
	
	setOwner() {
	
	}
	
	getFirerate() {
		return this.firerate * (this.owner instanceof LevelingTank ? (1.3 - (0.6/7 * this.owner.getUpgrade("tank_reload").value)) : 1);
	}
	
	canFire() {
		for(let d of this.drones) {
			if(!this.owner.game.tanks.includes(d)) {
				this.drones.splice(this.drones.indexOf(d),1);
			}
		}
		return new Date().getTime()-this.lastFireTime>=this.getFirerate()*1000 && (!(this.bulletConstructor==Drone) || this.drones.length < this.maxDrones);
	}
	
	fire() {
		if(!this.canFire()) return;
		this.lastFireTime = new Date().getTime();
		let m = 1;
		let bd = 1;
		let bhp = 1;
		let bs = 1;
		let bm = 1;
		if(this.owner instanceof LevelingTank) {
			m += 1*this.owner.visualLevel/45;
			bd += -0.7 + this.owner.getUpgrade("bullet_damage").value * 0.21;
			bhp += -0.7 + this.owner.getUpgrade("bullet_hp").value * 0.21;
			bs += this.owner.getUpgrade("bullet_speed").value * 0.1;
			bm += -0.7 + (bhp - 1)/5;
		}
		let bullet = new this.bulletConstructor(this.bullet.hp*m*bhp,((this.bullet.size!=null?this.bullet.size:this.width/2)*this.owner.size/20)*(1+(this.bulletConstructor==Drone?-0.5:0)),"bullet",1,this.owner.game,this.owner.team,this.bullet.speed*bs,this.owner,this.bullet.damage*m*bd,this.bullet.mass*m*bm);
		if(this.owner.game.flags.includes("local_player_control")) bullet.addFlag("local_player_control");
		bullet.owner=this.owner;
		bullet.controllable = this.canControlDrones;
		if(this.bullet.body) bullet.render = this.bullet.body;
		if(this.bullet.barrels) { this.bullet.barrels.forEach((b)=>{let z=b();z.owner=bullet;bullet.barrels.push(z);}); }
		this.drones.push(bullet);
		if(this.bullet.damageRate) bullet.damageRate = this.bullet.damageRate;
		if(this.bullet.lifetime) bullet.lifetime = this.bullet.lifetime;
		if(this.bullet.tankClass!=null) bullet.setClass(this.bullet.tankClass);
		if(this.bullet.behaviorTick!=null) bullet.behaviorTick = this.bullet.behaviorTick;
		bullet.x = this.owner.x;
		bullet.y = this.owner.y;
		bullet.direction = this.owner.direction + this.rotation + (this.spread!=null?this.spread-Math.random()*this.spread*2:0);
		bullet.move(this.horizOffset*this.owner.size/15,bullet.direction+this.rotation+90);
		bullet.velocity.x = this.owner.velocity.x;
		bullet.velocity.y = this.owner.velocity.y;
		bullet.push(bullet.speed,bullet.direction);
		this.owner.push(-this.recoil,bullet.direction);
		game.addTank(bullet);
	}
	
	render(ctx) {
		let fireAnimFrame = (new Date().getTime()-this.lastFireTime) / 1000;
		if(fireAnimFrame>0.4) fireAnimFrame = 0.4;
		fireAnimFrame = fireAnimFrame / 0.4;
		ctx.beginPath();
		ctx.fillStyle = "#e2e2e2";
		ctx.strokeStyle = pSBC(-0.75,ctx.fillStyle);
		ctx.translate((ctx.canvas.width/2)+this.owner.x-this.owner.game.x,(ctx.canvas.height/2)+this.owner.game.y-this.owner.y);
		ctx.rotate(((this.rotation + this.owner.direction - 90) * Math.PI) / 180);
		if(this.funnelAngle!=null) {
			let w = this.width*this.owner.size/20;
			let l = this.length*this.owner.size/20-1/fireAnimFrame;
			ctx.moveTo(0+this.vertOffset*this.owner.size/15,-w/2+(w*this.funnelAngle)+this.horizOffset*this.owner.size/15);
			ctx.lineTo(l+this.vertOffset*this.owner.size/15,-w/2+this.horizOffset*this.owner.size/15);
			ctx.lineTo(l+this.vertOffset*this.owner.size/15,w/2+this.horizOffset*this.owner.size/15);
			ctx.lineTo(0+this.vertOffset*this.owner.size/15,w/2-(w*this.funnelAngle)+this.horizOffset*this.owner.size/15);
			ctx.closePath();
		}
		else {
			ctx.rect(0+this.vertOffset*this.owner.size/15,-((this.width*(this.owner.size/20))/2)+this.horizOffset*this.owner.size/15,this.length*this.owner.size/20-1/fireAnimFrame,this.width*this.owner.size/20);
		}
		ctx.translate(-(ctx.canvas.width/2)+this.owner.x-this.owner.game.x,-(ctx.canvas.height/2)+this.owner.game.y-this.owner.y);
		ctx.stroke();
		ctx.fill();
		ctx.resetTransform();
	}
	
	tick() {
	
	}
}

class AutoBarrel extends Barrel {
	constructor(width,length,rotation,firePriority,owner,firerate,horizOffset,recoil,bullet,bc,maxDrones,spread,funnelAngle,vertOffset,reloadBeforeFiringOtherBarrels,canControlDrones) {
		super(width,length,rotation,firePriority,owner,firerate,horizOffset,recoil,bullet,bc,maxDrones,spread,funnelAngle,vertOffset,reloadBeforeFiringOtherBarrels,canControlDrones);
		this.direction=0;
	}
	
	tick() {
		
	}
	
	render(ctx) {
		super.render(ctx);
		ctx.beginPath();
		ctx.translate((ctx.canvas.width/2)+this.owner.x-this.owner.game.x,(ctx.canvas.height/2)+this.owner.game.y-this.owner.y);
		ctx.rotate(((this.rotation + this.owner.direction - 90) * Math.PI) / 180);
		ctx.arc(this.vertOffset*this.owner.size/15,this.horizOffset*this.owner.size/15,(this.width/2)+3+(this.owner.size/2)-(15/2),0,2*Math.PI,false);
		ctx.closePath();
		ctx.translate(-(ctx.canvas.width/2)+this.owner.x-this.owner.game.x,-(ctx.canvas.height/2)+this.owner.game.y-this.owner.y);
		ctx.stroke();
		ctx.fill();
		ctx.resetTransform();
	}
}

class DanjayeEventHolder {
	constructor(parent) {
		this.eventListeners={};
	}
	
	registerEvent(name) {
		if(!this.eventListeners[name]) this.eventListeners[name] = [];
	}
	
	addEventListener(name,func) {
		this.eventListeners[name].push(func);
	}
	
	fireEvent(name,event) {
		this.eventListeners[name].forEach((e)=>e.call(this,event));
	}
	
	removeEventListener(name,func) {
		let z=this.eventListeners[name].find((z)=>z==func);
		if(!z) throw new Error("function not found in event listeners");
		this.eventListeners[name].splice(this.eventListeners[name].indexOf(z),1);
	}
}
class DanjayeEvent {
	constructor(name) {
		this.name=name;
		this.cancelled=false;
	}
}
class DamageEvent extends DanjayeEvent {
	constructor(damage,damager) {
		super("damage");
		this.damage=damage;
		this.damager=damager;
	}
}

class Tank extends DanjayeEventHolder {
	constructor(hp,size,name,lvl,game,team) {
		super();
		this.createdAt = new Date().getTime();
		this.maxhp = hp;
		this.hp = this.maxhp;
		this.size = size;
		this.name = name;
		this.visualLevel = lvl;
		this.x = 0;
		this.y = 0;
		this.velocity = {
			x: 0,
			y: 0
		};
		this.direction = 90;
		this.lastDamageTime = -9999;
		this.deathTime = -99999999999;
		this.barrels = [];
		this.game = game;
		this.team = team;
		this.flags = [];
		this.damagers = new Map();
		this.colliders = [];
		this.canCollide = (tank)=>!(tank instanceof Bullet&&tank.team==this.team&&tank.team!=null)&&tank!=this&&(!tank.owner||tank.owner!=this)&&(!this.owner||this.owner!=tank);
		this.mass = 10;
		this.currentBarrel = 0;
		this.lastVolleyTime = -999;
		this.speed = 0.2;
		this.damageRate = 500;
		this.stationary = false;
		this.xp = 0;
		this.healingRate = 0.001;
		this.timeToHeal = 10;
		this.lastHealTime = -99;
		this.bodyDamage = 1;
		this.messages = [];
		this.id=null;
		this.registerEvent("damage");
		this.registerEvent("beforedestroy");
		this.animations={};
		this.registerAnimation("death",()=>this.deathTime,1);
		this.registerAnimation("hurt",()=>this.lastDamageTime,0.1);
	}
	
	reset() {
		this.body=new Tank().body;
		this.barrels.forEach((b)=>{
			b.drones.forEach((d)=>{
				d.kill();
			});
		});
	}
	
	addBarrel(brl) {
		this.barrels.push(brl);
	}
	
	setMaxHP(amt) {
		this.maxhp = amt;
	}
	
	kill() {
		if(this.game.flags.includes("local_player_control")) {
			io.emit("danjaye_kill",this.id);
		}
		this.deathTime = new Date().getTime();
		this.hp=0;
	}
	
	destroy() {
		if(this.game.flags.includes("local_player_control")) {
			io.emit("danjaye_destroy",this.id);
		}
		this.game.garbageCollection.push(this);
	}
	
	addXP(xp) {
		this.xp += xp;
	}
	
	damage(amount,damager) {
		if(this.hp<=0) return;
		let time = new Date().getTime();
		this.lastDamageTime = time;
		this.damagers.set(damager,{ lastDamageTime: time, damage: amount, type: (damager.owner instanceof Tank?(damager instanceof Drone?game.damageTypes.drone:(damager instanceof Trap?game.damageTypes.trap:game.damageTypes.shoot)):game.damageTypes.ram) });
		this.hp -= amount;
		if(this.hp<0) {
			this.hp = 0;
		}
		this.fireEvent("damage",{ damage: amount, damager: damager, type: this.damagers.get(damager).type.name });
		if(this.hp==0) {
			if(damager.owner instanceof Tank) {
				game.killfeed(damager.owner,this); 
				damager.owner.addXP(this.xp);
			}
			else {
				game.killfeed(damager,this); 
				damager.addXP(this.xp);
			}
		}
		return true;
	}
	
	push(speed,direction) {
		this.velocity.x += Math.sin(direction*Math.PI/180) * speed;
		this.velocity.y += Math.cos(direction*Math.PI/180) * speed;
	}
	
	move(speed,direction) {
		this.x += Math.sin(direction*Math.PI/180) * speed;
		this.y += Math.cos(direction*Math.PI/180) * speed;
	}
	
	canBeDamagedBy(tank) {
		if(!this.damagers.has(tank)) this.damagers.set(tank,{ lastDamageTime: -9999, damage: 0, type: null });
		return (tank.team!=this.team||tank.team==null)&&new Date().getTime()>this.damagers.get(tank).lastDamageTime+tank.damageRate;
	}
	
	deathAnimationCheck() {
		if(this.hp==0) {
			let d=this.getAnimationProgress("death");
			if(d>100) this.kill();
			if(d>=1&&d<100) this.destroy();
			if(!this.flags.includes("local_player_control")) {
				this.applyVelocity();
				this.dissipateVelocity();
			}
			return true;
		}
	}
	
	damageTick() {
		if(this.deathAnimationCheck()) return;
		for(let tank of this.colliders) {
			if(this.canBeDamagedBy(tank)) {
				this.damage(tank.bodyDamage,tank);
			}
		}
	}
	
	setClass(c) {
		this.reset();
		this.class = c;
		this.barrels = this.class(this).barrels;
		if(Object.values(this.game.dominatorClasses).includes(c)) {
			this.stationary = true;
			let muzzle = this.class(this).muzzle;
			this.addBarrel(new Barrel(muzzle!=null?muzzle.width:14,muzzle!=null?muzzle.length:25,0,99,this,2.2,0,0,{speed:10,damage:25,hp:50,mass:200},Bullet,null,null,-0.9));
		}
	}
	
	tick() {
		this.collideWithWall();
		this.collide();
		this.applyVelocity();
		this.dissipateVelocity();
		this.healingTick();
		if(this.stationary) {
			this.velocity.x=0;
			this.velocity.y=0;
		}
	}
	
	healingTick() {
		if(this.hp==0) return;
		if(new Date().getTime() < (this.lastDamageTime + this.timeToHeal * 1000)) return;
		let rate = (new Date().getTime()/1000 - (this.lastDamageTime/1000 + this.timeToHeal)) * this.healingRate;
		if(rate > 0.15) rate = 0.15;
		this.hp += rate;
		if(this.hp > this.maxhp) this.hp = this.maxhp;
		this.lastHealTime = new Date().getTime();
	}
	
	getDirectionTowards(x,y) {
		return (Math.atan2(y-this.y,x-this.x) * 180 / Math.PI) + 90 + 180;
	}
	
	directionTowards(x,y) {
		return (Math.atan2(y-this.y,x-this.x) * 180 / Math.PI);
	}
	
	render(ctx) {
		if(this.stationary||this.class==this.game.tankClasses.smasher||this.class==this.game.tankClasses.spike) {
			let t = 47.5;
			if(this.class==this.game.tankClasses.smasher||this.class==this.game.tankClasses.spike) {
				if(!this.spikeRotation) this.spikeRotation = 0;
				if(!this.stationary) this.spikeRotation+=4;
				t = this.spikeRotation;
			}
			if(this.class==this.game.tankClasses.spike) {
				for(let i=0;i<4;i++){
					game.renderShape(this.x,this.y,t+(i*23),this.size*1.25,4,"#151515",-9999,ctx);
				}
			}
			else {
				game.renderShape(this.x,this.y,t,this.size*1.25,6,"#151515",-9999,ctx);
			}
		}
		for(let barrel of this.barrels) {
			barrel.render(ctx);
		}
		this.body(ctx);
	}
	
	animationProgress(startTime,length) {
		let daf = (new Date().getTime()-startTime) / 1000;
		//if(daf>length) daf = length;
		return (daf / length)*10;
	}
	
	getAnimationProgress(name) {
		let a=this.getAnimation(name);
		if(!a) throw new Error("No animation with name " + name);
		return this.animationProgress(a.startTimeGetter(),a.length);
	}
	
	getAnimation(name) {
		return this.animations[name];
	}
	
	isAnimationPlaying(name) {
		let a=this.getAnimation(name);
		return new Date().getTime()-a.startTimeGetter()<=a.length*1000;
	}
	
	registerAnimation(name,startTimeGetter,length) {
		this.animations[name]= {startTimeGetter:startTimeGetter,length:length};
	}
	
	applyVisualEffects(ctx) {
		//console.log(this.getAnimationProgress("death"));
		ctx.filter = `brightness(${Math.min(1-this.getAnimationProgress("hurt")*0.7,1)}) opacity(${Math.max(0,1-this.getAnimationProgress("death")*1.5)})`;
		if(this.isAnimationPlaying("death")) this.size += Math.min(4,this.getAnimationProgress("death")*4);
	}
	
	body(ctx) {
		ctx.beginPath();
		ctx.fillStyle = this.getTeam().color;
		ctx.strokeStyle = pSBC(-0.75,this.getTeam().color);
		this.applyVisualEffects(ctx);
		ctx.arc(ctx.canvas.width/2+this.x-this.game.x,ctx.canvas.height/2+this.game.y-this.y,this.size,0,2*Math.PI,false);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.filter = "none";
	}
	
	addFlag(flag) {
		this.flags.push(flag);
	}
	
	fireNextBarrel() {
		if(this.barrels.length==0) return;
		if(!this.barrels.find((b)=>b.firePriority==0)) return;
		let f = [];
		while(f.length==0) {
			f = this.barrels.filter((b)=>b.firePriority==this.currentBarrel);
			if(f.length == 0) this.currentBarrel = 0;
		}
		let c = new Date().getTime()>(f[0].reloadBeforeFiringOtherBarrels?this.lastVolleyTime:f[0].lastFireTime)+f[0].getFirerate()*1000;
		if(c) {
			this.lastVolleyTime = new Date().getTime();
			if(!this.game.flags.includes("local_player_control")) {
				this.game.socket.emit("danjaye_request_fire",this.currentBarrel);
			}
			for(let barrel of f) {
				barrel.fire();
			}
		}
		if(c || !f[0].reloadBeforeFiringOtherBarrels) {
			this.currentBarrel++;
		}
	}
	
	collideWithWall() {
		if(this.x > this.game.width / 2 || this.x < this.game.width / -2) {
			this.x -= this.velocity.x;
			this.velocity.x = -this.velocity.x;
		}
		if(this.y > this.game.height / 2 || this.y < this.game.height / -2) {
			this.y -= this.velocity.y;
			this.velocity.y = -this.velocity.y;
		}
	}
	
	distance(x,y) {
		return (x-this.x)**2 + (y-this.y)**2;
	}
	
	collide() {
		if(this.hp==0) return;
		this.colliders = [];
		this.game.tanks.forEach((tank)=>{
			if(this.canCollide(tank)) {
				if(tank.hp>0&&this.distance(tank.x,tank.y) <= (this.size+tank.size)**2) {
					if((this.bodyDamage<tank.hp&&tank.bodyDamage<this.hp)||!this.canBeDamagedBy(tank)||!tank.canBeDamagedBy(this)) {
						let my = tank.mass/this.mass;
						if(my > 1) my = 1;
						let t = this.mass/tank.mass;
						if(t > 1) t = 1;
						this.velocity.x += tank.velocity.x * my;
						this.velocity.y += tank.velocity.y * my;
						tank.velocity.x -= tank.velocity.x * t;
						tank.velocity.y -= tank.velocity.y * t;
					}
					this.colliders.push(tank);
				}
			}
		});
	}
	
	dissipateVelocity(s=10) {
		this.velocity.x -= this.velocity.x / s;
		this.velocity.y -= this.velocity.y / s;
	}
	
	applyVelocity() {
		if(this.stationary) return;
		if(isNaN(this.velocity.x)||isNaN(this.velocity.y)||isNaN(this.direction)) {
			this.velocity.x = 0;
			this.velocity.y = 0;
			this.direction = 0;
			console.error("Velocity or direction was NaN for ", this);
		}
		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}
	
	behaviorTick() {
	
	}
	
	say(text,time=5) {
		this.messages.push({text:text,time:time,created:new Date().getTime()});
	}
	
	getTeam() {
		let t=this.game.teams[this.team];
		if(!t) t={name:"",color:this.flags.includes("local_player")||(this.owner!=null&&this.owner.flags.includes("local_player"))?this.game.teams[1].color:this.game.teams[2].color};
		return t;
	}
}

class LevelingTank extends Tank {
	constructor(hp,size,name,lvl,game,team) {
		super(hp,size,name,lvl,game,team);
		this.requiredXPForNextLevel = 2;
		this.requiredXPFormula = (xp) => Math.ceil(2 + 1.05*xp);
		this.notXP = 0;
		this.upgrades = [
			{
				id: "tank_regen",
				name: "regeneration",
				color: "#ff6af6",
				value: 0,
				max: 7
			},
			{
				id: "tank_hp",
				name: "max health",
				color: "indianred",
				value: 0,
				max: 7
			},
			{
				id: "tank_damage",
				name: "body damage",
				color: "rgb(180, 85, 215)",
				value: 0,
				max: 7
			},
			{
				id: "bullet_speed",
				name: "bullet speed",
				color: "rgb(88, 116, 202)",
				value: 0,
				max: 7
			},
			{
				id: "bullet_damage",
				name: "bullet damage",
				color: "#b92929",
				value: 0,
				max: 7
			},
			{
				id: "bullet_hp",
				name: "bullet penetration",
				color: "#ea9132",
				value: 0,
				max: 7
			},
			{
				id: "tank_reload",
				name: "reload",
				color: "#4dce4d",
				value: 0,
				max: 7
			},
			{
				id: "tank_speed",
				name: "movement speed",
				color: "rgb(132, 158, 238)",
				value: 0,
				max: 7
			}
		];
		this.requiresVisualUpgradesUpdate=true;
		this.upgradePoints = 0;
		this.speed=0.3;
	}
	
	addXP(xp) {
		if(this.hp==0) return;
		this.notXP += xp;
		while(this.notXP >= this.requiredXPForNextLevel&&this.visualLevel<this.game.levelcap) {
			this.notXP -= this.requiredXPForNextLevel;
			this.visualLevel += 1;
			this.addUpgradePoints();
			let lmhp = this.maxhp;
			this.maxhp+=10/45;
			this.hp += this.maxhp - lmhp;
			this.requiredXPForNextLevel = this.requiredXPFormula(this.requiredXPForNextLevel);
			this.speed-=0.1/60;
		}
		this.xp += xp;
		this.size = 15 + 7 * (this.visualLevel/45);
		/*let lmhp = this.maxhp;
		this.maxhp = 10 + 10 * (this.visualLevel/45);
		this.hp += this.maxhp - lmhp;*/
	}
	
	addUpgradePoints() {
		this.upgradePoints+=33/45;
		this.requiresVisualUpgradesUpdate=true;
	}
	
	getUpgrade(id) {
		return this.upgrades.find((u)=>u.id==id);
	}
	
	upgrade(id) {
		let u = this.getUpgrade(id);
		if(u==null||u.value==u.max||this.upgradePoints<1) return;
		u.value+=1;
		this.upgradePoints -= 1;
		switch(id) {
			case "tank_hp":
				let lmhp = this.maxhp;
				this.maxhp+=70/7;
				this.hp += this.maxhp - lmhp;
				this.mass += 50/7;
				break;
			case "tank_damage":
				this.bodyDamage+=15/7;
				break;
			case "tank_speed":
				this.speed+=0.15/7;
				break;
			case "tank_regen":
				this.timeToHeal-=5/7;
				this.healingRate+=0.01/7;
				break;
		}
		this.requiresVisualUpgradesUpdate=true;
	}
	
	reset() {
		super.reset();
		let us = new this.constructor().upgrades;
		this.upgrades.forEach((u)=>{
			let f = us.find((u2)=>u2.id==u.id);
			if(f) {
				if(u.value>f.max) {
					this.upgradePoints+=u.value-f.max;
					f.value=f.max;
				}
				else {
					f.value=u.value;
				}
			}
			else {
				this.upgradePoints+=u.value;
			}
		});
		this.upgrades=us;
		this.requiresVisualUpgradesUpdate=true;
	}
}

class ArenaCloser extends Tank {
	constructor(game,x,y,direction) {
		super(10000,75,"Arena Closer",1,game,0);
		this.x = x;
		this.y = y;
		this.addBarrel(new Barrel(17,30,0,0,this,0.33,0,0,{speed:20,damage:200,hp:50,mass:500}));
		this.mass=1000;
		this.speed = 0.4;
		this.bodyDamage=100;
		this.targetFormula = () => this.game.tanks.find((t)=>t.team!=this.team&&!(t instanceof Bullet));
	}
	
	behaviorTick() {
		let target = this.targetFormula();
		if(target) {
			this.fireNextBarrel();
			this.direction += (-this.direction - this.getDirectionTowards(target.x,target.y))
			this.push(this.speed,this.direction);
		}
		else {
			this.direction += 0.25;
		}
	}
	
	collideWithWall() {
	
	}
}

class Dominator extends Tank {
	constructor(game,x,y,direction,base) {
		super(3000,60,"dominator",75,game,0);
		this.x = x;
		this.y = y;
		this.setClass(game.dominatorClasses.destroyer);
		this.mass=100;
		this.speed = 0.4;
		this.targetFormula = () => {
			let sussy = this.game.tanks.toSorted((a,b)=>this.distance(a.x,a.y)-this.distance(b.x,b.y)).filter((t)=>t.team!=this.team&&!(t instanceof Bullet));
			if(sussy.length>0) {
				let sus = sussy.find((t)=>!(t instanceof Polygon));
				if(sus!=null&&this.distance(sus.x,sus.y)<200000) return sus;
				if(this.distance(sussy[0].x,sussy[0].y)<200000) return sussy[0];
			}
		}
		this.stationary = true;
		this.base = base;
		this.bodyDamage=15;
	}
	
	behaviorTick() {
		let target = this.targetFormula();
		if(target) {
			this.fireNextBarrel();
			this.direction += (-this.direction - this.getDirectionTowards(target.x,target.y))
			this.push(this.speed,this.direction);
		}
		else {
			this.direction += 0.25;
		}
	}
	
	collideWithWall() {
	
	}
	
	damage(amount,damager) {
		if(!super.damage(amount,damager)) return;
		if(this.hp==0) {
			this.xp = 0;
			this.team = this.team == 0 ? damager.team : 0;
			this.base.team = this.team;
			this.hp = this.maxhp;
			if(this.team==0) {
				game.notif(this.name+" is being contested",3,game.teams[0].color,"black");
			}
			else {
				game.notif(this.name+" has been defeated by "+game.getTeam(this.team).name,3,game.getTeam(this.team).color)
			}
		}
	}
}

class Wall extends Tank {
	constructor(game) {
		super(-1,200,"wall",75,game,0);
		this.game=game;
		this.x=0;
		this.y=0;
		this.team=0;
		this.mass=10000;
		this.stationary=true;
		this.bodyDamage=0;
	}
	
	render(ctx) {
		this.game.renderShape(this.x,this.y,-27,this.size,4,"#bfbfbf",this.lastDamageTime);
	}
	
	/*behaviorTick() {
		this.colliders.forEach((c)=>{
			if(!(c instanceof Wall)) {
				//this.direction += (-this.direction - this.getDirectionTowards(target.x,target.y))
				c.move(10,this.directionTowards(c.x,c.y));
			}
		});
	}*/
	
	collide() {
		this.colliders = [];
		this.game.tanks.forEach((tank)=>{
			if(this.canCollide(tank)&&!(tank instanceof ArenaCloser)) {
				let zv=(z)=> {return tank.x<this.x+this.size/z&&tank.x>this.x-this.size/z&&tank.y<this.y+this.size/z&&tank.y>this.y-this.size/z;}
				if(zv(1.4)) {
					if(tank instanceof Bullet||((tank instanceof Polygon||tank instanceof LevelingTank)&&zv(1.5))) tank.destroy();
					tank.velocity.x = -tank.velocity.x;
					tank.velocity.y = -tank.velocity.y;
					this.colliders.push(tank);
				}
			}
		});
	}
}

class FallenBooster extends Tank {
	constructor(game,x,y,direction) {
		super(1000,40,"fallen booster",75,game,0);
		this.x = x;
		this.y = y;
		this.setClass(game.tankClasses.booster);
		this.mass=100;
		this.team=5;
		this.speed = 0.05;
		this.targetFormula = () => {
			let sussy = this.game.tanks.toSorted((a,b)=>this.distance(a.x,a.y)-this.distance(b.x,b.y)).filter((t)=>t.team!=this.team&&!(t instanceof Bullet));
			if(sussy.length>0) {
				let sus = sussy.find((t)=>!(t instanceof Polygon));
				if(sus!=null) return sus;
			}
		}
		this.barrels.forEach((b)=>{b.length=b.length/1.1;b.bullet.damage*=2;b.bullet.hp*=5;b.bullet.mass*=0.5;b.bullet.speed*=2;});
		this.bodyDamage=5;
		this.xp=2000;
	}
	
	behaviorTick() {
		let target = this.targetFormula();
		if(target) {
			this.fireNextBarrel();
			this.direction += (-this.direction - this.getDirectionTowards(target.x,target.y))
			this.push(this.speed,this.direction);
		}
		else {
			this.direction += 0.25;
		}
	}
	
	damage(amount,damager) {
		if(!super.damage(amount,damager)) return;
		if(this.hp==0) {
			this.game.notif("fallen booster has been defeated by "+(damager instanceof Bullet?damager.owner.name:damager.name),10,this.game.getTeam(this.team).color);
		}
	}
}

class Necromancer extends Tank {
	constructor(game,x=null,y=null) {
		super(1000,40,"Necromancer",75,game,0);
		this.game=game;
		this.x=0||x;
		this.y=0||y;
		this.barrels=[
			new Barrel(23,20,90,0,this,0.1,0,0,{speed:0.5,damage:5,hp:10,mass:3,damageRate:300,body:this.body,size:6.5},Drone,4),
			new Barrel(23,20,-90,1,this,0.1,0,0,{speed:0.5,damage:5,hp:10,mass:3,damageRate:300,body:this.body,size:6.5},Drone,4),
			new Barrel(23,20,0,2,this,0.1,0,0,{speed:0.5,damage:5,hp:10,mass:3,damageRate:300,body:this.body,size:6.5},Drone,4),
			new Barrel(23,20,180,3,this,0.1,0,0,{speed:0.5,damage:5,hp:10,mass:3,damageRate:300,body:this.body,size:6.5},Drone,4)
		];
		this.size=75;
		this.targetFormula = () => {
			let sussy = this.game.tanks.toSorted((a,b)=>this.distance(a.x,a.y)-this.distance(b.x,b.y)).filter((t)=>t.team!=this.team&&!(t instanceof Bullet));
			if(sussy.length>0) {
				let sus = sussy.find((t)=>!(t instanceof Polygon));
				if(sus!=null) return sus;
			}
		}
		this.mass=1000;
		this.speed=0.06;
		this.xp=2700;
	}
	
	body(ctx){
		this.game.renderShape(this.x,this.y,this.direction-27,this.size,4,this.getTeam().color,this.lastDamageTime);
	}
	
	behaviorTick() {
		this.fireNextBarrel();
		this.push(this.speed,this.direction);
		this.direction += 0.25;
	}
	
	damage(amount,damager) {
		if(!super.damage(amount,damager)) return;
		if(this.hp==0) {
			this.game.notif("necromancer has been defeated by "+(damager instanceof Bullet?damager.owner.name:damager.name),10,this.game.getTeam(this.team).color);
		}
	}
}

class FallenOverlord extends Tank {
	constructor(game,x=null,y=null) {
		super(1000,40,"Fallen Overlord",75,game,0);
		this.game=game;
		this.x=0||x;
		this.y=0||y;
		this.setClass(this.game.tankClasses.overlord);
		this.barrels.forEach((b)=>{
			b.bullet.size=3;
			b.firerate=0.2;
			b.length=29;
			b.maxDrones=10;
			b.bullet.lifetime=3;
		});
		this.team=5;
		this.size=50;
		this.targetFormula = () => {
			let sussy = this.game.tanks.toSorted((a,b)=>this.distance(a.x,a.y)-this.distance(b.x,b.y)).filter((t)=>t.team!=this.team&&!(t instanceof Bullet));
			if(sussy.length>0) {
				let sus = sussy.find((t)=>!(t instanceof Polygon));
				if(sus!=null) return sus;
			}
		}
		this.mass=1000;
		this.speed=0.06;
		this.xp=1600;
	}
	
	behaviorTick() {
		this.fireNextBarrel();
		this.push(this.speed,this.direction);
		this.direction += 0.25;
	}
	
	damage(amount,damager) {
		if(!super.damage(amount,damager)) return;
		if(this.hp==0) {
			this.game.notif(this.name+" has been defeated by "+(damager instanceof Bullet?damager.owner.name:damager.name),10,this.game.getTeam(this.team).color);
		}
	}
}

class Mothership extends Tank {
	constructor(game,x,y,direction) {
		super(4000,80,"mothership",130,game,0);
		this.x = x;
		this.y = y;
		this.mass=1000;
		this.speed = 0.05;
		this.targetFormula = () => {
			let sussy = this.game.tanks.toSorted((a,b)=>this.distance(a.x,a.y)-this.distance(b.x,b.y)).filter((t)=>t.team!=this.team&&!(t instanceof Bullet));
			if(sussy.length>0) {
				let sus = sussy.find((t)=>!(t instanceof Polygon));
				if(sus!=null&&this.distance(sus.x,sus.y)<100000) return sus;
				if(this.distance(sussy[0].x,sussy[0].y)<100000) return sussy[0];
			}
		}
		for(let i=0;i<18;i++) {
			this.barrels.push(new Barrel(5,24,90+i*20,i,this,0.05,0,0,{speed:0.3,damage:3,hp:30,mass:3,damageRate:300,size:1},Drone,2,null,0,0,true,i>9));
		}
		this.bodyDamage=50;
	}
	
	behaviorTick() {
		let target = this.targetFormula();
		if(target) {
			this.fireNextBarrel();
			this.direction += (-this.direction - this.getDirectionTowards(target.x,target.y))
			this.push(this.speed,this.direction);
		}
		else {
			this.direction += 0.25;
		}
	}
	
	body(ctx) {
		this.game.renderShape(this.x,this.y,this.direction,this.size,18,this.getTeam().color,this.lastDamageTime);
	}
}

class Bullet extends Tank {
	constructor(hp,size,name,lvl,game,team,speed,owner,damage=2,mass=20) {
		super(hp,size,name,lvl,game,team);
		this.speed = speed;
		this.owner = owner;
		this.lifetime = 3;
		this.bodyDamage = damage;
		this.canCollide = (tank)=>tank!=this&&tank!=this.owner&&(tank.team!=this.team||tank.team==null)&&(!tank.owner||tank.owner!=this.owner);
		this.mass = mass;
		this.fireBarrelsOffsetTime = 1000;
	}
	
	tick() {
		if(this.createdAt+(this.lifetime*1000)<new Date().getTime()) {
			if(this.hp>0) this.kill();
		}
		if(this.team!=0) this.collideBase();
		this.collide();
		//this.velocity.x += Math.sin(this.direction*Math.PI/180) * this.speed;
		//this.velocity.y += Math.cos(this.direction*Math.PI/180) * this.speed;
		this.applyVelocity();
		this.dissipateVelocity(75);
		if(new Date().getTime()>this.createdAt+this.fireBarrelsOffsetTime) this.fireNextBarrel();
	}
	
	render(ctx) {
		for(let barrel of this.barrels) {
			barrel.render(ctx);
		}
		ctx.beginPath();
		ctx.fillStyle = this.getTeam().color;
		ctx.strokeStyle = pSBC(-0.75,this.getTeam().color);
		ctx.arc(ctx.canvas.width/2+this.x-this.game.x,ctx.canvas.height/2+this.game.y-this.y,this.size,0,2*Math.PI);
		ctx.closePath();
		this.applyVisualEffects(ctx);
		ctx.stroke();
		ctx.fill();
		ctx.filter="none";
	}
	
	collideBase() {
		for(let base of this.game.bases) {
			if(base.team == this.team) continue;
			if(base instanceof DominatorBase) continue;
			if(this.x >= base.x && this.x <= base.x + base.width && this.y <= base.y && this.y >= base.y - base.height) {
				if(this.hp>0) this.kill();
			}
		}
	}
}

class Drone extends Bullet {
	constructor(hp,size,name,level,game,team,speed,owner,damage,mass) {
		super(hp,size,name,level,game,team,speed,owner,damage,mass);
		this.lifetime = 9999999999;
		this.target = {x:0,y:0};
		this.controllable = true;
	}
	
	behaviorTick() {
		let x = this.owner.x;
		let y = this.owner.y;
		if(this.owner instanceof Base) {
			x += this.owner.width/2;
			y -= this.owner.height/2;
		}
		let tr = this.game.tanks.toSorted((a,b)=>this.distance(a.x,a.y)-this.distance(b.x,b.y)).filter((t)=>(t.team!=this.owner.team||t.team==null)&&(!(t instanceof Polygon)||!(this.owner instanceof Base))&&t.distance(x,y)<150000);
		let f = tr.find((t)=>!(t instanceof Bullet));
		if(f==null) f = tr[0];
		tr = f;
		let sm = 1;
		let sus=1;
		if(this.owner.mouse&&this.owner.mouse.pressed&&this.controllable) {
			tr = {};
			tr.x = this.owner.mouse.x;
			tr.y = this.owner.mouse.y;
			sm = 1.1;
			sus=0.5;
		}
		if(tr!=null) {
			this.direction += (this.controllable&&this.owner.rightMousePressed?180:0) + (-this.direction - this.getDirectionTowards(tr.x,tr.y)) + (45 * sus) - Math.random() * (22.5 * sus);
		}
		else {
			this.direction += (-this.direction - this.getDirectionTowards(x,y)) + 45 - Math.random() * 22.5;
			sm = 0.3;
		}
		this.push(sm*this.speed+2-4*Math.random(),this.direction);
	}
	
	render(ctx) {
		this.applyVisualEffects(ctx);
		this.game.renderShape(this.x,this.y,this.direction,this.size,3,this.getTeam().color);
	}
	
	tick() {
		if(this.createdAt+(this.lifetime*1000)<new Date().getTime() || (!(this.owner instanceof Base)&&!this.game.tanks.includes(this.owner))) {
			if(this.hp>0) this.kill();
		}
		if(this.team!=0) this.collideBase();
		this.collide();
		//this.velocity.x += Math.sin(this.direction*Math.PI/180) * this.speed;
		//this.velocity.y += Math.cos(this.direction*Math.PI/180) * this.speed;
		this.applyVelocity();
		this.dissipateVelocity();
	}
}

class Trap extends Bullet {
	constructor(hp,size,name,level,game,team,speed,owner,damage,mass,lifetime=12) {
		super(hp,size,name,level,game,team,speed,owner,damage,mass);
		this.lifetime = lifetime;
	}
	
	render(ctx) {
		ctx.translate(ctx.canvas.width/2+this.x-this.game.x,ctx.canvas.height/2+this.game.y-this.y);
		ctx.beginPath();
		ctx.rotate(((this.direction - 90) * Math.PI) / 180);
		let sr = this.size * 2;
		ctx.moveTo(-sr/2,-sr/4);
		ctx.lineTo(-sr/6,sr/6);
		ctx.lineTo(0,sr/1.66);
		ctx.lineTo(sr/6,sr/6);
		ctx.lineTo(sr/2,-sr/4);
		ctx.lineTo(0,-sr/6);
		ctx.closePath();
		ctx.translate(-(ctx.canvas.width/2+this.x-this.game.x),-(ctx.canvas.height/2+this.game.y-this.y));
		
		ctx.fillStyle = this.getTeam().color;
		ctx.strokeStyle = pSBC(-0.75,this.getTeam().color);
		this.applyVisualEffects(ctx);
		ctx.stroke();
		ctx.fill();
		ctx.filter="none";
		ctx.resetTransform();
	}
	
	tick() {
		if(this.createdAt+(this.lifetime*1000)<new Date().getTime() || (!(this.owner instanceof Base)&&!this.game.tanks.includes(this.owner))) {
			if(this.hp>0) this.kill();
		}
		if(this.team!=0) this.collideBase();
		this.collide();
		//this.velocity.x += Math.sin(this.direction*Math.PI/180) * this.speed;
		//this.velocity.y += Math.cos(this.direction*Math.PI/180) * this.speed;
		this.applyVelocity();
		this.dissipateVelocity(20);
	}
}

class Polygon extends Tank {
	constructor(hp,size,name,lvl,game,team,sides,color) {
		super(hp,size,name,lvl,game,team);
		this.sides = sides;
		this.color = color;
		this.direction = Math.random()*360;
		this.randomMoveDirection = Math.random()*360;
		this.velocity.x = 0.1*((Math.random()*2)-1);
		this.velocity.y = 0.1*((Math.random()*2)-1);
		this.randomDirectionModifier = 0.1*((Math.random()*2)-1);
	}
	
	tick() {
		this.collideWithWall();
		this.collide();
		this.velocity.x += Math.sin(this.randomMoveDirection*Math.PI/180) * 0.1 * this.randomDirectionModifier;
		this.velocity.y += Math.cos(this.randomMoveDirection*Math.PI/180) * 0.1 * this.randomDirectionModifier;
		this.applyVelocity();
		this.direction += this.randomDirectionModifier;
		this.dissipateVelocity();
	}
	
	render(ctx) {
		this.applyVisualEffects(ctx);
		this.game.renderShape(this.x,this.y,this.direction,this.size,this.sides,this.color,this.lastDamageTime);
		/*var numberOfSides = this.sides,
			size = this.size,
			Xcenter = ctx.canvas.width/2 + this.x - this.game.x,
			Ycenter = ctx.canvas.height/2 + this.game.y + this.y,
			step  = 2 * Math.PI / this.sides,
			shift = (Math.PI / 180.0) * -18;
		ctx.translate((ctx.canvas.width/2)+this.x-this.game.x,(ctx.canvas.height/2)+this.game.y-this.y);
		ctx.rotate(((this.direction - 90) * Math.PI) / 180);
		ctx.beginPath();      
		for (var i = 0; i <= this.sides;i++) {
			var curStep = i * step + shift;
			ctx.lineTo (+ size * Math.cos(curStep), size * Math.sin(curStep));
		}
		ctx.closePath();
		ctx.translate(-(ctx.canvas.width/2)+this.x-this.game.x,-(ctx.canvas.height/2)+this.game.y-this.y);
		
		ctx.strokeStyle = pSBC(-0.75,this.color);
		ctx.fillStyle = this.color;
		let daf = (new Date().getTime()-this.lastDamageTime) / 1000;
		if(daf>0.1) daf = 0.1;
		daf = daf / 0.1;
		daf = 1-daf;
		ctx.filter = "brightness("+(1-daf*0.7)+")";
		ctx.stroke();
		ctx.fill();
		ctx.filter = "none";
		ctx.resetTransform();*/
	}
}

class Square extends Polygon {
	constructor(game,x,y) {
		super(2,12,"square",1,game,0,4,"#ffe86a");
		this.x = x;
		this.y = y;
		this.mass = 2;
		this.xp = 1;
	}
	
	behaviorTick() {
		
	}
	
	damage(amount,damager) {
		if(!super.damage(amount,damager)) return;
		let d = (damager instanceof Square?damager.owner:damager);
		if(this.hp==0&&d.class==this.game.tankClasses.necromancer&&d.barrels[0].drones.length<d.barrels[0].maxDrones) {
			this.team=d.team;
			this.color=damager.getTeam().color;
			this.hp=50;
			this.mass=20;
			this.owner=d;
			this.controllable=true;
			let nd=new Drone();
			this.behaviorTick=nd.behaviorTick;
			this.collideBase=nd.collideBase;
			this.tick=nd.tick;
			//this.owner.barrels[0].drones.push(this);
			this.collideWithWall=()=>{};
		}
	}
}

class Pentagon extends Polygon {
	constructor(game,x,y) {
		super(14,20,"pentagon",1,game,0,5,"#27119c");
		this.x = x;
		this.y = y;
		this.mass = 20;
		this.xp = 13;
		this.bodyDamage=3;
	}
}

class Triangle extends Polygon {
	constructor(game,x,y) {
		super(4,12,"triangle",1,game,0,3,"#cc1c12");
		this.x = x;
		this.y = y;
		this.mass = 5;
		this.xp = 3;
	}
}

class AlphaPentagon extends Pentagon {
	constructor(game,x,y) {
		super(game,x,y);
		this.maxhp = 500;
		this.hp = 500;
		this.size = 50;
		this.mass = 300;
		this.xp = 1222;
		this.bodyDamage=16;
	}
}

class Base {
	constructor(game,team,x,y,width=500,height=500,spawnDrones=true) {
		this.game = game;
		this.team = team;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.drones = [];
		this.flags = [];
		this.spawnDrones = spawnDrones;
		this.dominator = null;
	}
	
	canSpawnDrone() {
		return this.spawnDrones && this.drones.length < 10;
	}
	
	render(ctx) {
		ctx.beginPath();
		ctx.rect((ctx.canvas.width/2)+this.x-this.game.x,(ctx.canvas.height/2)+this.game.y-this.y,this.width,this.height);
		ctx.fillStyle = this.game.getTeam(this.team).color;
		ctx.filter="opacity(0.5)";
		ctx.fill();
		ctx.filter="none";
	}
	
	tick() {
		this.drones = this.game.tanks.filter((t)=>t instanceof Drone&&t.team==this.team);
		if(this.canSpawnDrone()) {
			let d = new Drone(500,2,"",1,this.game,this.team,0.5,this,0.5,50);
			d.addFlag("local_player_control");
			d.x = this.x + this.width/2;
			d.y = this.y - this.height/2;
			d.damageRate = 100;
			this.game.addTank(d);
		}
	}
	
	setDominator(dominator) {
		this.dominator = dominator;
	}
}

class DominatorBase extends Base {
	constructor(game,team,x,y,width,height) {
		super(game,team,x,y,width,height,false);
	}
	
	tick() {
		if(this.dominator == null) {
			let d = new Dominator(game,this.x+this.width/2,this.y-this.height/2,0,this);
			d.addFlag("local_player_control");
			d.setClass(this.game.getRandomObjectValue(this.game.dominatorClasses));
			this.setDominator(d);
			this.game.addTank(d);
		}
	}
}

class DanjayeServer extends DanjayeEventHolder {
	constructor() {
		super();
		this.tanks = [];
		this.width = 500;
		this.height = 500;
		this.teams = [
			{
				name: "server",
				color: "#ffe86a"
			},
			{
				name: "blu",
				color: "#1996e3"
			},
			{
				name: "red",
				color: "#e31919"
			},
			{
				name: "grn",
				color: "#3b8231"
			},
			{
				name: "prpl",
				color: "#7c1dbd"
			},
			{
				name: "fallen",
				color: "#606060"
			}
		];
		this.garbageCollection = [];
		this.tankClasses = {
			tank: (owner) => {
				return {
					barrels: [
						new Barrel(15,40,0,0,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10})
					]
				};
			},
			twin: (owner) => {
				return {
					barrels: [
						new Barrel(15,39,0,0,owner,0.20,9,1,{speed:7,damage:1,hp:1,mass:10}),
						new Barrel(15,39,0,1,owner,0.20,-9,1,{speed:7,damage:1,hp:1,mass:10})
					]
				};
			},
			destroyer: (owner) => {
				return {
					barrels: [
						new Barrel(30,39,0,0,owner,1.7,0,5,{speed:9,damage:10,hp:10,mass:50})
					]
				};
			},
			gunner: (owner) => {
				return {
					barrels: [
						new Barrel(6,35,0,0,owner,0.1,-11,0.1,{speed:6,damage:0.5,hp:0.25,mass:3}),
						new Barrel(6,35,0,3,owner,0.1,11,0.1,{speed:6,damage:0.5,hp:0.25,mass:3}),
						new Barrel(6,39,0,2,owner,0.1,5,0.2,{speed:6,damage:0.5,hp:0.25,mass:3}),
						new Barrel(6,39,0,1,owner,0.1,-5,0.2,{speed:6,damage:0.5,hp:0.25,mass:3})
					]
				}
			},
			penta_shot: (owner) => {
				return {
					barrels: [
						new Barrel(15,34,-60,0,owner,0.3,0,1,{speed:7,damage:1,hp:0.5,mass:10}),
						new Barrel(15,34,60,0,owner,0.3,0,1,{speed:7,damage:1,hp:0.5,mass:10}),
						new Barrel(15,39,-25,0,owner,0.3,0,1,{speed:7,damage:1,hp:0.5,mass:10}),
						new Barrel(15,39,25,0,owner,0.3,0,1,{speed:7,damage:1,hp:0.5,mass:10}),
						new Barrel(15,45,0,0,owner,0.3,0,1,{speed:9,damage:1,hp:0.5,mass:10})
					]
				}
			},
			octo_shot: (owner) => {
				return {
					barrels: [
						new Barrel(15,39,0,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,45,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,90,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,135,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,-45,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,-90,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,-135,0,owner,0.3,0,1,{speed:5,damage:0.5,hp:1,mass:10}),
						new Barrel(15,39,180,0,owner,0.20,0,1,{speed:7,damage:0.5,hp:1,mass:10})
					]
				}
			},
			streamliner: (owner) => {
				return {
					barrels: [
						new Barrel(12,65,0,0,owner,0.1,0,0.1,{speed:8,damage:0.4,hp:1,mass:1}),
						new Barrel(12,57,0,1,owner,0.1,0,0.1,{speed:9,damage:0.4,hp:1,mass:1}),
						new Barrel(12,46,0,1,owner,0.1,0,0.1,{speed:9,damage:0.4,hp:1,mass:1}),
						new Barrel(12,35,0,2,owner,0.1,0,0.1,{speed:9,damage:0.4,hp:1,mass:1}),
						new Barrel(12,25,0,3,owner,0.1,0,0.1,{speed:9,damage:0.4,hp:1,mass:1})
					]
				}
			},
			tri_angle: (owner) => {
				return {
					barrels: [
						new Barrel(15,42,0,1,owner,0.2,0,0,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,39,150,0,owner,0.05,0,2.5,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,39,-150,0,owner,0.05,0,2.5,{speed:5,damage:0.5,hp:0.5,mass:10})
					]
				}
			},
			triplet: (owner) => {
				return {
					barrels: [
						new Barrel(13,35,0,1,owner,0.20,9,1,{speed:7,damage:1,hp:0.5,mass:10}),
						new Barrel(13,35,0,2,owner,0.20,-9,1,{speed:7,damage:1,hp:0.5,mass:10}),
						new Barrel(13,40,0,0,owner,0.20,0,1,{speed:7,damage:1,hp:0.5,mass:10})
					]
				};
			},
			annihilator: (owner) => {
				return {
					barrels: [
						new Barrel(38,36.5,0,0,owner,2.5,0,10,{speed:8,damage:20,hp:30,mass:100})
					]
				}
			},
			overlord: (owner) => {
				return {
					barrels: [
						new Barrel(28,33,0,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2),
						new Barrel(28,33,90,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2),
						new Barrel(28,33,180,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2),
						new Barrel(28,33,-90,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2)
					]
				}
			},
			machine_gun: (owner) => {
				return {
					barrels: [
						new Barrel(29,45,0,0,owner,0.15,0,1,{speed:7,damage:1,hp:1,mass:9,size:6},Bullet,null,15)
					]
				}
			},
			sprayer: (owner) => {
				return {
					barrels: [
						new Barrel(18,60,0,0,owner,0.15,0,1,{speed:7,damage:0.9,hp:2,mass:12},Bullet,null,15),
						new Barrel(32,45,0,1,owner,0.15,0,1,{speed:9,damage:0.5,hp:1,mass:9,size:6},Bullet,null,15)
					]
				}
			},
			hybrid: (owner) => {
				return {
					barrels: [
						new Barrel(30,39,0,0,owner,1.7,0,5,{speed:9,damage:10,hp:10,mass:50}),
						new Barrel(28,33,180,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2,null,null,null,null,false)
					]
				}
			},
			trapper: (owner) => {
				return {
					barrels: [
						new Barrel(12,30,0,99,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10}),
						new Barrel(25,7,0,0,owner,0.5,0,0,{speed:10,damage:2,hp:30,mass:50,damageRate:500,size:3,lifetime:24},Trap,2,null,0.2,25)
					]
				}
			},
			mega_trapper: (owner) => {
				return {
					barrels: [
						new Barrel(20,29,0,99,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10}),
						new Barrel(40,10,0,0,owner,2.5,0,10,{speed:5,damage:15,hp:100,mass:800,damageRate:1000},Trap,2,null,0.2,23.5)
					]
				}
			},
			gunner_trapper: (owner) => {
				return {
					barrels: [
						new Barrel(20,29,0,99,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10}),
						new Barrel(40,10,0,0,owner,0.5,0,0,{speed:10,damage:2,hp:30,mass:50,damageRate:500,size:3,lifetime:24},Trap,2,null,0.2,23.5,false),
						new Barrel(6,39,180,2,owner,0.1,8,0.2,{speed:6,damage:0.5,hp:0.25,mass:3}),
						new Barrel(6,39,180,1,owner,0.1,-8,0.2,{speed:6,damage:0.5,hp:0.25,mass:3})
					]
				}
			},
			flank_guard: (owner) => {
				return {
					barrels: [
						new Barrel(15,40,0,0,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10}),
						new Barrel(15,35,180,0,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10})
					]
				};
			},
			overseer: (owner) => {
				return {
					barrels: [
						new Barrel(28,33,90,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,4),
						new Barrel(28,33,-90,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,4)
					]
				}
			},
			smasher: (owner) => {
				let f=null;
				f=()=>{
					for(let u of owner.upgrades) {
						if(["bullet_damage","bullet_hp","bullet_speed","tank_reload"].includes(u.id)) {
							if(u.value>0) owner.upgradePoints+=u.value;
							owner.upgrades.splice(owner.upgrades.indexOf(u),1);
							f();
							break;
						}
					}
				}
				f();
				for(let u of owner.upgrades) {
					u.max+=3;
				}
				owner.requiresVisualUpgradesUpdate=true;
				return {
					barrels: [
					
					]
				}
			},
			sniper: (owner) => {
				return {
					barrels: [
						new Barrel(15,50,0,0,owner,0.5,0,1,{speed:11,damage:2,hp:3,mass:10})
					]
				};
			},
			booster: (owner) => {
				return {
					barrels: [
						new Barrel(15,42,0,1,owner,0.2,0,0,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,33,130,0,owner,0.05,0,1.75,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,33,-130,2,owner,0.05,0,1.75,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,39,150,2,owner,0.05,0,1.75,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,39,-150,0,owner,0.05,0,1.75,{speed:5,damage:0.5,hp:0.5,mass:10})
					]
				}
			},
			fighter: (owner) => {
				return {
					barrels: [
						new Barrel(15,42,0,1,owner,0.2,0,0,{speed:5,damage:0.5,hp:0.5,mass:10}),
						new Barrel(15,39,90,0,owner,0.05,0,1.75,{speed:5,damage:1,hp:1,mass:10}),
						new Barrel(15,39,-90,0,owner,0.05,0,1.75,{speed:5,damage:1,hp:1,mass:10}),
						new Barrel(15,39,150,0,owner,0.05,0,1.75,{speed:5,damage:1,hp:1,mass:10}),
						new Barrel(15,39,-150,0,owner,0.05,0,1.75,{speed:5,damage:1,hp:1,mass:10})
					]
				}
			},
			spike: (owner) => {
				let f=null;
				f=()=>{
					for(let u of owner.upgrades) {
						if(["bullet_damage","bullet_hp","bullet_speed","tank_reload"].includes(u.id)) {
							if(u.value>0) owner.upgradePoints+=u.value;
							owner.upgrades.splice(owner.upgrades.indexOf(u),1);
							f();
							break;
						}
					}
				}
				f();
				for(let u of owner.upgrades) {
					u.max+=7;
				}
				owner.requiresVisualUpgradesUpdate=true;
				return {
					barrels: [
					
					]
				}
			},
			necromancer: (owner) => {
				owner.body = function(ctx) {
					this.game.renderShape(this.x,this.y,this.direction-26,this.size*1.3,4,this.getTeam().color,-9999,ctx);
				}
				return {
					barrels: [
						new Barrel(28,33,90,2,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,42),
						new Barrel(28,33,-90,2,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,0)
					]
				}
			},
			factory: (owner) => {
				owner.body = function(ctx) {
					this.game.renderShape(this.x,this.y,this.direction-26,this.size*1.3,4,this.game.getTeam(this.team).color,-9999,ctx);
				}
				return {
					barrels: [
						new Barrel(28,33,0,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300,tankClass:game.tankClasses.tank,behaviorTick:function(){
							this.owner.xp+=this.xp;
							this.xp=0;
							new Drone().behaviorTick.call(this);
							this.fireNextBarrel();
						}},Tank,2,null,null,0,true,true)
					]
				}
			},
			overtrapper: (owner) => {
				return {
					barrels: [
						new Barrel(12,30,0,99,owner,0.5,0,1,{speed:7,damage:2,hp:3,mass:10}),
						new Barrel(25,7,0,0,owner,0.5,0,0,{speed:10,damage:2,hp:30,mass:50,damageRate:500,size:3,lifetime:24},Trap,2,null,0.2,25),
						new Barrel(28,33,120,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2),
						new Barrel(28,33,-120,0,owner,3,0,0,{speed:0.5,damage:1,hp:10,mass:3,damageRate:300},Drone,2)
					]
				}
			},
			battleship: (owner) => {
				return {
					barrels: [
						new Barrel(12,30,90,0,owner,0.3,8,0,{speed:0.33,damage:0.2,hp:0.5,mass:1,damageRate:300,lifetime:3},Drone,4,null,-0.3,0,true),
						new Barrel(12,30,-90,0,owner,0.3,-8,0,{speed:0.33,damage:0.2,hp:0.5,mass:1,damageRate:300,lifetime:3},Drone,6,null,-0.3,0,true,false),
						new Barrel(12,30,90,0,owner,0.3,-8,0,{speed:0.33,damage:0.2,hp:0.5,mass:1,damageRate:300,lifetime:3},Drone,4,null,-0.3,0,true),
						new Barrel(12,30,-90,0,owner,0.3,8,0,{speed:0.33,damage:0.2,hp:0.5,mass:1,damageRate:300,lifetime:3},Drone,6,null,-0.3,0,true,false)
					]
				}
			},
			auto_5: (owner) => {
				return {
					barrels: [
						(()=>{let a=new AutoBarrel(7,19,0,0,owner,0.5,0,1,{speed:7,damage:1,hp:1,mass:10});a.vertOffset=16;return a;})(),
						(()=>{let a=new AutoBarrel(7,19,72,0,owner,0.5,0,1,{speed:7,damage:1,hp:1,mass:10});a.vertOffset=16;return a;})(),
						(()=>{let a=new AutoBarrel(7,19,144,0,owner,0.5,0,1,{speed:7,damage:1,hp:1,mass:10});a.vertOffset=16;return a;})(),
						(()=>{let a=new AutoBarrel(7,19,216,0,owner,0.5,0,1,{speed:7,damage:1,hp:1,mass:10});a.vertOffset=16;return a;})(),
						(()=>{let a=new AutoBarrel(7,19,288,0,owner,0.5,0,1,{speed:7,damage:1,hp:1,mass:10});a.vertOffset=16;return a;})()
					]
				}
			},
			ranger: (owner) => {
				return {
					barrels: [
						new Barrel(12,75,0,0,owner,1,0,1,{speed:14,damage:4,hp:3,mass:10}),
						(()=>{let a=new Barrel(11,23,0,99,owner,2.2,0,0,{speed:10,damage:25,hp:50,mass:200},Bullet,null,null,-0.9);a.vertOffset=6;return a;})(),
					]
				}
			},
			hunter: (owner) => {
				return {
					barrels: [
						(()=>{let a=new Barrel(15,50,0,1,owner,1,0,1,{speed:10,damage:1,hp:2,mass:7});a.spread=5;return a;})(),
						(()=>{let a=new Barrel(20,40,0,0,owner,0.1,0,1,{speed:10,damage:3,hp:3,mass:15});a.spread=5;return a;})()
					]
				}
			},
			rocketeer: (owner) => {
				return {
					barrels: [
						(()=>{let a=new Barrel(22.5,30,0,0,owner,2,0,1,{speed:3,damage:10,hp:7,mass:40,barrels:[
							()=>new Barrel(29,40,180,0,null,0.1,0,1,{speed:7,damage:1,hp:1,mass:9,size:6},Bullet,null,15)
						] });a.funnelAngle=-0.35;return a;})(),
						(()=>{let a=new Barrel(30,5,0,99,owner,1,0,1,{speed:6,damage:10,hp:20});a.funnelAngle=0.1;a.vertOffset=25;return a;})()
					]
				}
			}
		};
		this.bases = [];
		this.tankClassPathways = new Map();
		this.tankClassPathways.set(this.tankClasses.tank,[
			{ _class: this.tankClasses.machine_gun, level: 15 },
			{ _class: this.tankClasses.twin, level: 15 },
			{ _class: this.tankClasses.flank_guard, level: 15 },
			{ _class: this.tankClasses.smasher, level: 30 },
			{ _class: this.tankClasses.sniper, level: 15 }
		]);
		this.tankClassPathways.set(this.tankClasses.machine_gun,[
			{ _class: this.tankClasses.gunner, level: 30 },
			{ _class: this.tankClasses.destroyer, level: 30 },
			{ _class: this.tankClasses.sprayer, level: 45 }
		]);
		this.tankClassPathways.set(this.tankClasses.destroyer,[
			{ _class: this.tankClasses.annihilator, level: 45 },
			{ _class: this.tankClasses.hybrid, level: 45 },
			{ _class: this.tankClasses.rocketeer, level: 45 }
		]);
		this.tankClassPathways.set(this.tankClasses.gunner,[
			{ _class: this.tankClasses.streamliner, level: 45 },
			{ _class: this.tankClasses.gunner_trapper, level: 45 }
		]);
		this.tankClassPathways.set(this.tankClasses.twin,[
			{ _class: this.tankClasses.penta_shot, level: 45 },
			{ _class: this.tankClasses.octo_shot, level: 45 },
			{ _class: this.tankClasses.triplet, level: 45 }
		]);
		this.tankClassPathways.set(this.tankClasses.flank_guard,[
			{ _class: this.tankClasses.tri_angle, level: 30 }
		]);
		this.tankClassPathways.set(this.tankClasses.trapper,[
			{ _class: this.tankClasses.gunner_trapper, level: 45 },
			{ _class: this.tankClasses.mega_trapper, level: 45 }
		]);
		this.tankClassPathways.set(this.tankClasses.sniper,[
			{ _class: this.tankClasses.overseer, level: 30 },
			{ _class: this.tankClasses.trapper, level: 30 },
			{ _class: this.tankClasses.hunter, level: 30 }
		]);
		this.tankClassPathways.set(this.tankClasses.overseer,[
			{ _class: this.tankClasses.overlord, level: 45 },
			{ _class: this.tankClasses.necromancer, level: 45 },
			{ _class: this.tankClasses.factory, level: 45 },
			{ _class: this.tankClasses.overtrapper, level: 45 },
			{ _class: this.tankClasses.battleship, level: 45 }
		]);
		this.tankClassPathways.set(this.tankClasses.tri_angle,[
			{ _class: this.tankClasses.booster, level: 45 },
			{ _class: this.tankClasses.fighter, level: 45 }
		]);
		/*this.tankClassPathways.set(this.tankClasses.smasher,[
			{ _class: this.tankClasses.spike, level: 45 }
		]);*/
		this.dominatorClasses = {
			destroyer: (owner) => {
				return {
					barrels: [
						new Barrel(14,32.5,0,0,owner,2.2,0,0,{speed:10,damage:25,hp:50,mass:200})
					]
				}
			},
			gunner: (owner) => {
				return {
					barrels: [
						new Barrel(3,32,0,0,owner,0.075,-3,0.1,{speed:13,damage:2,hp:1.5,mass:2}),
						new Barrel(3,32,0,2,owner,0.075,3,0.2,{speed:13,damage:2,hp:1.5,mass:2}),
						new Barrel(5,33,0,1,owner,0.075,0,0.1,{speed:13,damage:2,hp:1.5,mass:2,size:1.5})
					]
				}
			}
		}
		this.maxBots = 0;
		this.allowedBotTeams = [ 1, 2 ];
		this.botRammerClasses = [ this.tankClasses.tri_angle, this.tankClasses.flank_guard, this.tankClasses.booster, this.tankClasses.fighter ];
		this.botMatchingStats = [
			[
				"tank_hp",
				"tank_regen",
				"tank_damage"
			],
			[
				"bullet_damage",
				"bullet_hp",
				"tank_reload",
				"bullet_speed"
			]
		];
		this.damageTypes = {
			shoot: () => {
				return true;
			},
			ram: () => {
				return true;
			},
			drone: ()=>{
				return true;
			},
			trap: ()=>{
				return true;
			}
		};
		let ckm=(list)=>list.map((it)=>{return{action:()=>{this.localPlayer.say(it)},text:it}});
		this.chatCommands = {
			"x": ["Help!","Thanks!","Go! Go! Go!","Incoming!","1v1?","2v1?","Team with me","Chill out","Unfair"],
			"z": ["Good job!","Yes","No","We need to regroup","We're goated"]
		};
		this.levelcap = 60;
		this.notif("connecting...",5,"lightgray","gray");
		this.netOldClassMap = {
			"Tank": Tank,
			"Bullet": Bullet,
			"ArenaCloser": ArenaCloser,
			"Dominator": Dominator,
			"LevelingTank": LevelingTank,
			"FallenBooster": FallenBooster,
			"Mothership": Mothership,
			"Drone": Drone,
			"Trap": Trap,
			"Polygon": Polygon,
			"Square": Square,
			"Triangle": Triangle,
			"Pentagon": Pentagon,
			"AlphaPentagon": AlphaPentagon,
			"Necromancer": Necromancer,
			"FallenOverlord": FallenOverlord
		};
		this.netSendingSpeed = 0;
		this.netRecievingSpeed = 10;
		this.lastPayloadTime = -99;
		this.flags=[ "local_player_control","rule.spawn_polygons" ];
		this.delegatedIDs = {};
		this.spawning = [
			{
				classes: [Square,Square,Square,Square,Square,Square,Square,Square,Square,Square,Square,Square,Triangle,Triangle,Pentagon],
				lastTime: -999,
				condition: (x,y)=>game.flags.includes("rule.spawn_polygons")&&game.tanks.filter((t)=>t instanceof Polygon).length < 200 * game.width/2500,
				pickX: ()=>Math.random()*game.width-game.width/2,
				pickY: ()=>Math.random()*game.height-game.height/2,
				frequency: 100
			},
			{
				classes: [Pentagon,Pentagon,Pentagon,Pentagon,AlphaPentagon],
				lastTime: -999,
				condition: (x,y)=>game.flags.includes("rule.spawn_polygons")&&game.tanks.filter((t)=>t instanceof AlphaPentagon).length < 7,
				pickX: ()=>(200-400*Math.random())*game.width/1500,
				pickY: ()=>(200-400*Math.random())*game.width/1500,
				frequency: 5000
			},
			{
				classes: [Necromancer,FallenBooster,FallenOverlord],
				lastTime: -999,
				condition: ()=>game.flags.includes("rule.spawn_bosses"),
				pickX: ()=>Math.random()*game.width-game.width/2,
				pickY: ()=>Math.random()*game.height-game.height/2,
				frequency: 300000
			}
		];
		this.players = [];
		this.botClassSpinEligible = [ this.tankClasses.octo_shot ];
		this.delta = 10;
		this.lastFrameTime = -10;
		this.modes={
			ffa: ()=>{
				this.allowedBotTeams=[];
				this.width=2000;
				this.height=2000;
				this.resetRoundEndBehavior();
				this.startRound(60000*60);
			},
			_2_teams: ()=> {
				this.width=3000;
				this.height=2000;
				this.allowedBotTeams=[1,2];
				this.addBase(new Base(this,1,1100,1000,400,2000));
				this.addBase(new Base(this,2,-1500,1000,400,2000));
				this.resetRoundEndBehavior();
				this.startRound(60000*60);
			},
			_4_teams: ()=>{
				this.width=3000;
				this.height=3000;
				this.allowedBotTeams=[1,2,3,4];
				this.addBase(new Base(this,1,750,1500,750,750));
				this.addBase(new Base(this,2,-1500,1500,750,750));
				this.addBase(new Base(this,3,750,-750,750,750));
				this.addBase(new Base(this,4,-1500,-750,750,750));
				this.resetRoundEndBehavior();
				this.startRound(60000*60);
			},
			domination: ()=>{
				this.allowedBotTeams=[1,2];
				this.width=4000;
				this.height=4000;
				this.addBase(new Base(this,1,1250,-1250,750,750));
				this.addBase(new Base(this,2,-2000,2000,750,750));
				let sw = new DominatorBase(this,0,-1000,-500,500,500);
				this.addBase(sw);
				let ne = new DominatorBase(this,0,500,1000,500,500);
				this.addBase(ne);
				let se = new DominatorBase(this,0,500,-500,500,500);
				this.addBase(se);
				let nw = new DominatorBase(this,0,-1000,1000,500,500);
				this.addBase(nw);
				function allEquals(...args) {
					return args.every((a)=>a==args[0]);
				}
				this.resetRoundEndBehavior();
				this.roundEndNotif = ()=>{
					this.notif(this.getTeam(sw.team).name +" has won the game!",7,this.getTeam(sw.team).color);
				}
				this.isRoundWon = ()=>{
					return allEquals(sw.team,ne.team,se.team,nw.team)&&sw.team!=0;
				};
				this.startRound(300000*2);
			},
			maze: ()=>{
				this.allowedBotTeams=[];
				this.width=3000;
				this.height=3000;
				",".repeat(100).split(",").forEach((z,i)=>{
					if(Math.random()*100>50+Math.random()*50) {
						let wall = game.summon(Wall,true);
						let c=Math.floor(i/10);
						wall.x=(-game.width/2+wall.size/2)+i*wall.size*1.44-(c*wall.size*1.44)*10;
						wall.y=(game.height/2-wall.size/2)-c*wall.size*1.44;
					}
				});
				this.resetRoundEndBehavior();
				this.startRound(60000*60);
			},
			mothership: ()=>{
				this.allowedBotTeams=[1,2];
				this.width=4000;
				this.height=4000;
				this.resetRoundEndBehavior();
				this.startRound(300000*2);
			},
			tag: ()=>{
				this.allowedBotTeams=[1,2,3,4];
				this.width=2500;
				this.height=2500;
				this.resetRoundEndBehavior();
				/*let f=function(e){
					e.tank.addEventListener("damage",function(){
						if(this.hp==0){
							
						}
					});
				}
				this.roundEventListeners.push({ name: "tankadded", func: f });
				this.addEventListener("tankadded",f);*/
				this.startRound(300000*2);
			}
		};
		this.roundStartTime = -99999;
		this.roundTime = 0;
		this.roundTimerNode = null;
		this.isRoundWon=()=>false;
		this.roundEndNotif=()=>null;
		this.registerEvent("tankadded");
		this.roundEventListeners = [];
		this.netOldLongConstructorClasses=["LevelingTank","Tank","Bullet","Drone","Trap"];
		this.netOldShortConstructorClasses=["ArenaCloser","Dominator","FallenBooster","Mothership","Polygon","Square","Triangle","Pentagon","AlphaPentagon","Necromancer","FallenOverlord"];
		let szm=(b,c,f,...c2)=> f.call(b.game.tanks,c)&&c2.every((z)=>z==true)?c(b):false;
		this.botFocuses = {
			attack: (bot)=>true,
			farmPolygons: (bot)=>true,
			killDominator: (bot)=>szm(bot,(t)=>t instanceof Dominator&&(t.team!=bot.team||bot.team==null),game.tanks.find,bot.visualLevel>=30),
			killMothership: (bot)=>bot.visualLevel>=30&&game.tanks.find((t)=>t instanceof Mothership&&(t.team!=bot.team||bot.team==null)),
			killBoss: (bot)=> bot.visualLevel>=45,
			killLeader: (bot)=>this.tanks.find((t)=>this.isLeader(t)&&(t.team!=bot.team||bot.team==null)),
			socialize: (bot)=>false
		}
		this.lastID = -1;
		
		this.mods=[];
		/*this.refreshModsCache();
		setTimeout(()=>{if(this.mods.length>0){this.notif("loading mods...");this.initMods();this.notif("done loading mods");}},10);*/
	}
	
	addMod(name,func,meta={}) {
		this.mods.push({ name: name, func: func.toString(), meta: meta });
		this.saveModsStorage();
	}
	
	refreshModsCache() {
		this.mods=this.getModsStorage();
	}
	
	drawGrid(dist=25) {
		let w=document.body.clientWidth;
		let h=document.body.clientHeight;
		this.ctx.resetTransform();
		this.ctx.lineWidth=1;
		this.ctx.strokeStyle="rgba(37,37,37,0.1)";
		" ".repeat(h/dist).split("").forEach((z,i)=>{
			this.ctx.beginPath();
			let a=i*dist+((game.y+i*dist)%dist);
			this.ctx.moveTo(0,a);
			this.ctx.lineTo(w,a);
			this.ctx.closePath();
			this.ctx.stroke();
		});
		" ".repeat(w/dist).split("").forEach((z,i)=>{
			this.ctx.beginPath();
			let a=i*dist+((-game.x+i*dist)%dist);
			this.ctx.moveTo(a,0);
			this.ctx.lineTo(a,h);
			this.ctx.closePath();
			this.ctx.stroke();
		});
		this.ctx.lineWidth=10;
		this.ctx.filter="none";
	}
	
	initMods() {
		this.mods.forEach((m)=>{
			m.game=this;
			let v=this.gui.getPreference(this.gui.getStorage(),"mod."+m.name);
			if(v&&v.value){
				try{
					Function("(function(){"+m.func+"}).call(this)").call(m);
				}catch(e){this.notif(m.name+": "+e,22,"indianred");}
			}
		});
	}
	
	saveModsStorage() {
		this.setModsStorage(this.mods.map((m)=>{delete m.game;return m;}));
	}
	
	getModsStorage() {
		if(!localStorage.getItem("dtg_mods")) this.setModsStorage([]);
		return JSON.parse(localStorage.getItem("dtg_mods"));
	}
	
	setModsStorage(mods) {
		localStorage.setItem("dtg_mods",JSON.stringify(mods));
	}
	
	removeMod(idx) {
		this.mods.splice(idx,1);
		this.saveModsStorage();
	}
	
	async publishMod(m) {
		return new Promise((r)=>{
			this.socket.once("danjaye_error",(z)=>{
				r(z);
			});
			this.socket.once("danjaye_notif",(z)=>{
				r(z);
			});
			this.socket.emit("danjaye_publish_mod",m);
		});
	}
	
	resetRoundEndBehavior() {
		this.roundEventListeners.forEach((el)=>{
			this.removeEventListener(el.name,el.func);
		});
		this.roundEventListeners=[];
		this.isRoundWon=()=>false;
		this.roundEndNotif=()=>null;
	}
	
	setMode(mode) {
		this.reset();
		this.mode=mode;
		this.mode();
	}
	
	delegate(pid) {
		let id = this.nextID();
		if(Array.isArray(this.delegatedIDs)) this.delegatedIDs = {};
		if(!this.delegatedIDs[pid]) this.delegatedIDs[pid] = [];
		this.delegatedIDs[pid].push(id);
		Array.from(io.sockets.sockets.values()).find((s)=>s.danjaye.id==pid).emit("danjaye_delegate",id);
	}
	
	getDelegate(id) {
		for(let [k,v] of Object.entries(this.delegatedIDs)) {
			if(v==id) return k;
		}
		return null;
	}
	
	killfeed(tank,defeated,helper=null) {
		io.emit("danjaye_game_fire",{ 
			parse: ["killfeed",[tank.id, defeated.id, helper?helper.id:null]]
		});
		let c=(g)=>(g instanceof Bullet)||g instanceof Polygon;
		if((c(tank)&&!(tank instanceof Polygon)&&(tank.owner==null||!(tank.owner instanceof Base)))||c(defeated)) return;
		let z=(x)=>x==tank.game.localPlayer&&tank.game.localPlayer!=null;
		let hs = [];
		for(let [k,v] of defeated.damagers.entries()) {
			if(k!=tank&&(!(k instanceof Bullet)||k.owner!=tank)&&new Date().getTime()<=v.lastDamageTime+7000) hs.push({damager:k,data:v});
		}
		hs.sort((a,b)=>b.data.lastDamageTime-a.data.lastDamageTime);
		if(hs.length>0) helper = hs[0].damager instanceof Bullet ? hs[0].damager.owner : hs[0].damager;
		/*let d = this.createKillfeedUserBox(tank);
		let f = this.createFadingElement("",5);
		if(z(tank)||z(defeated)||z(helper)) {
			f.classList.add("highlight");
		}
		f.appendChild(this.createKillfeedUserBox(tank));
		if(helper!=null) {
			f.innerHTML+=" + ";
			f.appendChild(this.createKillfeedUserBox(helper));
		}*/
		let t=null;
		if(defeated.damagers.has(tank)) t = defeated.damagers.get(tank).type;
		//f.innerHTML+=" " + (t!=null&&t==game.damageTypes.ram?"rammed":(t==game.damageTypes.drone?"'s drones rammed":(t==game.damageTypes.trap?"trapped":"shot"))) + " ";
		/*f.innerHTML+="<canvas></canvas><canvas></canvas>";
		this.renderTankClass(f.querySelector("canvas").getContext("2d"),tank.class,(tza)=>{
			tza.team=tank.team;
			tza.size=15 + (tank.visualLevel/45) * 15;
			if(tank.visualLevel>=45) tza.size=30;
			if(t==game.damageTypes.ram) tza.direction=-90;
		});
		this.renderTankClass(f.querySelector("canvas:last-child").getContext("2d"),defeated.class,(tza)=>{
			tza.team=defeated.team;
			tza.size=15 + (defeated.visualLevel/45) * 15;
			if(defeated.visualLevel>=45) tza.size=30;
		});*/
		//f.appendChild(this.createKillfeedUserBox(defeated));
		//this.notifBox.querySelector(".killfeed").prepend(f);
	}
	
	notif(text,timeOnScreen=15,background="",textColor="") {
		console.log(text);
		io.emit("danjaye_notif",{ text: text, timeOnScreen: timeOnScreen, background: background, textColor: textColor });
	}
	
	destroyRoundTimerNode() {
		if(!this.roundTimerNode) return;
		this.roundTimerNode.remove();
		this.roundTimerNode=null;
	}
	
	startRound(time) {
		if(this.roundTimerNode) { this.destroyRoundTimerNode(); }
		this.roundTime = time;
		this.roundStartTime = new Date().getTime();
		this.roundTimerNode = this.notif("timer",(time/1000)*2);
	}
	
	endRound() {
		if(this.isClosed()||this.isClosing()) return;
		this.destroyRoundTimerNode();
		if(this.isRoundWon()) this.roundEndNotif();
		setTimeout(()=>{if(!this.isClosed()&&!this.isClosing())this.closeArena();},3000);
	}
	
	reset() {
		if(this.flags.includes("local_player_control")) {
			io.emit("danjaye_game_fire",{
				reset: []
			});
		}
		this.bases=[];
		this.tanks=[];
	}
	
	addRoundTime(time) {
		this.roundTime += time;
	}
	
	getRemainingRoundTime() {
		return this.roundTime-(new Date().getTime()-this.roundStartTime);
	}
	
	renderRoundTimer() {
		if(!this.roundTimerNode) return;
		let time = this.getRemainingRoundTime();
		let s = time/1000;
		let m = Math.ceil(s/60);
		let sim = Math.floor(60-((m*60)-s));
		this.roundTimerNode.innerText=(m-1)+":"+(String(sim).length==1?"0":"")+sim;
	}
	
	roundTick() {
		if(this.roundTime==0) return;
		if(this.isRoundWon()||this.getRemainingRoundTime()<=0) {
			this.endRound();
		}
	}
	
	nextID() {
		/*let i=null;
		let id=0;
		while(i==null) {
			if(!this.tanks.find((t)=>t.id==id&&t.flags.includes("local_player_control"))) {
				let t = this.tanks.find((t)=>t.id==id);
				if((this.flags.includes("local_player_control")&&!this.getDelegate(id))||(!this.flags.includes("local_player_control")&&this.getDelegate(id)&&t==null)) {
					if(t!=null) t.destroy();
					i=id;
				}
			}
			if(!this.tanks.find((t)=>t.id==id)&&!this.getDelegate(id)) i =id;
			id++;
		}
		return i;*/
		this.lastID+=1;
		return this.lastID;
	}
	
	addTank(tank) {
		try {
			if(this.flags.includes("local_player_control")) {
				if(tank.id==null) {
					tank.id = this.nextID();
				}
			}
			else if(tank.flags.includes("local_player_control")) {
				if(!Array.isArray(this.delegatedIDs)) this.delegatedIDs = [];
				if(this.delegatedIDs.length==0) throw new Error("No delegated IDs to add such tank");
				tank.id = this.delegatedIDs.find((id)=>!this.tanks.find((t)=>t.id==id));
				if(tank.id==null) throw new Error("All delegated IDs are taken");
			}
			else if(tank.id==null) {
				throw new Error("Cannot add tank!");
			}
			this.tanks.push(tank);
			this.fireEvent("tankadded",{ tank: tank });
		}
		catch(e) {
			if(e.message=="Cannot add tank!") return;
			this.notif(e.message,4,"pink","indianred");
		}
	}
	
	tick() {
		for(let g of this.garbageCollection) {
			if(this.tanks.includes(g)) this.tanks.splice(this.tanks.indexOf(g),1);
			this.garbageCollection.splice(this.garbageCollection.indexOf(g),1);
		}
		this.localPlayer = this.tanks.find((t)=>t.flags.includes("local_player"));
		this.bots = this.tanks.filter((t)=>t.flags.includes("bot"));
		if(this.flags.includes("local_player_control")) {
			for(let s of this.spawning) {
				if(new Date().getTime()>s.lastTime+s.frequency&&s.condition()) {
					s.lastTime=new Date().getTime();
					let z=new s.classes[Math.round(Math.random()*(s.classes.length-1))](game,s.pickX(),s.pickY());
					z.addFlag("local_player_control");
					game.addTank(z);
				}
			}
			for(let base of this.bases) {
				base.tick();
			}
		}
		for(let tank of this.tanks) {
			if(tank.flags.includes("local_player_control")/*||(tank.owner&&tank.owner.flags.includes("local_player_control"))*/) {
				if(!tank.flags.includes("local_player")) tank.behaviorTick();
				tank.tick();
				tank.damageTick();
			}
			else {
				if(this.flags.includes("local_player_control")&&tank.hp>0) {
					tank.collide();
					tank.damageTick();
					tank.healingTick();
				}
				tank.deathAnimationCheck();
				if(this.flags.includes("local_player_control")&&tank.hp==0&&!tank.isDead) { io.emit("danjaye_kill",tank.id);tank.isDead=true; }
			}
		}
		if(this.players.length>0&&new Date().getTime()>this.lastPayloadTime+this.netSendingSpeed) {
			for(let v of io.sockets.sockets.values()) {
				if(!v.danjaye.canRecieveData()) continue;
				v.danjaye.throttle();
				v.emit("danjaye_data",this.constructPayload());
				v.emit("danjaye_match_data",{
					width: this.width,
					height: this.height,
					levelcap: this.levelcap,
					allowedBotTeams: this.allowedBotTeams
				});
				if(v.danjaye.netRecievingSpeed>this.netSendingSpeed) v.danjaye.netRecievingSpeed -= Math.min(1,(v.danjaye.netRecievingSpeed - v.danjaye.delay) * (v.danjaye.netRecievingSpeed/v.danjaye.delay) / 500);
			}
			this.lastPayloadTime=new Date().getTime();
		}
		this.delta = new Date().getTime() - this.lastFrameTime;
		this.lastFrameTime = new Date().getTime();
		this.roundTick();
	}
	
	getNonRecursive(b) {
		let br = {};
		for(let [k,v] of Object.entries(b)) {
			if(!["owner","game","drones","bulletConstructor"].includes(k)) br[k]=v;
			if(["bulletConstructor"].includes(k)) br[k]=v.name;
		}
		return br;
	}
	
	constructPayload() {
		let payload=[];
		for(let tank of this.tanks.filter((t)=>t.flags.includes("local_player_control")||this.flags.includes("local_player_control"))) {
			if(tank.hp==0) continue;
			let t={};
			t.id=tank.id;
			t.x=tank.x;
			t.y=tank.y;
			t.direction=tank.direction;
			t.size=tank.size;
			t.xp=tank.xp;
			if(tank.owner) t.owner=tank.owner.id;
			t.barrels=tank.barrels.map((b)=>{
				return this.getNonRecursive(b);
			});
			if(tank.class!=null) t.class=tank.class.name;
			t.team=tank.team;
			t.messages=tank.messages;
			t.maxhp=tank.maxhp;
			t.hp=tank.hp;
			t.name=tank.name;
			t.velocity=tank.velocity;
			t._constructor = tank.constructor.name;
			if(tank instanceof LevelingTank)t.upgrades=tank.upgrades;
			t.visualLevel=tank.visualLevel;
			t.bodyDamage=tank.bodyDamage;
			payload.push(t);
		}
		for(let id of Object.values(this.delegatedIDs)) {
			let tank = game.tanks.find((t)=>t.id==id);
			if(tank){
				let t={id:id};
				t.xp=tank.xp;
				t.visualLevel=tank.visualLevel;
				t.hp=tank.hp;
				t.barrels=tank.barrels.map((b)=>{
					return this.getNonRecursive(b);
				});
				if(tank.class!=null) t.class=tank.class.name;
				t.lastFireTime=tank.lastFireTime;
				payload.push(t);
			}
		}
		return payload;
	}
	
	splitClassName(name) {
		let sofar="";
		let SussedName = name;
		let i =0;
		for(let l of name) {
			if(l==l.toUpperCase()&&i!=0) {
				SussedName = SussedName.replace(sofar,sofar+" ");
				sofar="";
			}
			sofar+=l;
			i++;
		}
		return SussedName;
	}
	
	getClassName(t) {
		return (t.class!=null?t.class.name:this.splitClassName(t.constructor.name)).replace("_"," ")+(Object.values(this.tankClasses).includes(t.class)?"":" "+t.constructor.name);
	}
	
	isLeader(tank) {
		return this.tanks.filter((t)=>t.team==tank.team&&t!=tank&&t.xp>=tank.xp).length==0;
	}
	
	getTeam(team) {
		let t=this.teams[team];
		if(!t) t={name:"",color:this.teams[2].color};
		return t;
	}
	
	makeArenaCloser(x,y) {
		let ac = new ArenaCloser(this,x,y);
		ac.addFlag("local_player_control");
		return ac;
	}
	
	closeArena() {
		if(this.isClosed()||this.isClosing()) { this.notif("Arena already closed or closing",3); return; }
		//this.endRound();
		this.addTank(this.makeArenaCloser(this.height,this.width));
		this.addTank(this.makeArenaCloser(-this.height,this.width));
		this.addTank(this.makeArenaCloser(this.height,-this.width));
		this.addTank(this.makeArenaCloser(-this.height,-this.width));
		game.notif("Arena closed: No players can join",20,"indianred")
	}
	
	getRandomObjectValue(o) {
		let rtc = Object.keys(o);
		return o[rtc[Math.round(Math.random()*(rtc.length-1))]];
	}
	
	makeTank(name,team) {
		let sussyTank = new LevelingTank(10,15,name,0,this,team);
		sussyTank.setClass(/*this.getRandomObjectValue(this.tankClasses)*/this.tankClasses.tank);
		sussyTank.addFlag("local_player_control");
		let base = this.bases.find((b)=>b.team==sussyTank.team);
		if(base==null) {
			sussyTank.x = Math.random()*this.width-this.width/2;
			sussyTank.y = Math.random()*this.height-this.height/2;
		}
		else {
			sussyTank.x = base.x + (Math.random() *base.width/2);
			sussyTank.y = base.y - (Math.random()*base.height/2);
		}
		return sussyTank;
	}
	
	addBot() {
		if(this.isClosed()||this.isClosing()||this.tanks.filter((t)=>t.flags.includes("bot")).length>=this.maxBots) return;
		let getTeamTanks = (a)=>this.tanks.filter((t)=>t.team==a&&t.flags.includes("bot"));
		let getLeastTankTeam = ()=>this.allowedBotTeams.toSorted((a,b)=>getTeamTanks(this.allowedBotTeams.indexOf(b)).length-getTeamTanks(this.allowedBotTeams.indexOf(a)).length)[0];
		let team = this.allowedBotTeams.length==0?null:getLeastTankTeam();//this.allowedBotTeams[Math.round(Math.random()*(this.allowedBotTeams.length-1))];
		let rn = ["Arena Closer","BigTank","BLU","ShootEmUp","Dominator","Sinbadx","TEAMTEAM","Aurora","ben","CMD","gaben","HeavyWeapons",".","killer","kate","Boss","pet","Fallen Booster",":)",":^)","princess","cupcake","King","xX_Legend_Xx","MONSTER","d","Smash!","XD","bruh",":(","Wesley"];
		let sussyTank = this.makeTank(rn[Math.round(Math.random()*(rn.length-1))],team);
		sussyTank.addFlag("bot");
		sussyTank.upgradePriority = sussyTank.upgrades[Math.ceil(Math.random()*sussyTank.upgrades.length)-1].id;
		sussyTank.addXP(Math.round(Math.random()*999));
		//sussyTank.addXP(16269);
		sussyTank.target={ x: 0, y: 0 };
		sussyTank.lastTargetChangeTime=-999;
		sussyTank.log=function(k,t,tz=1){
			let m=()=>this.messages.find((m)=>m.text.startsWith(k));
			if(!m()) this.say(k,tz);
			m().text=k+" "+t;
		}
		sussyTank.resetCoordinate={x:(Math.random()*game.width)-game.width/2,y:(Math.random()*game.height)-game.height/2};
		if(Math.random()>0.4) sussyTank.addFlag("bot_flanker");
		let randomModifier = Math.random();
		sussyTank.behaviorTick=function() {
			if(this.tankClassIdea==null||this.tankClassIdea==this.class) {
				let c = this.game.tankClassPathways.get(this.class);
				if(c) this.tankClassIdea = c[Math.round(Math.random()*(c.length-1))]._class;
			}
			let lp = this.game.tanks.filter((t)=>(t.team!=this.team||t.team==null)&&t!=this&&this.distance(t.x,t.y)<50000&&(!t.owner||t.owner!=this)&&!(t instanceof Wall)&&!t.colliders.find((z)=>z instanceof Wall)).toSorted((a,b)=>this.distance(a.x,a.y)-(a.size**2)-this.distance(b.x,b.y)-(b.size**2));
			let t=lp.find((z)=>this.distance(z.x,z.y)<2000+(300*z.size)&&z.bodyDamage>this.maxhp/4);
			if(t) this.log("TBD:","Is targeting body damage",2);
			if(!t) t = lp.slice(0,7).toSorted((a,b)=>b.xp-a.xp).find((t)=>((!(t instanceof Bullet)&&!(t instanceof Polygon))||(t.bodyDamage>this.maxhp/4&&this.distance(t.x,t.y)<20000)));
			
			lp = (t==null||this.distance(t.x,t.y)>100000)&&lp.length > 0 ? lp[Math.ceil(Math.random()*lp.length-1)] : t;
			if(lp==null) {
				lp=this.resetCoordinate;
				this.log("BoundsError:","Couldn't find position");
			}
			if(new Date().getTime()-this.lastTargetChangeTime>225+50*randomModifier) {
				this.lastTargetChangeTime = new Date().getTime();
				this.target = {x:lp.x,y:lp.y};
				this.log("Target:","Updated target position");
			}
			if(lp&&(this.target.x!=lp.x||this.target.y!=lp.y)&&lp.name) this.log("TargetFormula:","Seen a tank called "+lp.name);
			if(lp!=null) {
				let moveReverse = (this.flags.includes("bot_rammer") && this.hp/this.maxhp>0.5 && !this.game.botRammerClasses.includes(this.class)) || ((this.game.botRammerClasses.includes(this.class) && this.hp/this.maxhp<=0.5));
				this.direction += (-this.direction - (this.getDirectionTowards(this.target.x,this.target.y) + (moveReverse?180:1)))/5;
				if(lp instanceof Tank) {if(this.distance(lp.x,lp.y)<50000||!(lp instanceof Polygon)||[this.game.tankClasses.sniper,this.game.tankClasses.ranger,this.game.tankClasses.hunter].includes(this.class)) this.fireNextBarrel();}
				if(!this.bmd) this.bmd = -1;
				if(Math.random()*10000>9000+1000*Math.random()) this.bmd = -this.bmd;
				this.push(this.speed,this.getDirectionTowards(lp.x,lp.y)+(90*this.bmd));
				this.push(this.speed-(this.speed*2*30/this.distance(lp.x,lp.y)),this.direction+(((this.hp/this.maxhp<=0.5&&!(lp instanceof Polygon))&&this.distance(lp.x,lp.y)<200000)||moveReverse||this.distance(lp.x,lp.y)<(lp.size+this.size)*100||(lp.bodyDamage>this.maxhp/4&&this.distance(lp.x,lp.y)<15000&&!this.flags.includes("bot_rammer"))?180:0));
			}
			if(this.upgradePoints>=1) {
				let u = this.getUpgrade(this.upgradePriority);
				let ma = this.game.botMatchingStats.find((a)=>a.includes(this.upgradePriority));
				//if(ma) ma = ma.toSpliced(ma.indexOf(this.upgradePriority),1);
				if(ma) ma = ma[Math.round(Math.random()*(ma.length-1))];
				if(ma) this.upgradePriority = ma;
				this.upgrade(this.upgradePriority);
				if(this.game.botMatchingStats[0].includes(this.upgradePriority)&&!this.flags.includes("bot_rammer")) {
					this.flags.push("bot_rammer");
				}
			}
			let pu = game.tankClassPathways.get(this.class);
			if(pu) {
				pu = pu.find((p)=>p._class==this.tankClassIdea);//pu[Math.round(Math.random()*(pu.length-1))];
				if(pu.level<=this.visualLevel) {
					this.setClass(pu._class);
				}
			}
			/*if(!this.lastMessageTime) this.lastMessageTime = -999;
			if(new Date().getTime()>this.lastMessageTime+4000&&lp!=null&&!(lp instanceof Bullet)&&!(lp instanceof Polygon)) {
				this.lastMessageTime = new Date().getTime();
				this.say("hi "+lp.name);
			}*/
		}
		this.addTank(sussyTank);
		return sussyTank;
	}
	
	addBase(base) {
		io.emit("danjaye_game_fire",{
			parse: ["summon",base.constructor.name,{
				team: base.team,
				x: base.x,
				y: base.y,
				width: base.width,
				height: base.height,
				spawnDrones: base.spawnDrones
			}]
		});
		this.bases.push(base);
	}
	
	renderShape(x,y,direction,size,sides,color,lastDamageTime=-999,ctx=this.ctx) {
		var numberOfSides = this.sides,
			size = size,
			Xcenter = ctx.canvas.width/2 + x - this.x,
			Ycenter = ctx.canvas.height/2 + this.y + y,
			step  = 2 * Math.PI / sides,
			shift = (Math.PI / 180.0) * -18;
		ctx.translate((ctx.canvas.width/2)+x-this.x,(ctx.canvas.height/2)+this.y-y);
		ctx.rotate(((direction - 90) * Math.PI) / 180);
		ctx.beginPath();      
		for (var i = 0; i <= sides;i++) {
			var curStep = i * step + shift;
			ctx.lineTo (+ size * Math.cos(curStep), size * Math.sin(curStep));
		}
		ctx.closePath();
		ctx.translate(-(ctx.canvas.width/2)+x-this.x,-(ctx.canvas.height/2)+this.y-y);
		
		ctx.strokeStyle = pSBC(-0.75,color);
		ctx.fillStyle = color;
		/*let daf = (new Date().getTime()-lastDamageTime) / 1000;
		if(daf>0.1) daf = 0.1;
		daf = daf / 0.1;
		daf = 1-daf;
		ctx.filter = "brightness("+(1-daf*0.7)+")";*/
		ctx.stroke();
		ctx.fill();
		ctx.filter = "none";
		ctx.resetTransform();
	}
	
	setGUI(gui) {
		this.gui = gui;
	}
	
	isClosing() {
		return this.tanks.find((t)=>t instanceof ArenaCloser)!=null&&!this.isClosed();
	}
	
	isClosed() {
		return this.tanks.filter((t)=>t instanceof LevelingTank).length<=1&&this.tanks.find((t)=>t instanceof ArenaCloser)!=null;
	}
	
	summon(c,force=false) {
		let c1=new c(this,0,0,0);
		c1.flags.push("local_player_control");
		if(force) { this.tanks.push(c1); } else { this.addTank(c1); }
		return c1;
	}
}

const game = new DanjayeServer();
game.width=1000;
game.height=1000;

io.use((socket,next)=>{
	socket.danjaye={};
	socket.danjaye.id=game.nextID();
	socket.danjaye.lastPayloadTime = -99999;
	socket.danjaye.delay = 100;
	socket.danjaye.lastDelay = 100;
	socket.danjaye.netRecievingSpeed = 100;
	socket.danjaye.canRecieveData = ()=>new Date().getTime()-socket.danjaye.lastPayloadTime>socket.danjaye.netRecievingSpeed;
	socket.danjaye.throttle =()=>{
		if(!socket.danjaye.recievedPayload) return;
		socket.danjaye.recievedPayload = false;
		socket.emit("danjaye_throttling");
		socket.danjaye.sendPayloadTime = new Date().getTime();
	};
	socket.danjaye.recievedPayload = true;
	next();
});

let randOperatorToken=null;
function genNewToken() {
	randOperatorToken=Math.round(Math.random()*100000000000000000000);
	console.log("token:" +randOperatorToken);
}
genNewToken();
const throttle = (socket)=>{
	socket.emit("danjaye_throttling");
	socket.danjaye.sendPayloadTime = new Date().getTime();
}

io.on("connection",(socket)=>{
	console.log("client joined");
	(function(){
		this.players.push(socket.danjaye.id);
		if(this.flags.includes("local_player_control")) {
			this.delegate(socket.danjaye.id);
		}
	}).call(game);
	socket.emit("id",socket.danjaye.id);
	socket.emit("danjaye_join",-1);
	socket.emit("danjaye_game_fire",{
		reset: []
	});
	socket.danjaye.throttle();
	
	socket.on("danjaye_throttling",()=>{
		socket.danjaye.delay = new Date().getTime() - socket.danjaye.sendPayloadTime;
		socket.danjaye.lastPayloadTime = new Date().getTime();
		if(socket.danjaye.delay > socket.danjaye.netRecievingSpeed) {
			socket.danjaye.netRecievingSpeed += socket.danjaye.delay - socket.danjaye.netRecievingSpeed;
		}
		socket.danjaye.recievedPayload = true;
		//console.log(socket.danjaye);
	});
	socket.on("danjaye_command",(c)=>{
		let m=":(";
		if(c=="logon "+randOperatorToken) { socket.danjaye.isOperator=true;genNewToken();m="logged in successfully"; }
		socket.emit("danjaye_command",m);
	});
	socket.on("danjaye_data",(d)=>{
		(function(){
			for(let ta of d) {
				let zzz=this.delegatedIDs[socket.danjaye.id];
				if(!zzz||!zzz.includes(ta.id)) continue;
				if(ta._constructor!="LevelingTank"&&!socket.danjaye.isOperator) continue;
				let t = this.tanks.find((t)=>t.id==ta.id);
				if(t!=null&&t.hp==0) continue;
				if(t==null) {
					console.log(ta._constructor);
					if(this.netOldLongConstructorClasses.includes(ta._constructor)) t = new this.netOldClassMap[ta._constructor](ta.maxhp,ta.size,ta.name,0,this,ta.team);
					if(this.netOldShortConstructorClasses.includes(ta._constructor)) t = new this.netOldClassMap[ta._constructor](this,ta.x,ta.y,ta.direction);
					t.id = ta.id;
					this.addTank(t);
					if(ta._constructor=="LevelingTank") {
						t.setClass(this.tankClasses.tank);
					}
				}
				if(!t.flags.includes("local_player_control")) {
					t.x = ta.x;
					t.y = ta.y;
					t.direction = ta.direction;
					t.team = ta.team;
					//t.xp = ta.xp;
					//t.hp = ta.hp;
					t.maxhp = ta.maxhp;
					t.messages=ta.messages;
					t.name=ta.name;
					t.size=ta.size;
					t.velocity=ta.velocity;
					/*t.barrels=[];
					for(let b of ta.barrels) {
						t.addBarrel(new Barrel(b.width,b.length,b.rotation,b.firePriority,t,b.firerate,b.horizOffset,b.recoil,b.bullet,this.netOldClassMap[b.bulletConstructor],b.maxDrones,b.spread,b.funnelAngle,b.vertOffset,b.reloadBeforeFiringOtherBarrels,b.canControlDrones));
					}*/
					if(ta._constructor=="LevelingTank")t.upgrades=ta.upgrades;
					t.bodyDamage=ta.bodyDamage;
				}
			}
		}).call(game);
	});
	socket.on("danjaye_request_fire",(d)=>{
		(function(){
			if(this.flags.includes("local_player_control")) {
				try {
					this.tanks.find((t)=>t.id==this.delegatedIDs[socket.danjaye.id][0]).barrels.filter((b)=>b.firePriority==d).forEach((b)=>{b.fire();});
				}catch(e){void(0);}
			}
		}).call(game);
	});
	socket.on("danjaye_kill",(d)=>{
		(function(){
			try {
				let t=this.tanks.find((t)=>t.id==this.delegatedIDs[socket.danjaye.id][0]);
				if(t.hp>0) t.kill();
			}catch(e){void(0);}
		}).call(game);
	});
	socket.on("danjaye_request_data",(d)=>{
		(function(){
			try {
				let t=this.tanks.find((t)=>t.id==this.delegatedIDs[socket.danjaye.id][0]);
				if(d.class&&game.tankClasses[d.class]!=null) t.setClass(game.tankClasses[d.class]);
				if(d.xp&&!isNaN(Number(d.xp))) t.addXP(d.xp);
			}catch(e){
				void(0);
			}
		}).call(game);
	});
	socket.on("danjaye_mouse",(d)=>{
		(function(){
			try {
				let t=this.tanks.find((t)=>t.id==this.delegatedIDs[socket.danjaye.id][0]);
				t.mouse=d;
				t.rightMousePressed=d.rightMousePressed;
			}catch(e){
				void(0);
			}
		}).call(game);
	});
});

//game.height=2000;
//game.width=2000;
//game.addBase(new Base(game,1,250,-250,500,500));
//game.addBase(new Base(game,2,-750,750,500,500));
//game.addBase(new Base(game,3,-750,-250,500,500));
//game.addBase(new Base(game,4,250,750,500,500));
/*let b = new DominatorBase(game,0,-750,-250,500,500);
game.addBase(b);
b = new DominatorBase(game,0,250,750,500,500);
game.addBase(b);*/
//setTimeout(()=>{b.dominator.flags.push("local_player","game_camera_target");b.dominator.behaviorTick=function(){}},50);
//fb=new FallenBooster(game,0,0,0);
//fb.flags.push("local_player_control");
//game.addTank(fb);
/*ms=new Mothership(game,200,200,0);
ms.flags.push("local_player_control");
game.tanks.push(ms);
ms.team=2;
ms=new Mothership(game,-200,-200,0);
ms.flags.push("local_player_control");
game.tanks.push(ms);
ms.team=1;*/
/*",".repeat(40).split(",").forEach((z,i)=>{
	if(Math.random()*100>70) {
		let wall = game.summon(Wall,true);
		let c=Math.floor(i/6);
		wall.x=(-game.width/2+wall.size/2)+i*wall.size*1.5-(c*wall.size*1.5)*6;
		wall.y=(game.height/2-wall.size/2)-c*wall.size*1.5;
	}
});*/

setInterval(()=>{
	let bot = game.addBot();
	//if(!game.tanks.find((t)=>t.flags.includes("local_player"))) { bot.addFlag("local_player"); bot.addFlag("game_camera_target") };
},100);

setInterval(()=>{
	game.tick();
},10);

server.listen(84);

let f=(z)=>readline.question("> ",(a)=>{
	try { 
		console.log(eval(a));
	} catch(e) {
		console.warn(e);
	}
	f(f);
});
f();