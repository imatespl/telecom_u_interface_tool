#!/usr/bin/env python
#-*-coding:utf-8-*-

import tornado.options
import pymongo

def mongo_db(uc_ip,type):
    print uc_ip,type
    _pydb = pymongo.Connection('localhost',27017)
    
    if type == "all":
        alist = []
        for i in range(0,10):
            alist.append("0"+str(i))
            alist.append("c"+str(i))
        alist = alist + ["0a","40","41","42","43","44","80","81","82","83","84","85","ca"]
        
        for type in alist:
            db_config_collection = "uc_ip_"+uc_ip.replace(".", "_") + "_" + type
            db_config_log_collection = db_config_collection + "_log"
            exec('_pydb.u02test.'+db_config_collection+'.remove()')
            exec('_pydb.u02test.'+db_config_log_collection+'.remove()')
        print "clear ok"
    
    else:
        db_config_collection = "uc_ip_"+uc_ip.replace(".", "_") + "_" + type
        db_config_log_collection = db_config_collection + "_log"
            
        exec('_pydb.u02test.'+db_config_collection+'.remove()')
        exec('_pydb.u02test.'+db_config_log_collection+'.remove()')
        print "clear ok"

if __name__ == "__main__":
    tornado.options.define("ip", type=str, default="172.16.6.133", help="aa")
    tornado.options.define("type", type=str, default="00", help="oo")
    tornado.options.parse_command_line()
    uc_ip = tornado.options.options.ip
    type = tornado.options.options.type
    mongo_db(uc_ip,type)
