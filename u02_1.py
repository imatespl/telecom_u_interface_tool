#!/usr/bin/env python
#-*-coding:utf-8-*-
#立刻能加中文注释
# Copyright (c) 2011 dwliu. See LICENSE for details.

import os
import tornado.web
import tornado.httpserver
import tornado.ioloop
import tornado.iostream
import tornado.options
import logging
import socket
import time
import tornado.escape
import tornado.websocket
import os.path
import uuid
import errno
import functools
import asyncmongo
import settings
import json
import collections
import random
import struct
import db

#import pdb
#pdb.set_trace()

"""整个脚本框架是借用tornado的经典例子chatdemo.py,也就是脚本中的webHandler,一方面从网页下发消息，消息中携带的是要发送的UC策略，
将下发的数据中的信息回显到网页，同时将数据传给发送进程进行发送;另外一个重要的流程是ud报文的接收及解析，由Connection来完成"""

class webHandler(tornado.websocket.WebSocketHandler):
    """webHandler在tornado的chatdemo脚本基础上修改，提供测试脚本的网页框架，实现接收网页下发消息，回显消息，传送数据到ucPacket_send_read的功能"""
    waiters = set()
    ipcache = []
    uccache = []
    udcache = []
    cache_size = 200
    def allow_draft76(self):
        # for iOS 5.0 Safari
        return True

    def open(self):
       webHandler.waiters.add(self)

    def on_close(self):
        webHandler.waiters.remove(self)

    @classmethod
    def update_cache(cls, data):
	#更新网页缓存，用classemethod修饰，在类以外的结构可以直接访问
        
        if data["mtype"] == "uc_resp":
        #uc_resp用于显示uc策略及响应
            cls.uccache.append(data)
            if len(cls.uccache) > cls.cache_size:
                cls.uccache = cls.uccache[-cls.cache_size:]
        elif data["mtype"] == "uc_ip":
            cls.ipcache .append(data)
            if len(cls.ipcache) > cls.cache_size:
                cls.ipcache = cls.ipcache[-cls.cache_size:]
        else:
        #另外有一个ud_resp用于显示ud消息
            cls.udcache.append(data)
            if len(cls.udcache) > cls.cache_size:
                cls.udcache = cls.udcache[-cls.cache_size:]

    @classmethod
    def send_updates(cls, data, template_html, **kwargs):
	#回显消息的功能，将需要回显的数据传入，有waiter.write_message()写入，是chatdemo的自有功能
        webHandler.update_cache(data)
        for waiter in cls.waiters:
	    try:
                data["html"] =  waiter.render_string(template_html, **kwargs)
                waiter.write_message(data)
            except:
                logging.error("Error sending message", exc_info=True)
    
    @classmethod
    def send_web(cls,data,template_html,**kwargs):
	#回显消息的功能，将需要回显的数据传入，有waiter.write_message()写入，是chatdemo的自有功能
        webHandler.update_cache(data)
        for waiter in cls.waiters:
	    try:
                data["html"] =  waiter.render_string(template_html, **kwargs)
                waiter.write_message(data)
            except:
                logging.error("Error sending message", exc_info=True)

    def on_message(self, message):
	#网页下发的数据首先到达on_message,进行解析，调用Uc_Proc发送数据
        logging.info("got message %r", message)
        parsed = tornado.escape.json_decode(message)
	ucheader = ''
	ucbody = ''
        for header_value in parsed["uc_header"]:
		ucheader += header_value.values().pop()

	for body_value in parsed["uc_body"]:
		ucbody += body_value.values().pop()

        chat = {
            "id": str(uuid.uuid4()),
            "body": "header:" + ucheader + " body:" + ucbody,
            "mtype": "uc_resp"
	}
	#callback设置了一个传入Uc_Proc的函数，以便在发送数据时调用，回显到网页ACK等信息
        try:
                Uc_Proc(parsed["uc_IP"], int(parsed["uc_Port"]),parsed)
        except:
                logging.error("Send uc error", exc_info=True)
        webHandler.send_updates(chat, "uc_resp.html", uc_resp=chat)

    @classmethod
    def uc_form(cls,message):
    #chatdemo.py自带的数据结构，body的值是要回显的内容
        chat = {
            "id": str(uuid.uuid4()),
            "body": message,
            "mtype": "uc_resp"
        }
        webHandler.send_updates(chat, "uc_resp.html", uc_resp=chat)
    
    @classmethod
    def ud_form(cls,message):
    #chatdemo.py自带的数据结构，body的值是要回显的内容
        chat = {
            "id": str(uuid.uuid4()),
            "body": message,
            "mtype": "ud_recv"
        }
        webHandler.send_updates(chat, "ud_recv.html", ud_recv=chat)

    @classmethod
    def ip_form(cls,message):
    #chatdemo.py自带的数据结构，body的值是要回显的内容
        chat = {
            "id": str(uuid.uuid4()),
            "body": message,
            "mtype": "uc_ip"
        }
        webHandler.send_updates(chat, "uc_ip.html", uc_ip=chat)
	
class MainHandler(tornado.web.RequestHandler):
#网页代码index.html
    def get(self):
        self.render("index.html", uc_resps=webHandler.uccache, ud_recvs=webHandler.udcache, uc_ips=webHandler.ipcache)

class Uc_Proc(db.mongo_db):
#发送UC策略的主要代码
        aaa_type = 1
	body_length = 0
	ucsocket = {}

	def __init__(self, ser_addr, ser_port,parsed,connection=None):
		self.addr = ser_addr
		self.port = ser_port
		self.ucdata = parsed
                self.randtype = 0
                if connection is not None and parsed.has_key("uc_AAA_query"):
                    self.stream = tornado.iostream.IOStream(connection)
                    Uc_Proc.aaa_type = parsed["uc_AAA_query"]
                elif connection is None and parsed.has_key("uc_AAA_query"):
                    Uc_Proc.aaa_type = parsed["uc_AAA_query"]
                else:
		    self.randtype = parsed["uc_Random"]
		self.callback = webHandler.uc_form	
                self._senddata =None
	        self.resendtime = 0
                self.heart_count = 0
                self.userquery = ''
		self.uc_packet_ascii = None
                self.uc_packet_hex = None
		self.ucack_read_times = 0
		self.ucdata_buffer = collections.deque()
		self.gen_request_running = False
		self.gen_ucdata_to_send = None
		self.uc_gen_count = 0
		self.fd = self.addr+":"+str(self.port)
                self.dpi_app_name = ''
                self.uc_packet_len = ''
                self.uc_dpi_name_len = 0
		"""主判断是长连接设置，如果是同一IP同一端口，不用调用uc_connect，直接write数据；"""
        	if self.ucsocket.has_key(self.fd):
        #如果有这个key，说明当前下发的策略，要连接的IP+PORT和之前的相同，不必再调用uc_connect,而直接write数据
			self.ucsocket[self.fd].ucdata = self.ucdata
		        """uc_Modifier的判断是区分循环发包和正常发包，循环发包走的是gen_request发送流程，add_by_liudw"""
			if self.ucsocket[self.fd].ucdata.has_key("uc_Modifier"):
                                print "Modifier"
				self.ucsocket[self.fd].ucdata_buffer.append(self.ucdata)
				if not self.ucsocket[self.fd].gen_request_running:
					try:
						self.callback('Start sss command ')
						self.ucsocket[self.fd].uc_gen_count = 0
						self.ucsocket[self.fd].gen_ucdata_to_send = self.ucsocket[self.fd].ucdata_buffer.popleft()
						self.ucsocket[self.fd].gen_request()
					except:
						logging.error("gen uc request error", exc_info=True)
	#普通发包流程是走的send_request发送流程，add_by_lixiaoli,包含超时重发和随机发包
			elif self.randtype > "0":
        #这里判断网页传过来的randtype，如果是0就不随机，如果是0，就要进行一些处理
                        	self.ucsocket[self.fd].resendtime = 0
                        	self.ucsocket[self.fd].send_request()
			else:
                                if parsed.has_key("uc_AAA_query"):
                                    Uc_Proc.aaa_type = parsed["uc_AAA_query"]
                                    if not self.ucsocket[self.fd].stream.reading():
                                        self.ucsocket[self.fd].stream.read_bytes(16,self.on_next)
				else:
                                    if not self.ucsocket[self.fd].gen_request_running:
					self.ucsocket[self.fd].ucdata = self.ucdata
					self.ucsocket[self.fd].send_request()
                else:
			self.ucsocket[self.fd] = self
		        if not self.stream.reading():
		            self.stream.read_bytes(16, self.on_next)
			#self.ucsocket[self.fd].heart_count = 0
            #当一个新的IP+PORT来到时，就要新建一条连接
			if self.ucdata.has_key("uc_Modifier"):
				self.ucdata_buffer.append(self.ucdata)
                                if not self.gen_request_running:
                                        try:
                                                self.callback('Start command ')
                                                self.gen_ucdata_to_send = self.ucdata_buffer.popleft()
                                                self.gen_request()
                                        except:
                                                logging.error("gen uc request error", exc_info=True)
			else:
                                if parsed.has_key("uc_AAA_query"):
		                    if not self.stream.reading():
                                        self.stream.read_bytes(16,self.on_next)
				else:
				    self.send_request()
		#print self.ucsocket[self.fd]
		#if self.randtype == "0" and not self.ucdata.has_key("uc_Modifier"):
		#	self.heart_count_add()
        #开一条连接时就启动心跳报文的等待

        def remove_self(self):
	#移除长连接
		#print "remove_self"
                del Uc_Proc.ucsocket[self.fd]

        def rand_send_data(self,data):
	#随机发包时，对数据进行随机处理的方法
                sdata = ""
                rdata = ""
                randlist = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
                if self.len_min==self.len_max:
                        i = self.len_min
                else:
                        i = random.choice(xrange(self.len_min,self.len_max))
                if self.randtype == "0":
                        sdata = data
                        #print "no rand"
                elif self.randtype == "1":
                        sdata = data[0:8]
                        for j in range(0,i*2):
                                rdata +=(random.choice(randlist))
                        sdata = sdata + rdata.decode("hex")
                        #print "rand 1"

                elif self.randtype == "2":
                        sdata = data[0:32]
                        for j in range(0,i*2):
                                rdata +=(random.choice(randlist))
                        sdata = sdata + rdata.decode("hex")
                        #print "rand 2"

                elif self.randtype == "3":
                        for j in range(0,i*2):
                                rdata +=(random.choice(randlist))
                        sdata = sdata + rdata.decode("hex")
                        #print "rand 3"
                #print repr(sdata)
                return sdata
   
        def send_request(self):
            if self.ucdata.has_key("uc_Delete"):
                self.config_delete(self.ucdata,self.callback)
            else:       
                self.config_query(self.ucdata, self.sent_uc, self.callback)

	def sent_uc(self):
	#进入发包流程
                self.len_min = int(self.ucdata["uc_Random_Length_min"])
                self.len_max = int(self.ucdata["uc_Random_Length_max"])
                self.randtype = str(self.ucdata["uc_Random"])
                self._senddata =self.format_uc().decode("hex")
                self.ReSendType = str(self.ucdata["uc_Resend"])
                self.ReSendTime = int(self.ucdata["uc_Timeout"])
                self.ReSendCount = int(self.ucdata["uc_Count"])
		#print "ReSendCount %d" %self.ReSendCount
                self.MessageType = self.ucdata["uc_header"][2]["uc_Header_MessageType_SE1"].decode("hex")
                self.MessageNo = self.ucdata["uc_header"][3]["uc_MessageNo_NU2"].decode("hex")
                self.MessageSequenceNo = self.ucdata["uc_header"][5]["uc_Header_MessageSeq_SQ4"].decode("hex")
		if not self.stream.closed():
        #是否重发的判断，这里可能是超时重发，也可能是定时重发，也可能是随机重复发送
			if self.randtype !=0 and self.resendtime < self.ReSendCount-1:
				self._senddata = self.rand_send_data(self._senddata)
                               	self.resendtime +=1
				self.callback("resendtime "+str(self.resendtime))
				if self.randtype != "0":
					self.stream.write(self._senddata)
					self.stream.close()
					self.send_request()
				else:
                               		self.stream.write(self._senddata,self.read_callback)
					if not self.stream.reading():
					    self.stream.read_bytes(16,self.on_next)
			else:
			       	self._senddata = self.rand_send_data(self._senddata)
                                self.stream.write(self._senddata)
				if self.randtype != "0":
				    self.remove_self()
				if not self.stream.reading():
			            self.stream.read_bytes(16, self.on_next)
		

	def read_callback(self):
	#设置超时回调函数
		self.timeout = tornado.ioloop.IOLoop.instance().add_timeout(time.time()+self.ReSendTime, self.sent_uc)

	def heart_count_add(self):
		self.hearttimeout = tornado.ioloop.IOLoop.instance().add_timeout(time.time()+10, self.heart_count_add)
    #设置心跳报文接收的等待时间，间隔为10s,每十秒更新一次计数
		self.heart_count+=1
		#print "self.heart_count %d" %self.heart_count
    #到达三次后就关闭连接，打印分析机已死
		if self.heart_count==4:
			self.callback(time.ctime(time.time())+" Alanysis device is dead")
			tornado.ioloop.IOLoop.instance().remove_timeout(self.hearttimeout)
			self.stream.close()
			try:
			    self.remove_self()
			except KeyError:
			    logging.error("KeyError")
	def heart_decode(self,data):
		#print "heart_decode"
	    self.callback('device is: '+data[1:].encode("utf-8"))
            if self.gen_request_running:
                   if not self.stream.reading():
                        self.stream.read_bytes(16, self.header_decode)
            else:
                   if not self.stream.reading():
                       self.stream.read_bytes(16, self.on_next)
		
	def on_next(self, data):
	#解析ACK头，到这里还要去掉默认超时重发的定时器，因为已经收到ACK了
		if (self.randtype =='0')&(self.resendtime!=0):
			tornado.ioloop.IOLoop.instance().remove_timeout(self.timeout)
		#self.callback("uc_ack header is "+data.encode("hex"))
		body_length = int(data[-4:].encode("hex"),16)
		self.heart_count = 0
		if data[4] =='\xc1':
        #这是收到心跳报文的判断
			self.callback(time.ctime(time.time())+" receive heartbeat packet")
			self.stream.read_bytes(body_length-16, self.heart_decode)
		elif data[4]== '\x83':
                        #self.callback("AAA query,header: "+repr(data))
                        self.stream.read_bytes(body_length-16, self.AAA_decode)	
                elif data[4]== '\xc5':
                        self.callback("DPI static INFO")
                        self.stream.read_bytes(body_length-16, self.DPIS_decode)	
                elif data[4]== '\xc6':
                        self.callback("DPI dynamic INFO")
                        self.stream.read_bytes(body_length-16, self.DPID_decode)
                elif data[4]== '\xc2':
                        #self.callback("DPI policy query")
                        self.stream.read_bytes(body_length-16,self.policy_query)	
		elif data[4]== '\xcd':
        #这是收到正常ACK包的判断
			if not self.stream.reading():
				self.stream.read_bytes(body_length-16, self.bodydecode)
		else:	
        #到这里，收到的就不是ACK报文
			if not self.stream.reading():
				self.stream.read_bytes(body_length-16,self.errordecode)
			self.callback("not ACK packet")

	def policy_query(self,data=None):
            if data is not None:
                num = ord(data[0])
                data = data[1:]

            if not hasattr(self, "policy"):
                self.policy = self.policy_gen(num, data)

            try:
                self.policy.next()
            except StopIteration:
                delattr(self, "policy")
		if self.gen_request_running:
		    tornado.ioloop.IOLoop.instance().add_callback(self.gen_request)

	def policy_gen(self, num, data):
            for i in range(0, num):
                type = data[0].encode("hex")
                mn = data[1:5].encode("hex")
		if not self.gen_request_running:
                    self.callback("DPI policy query type is " + type)
                yield self.config_log_query(self.addr, type, mn, self.send_policy)
                data = data[5:]

         
        def send_policy(self, data=None):
            if data == None:
		pass
                #self.callback("No new policy")
            else:
                self.MessageType = "\xc3"
                self.MessageNo = "\x00\x00"
                self.MessageSequenceNo = "\x00\x00\x00\x00"
                pc_len = struct.pack('!i',len(data)+16) 
                packet = "\x10\x43\x55\x43\xc3\x00\x00\x00\x00\x00\x00\x00"+pc_len+data
		self.callback(packet.encode("hex"))
                self.stream.write(packet)
		if not self.gen_request_running:
		    if not self.stream.reading():
	                self.stream.read_bytes(16,self.on_next)
		else:
		    if not self.stream.reading():
                        self.stream.read_bytes(16,self.header_decode)
            self.policy_query()

        def DPIS_decode(self,data):
            dpi_ver = unicode(data[0:4],"utf-8")
            site_len = ord(data[4])
            site_name = unicode(data[5:5+site_len],"utf-8")
            deploy = ""
            if data[5+site_len] == "\x01":
                deploy = "Parallel&One-way Up"    
            elif data[5+site_len] == "\x02":
                deploy = "Parallel&One-way Down"    
            elif data[5+site_len] == "\x01":
                deploy = "Parallel&Both-way"    
            elif data[5+site_len] == "\x01":
                deploy = "Serial&One-way Up"    
            elif data[5+site_len] == "\x01":
                deploy = "Serial&One-way Down"    
            elif data[5+site_len] == "\x01":
                deploy = "Serial&Both-way"   

            total_capability =str(int(data[6+site_len:8+site_len].encode("hex"),16)) 
            slotnum = str(int(data[8+site_len].encode("hex"),16))
            preprocslotnum = str(int(data[9+site_len].encode("hex"),16))
            analysisslotnum = str(int(data[10+site_len].encode("hex"),16))
            GPslotnum = str(ord(data[11+site_len]))
            portstypenum = ord(data[12+site_len])
            self.callback("DPIver:"+dpi_ver+" DeploySiteName:"+site_name+" Deploy_Mode"+deploy)
            self.callback("Total_Capability:"+total_capability+" SlotNum:"+slotnum+" PreProcSlotNum:"+preprocslotnum)
            self.callback("AnalysisSlotNum:"+analysisslotnum+" GPSlotNum:"+GPslotnum+" PortsTypeNum:"+str(portstypenum))
            data = data[13+site_len]
            for i in range(0,portstypenum):
               porttype = ""
               if data[0] =="\x01":
                   porttype = "GE-fiber"
               elif data[0] =="\x02":
                   porttype = "GE-electric"
               elif data[0] =="\x03":
                   porttype = "10G POS"
               elif data[0] =="\x04":
                   porttype = "10GE"
               elif data[0] =="\x05":
                   porttype = "40G POS"
               elif data[0] =="\x06":
                   porttype = "40GE"
               elif data[0] =="\x07":
                   porttype = "100GE"
               else:
                   porttype = "to be extended"
               portsnum = ord(data[1])
               self.callback("PortType:"+porttype+" PortsNum:"+str(portsnum))
               data = data[2:]
               for i in range(0,portsnum):
                   portno = str(ord(data[0]))
                   des_len = ord(data[1])
                   portdes = unicode(data[2:2+des_len],"utf-8")
                   linkid =str(ord(data[2+des_len]))
                   linkdes_len = ord(data[3+des_len])
                   xlen = des_len+linkdes_len
                   linkdes = unicode(data[4+des_len:4+xlen],"utf-8")
                   self.callback("PortNo: "+portno+" PortDescription: "+portdes)
                   self.callback("M_LindID: "+linkid+" M_LindDesc: "+linkdes)
	    if self.gen_request_running:
		   if not self.stream.reading():
			self.stream.read_bytes(16, self.header_decode)
	    else:
            	   if not self.stream.reading():
                       self.stream.read_bytes(16, self.on_next)


        def DPID_decode(self,data):
            Total_PNum = ord(data[0])
            self.callback("Total_PortsNum: "+str(Total_PNum))
            data = data[1:]
            for i in range(0,Total_PNum):
                portno = ord(data[0])
                len = ord(data[1])        
                portinfo = unicode(data[2:2+len],"utf-8")
                portus = str(int(data[2+len:3+len].encode("hex"),16))
                self.callback("PortNo:"+portno+" PortInfo:"+portinfo+" PortUsage:"+portus)
                total_cpuno = str(int(data[3+len:5+len].encode("hex"),16))
                self.callback("Total_CpuNum: "+total_cpuno)
                data = data[5+len:]
                for i in range(0,total_cpuno):
                    cpu_no = str(int(data[0:2].encode("hex"),16)) 
                    cpu_usage = str(ord(data[2]))
                    self.callback("CPU_No:"+cpu_no+" CPU_Usage:"+cpu_usage)             
                    data = data[3:]
            if self.gen_request_running:
                   if not self.stream.reading():
                        self.stream.read_bytes(16, self.header_decode)
            else:
                   if not self.stream.reading():
                       self.stream.read_bytes(16, self.on_next)


        def AAA_decode(self,data):
            if data[0]== '\x00':
                self.callback("Query all,body: "+repr(data))
            else:
                userIP = data[2:6]
            	ipPRE = data[6]
            	self.MessageNo = '\x00\x01'
            	self.MessageSequenceNo = '\x11\x11\x11\x11'
            	ip = str(ord(userIP[0]))+str(ord(userIP[1]))+str(ord(userIP[2]))+str(ord(userIP[3])) 
            	name_len = len(ip)
            	length = struct.pack('B',name_len+2)
            	pc_len = struct.pack('!i',name_len+46)
                #self.callback("Query body: "+repr(data))
                if Uc_Proc.aaa_type == None:
                    pass
                elif Uc_Proc.aaa_type == "1":
                #以3A信息下发方式回复
                    packet = '\x10\x43\x55\x43\x81\x00\x01\x00\x11\x11\x11\x11'+pc_len+'\x01'+length+ip+'\x08\x06'+userIP+'\x04\x06\x0a\x0a\x0a\x01\x20\x0a\x4d\x69\x6b\x72\x6f\x54\x69\x6b\x28\x06\x00\x00\x00\x01'
            #        self.callback("aaa reply 1: "+repr(packet))
                    #self.config_log_query(self.addr,ip,self.AAA_send)
		    self.MessageType = '\x81'
                    self.stream.write(packet)
                elif Uc_Proc.aaa_type == "2":
                #以IP地址段用信息下发方式回复
                    packet = '\x10\x43\x55\x43\x82\x00\x01\x00\x11\x11\x11\x11'+pc_len+'\x01'+length+ip+'\x00\x01\x04'+userIP+ipPRE
             #       self.callback("aaa reply 2: "+repr(packet))
                    self.MessageType = '\x82'
                    if not self.stream.closed:
                        self.stream.write(packet)
                elif Uc_Proc.aaa_type == "3":
                #用户不存在
                    packet = '\x10\x43\x55\x43\x81\x00\x01\x00\x11\x11\x11\x11\x00\x00\x00\x37\x01\x0b\x4e\x6f\x6e\x2d\x45\x78\x69\x73\x74\x08\x06'+userIP+'\x04\x06\x0a\x0a\x0a\x01\x20\x0a\x4d\x69\x6b\x72\x6f\x54\x69\x6b\x28\x06\x00\x00\x00\x01'
              #      self.callback("aaa reply 3: "+repr(packet))
                    self.MessageType = '\x81'
                    if not self.stream.closed:
                        self.stream.write(packet)
                elif Uc_Proc.aaa_type == "4":
                #以数据库查询方式回复
                    pass
            if self.gen_request_running:
                   if not self.stream.reading():
                        self.stream.read_bytes(16, self.header_decode)
            else:
                   if not self.stream.reading():
                       self.stream.read_bytes(16, self.on_next)

	def AAA_send(self,data):
	    self.stream.write(data)
            if not self.stream.reading:
                self.stream.readbytes(16,self.on_next) 

	def errordecode(self,data):
    #收到的不是ACK报文，就需要断开连接，否则之后读取的数据很可能都错，断开后重连
		self.callback( "uc_ack body is " + data.encode("hex"))
		self.stream.close()
	#	self.remove_self()

	def bodydecode(self, data):
	#解析ACK body字段
		#self.callback( "uc_ack body is " + data.encode("hex"))
		if (data[0]==self.MessageType)&(data[1:3]==self.MessageNo)&(data[3:7]==self.MessageSequenceNo):
			#self.callback('receive ACK')
			if data[7]=='\x00':
				self.callback('ACK right')
                                if data[0]!="\xc3" and data[0]!="\x81" and data[0]!="\x85":
                                    self.config_insert()
			else:
	#			pass
				self.callback('ACK errorNO: '+ repr(data[7]))
				self.callback("error describe is: " + data[10:].encode("utf-8"))
		else:
			self.callback('not the wanted ACK')
	        if not self.stream.reading():
                   	self.stream.read_bytes(16, self.on_next)
			
	def format_uc(self):
	#循环发包流程中，将网页数据取出组合成正常包
		ucheader = ''
		ucbody = ''
		for header_value in self.ucdata["uc_header"]:
			ucheader += header_value.values().pop()

		for body_value in self.ucdata["uc_body"]:
			ucbody += body_value.values().pop()

		return ucheader + ucbody
	
	def uc_gen(self, data, count, step):
		format_patten = '{0:0' + str(len(data))+ 'x}'
		format_string = ''
		if self.uc_gen_count < int(count):
			format_string = format_patten.format(int(data, 16) + int(step))
		return format_string
	
	def uc_gen_ascii(self, data, step, data_len=None):
	#循环发包流程中，和字符相关的变化量，在ASCII码中取可见字符进行变化
		if data_len == None:
			data_len = len(data)/2

		for i in xrange(len(data)/2):
			v = data[i:i+2]
			iv = int(v, 16)
			if iv < 58:
				asc_list = range(iv, 58, int(step)) + range(65, 91, int(step)) + range(97, 123, int(step))
			elif iv < 91:
				asc_list = range(iv, 91, int(step)) + range(97, 123, int(step))
			else:
				asc_list = range(iv, 123, int(step))
			
			if data_len == 1:
				for w in set(asc_list):
					yield chr(w)
			else:
				c = data[i+2:]
				for j in asc_list:
					for a in self.uc_gen_ascii(c, step, data_len - 1):
						yield chr(j) + a
	def uc_gen_hex(self,data,step,data_len=None):
		if data_len == None:
			data_len = len(data)/2

		for i in xrange(len(data)/2):
			v = data[i:i+2]
			asc_list = range(int(v), 40, int(step))
			
			if data_len == 1:
				for w in asc_list:
					yield str(w)
			else:
				c = data[i+2:]
				for j in asc_list:
					for a in self.uc_gen_hex(c, step, data_len - 1):
						yield str(j) + a

	def uc_gen_from_file(self, count):
	#循环发包流程中，和DPI库协议名称相关，加载文件dpi_name，从中读取
		dpi_name = open("dpi_name", "r")
		line = dpi_name.readline()
		while True:	
			yield line.strip('\n')
			line = dpi_name.readline()
			if not line:
				dpi_name.seek(0)
			if self.uc_gen_count >= int(count):
				break;
		dpi_name.close()

	def format_uc_gen(self, callback=None):
	#循环发包流程中，生成发送的数据包
		ucheader = ''
		ucbody = ''
		senddata = ''
		for key in self.gen_ucdata_to_send["uc_Modifier"].keys():
			pos = self.gen_ucdata_to_send["uc_Modifier"][key][key + "_pos"]
			header_or_body = self.gen_ucdata_to_send["uc_Modifier"][key][key + "_isheader"]
			md_name = self.gen_ucdata_to_send["uc_Modifier"][key][key + "_MDx"]
			data = self.gen_ucdata_to_send[header_or_body][pos][md_name]
			count = self.gen_ucdata_to_send["uc_Modifier_count"]
			step = self.gen_ucdata_to_send["uc_Modifier"][key][key + "_step"]
			
			if md_name == "uc_Body_AppName_CH0":
				if self.uc_gen_count == 0:
					self.uc_packet_len = self.gen_ucdata_to_send["uc_header"][-1]["uc_Header_MessageLen_LN4"]
					self.uc_dpi_name_len = len(data)/2
					self.dpi_app_name = self.uc_gen_from_file(count)
					dpi_name = self.dpi_app_name.next()
				else:
					dpi_name = self.dpi_app_name.next()
				self.gen_ucdata_to_send[header_or_body][int(pos)][md_name] = dpi_name
				
				app_len_patten = '{0:0' + str(len(self.gen_ucdata_to_send[header_or_body][int(pos) - 1]["uc_Body_AppName_Length_CN1"])) + 'x}' 
				self.gen_ucdata_to_send[header_or_body][int(pos) - 1]["uc_Body_AppName_Length_CN1"] = app_len_patten.format(len(dpi_name))
                                uc_len = self.uc_packet_len
                                uc_dpi_len = self.uc_dpi_name_len
				uc_len_patten = '{0:0' + str(len(uc_len)) + 'x}'
				self.gen_ucdata_to_send["uc_header"][-1]["uc_Header_MessageLen_LN4"] = uc_len_patten.format(int(uc_len, 16) + (len(dpi_name) - uc_dpi_len)) 
			elif md_name[-3:] == "CH0":
				if self.uc_gen_count == 0:
					self.uc_packet_ascii = self.uc_gen_ascii(data, step)
					ascii_data = self.uc_packet_ascii.next()
				else:
					ascii_data = self.uc_packet_ascii.next()
				self.gen_ucdata_to_send[header_or_body][int(pos)][md_name] = ascii_data
			
                        elif md_name[-3:] == "CH1":
				if self.uc_gen_count == 0:
					self.uc_packet_hex = self.uc_gen_hex(data[2:], step)
					ascii_data = self.uc_packet_hex.next()
				else:
					ascii_data = self.uc_packet_hex.next()
				self.gen_ucdata_to_send[header_or_body][int(pos)][md_name] = data[0:2]+ascii_data

			else:
				self.gen_ucdata_to_send[header_or_body][int(pos)][md_name] = self.uc_gen(data, count, step)	

		for header_value in self.gen_ucdata_to_send["uc_header"]:
			ucheader += header_value.values().pop().decode("hex")

		for body_value in self.gen_ucdata_to_send["uc_body"]:
			if body_value.has_key("uc_Body_AppName_CH0"):
				ucbody += body_value.values().pop()
			elif body_value.keys().pop()[-3:] == "CH0":
				body_values_pop = body_value.values().pop()
				if isinstance(body_values_pop, unicode):
					ucbody += body_value.values().pop().decode("hex")
				else:
					ucbody += body_value.values().pop()
			else:
				ucbody += body_value.values().pop().decode("hex")
		
		senddata = ucheader + ucbody
		self.MessageType = self.gen_ucdata_to_send["uc_header"][2]["uc_Header_MessageType_SE1"].decode("hex")
		self.MessageNo = self.gen_ucdata_to_send["uc_header"][3]["uc_MessageNo_NU2"].decode("hex")
		self.MessageSequenceNo = self.gen_ucdata_to_send["uc_header"][5]["uc_Header_MessageSeq_SQ4"].decode("hex")
		
		if callback:
			if self.gen_ucdata_to_send.has_key("uc_Delete"):
				self.config_delete(self.gen_ucdata_to_send, self.callback)
			else:
				self.config_query(self.gen_ucdata_to_send, callback, self.callback, senddata)
	
		self.uc_gen_count +=1

	def gen_request(self):
	#循环发包流程中，开始发送数据
		if self.uc_gen_count < int(self.gen_ucdata_to_send["uc_Modifier_count"]):
			#print "Modifier_count"
			#print "self.uc_gen_count:%d" %self.uc_gen_count
			if not self.gen_request_running:
				self.gen_request_running = True
			self.format_uc_gen(self.gen_request_send)
		else:
			if self.ucdata_buffer:
				self.callback('Send One command ok')
				self.gen_ucdata_to_send = self.ucdata_buffer.popleft()
				if not self.gen_request_running:
					self.gen_request_running = True
				self.uc_gen_count = 0
				self.format_uc_gen(self.gen_request_send)
			else:
				if self.gen_request_running:
					self.gen_request_running = False		
					self.callback('Send All command ok')
	def gen_request_send(self, data):
	#循环发包流程中，write数据到socket缓存中	
		self.stream.write(data)
		if self.stream.reading():
			self.stream._read_callback = None
		self.stream.read_bytes(16, self.header_decode)
		#self.ucack_read_times = 0

	def header_decode(self, data):
	#循环发包流程中，解析ACK头
		body_length = int(data[-4:].encode("hex"),16)
                if data[4] =='\xc1':
        #这是收到心跳报文的判断
                       # self.callback(time.ctime(time.time())+" receive heartbeat packet")
                        self.stream.read_bytes(body_length-16, self.heart_decode)
                elif data[4]== '\x83':
                      #  self.callback("AAA query,header: "+repr(data))
                        self.stream.read_bytes(body_length-16, self.AAA_decode)
                elif data[4]== '\xc5':
                     #   self.callback("DPI static INFO")
                        self.stream.read_bytes(body_length-16, self.DPIS_decode)
                elif data[4]== '\xc6':
                    #    self.callback("DPI dynamic INFO")
                        self.stream.read_bytes(body_length-16, self.DPID_decode)
                elif data[4]== '\xc2':
                        #self.callback("DPI policy query")
                        self.stream.read_bytes(body_length-16,self.policy_query)
		elif data[4]== '\xcd':
			if not self.stream.reading():
				self.stream.read_bytes(body_length-16, self.body_decode)
		else:	
			if not self.stream.reading():
				#print 'ack wrong'
				self.stream.read_bytes(body_length-16,self.body_decode)
	def body_decode(self, data):
	#循环发包流程中，解析ACK body
		#self.ucack_read_times += 1
                if data[7]=='\x00':
			if data[0] != '\xc3' or data[0] != '\xfe':
                            	tornado.ioloop.IOLoop.instance().add_callback(self.gen_request)
			    	self.config_insert()
			else:
				if not self.stream.reading():
					self.stream.read_bytes(16, self.header_decode)
                else:
                        #if self.ucack_read_times < 2:
                        #        if not self.stream.reading():
                         #               self.stream.read_bytes(16, self.header_decode)
			self.gen_request_running = False
			self.callback("send uc loop receive a error ack.")
			self.callback("uc_ack body is %s" %data.encode("hex"))
			self.gen_ucdata_to_send = None
                        if not self.stream.reading():
                            self.stream.read_bytes(16, self.header_decode)
                        #else:
                         #       tornado.ioloop.IOLoop.instance().add_callback(self.gen_request)
			#	self.config_insert()
		
class Application(tornado.web.Application):
#tornado自带，加载网页代码框架，分别在文件templates和static中
	def __init__(self):
		
        	handlers = [
            	(r"/", MainHandler),
            	(r"/ucsocket", webHandler),
        	]
        	settings = dict(
		cookie_secret="__TODO:_U01TEST_",
        	template_path=os.path.join(os.path.dirname(__file__), "templates"),
            	static_path=os.path.join(os.path.dirname(__file__), "static"),
            	xsrf_cookies=True,
            	autoescape=None,
        	)
            #tornado的固定用法
        	tornado.web.Application.__init__(self, handlers, **settings)

#Connection完成UD监听、解析、发送数据到网页的功能，add_by_lixiaoli
class Ud_Proc(object):
    packetType = ''
    packetSubType = ''
    udcache = []
    packetLength = 0
    AppNumber = 0
    def __init__(self, connection, address):
    #ud监听流程，一上来就监听端口
        self.stream = tornado.iostream.IOStream(connection)
        self.address = address
        self.read()

    def read(self):
    #监听后即用read_bytes，等待读取ud数据头，16字节
	self.stream.read_bytes(16, self.udheader_decode)

    def udheader_decode(self, data):
    #read读取的数据传来，开始解析头部
        self.packetType = data[8]
        self.packetSubType = data[9]
	self.packetLength = int(data[12:16].encode("hex"),16)
        if (data[8]=='\x01')&(data[9]=='\x00'):
            self._read_ud("Receive PacketType WEBstat from"+self.address[0])
            if not self.stream.closed():
                self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
	elif (data[8]=='\x01')&(data[9]=='\x02'):
    #判断为通用流量统计的ud报文
            self._read_ud("Receive PacketType TYLLTJ from"+self.address[0])
            if not self.stream.closed():
	    	self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
		#解析完ud头，读取响应的长度，去解析body
        elif (data[8]=='\x01')&(data[9]=='\xc2'):
        #判断为P2P流向统计的ud报文
            self._read_ud("Receive PacketType P2PTJ from"+self.address[0])
            if not self.stream.closed():
	    	self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
        elif (data[8]=='\x01')&(data[9]=='\x01'):
        #判断为VOIP流量统计报文
            self._read_ud("VOIP: "+self.address[0])
            if not self.stream.closed():
                self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
        elif (data[8]=='\x01')&(data[9]=='\x80'):
        #判断为用户偏好分析报文
            self._read_ud("USERPrefer: "+self.address[0])
            if not self.stream.closed():
                self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
        elif (data[8]=='\x01')&(data[9]=='\x03'):
            print "specify"
            self._read_ud("specify-protocol-for-user:"+self.address[0])
            if not self.stream.closed():
                self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
        elif (data[8]=='\x01')&(data[9]=='\xc4'):
            self._read_ud("streamdirection: "+self.address[0])
            if not self.stream.closed():
                self.stream.read_bytes(self.packetLength-16,self.udbody_decode)
        else:
        #其他类的报文没有注册
            self._read_ud("receive NONE UD Packet")
	    self.read()

    def udbody_decode(self,data):
    #解析ud头后，读取响应长度，开始解析body字段
        starttime = int(data[0:4].encode("hex"),16)
        endtime = int(data[4:8].encode("hex"),16)
        R_StartTime = time.ctime(starttime)
        R_EndTime = time.ctime(endtime)
        self._read_ud("R_StartTime: "+str(R_StartTime)+"  R_EndTime: "+str(R_EndTime))

        if (self.packetType=='\x01')&(self.packetSubType=='\x02'):
        #通用流量统计报文的解析过程
            AppType = data[10].encode("hex")
            AppId = data[11:13].encode("hex")
            AppLength = ord(data[13])
            AppNameRead = self.packetLength-54-AppLength
            self._read_ud("AppType= "+AppType+" AppID= "+AppId+"AppName= "+unicode(data[14:14+AppLength], "utf-8"))
            AppUserNum= int(data[self.packetLength-24-16:self.packetLength-20-16].encode("hex"),16)
            AppTraffic_Up= int(data[self.packetLength-20-16:self.packetLength-16-16].encode("hex"),16)
            AppTraffic_Dn= int(data[self.packetLength-16-16:self.packetLength-12-16].encode("hex"),16)
            AppPacketsNum= int(data[self.packetLength-12-16:self.packetLength-8-16].encode("hex"),16)
            AppSessionsNum= int(data[self.packetLength-8-16:self.packetLength-4-16].encode("hex"),16)
            AppNewSessionNum= int(data[self.packetLength-4-16:].encode("hex"),16)
            self._read_ud('AppUserNum= '+str(AppUserNum)+'  AppPacketsNum='+str(AppPacketsNum))
            self._read_ud('  AppTraffic_Up= '+str(AppTraffic_Up)+'AppTraffic_Dn= '+str(AppTraffic_Dn))
            self._read_ud('AppSessionsNum= '+str(AppSessionsNum)+' AppNewSessionNum= '+str(AppNewSessionNum))
            #self._read_ud("AppNumber= "+str(self.AppNumber))
        elif (self.packetType=='\x01')&(self.packetSubType=='\xc2'):
        #P2P流向统计报文的解析过程
            AppNameLength =int(data[11].encode("hex"),16)
            AppName= (data[12:12+AppNameLength])
            self._read_ud("AppName= "+unicode(AppName, "utf-8"))
            TrafficDirectionNum = int(data[12+AppNameLength].encode("hex"),16)
            data = data[13+AppNameLength:]
	    for i in range(0, TrafficDirectionNum):
                dire_len = ord(data[0])
                #TrafficDirectionName= str(ord(data[4]))+"."+str(ord(data[3]))+"."+str(ord(data[2]))+"."+str(ord(data[1]))
                TrafficDirectionName = unicode(data[1:1+dire_len],"utf-8")
                InputTra = int(data[1+dire_len:5+dire_len].encode("hex"),16)
                OutputTra = int(data[5+dire_len:9+dire_len].encode("hex"),16)
                self._read_ud("TrafficDirection: "+TrafficDirectionName+" InputTra= "+str(InputTra)+" OutputTra= "+str(OutputTra))
                data = data[13:]

        elif (self.packetType=='\x01')&(self.packetSubType=='\x00'):
        #web类流量统计报文解析过程
            Site_Num_Hit = int(data[10:12].encode("hex"),16)
            self._read_ud("SiteNum: "+str(Site_Num_Hit))
            if Site_Num_Hit != 0:
                data = data[12:]
	    	for i in range(0,Site_Num_Hit):
                    SiteNameLength = int(data[0].encode("hex"),16)
                    SiteName = unicode(data[1:1+SiteNameLength], "utf-8")
                    SiteType = data[1+SiteNameLength].encode("hex")
                    SiteHitFreq = int(data[2+SiteNameLength:6+SiteNameLength].encode("hex"),16)
                    SiteTraffic_Up = int(data[6+SiteNameLength:10+SiteNameLength].encode("hex"),16)
                    SiteTraffic_Dn = int(data[10+SiteNameLength:14+SiteNameLength].encode("hex"),16)
                    data = data[14+SiteNameLength:]
                    self._read_ud("SiteName:"+SiteName+" SiteType:"+SiteType+" SiteHitFreq:"+str(SiteHitFreq))
                    self._read_ud("SiteTraffic_Up:"+str(SiteTraffic_Up)+" SiteTraffic_Dn:"+str(SiteTraffic_Dn))
            else:
                self._read_ud("no web")

        elif (self.packetType=='\x01')&(self.packetSubType=='\xc4'):
        #流量流向分析
            srcid = ord(data[8])
            dstid = ord(data[9])
            appnum = ord(data[10])
            self._read_ud("SRCID: "+str(srcid)+ " DSTID: "+str(dstid)+" APPNO: "+str(appnum))
            data = data[11:]
            for i in range(0,appnum):
                apptype = str(ord(data[0]))
                appid = int(data[1:3].encode("hex"),16)
                if appid == 0:
                    appname_len = ord(data[3])
                    APPname = unicode(data[4:4+appname_len],"utf-8")
                    tra_up = str(int(data[4+appname_len:8+appname_len].encode("hex"),16))
                    tra_dn = str(int(data[8+appname_len:12+appname_len].encode("hex"),16))
                    self._read_ud("APPType: "+apptype+" APPID: "+str(appid)+" APPname: "+APPname+" Traffic_Up: "+tra_up+"M Traffic_Dn: "+tra_dn+"M")
                else:
                    tra_up = str(int(data[4:8].encode("hex"),16))
                    tra_dn = str(int(data[8:12].encode("hex"),16))
                    self._read_ud("APPType: "+apptype+" APPID: "+str(appid)+" Traffic_Up: "+tra_up+"M Traffic_Dn: "+tra_dn+"M")

        elif (self.packetType=='\x01')&(self.packetSubType=='\x03'):
        #指定应用的用户统计
            apptype = repr(data[8])
            appid = int(data[9:11].encode("hex"),16)
            applen = ord(data[11])
            appname = unicode(data[12:12+applen],"utf-8")
            usernum = int(data[12+applen:14+applen].encode("hex"),16)
            self._read_ud("AppType : "+apptype+" AppId : "+str(appid)+" AppName : "+appname+" user_num : "+str(usernum))
            data = data[14+applen:]
            for i in range(0,usernum):
                if data[0]=='\x01':
                    usertype = "account_user"
                elif data[0]=='\x02':
                    usertype = "static_user"
                else:
                    usertype = "group_user"
                acc_len = ord(data[1])
                acc = unicode(data[2:2+acc_len],"utf-8")
                if (apptype=='\x01')|(apptype=='\x02'):
                    usage = str(int(data[2+acc_len:4+acc_len].encode("hex"),16))+" count"
                else:
                    self._read_ud("UserType: "+usertype+" AccName: "+acc+" Usage: "+usage)
        elif (self.packetType=='\x01')&(self.packetSubType=='\x00'):
        #web类流量统计报文解析过程
            Site_Num_Hit = int(data[10:12].encode("hex"),16)
            self._read_ud("SiteNum: "+str(Site_Num_Hit))
            if Site_Num_Hit != 0:
                data = data[12:]
                for i in range(0,Site_Num_Hit):
                    SiteNameLength = int(data[0].encode("hex"),16)
                    SiteName = unicode(data[1:1+SiteNameLength], "utf-8")
                    SiteType = data[1+SiteNameLength].encode("hex")
                    SiteHitFreq = int(data[2+SiteNameLength:6+SiteNameLength].encode("hex"),16)
                    SiteTraffic_Up = int(data[6+SiteNameLength:10+SiteNameLength].encode("hex"),16)
                    SiteTraffic_Dn = int (data[10+SiteNameLength:14+SiteNameLength].encode("hex"),16)
                    data = data[14+SiteNameLength:]
                    self._read_ud("SiteName:"+SiteName+" SiteType:"+SiteType+" SiteHitFreq:"+str(SiteHitFreq))
                    self._read_ud("SiteTraffic_Up:"+str(SiteTraffic_Up)+" SiteTraffic_Dn:"+str(SiteTraffic_Dn))
            else:
                self._read_ud("no web")
        elif (self.packetType=='\x01')&(self.packetSubType=='\x01'):
        #VOIP流量统计报文解析过程
            media_num = int(data[10].encode("hex"),16)
            self._read_ud("Media_Protocol_num = "+str(media_num))
            data = data[11:]
            for i in range(0, media_num):
                if data[0]=='\x01':
                    media_type = "RTP"
                else:
                    media_type = "other"
                media_traffic = int(data[1:5].encode("hex"),16)
                self._read_ud("Type "+str(i)+": "+media_type+" traffic: "+str(media_traffic))
                data = data[5:]
            sig_num = int(data[0].encode("hex"),16)
            self._read_ud("Sig_Protocol_num = "+str(sig_num))
            data = data[1:]
            for i in range(0, sig_num):
                if data[0]=='\x01':
                    sig = "H.323"
                elif data[0]=='\x02':
                    sig = "SIP"
                elif data[0]=='\x03':
                    sig = "MGCP"
                elif data[0]=='\x04':
                    sig = "other"
                sig_traffic = int(data[1:5].encode("hex"),16)
                self._read_ud("Type "+str(i)+": "+sig+" traffic: "+str(sig_traffic))
                data = data[5:]
            gw_num = int(data[0:2].encode("hex"),16)
            data = data[2:]
            for i in range(0,gw_num):
                self._read_ud("The info about gw"+str(i)+":")
                GW_IPLength = int(data[0].encode("hex"),16)
                GW_IP = data[1:1+GW_IPLength]
                if GW_IPLength==4:
                    self._read_ud("GW_IP(IPV6):"+str(GW_IP[0:2].encode("hex"))+":"+str(GW_IP[2:4].encode("hex"))+":"+str(GW_IP[4:6].encode("hex"))+":"+str(GW_IP[6:8].encode("hex"))+":"+str(GW_IP[8:10].encode("hex"))+":"+str(GW_IP[10:12].encode("hex"))+":"+str(
GW_IP[12:14].encode("hex"))+":"+str(GW_IP[14:16].encode("hex")))
                    TotalCallSessions=int(data[1+GW_IPLength:1+2+GW_IPLength],16)
                    CallSessionsConcurrent=int(data[1+2+GW_IPLength:1+2+2+GW_IPLength],16)
                    TotalCallDuration=int(data[1+2+2+GW_IPLength:1+2+2+4+GW_IPLength],16)
                    data = data[1+2+2+4+GW_IPLength:]
                    self._read_ud("TotalCallSessions(times):"+TotalCallSessions+","+"CallSessionsConcurrent(times):"+CallSessionsConcurrent+",TotalCallDuration(seconds):"+TotalCallDuration+";")
                else:
                    pass
            GWKeeperNum = int(data[0:2].encode("hex"),16)
            data=data[2:]
            for i in range(0,GWKeeperNum):
                self._read_ud("The info about gwkeeper"+str(i)+":")
                GWKeeperIPLength = int(data[0].encode("hex"),16)
                GWKeeperIP = data[1:1+GWKeeperIPLength]
                if GWKeeperIPLength==4:
                        self._read_ud("GWKeeperIP(IPV4):"+str(int(GWKeeperIP[0].encode("hex"),16))+"."+str(int(GWKeeperIP[1].encode(
"hex"),16))+"."+str(int(GWKeeperIP[2].encode("hex"),16))+"."+str(int(GWKeeperIP[3].encode("hex"),16)))
                elif GW_IPLength==16:
                        self._read_ud("GWKeeperIP(IPV6):"+str(GWKeeperIP[0:2].encode("hex"))+":"+str(GWKeeperIP[2:4].encode("hex"))+":"+str(GWKeeperIP[4:6].encode("hex"))+":"+str(GWKeeperIP[6:8].encode("hex"))+":"+str(GWKeeperIP[8:10].encode("hex"))+":"+str(GWKeeperIP[10:12].encode("hex"))+":"+str(GWKeeperIP[12:14].encode("hex"))+":"+str(GWKeeperIP[14:16].encode("hex")))
                data=data[1+GWKeeperIPLength:]
                TOPNCalledNumberNum=data[0]
                data=data[1:]
                for j in range(0,TOPNCalledNumberNum):
                        self._read_ud("Called Number TOP-"+str(j))
                        CalledNumber_Length=int(data[0],16)
                        CalledNumber=str(data[1:1+ CalledNumber_Length])
                        CalledDuration=str(int(data[1+CalledNumber_Length:1+4+CalledNumber_Length]))
                        data=data[1+4+CalledNumber_Length:]
                        self._read_ud("CalledNumber:"+CalledNumber+","+"CalledDuration:"+CalledDuration+";")
                TOPNCallNumberNum=data[0]
                data=data[1:]
                for j in range(0,TOPNCallNumberNum):
                        self._read_ud("Call Number TOP-"+str(j))
                        CallNumber_Length=int(data[0],16)
                        CallNumber=str(data[1:1+ CallNumber_Length])
                        CallDuration=str(int(data[1+CallNumber_Length:1+4+CallNumber_Length]))
                        data=data[1+4+CallNumber_Length:]
                        self._read_ud("CallNumber:"+CallNumber+","+"CallDuration:"+CallDuration+";")
        elif (self.packetType=='\x01')&(self.packetSubType=='\x80'):
        #用户偏好分析报文解析过程
            prefer_num = int(data[10].encode("hex"),16)
            self._read_ud("Prefer_Num = "+str(prefer_num))
            data = data[11:]
            for i in range(0, prefer_num):
                click_time = int(data[1:3].encode("hex"),16)
                self._read_ud("Prefer_type: "+repr(data[0])+" Click_time: "+str(click_time))
                data = data[3:]
            kw_num = int(data[0:2].encode("hex"),16)
            self._read_ud("KW_NUM = "+str(kw_num))
            data = data[2:]
            for i in range(0, kw_num):
                name_len = int(data[0].encode("hex"),16)
 	#判断一下连接是否关闭，没有关闭就继续等待读取
	if self.stream.closed():
	    self.stream.close()
	else:
	    self.read()

    def _read_ud(self, data):
    #回显到网页所需的结构
        webHandler.ud_form(data)

def ud_connection(sock, fd, event):
#ud监听的开始
    while True:
        try:
            connection, address = sock.accept()
            print 'The address is ', address
        except socket.error,e:
            if e[0] not in (errno.EWOULDBLOCK, errno.EAGAIN):
                raise
            return
        connection.setblocking(0)
        Ud_Proc(connection, address)

def uc_connection(sock, fd, event):
#uc监听的开始
    aaa_def = {"uc_AAA_query":"1"}
    while True:
        try:
            connection, address = sock.accept()
            print 'The connection obj is ', address
        except socket.error,e:
            if e[0] not in (errno.EWOULDBLOCK, errno.EAGAIN):
                raise
            return
        connection.setblocking(0)
        webHandler.ip_form(address[0]+":"+str(address[1]))
        Uc_Proc(address[0],address[1],aaa_def,connection)
        db.mongo_db.create_db_indexes(address[0]) 

def listen_ud(port):
#网页监听的开始，监听的是网站服务器端口
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setblocking(0)
    sock.bind(("", port))
    sock.listen(128)

    print "ud_listen"
    io_loop = tornado.ioloop.IOLoop.instance()
    #将connection_ready以回调函数形式，在io_loop开始时即开始监听
    callback = functools.partial(ud_connection, sock)
    io_loop.add_handler(sock.fileno(), callback, io_loop.READ)

def listen_uc(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setblocking(0)
    sock.bind(("", port))
    sock.listen(128)

    io_loop = tornado.ioloop.IOLoop.instance()
    #将connection_ready以回调函数形式，在io_loop开始时即开始监听
    callback = functools.partial(uc_connection, sock)
    io_loop.add_handler(sock.fileno(), callback, io_loop.READ)

if __name__ == "__main__":
        #程序的开始
	tornado.options.define("httpport", type=int, default=5150, help="Http Server Listen port")
        #webserver端口自定义选项配置
	tornado.options.define("udport", type=int, default=50001, help="Udserver Listen port")
        #ud监听端口自定义选项配置
        tornado.options.define("ucport", type=int, default=50000, help="Ucserver Listen port")
        #uc监听端口自定义选项配置
        tornado.options.parse_command_line()
        logging.info("starting webserver on 0.0.0.0:%d" % tornado.options.options.httpport)
        #形成网页框架
        http_server = tornado.httpserver.HTTPServer(Application())
        http_server.listen(tornado.options.options.httpport)
        #调用listen_main,流程开始
        listen_uc(tornado.options.options.ucport)
        listen_ud(tornado.options.options.udport)
	tornado.ioloop.IOLoop.instance().start()
		

