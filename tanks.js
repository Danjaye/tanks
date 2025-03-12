const JSONdb = require('simple-json-db');
const db = new JSONdb('tanks.json');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const jwt = require('jsonwebtoken');
//const fileUpload = require('express-fileupload');
const fs = require('fs');

app.use(express.json());

const secret = "22a_f10fu7fcxssif1@4F!@2e22ee22e#_l3@+!q=sppLP!PL:a;;;,m,,f<#<>#>>(29d0qwa-s-=z-1-r-3r13r13rllzlj3azlzlami)!0gn4igIrggreh\\#}!|sfodINFIgg4g4zz7+zzzzzjijiji252ijsIJ!Nkmmmm";

function verifyMods() {
	if(!db.get("mods_v1")) db.set("mods_v1",[]);
}

app.get("/games",(req,res,next)=>{
	res.json(broker.findSockets((s)=>s.danjaye.isHost==true).map((s)=>s.danjaye.id));
});

app.get("/mods",(req,res,next)=>{
	verifyMods();
	res.json(db.get("mods_v1").toReversed());
});

app.use(express.static(__dirname+"/web"));

class DanjayePlayer {
	constructor(broker,socket) {
		this.broker = broker;
		this.socket = socket;
		this.id = null;
		this.isHost = false;
		this.host = null;
		this.delegated = new Map();
	}
	
	setHostStatus(value) {
		if(!value&&this.getPlayers().length>0) return;
		if(value) this.host=null;
		this.isHost = value;
		this.socket.emit("danjaye_host_status",value);
	}
	
	getPlayers() {
		return this.broker.findSockets((s)=>s.danjaye.host==this);
	}
	
	delegate(player,id) {
		if(!this.delegated.has(player)) this.delegated.set(player,[]);
		this.delegated.set(player,[...this.delegated.get(player),id]);
		player.socket.emit("danjaye_delegate",id);
	}
}

class DanjayeServerBroker {
	constructor() {
		
	}
	
	findSockets(c) {
		return Array.from(io.sockets.sockets.values()).filter((s)=>c(s));
	}
	
	rollRandomHost(socket) {
		let i =socket.danjaye.getPlayers();
		let n = i[Math.random()*(i.length-1)];
		for(let s of i) {
			if(s==n) {
				s.danjaye.setHostStatus(true);
			}
			else {
				s.danjaye.host=(n||i[0]).danjaye;
			}
		}
	}
}

var broker = new DanjayeServerBroker();

io.use((socket,next)=>{
	socket.danjaye = new DanjayePlayer(broker,socket);
	let id =0;
	while(socket.danjaye.id==null) {
		if(broker.findSockets((s)=>s.danjaye.id==id).length==0) socket.danjaye.id = id;
		id++;
	}
	next();
});

io.on("connection",(socket) => {
	socket.emit("id",socket.danjaye.id);
	console.log(socket.danjaye.id + " logged on");
	
	socket.on("danjaye_data", (payload) => {
		let s=broker.findSockets((s)=>s.danjaye.host==socket.danjaye);
		if(s.length==0) {
			if(!socket.danjaye.isHost&&socket.danjaye.host!=null) {
				let h = socket.danjaye.host;
				payload=payload.filter((p)=>h.delegated.has(socket.danjaye)&&h.delegated.get(socket.danjaye).includes(p.id));
				s=[h.socket];
			}
		}
		for(let sk of s) {
			sk.emit("danjaye_data",payload);
		}
	});
	
	socket.on("danjaye_delete",(id)=>{
		let s=broker.findSockets((s)=>s.danjaye.host==socket.danjaye);
		if(s.length==0) {
			if(!socket.danjaye.isHost&&socket.danjaye.host!=null) {
				let h = socket.danjaye.host;
				if(!h.delegated.has(socket.danjaye)||!h.delegated.get(socket.danjaye).includes(id)) return;
				s=[h.socket];
			}
		}
		for(let sk of s) {
			sk.emit("danjaye_delete",id);
		}
	});
	
	socket.on("danjaye_host_status", (value) => {
		socket.danjaye.setHostStatus(value);
	});
	
	socket.on("danjaye_join",(id)=>{
		id=parseInt(id);
		if(isNaN(id)) return;
		let i =broker.findSockets((s)=>s.danjaye.id==id&&s.danjaye.isHost);
		if(i.length>0) {
			socket.danjaye.host = i[0].danjaye;
			socket.emit("danjaye_join",id);
			i[0].emit("danjaye_join",socket.danjaye.id);
		}
	});
	
	socket.on("danjaye_delegate",(p)=>{
		socket.danjaye.delegate(broker.findSockets((s)=>s.danjaye.id==p.player)[0].danjaye,p.id);
	});
	
	socket.on("danjaye_request_fire",(barrel)=>{
		barrel = parseInt(barrel);
		if(isNaN(barrel)) return;
		socket.danjaye.host.socket.emit("danjaye_request_fire",{
			id: socket.danjaye.id,
			barrel: barrel
		});
	});
	
	socket.on("danjaye_leave",()=>{
		socket.danjaye.host=null;
	});
	
	socket.on("disconnect",()=>{
		broker.rollRandomHost(socket);
	});
	
	socket.on("danjaye_game_update",(g)=>{
		let s=broker.findSockets((s)=>s.danjaye.host==socket.danjaye);
		for(let sk of s) {
			sk.emit("danjaye_game_update",g);
		}
	});
	
	socket.on("danjaye_publish_mod",(m)=>{
		if(!m) {socket.emit("danjaye_error","no mod provided");return;}
		if(typeof(m)!="object"){socket.emit("danjaye_error","bad mod");return;}
		if(!m.name||!m.func){socket.emit("danjaye_error","no provided mod name or function");return;}
		if(typeof(m.name)!="string"||!m.name.match(/^[a-zA-Z0-9-. +&,'@#]{1,32}$/)||typeof(m.func)!="string"){socket.emit("danjaye_error","bad mod name or function");return;}
		if(m.meta&&typeof(m.meta)!="object"){socket.emit("danjaye_error","bad mod metadata");return;}
		if(Object.keys(m).find((k)=>!["name","func","meta"].includes(k))){socket.emit("danjaye_error","too much mod data provided");return;}
		verifyMods();
		let mds=db.get("mods_v1");
		mds.push(m);
		db.set("mods_v1",mds);
		socket.emit("danjaye_notif","successfully posted mod");
	});
});

server.listen(81);