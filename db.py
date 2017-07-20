#!/usr/bin/env python
#-*-coding:utf-8-*-
# Copyright (c) 2011 dwliu. See LICENSE for details.

import asyncmongo
import settings
import pymongo
import functools
import struct

class mongo_db(object):
    def __init__(self, gen_request_running=False):
        self.gen_request_running = gen_request_running
        
    @property
    def db(self):
        if not hasattr(self, "_db"):
            self._db = asyncmongo.Client(pool_id='test_pool', **settings.get('mongo_database'))
        return self._db
#根据设备发送来的策略同步请求报文中的MessageSerialNo查询配置日志，返回需要更新的报文list
    def config_log_query(self, uc_ip, query_message_type=None, query_message_serial_no=None, policy_callback=None):
        if uc_ip is not None:
            self.uc_ip = uc_ip
        if query_message_serial_no is not None:
            self.query_message_serial_no = query_message_serial_no
        if self.uc_ip and query_message_type is not None:
            self.query_message_type = query_message_type
            self.db_config_collection = "uc_ip_" + self.uc_ip.replace(".", "_") + "_" + self.query_message_type
            self.db_config_log_collection = self.db_config_collection + "_log"
        if policy_callback is not None:
            self.policy_callback = policy_callback
            
        exec('self.db.'+self.db_config_log_collection+'.find({"MessageSerialNo":{"$gt":self.query_message_serial_no}}, limit=1000000, callback=self.config_log_query_resp)')
            
    def config_log_query_resp(self, response, error):
        message_no = set()
        message_delete_no = set()
        if error:
            raise
        else:
            if response:
                #删除用1标示，更新用2标示，新建用3标示
                for resp in response:
                    
                    if resp['status'] == "update":
                        if (resp['MessageNo'], 3) not in message_no:
                            message_no.add((resp['MessageNo'], 2))
                    elif resp['status'] == "new":
                        if resp['MessageNo'] in message_delete_no:
                            message_no.add((resp['MessageNo'], 2))
			    message_delete_no.remove(resp['MessageNo'])
                        else:
                            message_no.add((resp['MessageNo'], 3))
                    elif resp['status'] == "delete":
                        if (resp['MessageNo'], 3) in message_no:
                            message_no.remove((resp['MessageNo'], 3))
                        elif (resp['MessageNo'], 2) in message_no:
                            message_no.remove((resp['MessageNo'], 2))
                            message_delete_no.add(resp['MessageNo'])
                        else:
                            message_delete_no.add(resp['MessageNo'])
                            
                self.select_config_from_config_log(response[-1]['MessageSerialNo'], message_no, message_delete_no)
            else:
                self.policy_callback()
    
    def select_config_from_config_log(self, max_message_serial_no, message_no, message_delete_no=None):
        if message_delete_no is not None:
            change_message_no = len(message_no) + len(message_delete_no)
            callback = functools.partial(self.config_ucbody_resp, max_message_serial_no, change_message_no, message_no, message_delete_no)
        else:
            change_message_no = len(message_no)
            callback = functools.partial(self.config_ucbody_resp, max_message_serial_no, change_message_no, message_no)
            
        exec('self.db.'+self.db_config_collection+'.find({"MessageNo":{"$in":list(i[0] for i in message_no)}}, limit=1000000, callback=callback)')

    def config_ucbody_resp(self, max_message_serial_no, change_message_no, message_no, message_delete_no=None, response=None, error=None):
        policy_data = ""
        policy_data += self.query_message_type.decode("hex") + max_message_serial_no.decode("hex") + struct.pack("!H", change_message_no)
        if error:
            raise
        else:
            if response:
                for resp in response:
                    uc_content = resp['uc_content'].decode("hex")
                    if (resp['MessageNo'], 2) in message_no:
                        policy_data += resp['MessageNo'].decode("hex") + '\x02' + struct.pack("!i", len(uc_content)) + uc_content
                    elif (resp['MessageNo'], 3) in message_no:
                        policy_data += resp['MessageNo'].decode("hex") + '\x03' + struct.pack("!i", len(uc_content)) + uc_content

            if message_delete_no is not None:
                for message_no in message_delete_no:
                    policy_data += message_no.decode("hex") + '\x01'

            self.policy_callback(policy_data)
            
#数据库查询函数，首先从config_log数据库中查询数据是否存在，如果存在则响应失败信息到web，如果不存在，查询config数据库，查看策略是否存在，如果
#存在，更新config数据库，并执行插入config log日志，及更新config数据库，如果不存在则直接发包
    def config_query(self, uc_data=None, send_uc=None, send_resp=None, send_uc_data=None):
        if uc_data is not None:
            self.db_config_collection = "uc_ip_" + uc_data["uc_IP"].replace(".", "_") +"_" + uc_data["uc_header"][2]["uc_Header_MessageType_SE1"]
            self.db_config_log_collection = self.db_config_collection + "_log"
            self.db_message_no = uc_data["uc_header"][3]["uc_MessageNo_NU2"]
            self.uc_data = uc_data
            self.uc_body = ""
            for body in self.uc_data["uc_body"]:
		if body.keys().pop()[-3:] == "CH0":
		    body_value = body.values().pop()
                    if isinstance(body_value, unicode):
                        self.uc_body += body_value
		    else:
			self.uc_body += body_value.encode("hex")
                else:
                    self.uc_body += body.values().pop()
        if send_uc is not None:
            self.send_uc = send_uc
        if send_resp is not None:
            self.send_resp = send_resp
        if send_uc_data is not None:
            self.send_uc_data = send_uc_data
        
        
        if self.uc_data["uc_body"][-1].has_key("uc_Body_MessageSerialNo_SQ4"):
            self.db_message_serial_no = self.uc_data["uc_body"][-1]["uc_Body_MessageSerialNo_SQ4"]
            exec('self.db.'+self.db_config_log_collection+'.find({ "MessageSerialNo": self.db_message_serial_no}, limit=1, callback=self.config_query_resp)')
        elif self.uc_data["uc_body"][-1].has_key("uc_Body_WCL_SerialNo_SQ4"):
            self.db_message_serial_no = self.uc_data["uc_body"][-1]["uc_Body_WCL_SerialNo_SQ4"]
            exec('self.db.'+self.db_config_log_collection+'.find({ "MessageSerialNo": self.db_message_serial_no}, limit=1, callback=self.config_query_resp)')
        else:
            if self.gen_request_running:
                self.send_uc(self.send_uc_data)
            else:
                self.send_uc()

    def config_query_resp(self, response, error):
        if error:
            raise
        else:
            if response:
                if not self.gen_request_running:
                    self.send_resp("MessageSerialNo already exist.")
                    return False
                else:
                    return False
            else:
                    #插入操作日志,查询策略是否已经存在，如果存在更新一条已经存在策略，不会继续向DPI设备发送uc报文
                    
                    self.db.command('findAndModify',
                                    self.db_config_collection,
                                    query={'MessageNo':self.db_message_no},
                                    update={'$set':{'uc_content':self.uc_body,'status':'update'}},    
                                    callback=self.config_update_resp)

     
#各回调函数
    def config_log_insert_resp(self, response, error):
        if error:
            raise
        else:
            if response:
                
                if not response[0]["err"]:
                    if not self.gen_request_running:
                        self.send_resp("insert config log to database success.")
                        return True
                    else:
                        return True
                else:
                    if not self.gen_request_running:
                        self.send_resp("insert config log to database failed.")
                        return False
                    else:
                        return False


    def config_update_resp(self, response, error):
        if error:
            raise
        else:
            if response:
                if not response["value"] and response["ok"]:
                    if not self.gen_request_running:
                        self.send_uc()
                    else:
                        self.send_uc(self.send_uc_data)
                        
                elif response["value"] and response["ok"]:
                    if not self.gen_request_running:
                        self.send_resp("update config to database success.")
                    exec('self.db.'+self.db_config_log_collection+'.insert({"MessageSerialNo":self.db_message_serial_no, "MessageNo":self.db_message_no, "status":"update" }, callback=self.config_log_insert_resp)')
                else:
                    if not self.gen_request_running:
                        self.send_resp("update config to database failed.")
                        return False
                    else:
                        return False

    def config_insert_resp(self, response, error):
        if error:
            raise
        else:
            if response:
               
                if not response[0]["err"]:
                    if not self.gen_request_running:
                        self.send_resp("insert config to database success.")
                        return True
                    else:
                        return True
                else:
                    if not self.gen_request_running:
                        self.send_resp("insert config to database failed.")
                        return False
                    else:
                        return False


#数据库插入操作，如果向设备发送uc报文并收到正确响应，执行该语句，将配置插入数据库
    def config_insert(self):
        if self.uc_data["uc_body"][-1].has_key("uc_Body_MessageSerialNo_SQ4"):
            self.db_message_serial_no = self.uc_data["uc_body"][-1]["uc_Body_MessageSerialNo_SQ4"]
            exec('self.db.'+self.db_config_collection+'.insert({ "MessageNo": self.db_message_no, "uc_content":self.uc_body, "MessageSerialNo":self.db_message_serial_no,"status":"new"}, limit=1, callback=self.config_insert_resp)')
            exec('self.db.'+self.db_config_log_collection+'.insert({"MessageSerialNo":self.db_message_serial_no, "MessageNo":self.db_message_no, "status":"new" }, callback=self.config_log_insert_resp)')
        elif self.uc_data["uc_body"][-1].has_key("uc_Body_WCL_SerialNo_SQ4"):
            self.db_message_serial_no = self.uc_data["uc_body"][-1]["uc_Body_WCL_SerialNo_SQ4"]
            exec('self.db.'+self.db_config_collection+'.insert({ "MessageNo": self.db_message_no, "uc_content":self.uc_body, "MessageSerialNo":self.db_message_serial_no, "status":"new"}, limit=1, callback=self.config_insert_resp)')
            exec('self.db.'+self.db_config_log_collection+'.insert({"MessageSerialNo":self.db_message_serial_no, "MessageNo":self.db_message_no, "status":"new" }, callback=self.config_log_insert_resp)')

#数据库删除操作，web如果为删除按钮，则执行删除config操作，同时更新操作日志config log
    def config_delete(self, uc_data=None, send_resp=None):
        if uc_data is not None:
            self.db_config_collection = "uc_ip_" + uc_data["uc_IP"].replace(".", "_") +"_" + uc_data["uc_header"][2]["uc_Header_MessageType_SE1"]
            self.db_config_log_collection = self.db_config_collection + "_log"
            self.db_message_no = uc_data["uc_header"][3]["uc_MessageNo_NU2"]
            self.uc_data = uc_data
            self.uc_body = ""
            for body in self.uc_data["uc_body"]:
                self.uc_body += body.values().pop()
        if send_resp is not None:
            self.send_resp = send_resp
            
        if self.uc_data["uc_body"][-1].has_key("uc_Body_MessageSerialNo_SQ4"):
            self.db_message_serial_no = self.uc_data["uc_body"][-1]["uc_Body_MessageSerialNo_SQ4"]
            exec('self.db.'+self.db_config_log_collection+'.find({ "MessageSerialNo": self.db_message_serial_no}, limit=1, callback=self.config_delete_resp)')
        elif self.uc_data["uc_body"][-1].has_key("uc_Body_WCL_SerialNo_SQ4"):
            self.db_message_serial_no = self.uc_data["uc_body"][-1]["uc_Body_WCL_SerialNo_SQ4"]
            exec('self.db.'+self.db_config_log_collection+'.find({ "MessageSerialNo": self.db_message_serial_no}, limit=1, callback=self.config_delete_resp)')

    def config_delete_resp(self, response, error):
            if error:
                raise
            else:
                if response:
                    if not self.gen_request_running:
                        self.send_resp("MessageSerialNo already exist.")
                        return False
                    else:
                        return False
                else:
                    self.db.command('findAndModify',
                            self.db_config_collection,
                            callback=self.config_delete_resp_confirm,
                            query={"MessageNo":self.db_message_no},
                            remove=True)

    def config_delete_resp_confirm(self, response, error):
        if error:
            raise
        else:
            if response:
                if not response["value"] and response["ok"]:
                    if not self.gen_request_running:
                        self.send_resp("no config to delete.")
                        return False
                    else:
                        return False
                elif response["value"] and response["ok"]:
                    if not self.gen_request_running:
                        self.send_resp("delete config from database success.")
                    exec('self.db.'+self.db_config_log_collection+'.insert({"MessageSerialNo":self.db_message_serial_no, "MessageNo":self.db_message_no, "status":"delete" }, callback=self.config_log_insert_resp)')
                else:
                    if not self.gen_request_running:
                        self.send_resp("delete config from database failed.")
                        return False
                    else:
                        return False
#根据IP地址建立索引                          
    @classmethod
    def create_db_indexes(cls, uc_ip):
        if not hasattr(cls, "_pydb"):
            cls._pydb = pymongo.Connection('localhost',27017)

        message_type = set(["00","01","02","03","04","05","06","07","08","09","0a","41","42","43","81","82","c7","c8","c9","ca"])
        for i in message_type:
            exec('cls._pydb.u02test.uc_ip_'+uc_ip.replace(".", "_")+'_'+i+'.ensure_index("MessageNo",cache_for=86400, unique=True)')
            exec('cls._pydb.u02test.uc_ip_'+uc_ip.replace(".", "_")+'_'+i+'_log.ensure_index("MessageSerialNo",cache_for=86400, unique=True)')



    
