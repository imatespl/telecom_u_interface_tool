$(document).ready(function() {
	  $( ".column" ).sortable({
      connectWith: ".column"
    });
 
    $( ".portlet" ).addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
      .find( ".portlet-header" )
        .addClass( "ui-widget-header ui-corner-all" )
        .prepend( "<span class='ui-icon ui-icon-plusthick'></span>")
        .end()
      .find( ".portlet-content" );
 
    $( "body" ).on("click", ".portlet-header .plus-icon", function() {
      $( this ).toggleClass( "ui-icon-plusthick" ).toggleClass( "ui-icon-minusthick" );
      $( this ).parents( ".portlet:first" ).find( ".portlet-content" ).toggle();
    });
    
    $( "body" ).on("click", ".portlet-header .close-icon", function() {
      $( this ).parents( ".portlet:first" ).remove();
    });
    $("body").on("change", ".c-change-next", function(){
		var selected = $(this).children("option:selected").attr("value").substring(2);
		if (selected == "03")
		{
			var changed = $(this).parents("li").next().next();
			changed.children("input").attr("name", function(i, val){
				return val.substring(0, val.length - 4) + "_NU1";
			});
			changed.children("label").attr("for", function(i, val){
				return val.substring(0, val.length - 4) + "_NU1";
			});
		} else if (selected == "04")
		{
			var changed = $(this).parents("li").next().next();
			changed.children("input").attr("name", function(i, val){
				return val.substring(0, val.length - 4) + "_IPy"
			});
			changed.children("label").attr("for", function(i, val){
				return val.substring(0, val.length - 4) + "_IPy";
			});
		}
	}).trigger("change");
 
    $("body").on("load", ".c-change-next", function(){
		var selected = $(this).children("option:selected").attr("value").substring(2);
		if (selected == "03")
		{
			var changed = $(this).parents("li").next().next();
			changed.children("input").attr("name", function(i, val){
				return val.substring(0, val.length - 4) + "_NU1";
			});
			changed.children("label").attr("for", function(i, val){
				return val.substring(0, val.length - 4) + "_NU1";
			});
		} else if (selected == "04")
		{
			var changed = $(this).parents("li").next().next();
			changed.children("input").attr("name", function(i, val){
				return val.substring(0, val.length - 4) + "_IPy"
			});
			changed.children("label").attr("for", function(i, val){
				return val.substring(0, val.length - 4) + "_IPy";
			});
		}
	}).trigger("load");

//根据APPTYPE，动态改变APPID
	$("body").on("change", ".apptype", function(){
		var selected = $( this ).children("option:selected").attr("value").substring(2);
		var setAppIdSelect = $( this ).next().next();
		setAppIdSelect.children().remove();
		switch(selected)
		{
		case "00":
			$('<option value="\\x0001">未识别应用</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "01":
			$('<option value="\\x0000">其他</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "02":
			$('<option value="\\x0000">其他</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "03":
			$('<option value="\\x0000">其他</option> \
			<option value="\\x0001">PPStream</option> \
			<option value="\\x0002">QVoD</option> \
			<option value="\\x0003">QQLive</option> \
			<option value="\\x0004">PPLive</option> \
			<option value="\\x0005">TVKoo</option> \
			<option value="\\x0006">迅雷看看</option> \
			<option value="\\x0007">暴风盒子</option> \
			<option value="\\x0008">蚂蚁电视</option> \
			<option value="\\x0009">猫眼电视</option> \
			<option value="\\x000a">MySee</option> \
			<option value="\\x000b">51TV</option> \
			<option value="\\x000c">SopCast</option> \
			<option value="\\x000d">PPVod</option> \
			<option value="\\x000e">P2PSrv</option> \
			<option value="\\x000f">PPRich</option> \
			<option value="\\x0010">PPGou</option> \
			<option value="\\x0011">5TTK</option> \
			<option value="\\x0012">风行播放器</option> \
			<option value="\\x0013">球皇直播</option> \
			<option value="\\x0014">VGO</option> \
			<option value="\\x0015">FastTV</option> \
			<option value="\\x0016">ppFilm</option> \
			<option value="\\x0017">新浪电视直播</option> \
			<option value="\\x0018">RealLink</option> \
			<option value="\\x0019">RealCast</option> \
			<option value="\\x001a">coopen</option> \
			<option value="\\x001b">乐酷</option> \
			<option value="\\x001c">CCIPTV</option> \
			<option value="\\x001d">PPMate</option> \
			<option value="\\x001e">极速酷6</option> \
			<option value="\\x001f">VJBase</option> \
			<option value="\\x0020">JeBoo</option> \
			<option value="\\x0021">青娱乐</option> \
			<option value="\\x0022">飞速土豆</option> \
			<option value="\\x0023">Ttlive</option> \
			<option value="\\x0024">搜狐电视直播</option> \
			<option value="\\x0025">iV影音加速器</option> \
			<option value="\\x0026">TVUPlayer</option> \
			<option value="\\x0027">皮皮影视</option> \
			<option value="\\x0028">乐鱼影音盒</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "04":
			$('<option value="\\x0000">其他</option>\
			<option value="\\x0001">BitTorrent </option>\
			<option value="\\x0002">DirectConnect</option>\
			<option value="\\x0003">GNUTELLA </option>\
			<option value="\\x0004">迅雷下载 </option>\
			<option value="\\x0005">eMule </option>\
			<option value="\\x0006">POCO </option>\
			<option value="\\x0007">酷狗 </option>\
			<option value="\\x0008">FlashGet </option>\
			<option value="\\x0009">QQ旋风 </option>\
			<option value="\\x000a">酷我音乐盒 </option>\
			<option value="\\x000b">QQLive </option>\
			<option value="\\x000c">PPLive </option>\
			<option value="\\x000d">PPStream </option>\
			<option value="\\x000e">沸点 </option>\
			<option value="\\x000f">Funshion </option>\
			<option value="\\x0010">QVOD </option>\
			<option value="\\x0011">UUSee </option>\
			<option value="\\x0012">CNTV </option>\
			<option value="\\x0013">暴风影音 </option>\
			<option value="\\x0014">Vagaa </option>\
			<option value="\\x0015">百度下吧 </option>\
			<option value="\\x0016">WinMX </option>\
			<option value="\\x0017">Winny </option>\
			<option value="\\x0018">脱兔 </option>\
			<option value="\\x0019"> 百宝 </option>\
			<option value="\\x001a">Maze </option>\
			<option value="\\x001b">搜娱 </option>\
			<option value="\\x001c">PP点点通 </option>\
			<option value="\\x001d">FrostWire </option>\
			<option value="\\x001e">Shareaza </option>\
			<option value="\\x001f">汉魅 </option>\
			<option value="\\x0020">Pando </option>\
			<option value="\\x0021">SoulSeek </option>\
			<option value="\\x0022">Foxy </option>\
			<option value="\\x0023">Fasttrack </option>\
			<option value="\\x0024">AppleJuice </option>\
			<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "05":
			$('<option value="\\x0000">其他</option>\
			<option value="\\x0001">9158视频聊天室 </option>\
			<option value="\\x0002">COMMON视频聊天室 </option>\
			<option value="\\x0003">DAILYMOTION </option>\
			<option value="\\x0004">DOSHOW视频聊天室 </option>\
			<option value="\\x0005">GOMTV </option>\
			<option value="\\x0006">GRABOID </option>\
			<option value="\\x0007">ITUNES </option>\
			<option value="\\x0008">JANGO </option>\
			<option value="\\x0009">MAILRU </option>\
			<option value="\\x000a">NICOVIDEO </option>\
			<option value="\\x000b">QQ音乐 </option>\
			<option value="\\x000c">QUICKTIME </option>\
			<option value="\\x000d">SHOUTCAST </option>\
			<option value="\\x000e">爱聊视频聊天室 </option>\
			<option value="\\x000f">呱呱视频聊天室 </option>\
			<option value="\\x0010">开心听 </option>\
			<option value="\\x0011">酷6 </option>\
			<option value="\\x0012">酷狗叮咚 </option>\
			<option value="\\x0013">手机电视 </option>\
			<option value="\\x0014">天天动听 </option>\
			<option value="\\x0015">土豆网在线视频 </option>\
			<option value="\\x0016">新浪UC视频聊天室 </option>\
			<option value="\\x0017">一听音乐 </option>\
			<option value="\\x0018">优酷客户端 </option>\
			<option value="\\x0019">语酷 </option>\
			<option value="\\x001a">中兴视频 </option>\
			<option value="\\x001b">奇秀视频聊天室 </option>\
			<option value="\\x001c">豆瓣电台 </option>\
			<option value="\\x001d">ICY </option>\
			<option value="\\x001e">乐视影音 </option>\
			<option value="\\x001f">METACAFE </option>\
			<option value="\\x0021">SAYNSAY视频聊天室</option>\
			<option value="\\x0022">SLINGBOX </option>\
			<option value="\\x0023">STEAM平台在线视频</option>\
			<option value="\\x0024">BBCIPLAYER </option>\
			<option value="\\x0025">BLIPTV </option>\
			<option value="\\x0026">LIVESTATION </option>\
			<option value="\\x0027">LAST_FM </option>\
			<option value="\\x0028">JUSTINTV </option>\
			<option value="\\x0029">SAPOVIDEO </option>\
			<option value="\\x002a">TNTTV </option>\
			<option value="\\x002b">ABC_VIDEO </option>\
			<option value="\\x002c">BRIGHTCOVE </option>\
			<option value="\\x002d">百度高清视频 </option>\
			<option value="\\x002e">GUARDIAN </option>\
			<option value="\\x002f">SKEEDRECEIVER </option>\
			<option value="\\x0031">NETFLIX </option>\
			<option value="\\x0032">MLBTV </option>\
			<option value="\\x0033">无料动画 </option>\
			<option value="\\x0034">RUTUBE </option>\
			<option value="\\x0035">SMOTRI </option>\
			<option value="\\x0036">IFILM </option>\
			<option value="\\x0037">KAZAA </option>\
			<option value="\\x0038">SCREENPLAY </option>\
			<option value="\\x0039">SHOCKWAVE </option>\
			<option value="\\x003a">BOXEE_STREAMING </option>\
			<option value="\\x003b">ICECAST </option>\
			<option value="\\x003c">YAHOO_VIDEO </option>\
			<option value="\\x003d">DEEZER </option>\
			<option value="\\x003e">CBS_VIDEO </option>\
			<option value="\\x003f">USTREAMTV </option>\
			<option value="\\x0041">BLOCKBUSTER </option>\
			<option value="\\x0042">4OD </option>\
			<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "06":
			$('<option value="\\x0000">download</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "07":
			$('<option value="\\x0000">Email</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "08":
			$('<option value="\\x0000">其他</option>\
			<option value="\\x0001">MSN </option>\
			<option value="\\x0002">QQ </option>\
			<option value="\\x0003">YAHOO </option>\
			<option value="\\x0004">SKYPE </option>\
			<option value="\\x0005">飞信 </option>\
			<option value="\\x0006">GOOGLETALK</option>\
			<option value="\\x0007">新浪UC </option>\
			<option value="\\x0008">Jabber </option>\
			<option value="\\x0009">LAVA </option>\
			<option value="\\x000a">百度Hi </option>\
			<option value="\\x000b">网易泡泡 </option>\
			<option value="\\x000c">阿里旺旺 </option>\
			<option value="\\x000d">YY </option>\
			<option value="\\x000e">IRC </option>\
			<option value="\\x000f">微信 </option>\
			<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "09":
			$('<option value="\\x0000"></option>\
			<option value="\\x0001">魔兽世界 </option>\
			<option value="\\x0002">QQ </option>\
			<option value="\\x0003">天堂 </option>\
			<option value="\\x0004">梦幻西游 </option>\
			<option value="\\x0005">剑侠情缘 </option>\
			<option value="\\x0006">完美世界 </option>\
			<option value="\\x0007">征途 </option>\
			<option value="\\x0008">QQ穿越火线 </option>\
			<option value="\\x0009">联众 </option>\
			<option value="\\x000a">QQ对战平台 </option>\
			<option value="\\x000b">街头篮球 </option>\
			<option value="\\x000c">巨人征途 </option>\
			<option value="\\x000d">浩方 </option>\
			<option value="\\x000e">跑跑卡丁车 </option>\
			<option value="\\x000f">劲舞团 </option>\
			<option value="\\x0010">问道 </option>\
			<option value="\\x0011">热血江湖 </option>\
			<option value="\\x0012">奇迹 </option>\
			<option value="\\x0013">冒险岛 </option>\
			<option value="\\x0014">天龙八部 </option>\
			<option value="\\x0015">中国游戏中心</option>\
			<option value="\\x0016">地下城与勇士</option>\
			<option value="\\x0017">永恒之塔 </option>\
			<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "0a":
			$('<option value="\\x0000">其他</option>\
			<option value="\\x0001">SKYPE </option>\
			<option value="\\x0002">NET2PHONE </option>\
			<option value="\\x0003">IAX </option>\
			<option value="\\x0004">UUCall </option>\
			<option value="\\x0005">ET263 </option>\
			<option value="\\x0006">铁通飞线 </option>\
			<option value="\\x0007">铁通RedVip </option>\
			<option value="\\x0008">Vtalk </option>\
			<option value="\\x0009">和悦网络电话</option>\
			<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "0b":
			$('<option value="\\x0000">其他</option>\
			<option value="\\x0001">爱音乐  </option>\
			<option value="\\x0002">天翼视讯</option>\
			<option value="\\x0003">翼聊    </option>\
			<option value="\\x0004">天翼空间</option>\
			<option value="\\x0005">天翼阅读</option>\
			<option value="\\x0006">爱游戏  </option>\
			<option value="\\x0007">189邮箱 </option>\
			<option value="\\x0008">天翼云  </option>\
			<option value="\\x0009">天翼动漫</option>\
			<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		case "0c":
			$('<option value="\\x0000">其他</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		default:
			$('<option value="\\x0000">其他</option> \
				<option value="\\xffff">通配指定</option>').appendTo(setAppIdSelect);
			break;
		}
	}).trigger("change");
	//动态去掉通用参数配置ud ip配置
	$("body").on("change", ".acccesslog_flag", function(){
		var selected = $( this ).children("option:selected").attr("value").substring(2);
		var parentNextDiv = $( this ).parent().next();
		switch(selected)
		{
		case "02":
			parentNextDiv.children("ul").children("li").remove();
			break;
		default:
			if (parentNextDiv.children("ul").children("li").length == 0)
			{
				$('<li>\
				   <label for="ud_IPtype_SN1">上报服务器IP地址(R_DestIP):</label>\
				   <select id="uc_Body_R_DestIPLen" name="ud_IPtype_SN1">\
					   <option value="\\x04">IPv4</option>\
					   <option value="\\x10">IPv6</option>\
				   </select>\
				  </li>\
				  <li>\
					<label for="ud_IPx">IP地址:</label>\
				   <input type="text"  name="ud_IPx" value="0.0.0.0" class="cw100"> \
					</li>\
					<li>\
				   <label for="ud_Port_NU2">端口(R_DestPort):</label>\
				   <input type="text"  name="ud_Port_NU2" class="cw40">\
				   </li>').appendTo(parentNextDiv.children("ul"));
			}
			break;
		}
	}).trigger("change");
    $( ".column" ).disableSelection();
	
    $("input[type=submit]").button().click(function(event){event.preventDefault});
    $("input[type=button]").button().click(function(event){event.preventDefault});
    $("#uc_tabs").accordion({ collapsible: true });
    $("#uc_Body_R_StartTime").datetimepicker();
    $("#uc_Body_R_EndTime").datetimepicker();
    $("#0_uc_Body_C_Starttime").datetimepicker();
	$("#0_uc_Body_Web_C_Starttime_TI1").datetimepicker();
	$("#0_uc_Body_Web_C_Stoptime_TI1").datetimepicker();
    $("#0_uc_Body_C_Stoptime").datetimepicker();
    $("#uc_Body_R_StartTime1").datetimepicker();
    $("#uc_Body_R_EndTime1").datetimepicker();
    $("#uc_ud_show").tabs();
    $("#uc_ud_show").width($(window).width()-375);
    $("#uc_ack").height($(window).height()-$("#nav_header").height()-95);
    $("#ud_show").height($(window).height()-$("#nav_header").height()-95);
    $("#uc_ack_clear").click(function(){
    		$("#uc_ack > div").remove();
    	});
    $("#ud_show_clear").click(function(){
    		$("#ud_show > div").remove();
    	});
    $(window).resize( function(event) {
            $("#uc_ud_show").width($(window).width()-375);        
            $("#uc_ack").height($(window).height()-$("#nav_header").height()-95);
            $("#ud_show").height($(window).height()-$("#nav_header").height()-95);
        });
    $("#datepicker2").datetimepicker();
    //$("#uc_ack").height($(window).height()-$(form_bottom).height()-10);
    //$("#ud_show").height($(window).height()-$(form_bottom).height()-10);
    $( "#dialog" ).dialog({ hide: "explode" });
    $("#dyinput_IP_Add").click(function(){
    			var iLenName = $("#dyinput_IP ul li:nth-last-child(3) :input").attr("name");
    			var uIpName = $("#dyinput_IP ul li:nth-last-child(2) :input").attr("name");
    			var uIpPrefixName = $("#dyinput_IP ul li:nth-last-child(1) :input").attr("name"); 
    			var ipLenthName = iLenName == undefined ? "0_uc_Body_UserIPLength_SN1":iLenName;
					var userIpName = uIpName == undefined ? "0_uc_Body_UserIP_IPx":uIpName;
					var userIpPrefixName = uIpPrefixName == undefined ? "0_uc_Body_UserIP_Prefix_NU1":uIpPrefixName;
					var IPnum = iLenName == undefined ? 0:(parseInt(ipLenthName.substring(0, 1)) + 1).toString(); 
    			$('<li><label for="' + IPnum + ipLenthName.substring(1) + '">IP地址长度' + IPnum + '(UserIPLength):</label><select name="' + IPnum + ipLenthName.substring(1) + '" class="garlic-auto-save"><option value="\\x04">IPv4</option><option value="\\x10">IPv6</option></select></li><li><label for="' + IPnum + userIpName.substring(1) + '">IP地址' + IPnum + '(UserIP):</label><input type="text"  name="' + IPnum + userIpName.substring(1) + '" value="0.0.0.0" class="cw100 garlic-auto-save"/></li><li><label for="' + IPnum + userIpPrefixName.substring(1) + '">IP地址前缀' + IPnum + '(UserIP_Prefix):</label><input type="text"  name="' + IPnum + userIpPrefixName.substring(1) + '" class="cw40 garlic-auto-save"/></li>').appendTo($("#dyinput_IP ul"));
    	});
    $("#dyinput_Message_Add").click(function(){
    			var messType = $("#dyinput_Message ul li:nth-last-child(2) :input").attr("name");
    			var messNo = $("#dyinput_Message ul li:nth-last-child(1) :input").attr("name");
    			var messageType = messType == undefined ? "0_uc_Body_MessageType_SE1":messType;
    			var messageNo = messNo == undefined ? "0_uc_Body_MessageNo_NU2":messNo;
    			var Mnum = messType == undefined ? 0:(parseInt(messageType.substring(0, 1)) + 1).toString();
    			$('<li> \
      		<label for="' +Mnum + messageType.substring(1) +'">策略类型' +Mnum + '(MessageType):</label> \
      		<select name="' +Mnum + messageType.substring(1) +'" class="cw100 garlic-auto-save"> \
		     		<option value="\\x00">通用参数设置</option> \
      	 		<option value="\\x01" selected="selected">流量分析结果上报策略</option> \
         		<option value="\\x02">Web类流量管理策略</option> \
         		<option value="\\x03">URL分类批量查询</option> \
		     		<option value="\\x04">URL分类批量回应 </option> \
		     		<option value="\\x05">VOIP类流量管理策略</option> \
		     		<option value="\\x06">通用流量管理策略</option> \
         		<option value="\\x07">通用流量标记策略</option> \
         		<option value="\\x08">指定应用的用户统计策略</option> \
         		<option value="\\x09">流量镜像策略</option> \
         		<option value="\\x0a">应用自定义策略</option> \
         		<option value="\\x40">用户组归属分配策略</option> \
         		<option value="\\x41">Web信息推送策略</option> \
         		<option value="\\x42">1ToN用户管理策略</option> \
         		<option value="\\x43">DDOS流量管理策略</option> \
		     		<option value="\\x44">DDOS保护策略对象绑定</option> \
		     		<option value="\\x80">AAA信息采集</option> \
       	 		<option value="\\x81">AAA信息下发</option> \
         		<option value="\\x82">静态用户信息下发</option> \
         		<option value="\\x83">AAA信息反查</option> \
         		<option value="\\x84">用户/应用策略绑定查询</option> \
         		<option value="\\x85">用户/应用策略信息下发</option> \
         		<option value="\\xc0">DPI通用信息下发</option> \
         		<option value="\\xc1">DPI设备心跳信息</option> \
         		<option value="\\xc2">DPI设备策略同步请求</option> \
         		<option value="\\xc3">DPI设备策略同步响应</option> \
         		<option value="\\xc4">DPI设备状态查询</option> \
         		<option value="\\xc5">DPI设备状态查询回应（静态信息）</option> \
         		<option value="\\xc6">DPI设备状态查询回应（动态信息）</option> \
         		<option value="\\xc7">协议特征库下发策略</option> \
         		<option value="\\xc8">URL分类库更新策略</option> \
         		<option value="\\xc9">应用名称对应更新通知</option> \
         		<option value="\\xca">IP地址库下发策略</option> \
         		<option value="\\xcb">广告触发网站列表定义</option> \
         		<option value="\\xcc">广告触发关键字列表定义</option> \
         		<option value="\\xcd">策略下发ACK</option> \
         		<option value="\\xff">随机信息类型</option> \
	    	</select> \
	    	</li> \
	    	<li> \
	    		<label for="' +Mnum + messageNo.substring(1) +'">策略号' +Mnum +'(Message No.):</label> \
	    		<input type="text" name="' +Mnum + messageNo.substring(1) +'" class="cw40 garlic-auto-save"/> \
	    	</li> ').appendTo($("#dyinput_Message ul"));
    	});
    $("#dyinput_Time_Add").click(function(){
    			var sTimeId = $("#dyinput_Time ul li:nth-last-child(2) input").attr("id");
    			var eTimeId = $("#dyinput_Time ul li:nth-last-child(1) input").attr("id");
    			var sTimeName = $("#dyinput_Time ul li:nth-last-child(2) input").attr("name");
    			var eTimeName = $("#dyinput_Time ul li:nth-last-child(1) input").attr("name");
					var startTimeId = sTimeId == undefined ? "0_uc_Body_C_Starttime":sTimeId;
					var endTimeId  = eTimeId == undefined ? "0_uc_Body_C_Stoptime":eTimeId;
					var startTimeName = sTimeName == undefined ? "0_uc_Body_C_Starttime_TI0":sTimeName;
					var endTimeName = eTimeName == undefined ? "0_uc_Body_C_Stoptime_TI0":eTimeName;
					var Tnum = sTimeId == undefined ? 0:(parseInt(startTimeId.substring(0, 1)) + 1).toString(); 
    			$('<li><label for="' +Tnum + startTimeName.substring(1) + '">管理起始时间' + Tnum + '(C_Starttime):</label><input type="text" id="' +Tnum + startTimeId.substring(1) + '" name="' +Tnum + startTimeName.substring(1) + '"  value="00/00/0000 00:00" class="cw120 garlic-auto-save"/></li><li><label for="' + Tnum + endTimeName.substring(1) + '">管理终止时间' + Tnum + '(C_Stoptime):</label><input type="text" id="' +Tnum + endTimeId.substring(1) + '" name="' +Tnum + endTimeName.substring(1) + '" value="00/00/0000 00:00" class="cw120 garlic-auto-save"/></li></ul></div>').appendTo($("#dyinput_Time ul"));
					$("#"+(Tnum + startTimeId.substring(1))).datetimepicker();
					$("#"+(Tnum + endTimeId.substring(1))).datetimepicker();
    	});
	$("#dyinput_SearchEngine_Add").click(function(){
			var preSENameLen = $("#dyinput_SearchEngine ul li:nth-last-child(2) input").attr("name");
			var preSEName = $("#dyinput_SearchEngine ul li:nth-last-child(1) input").attr("name");
			var crSENameLen = preSENameLen == undefined ? "0_uc_Body_SEName_Lenth_CN1":preSENameLen;
			var crSEName = preSEName == undefined ? "uc_Body_SEName_CH0":preSEName;
			var SENum = preSENameLen == undefined ? "0":(parseInt(preSENameLen.substring(0, 1)) + 1).toString();
	  $('<li> \
      <label for="'+SENum+preSENameLen+'">搜索名长度'+SENum+'(SEName_Lenth):</label> \
      <input type="text" name="'+SENum+preSENameLen+'" class="cw40"> \
      </li> \
      <li> \
      <label for="'+SENum+preSEName+'">搜索名称'+SENum+'(SEName):</label> \
      <input type="text" name="'+SENum+preSEName+'" class="cw80"> \
	  </li>').appendTo($("#dyinput_SearchEngine ul"));
	});
	$("#dyinput_CookieHost_Add").click(function(){
			var preCookieHostNameLen = $("#dyinput_CookieHost ul li:nth-last-child(4) input").attr("name");
			var preCookieHostName = $("#dyinput_CookieHost ul li:nth-last-child(3) input").attr("name");
			var preCookieKeyLen = $("#dyinput_CookieHost ul li:nth-last-child(2) input").attr("name");
			var preCookieKeyVlue = $("#dyinput_CookieHost ul li:nth-last-child(1) input").attr("name");
			var crCookieHostNameLen = preCookieHostNameLen == undefined ? "_uc_Body_Cookie_Host_Name_Length_CN1":preCookieHostNameLen.substring(1);
			var crCookieHostName = preCookieHostName == undefined ? "_uc_Body_Cookie_Host_Name_CH0":preCookieHostName.substring(1);
			var crCookieKeyLen = preCookieKeyLen == undefined ? "_uc_Body_Cookie_Key_Length_CN1":preCookieKeyLen.substring(1);
			var crCookieKeyVlue = preCookieKeyVlue == undefined ? "_uc_Body_Cookie_Key_Value_CH0":preCookieKeyVlue.substring(1);
			var CookieNum = preCookieHostNameLen == undefined ? "0":(parseInt(preCookieHostNameLen.substring(0, 1)) + 1).toString();
	  $('<li>\
      	<label for="'+CookieNum+crCookieHostNameLen+'">网站名称长度'+CookieNum+'(Cookie_Host_Name_Length):</label>\
       <input type="text"  name="'+CookieNum+crCookieHostNameLen.substring(1)+'" class="cw40">\
	  </li>\
	  <li>\
      	<label for="'+CookieNum+crCookieHostName+'">网站名称'+CookieNum+'(Cookie_Host_Name):</label>\
       <input type="text"  name="'+CookieNum+crCookieHostName+'" class="cw80">\
	   </li>\
	   <li>\
      	<label for="'+CookieNum+crCookieKeyLen+'">Cookie的key长度'+CookieNum+'(Cookie_Key_Length):</label>\
       <input type="text"  name="'+CookieNum+crCookieKeyLen.substring(1)+'" class="cw40">\
	   </li>\
	   <li>\
      	<label for="'+CookieNum+crCookieKeyVlue+'">Cookie的Key取值'+CookieNum+'(Cookie_Key_Value):</label>\
       <input type="text"  name="'+CookieNum+crCookieKeyVlue+'" class="cw80">\
	   </li>').appendTo($("#dyinput_CookieHost ul"));
	});
    	
	$("#dyinput_CWebType_Add").click(function(){
			var preCWebTypeName = $("#dyinput_CWebType ul li:nth-last-child(1) select").attr("name");
			var crCWebTypeName = preCWebTypeName == undefined ? "_uc_Body_CWebType_SE1":preCWebTypeName.substring(1);
			var CWebTypeNum = preCWebTypeName == undefined ? "0":(parseInt(preCWebTypeName.substring(0, 1)) + 1).toString();
			$(	  '<li> \
				  <label for="'+CWebTypeNum+crCWebTypeName+'">web分类'+CWebTypeNum+':</label> \
				  <select name="'+CWebTypeNum+crCWebTypeName+'" class="cw80"> \
					<option value="\\x01">新闻</option> \
					<option value="\\x02">军事</option> \
					<option value="\\x03">视频</option> \
					<option value="\\x04">财经</option> \
					<option value="\\x05">小说</option> \
					<option value="\\x06">购物</option> \
					<option value="\\x07">社交</option> \
					<option value="\\x08">生活</option> \
					<option value="\\x09">网页游戏</option> \
					<option value="\\x0a">团购</option> \
					<option value="\\x0b">体育</option> \
					<option value="\\x0c">数码</option> \
					<option value="\\x0d">手机</option> \
					<option value="\\x0e">旅游</option> \
					<option value="\\x0f">汽车</option> \
					<option value="\\x10">女性</option> \
					<option value="\\x11">彩票</option> \
					<option value="\\x12">银行</option> \
					<option value="\\x13">其他</option> \
					<option value="\\xff">随机</option> \
				  </select> \
				  </li>'
				).appendTo($("#dyinput_CWebType ul"));
	});
	
	$("#dyinput_Webtime_Add").click(function(){
			var preWebStarttimeId = $("#dyinput_Webtime ul li:nth-last-child(2) input").attr("id");

			var crWebStarttimeId = "_uc_Body_Web_C_Starttime_TI1";
			var crWebStarttimeName = "_uc_Body_C_Starttime_TI1";
			var crWebStoptimeId = "_uc_Body_Web_C_Stoptime_TI1";
			var crWebStoptimeName = "_uc_Body_C_Stoptime_TI1";
			var webtimeNum = preWebStarttimeId == undefined ? "0":(parseInt(preWebStarttimeId.substring(0, 1)) + 1).toString();
			$('<li> \
			<label for="'+webtimeNum+crWebStarttimeName+'">管理起始时间'+webtimeNum+':</label> \
				<input type="text" id="'+webtimeNum+crWebStarttimeId+'" name="'+webtimeNum+crWebStarttimeName+'" value="00/00/0000 00:00" class="cw120"> \
				</li><li><label for="'+webtimeNum+crWebStoptimeName+'">管理结束时间'+webtimeNum+':</label> \
				<input type="text" id="'+webtimeNum+crWebStoptimeId+'" name="'+webtimeNum+crWebStoptimeName+'" value="00/00/0000 00:00" class="cw120"></li>'
			).appendTo($("#dyinput_Webtime ul"));
			
			$("#"+(webtimeNum + crWebStarttimeId)).datetimepicker();
			$("#"+(webtimeNum + crWebStoptimeId)).datetimepicker();
	});
	
	$("#dyinput_UserGroup_Add").click(function(){
			var preUserTypeName = $("#dyinput_UserGroup ul li:nth-last-child(3) :input").attr("name");

			var UserNum = preUserTypeName == undefined ? "0":(parseInt(preUserTypeName.substring(0, 1)) + 1).toString();
			$('<li> \
      	<label for="'+UserNum+'_uc_Body_UserType_SE1">用户类型'+UserNum+':</label>\
      	<select name="'+UserNum+'_uc_Body_UserType_SE1" class="c-change-next"> \
      		<option value="\\x01" selected="selected">账户用户</option> \
      		<option value="\\x02">IP地址段用户</option> \
			<option value="\\x03">根据链路添加</option> \
       		<option value="\\x04">根据BARS_IP添加</option> \
      	</select> \
        </li> \
        <li> \
      	<label for="'+UserNum+'_uc_Body_UserNameLength_CN1">用户名长度'+UserNum+':</label> \
      	<input type="text"  name="'+UserNum+'_uc_Body_UserNameLength_CN1" class="cw100"> \
      	</li> \
      	<li> \
      	<label for="'+UserNum+'_uc_Body_UserName_CH0">用户名'+UserNum+':</label> \
      	<input type="text" name="'+UserNum+'_uc_Body_UserName_CH0" class="cw100"> \
      	</li>'
			).appendTo($("#dyinput_UserGroup ul"));
	});
//动态添加应用自定义协议keyword字段
	$("body").on("click", ".dyinput_Keyword_Add", function(){
			var TempName = $( this ).prev().children("ul").children("li:nth-last-child(4)").children("select").attr("name");
			var test = $( this ).prev().children("ul").find("select");
			console.log(test);
			var UDefinedAppName = $( this ).prev().prev().children("li:first").children("select").attr("name");
			var TempNameArray = new Array();
			var TempUDefinedAppNameArray = new Array();
			TempNameArray = TempName.split("_");
			TempAppNameArray = UDefinedAppName.split("_");
			var KeywordNameNum = TempName == undefined ? "0" : (parseInt(TempNameArray[1]) + 1).toString();
			var UserDefinedAppNameNum = UDefinedAppName == undefined ? "0" :TempAppNameArray[0];
			var OffsetBase = "_uc_Body_U_OffsetBase_SE1";
			var Offset = "_uc_Body_U_Offset_NU1";
			var KWLength = "_uc_Body_U_KWLength_NU1";
			var KWValue = "_uc_Body_U_KWValue_CH0";
			$('<li> \
		<label for="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_OffsetBase_SE1">偏移起始位置'+UserDefinedAppNameNum+'_'+KeywordNameNum+'(U_OffsetBase):</label> \
		<select name="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_OffsetBase_SE1" class="cw80"> \
	    		<option value="\\x00">从TCP/UDP载荷头起算</option> \
	    		<option value="\\x01">从TCP/UDP载荷尾倒算</option> \
	    </select> \
		</li> \
		<li> \
		<label for="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_Offset_NU1">偏移量'+UserDefinedAppNameNum+'_'+KeywordNameNum+'(U_Offset):</label> \
		<input type="text" name="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_Offset_NU1" value="1" class="100"> \
		</li> \
		<li> \
		<label for="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_KWLength_NU1">关键字长度'+UserDefinedAppNameNum+'_'+KeywordNameNum+'(U_KWLength):</label> \
		<input type="text" name="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_KWLength_NU1" value="1" class="cw40"> \
		</li> \
		<li> \
		<label for="'+UserDefinedAppNameNum+'_'+KeywordNameNum+'_uc_Body_U_KWValue_CH0">关键字段值'+UserDefinedAppNameNum+'_'+KeywordNameNum+'(U_KWValue):</label> \
		<input type="text" name="0_0_uc_Body_U_KWValue_CH0" value="1" class="cw100"> \
		</li>').appendTo($( this ).prev().children("ul"));
	});
	//动态添加应用自定义协议
	$("#dyinput_Signature_Add").click(function(){
			var AppName = $("#dyinput_Signature ul li:nth-last-child(6) :input").attr("name");
			var TempAppNameArray = new Array;
			TempAppNameArray = AppName.split("_");
			var AppNameNum = AppName == undefined ? "0" : (parseInt(TempAppNameArray[0]) + 1).toString();
			var patt = /(\"|[u\4e00-\u9fa5])[0-9]*_/g
			patt.compile(patt);
			var dyAppKeyword =$.parseHTML($("#dyinput_Signature").children("div:last").html().replace(patt, "$1"+AppNameNum+"_"));
		$('<ul>\
			<li>\
			<label for="'+AppNameNum+'_uc_Body_U_Protocol_SE1">协议类型'+AppNameNum+'(U_Protocol):</label>\
			<select name="'+AppNameNum+'_uc_Body_U_Protocol_SE1">\
	    		<option value="\\x06">TCP</option>\
	    		<option value="\\x11">UDP</option>\
			</select>\
			</li>\
			<li>\
      		<label for="'+AppNameNum+'_uc_Body_U_IPAdd_Length_SE1">应用服务器IP长度'+AppNameNum+'(U_IPAdd_Length):</label>\
			<select name="'+AppNameNum+'_uc_Body_U_IPAdd_Length_SE1">\
				<option value="\\x04">IPv4</option>\
				<option value="\\x10">IPv6</option>\
			</select>\
			</li>\
			<li>\
      		<label for="'+AppNameNum+'_uc_Body_U_SourceIP_IPx">源IP地址'+AppNameNum+'(U_SourceIP):</label>\
			<input type="text"  name="'+AppNameNum+'_uc_Body_U_SourceIP_IPx" value="255.255.255.255"  class="cw100"></li>\
			<li>\
      		<label for="'+AppNameNum+'_uc_Body_U_SourcePort_NU2">源端口'+AppNameNum+'(U_SourcePort):</label>\
			<input type="text"  name="'+AppNameNum+'_uc_Body_U_SourcePort_NU2" value="0"  class="cw40"></li>\
			<li>\
      		<label for="'+AppNameNum+'_uc_Body_U_DestIP_IPx">目的IP地址'+AppNameNum+'(U_DestIP):</label>\
			<input type="text"  name="'+AppNameNum+'_uc_Body_U_DestIP_IPx" value="255.255.255.255" class="cw100"></li>\
			<li>\
      		<label for="'+AppNameNum+'_uc_Body_U_DestPort_NU2">目的端口'+AppNameNum+'(U_SourcePort):</label>\
			<input type="text"  name="'+AppNameNum+'_uc_Body_U_DestPort_NU2" value="0"  class="cw40"></li>\
			<li>\
			<label for="'+AppNameNum+'_uc_Body_U_KW_NUMs_NU1">关键字个数'+AppNameNum+'(U_KW_NUMs):</label>\
			<input type="text" name="'+AppNameNum+'_uc_Body_U_KW_NUMs_NU1" value="1" class="cw40"></li>\
			</ul><div style="background-color: #D0F194"></div><a href="#" class="dyinput_Keyword_Add" style="margin-left:5px;">增加关键字</a><a href="#" class="dyinput_Keyword_Del" style="margin-left:5px;">删除关键字</a>').appendTo("#dyinput_Signature");
		$("#dyinput_Signature div:last").append(dyAppKeyword);
			
	});
	//增加SrcArea
	$("#dyinput_SrcArea_Add").click(function(){
			var SrcAreaName = $("#dyinput_SrcArea ul li:nth-last-child(1) :input").attr("name");
			var TempSrcAreaNameArray = new Array();
			TempSrcAreaNameArray = SrcAreaName == undefined ? new Array("0"):SrcAreaName.split("_");
			var SrcAreaNum = SrcAreaName == undefined ? "0": (parseInt(TempSrcAreaNameArray[0]) + 1).toString();
		$('<ul><li>\
      	<label for="'+SrcAreaNum+'_uc_Body_Src_AreaGroup_ID_NU2">源区域组ID'+SrcAreaNum+':</label>\
       <input type="text"  name="'+SrcAreaNum+'_uc_Body_Src_AreaGroup_ID_NU2" value="1" class="cw40">\
	    </li>\
		<li>\
       <label for="'+SrcAreaNum+'_uc_Body_AS_Num_NU1">AS的个数'+SrcAreaNum+':</label>\
       <input type="text"  name="'+SrcAreaNum+'_uc_Body_AS_Num_NU1" value="1" class="cw40 dychange_next_li_0">\
	   </li>\
	   	<li>\
       <label for="'+SrcAreaNum+'_uc_Body_AS_ID_NU4">AS号'+SrcAreaNum+':</label>\
       <input type="text"  name="'+SrcAreaNum+'_uc_Body_AS_ID_NU4" value="1" class="cw40">\
	   </li></ul>\
	   <ul><li>\
       <label for="'+SrcAreaNum+'_uc_Body_Area_Num_NU1">Area区域个数'+SrcAreaNum+':</label>\
       <input type="text"  name="'+SrcAreaNum+'_uc_Body_Area_Num_NU1" value="1" class="cw40 dychange_next_li_1">\
	   </li>\
	   <li>\
       <label for="'+SrcAreaNum+'_uc_Body_Area_Name_Length_CN1">Area_Name长度'+SrcAreaNum+':</label>\
       <input type="text"  name="'+SrcAreaNum+'_uc_Body_Area_Name_Length_CN1" value="1" class="cw40">\
	   </li>\
	   <li>\
       <label for="'+SrcAreaNum+'_uc_Body_Area_Name_CH0">Area_Name'+SrcAreaNum+':</label>\
       <input type="text"  name="'+SrcAreaNum+'_uc_Body_Area_Name_CH0" value="1" class="cw80">\
	   </li></ul>').appendTo("#dyinput_SrcArea ul");
	});
	$("#dyinput_DestArea_Add").click(function(){
			var DestAreaName = $("#dyinput_DestArea ul li:nth-last-child(6) :input").attr("name");
			var TempDestAreaNameArray = new Array();
			TempDestAreaNameArray = DestAreaName == undefined ? new Array("0"):DestAreaName.split("_");
			var DestAreaNum = DestAreaName == undefined ? "0": (parseInt(TempDestAreaNameArray[0]) + 1).toString();
		$('<ul><li>\
      	<label for="'+DestAreaNum+'_uc_Body_Src_AreaGroup_ID_NU2">源区域组ID'+DestAreaNum+':</label>\
       <input type="text"  name="'+DestAreaNum+'_uc_Body_Src_AreaGroup_ID_NU2" value="1" class="cw40">\
	    </li>\
		<li>\
       <label for="'+DestAreaNum+'_uc_Body_AS_Num_NU1">AS的个数'+DestAreaNum+':</label>\
       <input type="text"  name="'+DestAreaNum+'_uc_Body_AS_Num_NU1" value="1" class="cw40 dychange_next_li_0">\
	   </li>\
	   	<li>\
       <label for="'+DestAreaNum+'_uc_Body_AS_ID_NU4">AS号'+DestAreaNum+':</label>\
       <input type="text"  name="'+DestAreaNum+'_uc_Body_AS_ID_NU4" value="1" class="cw40">\
	   </li></ul>\
	   <ul><li>\
       <label for="'+DestAreaNum+'_uc_Body_Area_Num_NU1">Area区域个数'+DestAreaNum+':</label>\
       <input type="text"  name="'+DestAreaNum+'_uc_Body_Area_Num_NU1" value="1" class="cw40 dychange_next_li_1">\
	   </li>\
	   <li>\
       <label for="'+DestAreaNum+'_uc_Body_Area_Name_Length_CN1">Area_Name长度'+DestAreaNum+':</label>\
       <input type="text"  name="'+DestAreaNum+'_uc_Body_Area_Name_Length_CN1" value="1" class="cw40">\
	   </li>\
	   <li>\
       <label for="'+DestAreaNum+'_uc_Body_Area_Name_CH0">Area_Name'+DestAreaNum+':</label>\
       <input type="text"  name="'+DestAreaNum+'_uc_Body_Area_Name_CH0" value="1" class="cw80">\
	   </li></ul>').appendTo("#dyinput_DestArea");
	});
	//删除SrcArea
	$("#dyinput_SrcArea_Del").click(function(){
			for (var i=1; i <= 2 ; i++ )
			{
				$("#dyinput_SrcArea ul:nth-last-child(1)").remove();
			}
	});
	$("#dyinput_DestArea_Del").click(function(){
			for (var i=1; i <= 2 ; i++ )
			{
				$("#dyinput_DestArea ul:nth-last-child(1)").remove();
			}
	});
	//动态改变字段
	$("body").on("change", ".dychange_next_li_1", function(){
			var val = $(this).val();
			var nextAllem = $( this ).parent().nextAll();
			var nextem = $( this ).parent().next();
			var ffather = $( this ).parent().parent();
			if (val == "0")
			{
				nextAllem.remove();
			} else if (nextAllem.length/2 < parseInt(val) ){
					for (var i = 1; i <= parseInt(val) - nextAllem.length/2; i++)
					{
								var num = (parseInt(val) + i).toString();
							   $('<li>\
								<label for="'+num+'_uc_Body_Area_Name_Length_CN1">Area_Name长度'+num+':</label>\
								<input type="text"  name="'+num+'_uc_Body_Area_Name_Length_CN1" value="1" class="cw40">\
								</li>\
								<li>\
								<label for="'+num+'_uc_Body_Area_Name_CH0">Area_Name'+num+':</label>\
								<input type="text"  name="'+num+'_uc_Body_Area_Name_CH0" value="1" class="cw80">\
								</li>').appendTo(ffather);
					}
			} else if (nextAllem.length/2 > parseInt(val)){
				for (var i = 0; i < nextAllem.length/2 - parseInt(val); i++ )
				{
					$(this).parent().next().remove();
					$(this).parent().next().remove();
				}
			}
	}).trigger("change");
	$("body").on("change", ".dychange_next_li_0", function(){
			var val = $(this).val();
			var nextAllem = $( this ).parent().nextAll();
			var nextem = $( this ).parent().next();
			var ffather = $( this ).parent().parent();
			if (val == "0")
			{
				nextAllem.remove();
			} else if (nextAllem.length < parseInt(val) ){
					for (var i = 1; i <= parseInt(val) - nextAllem.length; i++)
					{
								var num = (parseInt(val) + i).toString();
							   $('<li>\
								<label for="'+num+'_uc_Body_AS_ID_NU4">AS号'+num+':</label>\
								<input type="text"  name="'+num+'_uc_Body_AS_ID_NU4" value="1" class="cw40">\
								</li>').appendTo(ffather);
					}
			} else if (nextAllem.length > parseInt(val)){
				for (var i = 0; i < nextAllem.length - parseInt(val); i++ )
				{
					$(this).parent().next().remove();
				}
			}
	}).trigger("change");
	//删除自定义协议keyword
	$("body").on("click", ".dyinput_Keyword_Del", function(){
			for (var i = 1; i <= 4 ; i++)
			{
				$( this ).prev().prev().children("ul").children("li:last").remove();
			}
	});
	//删除自定义应用
	$("#dyinput_Signature_Del").click(function(){
			$("#dyinput_Signature .dyinput_Keyword_Add:last").remove();
			$("#dyinput_Signature .dyinput_Keyword_Del:last").remove();
			$("#dyinput_Signature div:last").remove();
			for (var i = 1; i <= 6 ; i++ )
			{
				$("#dyinput_Signature ul:last li:nth-last-child(1)").remove();
			}
			
	});
	$("#dyinput_UserGroup_Del").click(function(){
			for (var i =1 ; i <= 3 ; i++)
			{
				$("#dyinput_UserGroup ul li:nth-last-child(1)").remove();
			}
	});
	
	$("#dyinput_CWebType_Del").click(function(){
			$("#dyinput_CWebType ul li:nth-last-child(1)").remove();
	});
	$("#dyinput_Webtime_Del").click(function(){
				for (var i = 1; i <= 2 ; i++ )
				{
					$("#dyinput_Webtime ul li:nth-last-child(1)").remove();
				}
	});
    $("#dyinput_IP_Del").click(function(){
    			for(var i = 1; i <= 3; i++) {
    					$("#dyinput_IP ul li:nth-last-child(1)").remove();
    			}	
    	});
    $("#dyinput_Message_Del").click(function(){
    			for (var i = 1; i <= 2; i++ ) {
    					$("#dyinput_Message ul li:nth-last-child(1)").remove();
    			}
    	});
    $("#dyinput_Time_Del").click(function(){
    			for (var i = 1; i <= 2; i++ ) {
    					$("#dyinput_Time ul li:nth-last-child(1)").remove();
					}
    	});	
	$("#dyinput_SearchEngine_Del").click(function(){
    			for (var i = 1; i <= 2; i++ ) {
    					$("#dyinput_SearchEngine ul li:nth-last-child(1)").remove();
					}
    	});
	$("#dyinput_CookieHost_Del").click(function(){
    			for (var i = 1; i <= 4; i++ ) {
    					$("#dyinput_CookieHost ul li:nth-last-child(1)").remove();
					}
    	});
	$("form").find("a[name=Modifier_Add]").click(function(){
				addModifier($(this).parents("form"));	
	});
	
	$("form").find("a[name=Modifier_Del]").click(function(){
    			delModifier($(this).parents("form"));
    });
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    //add by liudawei to handler Uc_traffic_Packet String
    //捕获按钮动作，发送数据

    $("form").on("submit", function(e) {
        if ($(this).checkForm(0,2)){
            ucTrafficPacket($(this));
        } else {
            e.preventDefault();
            alertDialog("uc_IP&uc_Port不能为空");
        }
        return false;
    });
    
   	$("input[value='生成发送队列']").click(function(e){
   		  if ($(this).parents("form").checkForm(0,2)){
            ucTrafficPacketQueue($( this ).parents("form"));
        } else {
            e.preventDefault();
            alertDialog("uc_IP&uc_Port不能为空");
        }
        return false;
   		});
   	$("input[value='发送']").click(function(e){
   		  if ($(this).parent().find("input[type='hidden']").length != 0){
            ucTracfficPacketQueueSend($( this ).parent());
        } else {
            e.preventDefault();
            alertDialog("发送队列不能为空");
        }
        return false;
   		});		
    updater.start();
});
//增加Modifier
function addModifier(selector) {
		var upMdOptionName = $(selector).children("ul").children("li:nth-last-child(1)").children(":input").attr("name");
		var ucMdOptionText = ''
	
		if (upMdOptionName.substring(1) != "_uc_Modifier_MDx") {
					var crMdOptionName = "_uc_Modifier_MDx";
					var crMdStepName = "_uc_Modifier_step";
					var crMdNum = "0";
		} else {
					var crMdStepName = $(selector).children("ul").children("li:nth-last-child(1)").children(":input:nth-last-child(1)").attr("name").substring(1);
					var crMdOptionName = upMdOptionName.substring(1);
					var crMdNum = (parseInt(upMdOptionName.substring(0, 1)) + 1).toString();
		}
		
		var checkedbox = $(selector).children("ul").find(":input[type=checkbox]").prop("checked");
		if (checkedbox)
		{
			var ucconfigNum = $(selector).children("ul").find(":input").length;
		} else {
			var ucconfigNum = $(selector).children("ul").find(":input").length - 1;
		}	 
		var ucMdOptionValue = '';
		var ucMdOptionText = '';
		//取得ucpacket各个字段name
		var fields = $(selector).serializeArray()
		for (var i = ucconfigNum; i < fields.length - 2; i++) {
					ucMdOptionText = $(selector).find("label[for='" + fields[i].name + "']").text().substring(0, $(selector).find("label[for='" + fields[i].name + "']").text().length - 1);
					ucMdOptionValue += '<option value="' + fields[i].name + '">' + ucMdOptionText + '</option>';
			}
		var md_num = ''
		//判断是否为第一次，如果是增加“变换次数”
		if (upMdOptionName =="uc_Random" ) {
				$(selector).children("ul").append('<li><label for="uc_Modifier_count">变换次数:</label><input type="text" name="uc_Modifier_count" class="cw100 garlic-auto-save"></li>')		
		} else {
				$(selector).children("ul").append('<li><label>Modifier:</label><select name='+ crMdNum + crMdOptionName + ' class="cw80 garlic-auto-save">' + ucMdOptionValue + '</select><label>步长:</label><input type="text" name='+ crMdNum + crMdStepName +'  class="cw40 garlic-auto-save"/></li>');		
		}
	}
//删除Modifier
function delModifier(selector) {
			var crMdOptionName = $(selector).children("ul").children("li:nth-last-child(1)").children(":input").attr("name");
			if (crMdOptionName.substring(1) == "_uc_Modifier_MDx" ||crMdOptionName == "uc_Modifier_count" ) {
						$(selector).children("ul").children("li:nth-last-child(1)").remove();
			}
	}
//验证提示信息框
function alertDialog(msg, width, height) {
    var w = width || 300;
    var h = height || 200;
    var alertDiv = $("<div title='提示'></div>").appendTo($("BODY"));
    var content = alertDiv.text(msg);
    alertDiv.dialog({
        autoOpen: true,
        height: h,
        width: w,
        modal: true,
        close: function(event, ui) {
            alertDiv.dialog("destroy");
            alertDiv.html("").remove();
        }});
}
function newUcpacket(form) {
    var Ucpacket = form.formToDict();
    updater.socket.send(JSON.stringify(Ucpacket));
    form.find("textarea[type=text]").val("").select();
};

//add by liudw 生成发送队列
function ucTrafficPacketQueue(form) {
	var checkedbox = form.children("ul").find(":input[type=checkbox]").prop("checked");
	if (checkedbox)
	{
		var ucconfigNum = form.children("ul").find(":input").length;
	} else {
		var ucconfigNum = form.children("ul").find(":input").length - 1;
	}
    var uctraPac = form.ucPacketFormat(ucconfigNum, 7);
    var queueTitle = $("h3[for='" + form.parent().attr("id") + "']").text()
    $("#uc_packet_queue").children("div").append('<div class="portlet ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"><div class="portlet-header ui-widget-header ui-corner-all"><span class="close-icon ui-icon ui-icon-closethick"></span><span class="plus-icon ui-icon ui-icon-plusthick"></span>' + queueTitle + '</div><div class="portlet-content" style="display:none;"><input type="hidden" name="' + queueTitle + '" value=' + JSON.stringify(uctraPac) + '></div></div>');
		//alert($("#1").attr("value"));
};

//add by liudw 将队列发送出去
function ucTracfficPacketQueueSend(form) {
		var fields = form.serializeArray();
		for(var i=0; i < fields.length; i++) {
				updater.socket.send(fields[i].value);	
		}
};

//add by liudawei 
//将form数据转换为json格式通过websocket发送出去
function ucTrafficPacket(form) {
	var checkedbox = form.children("ul").find(":input[type=checkbox]").prop("checked");
	if (checkedbox)
	{
		var ucconfigNum = form.children("ul").find(":input").length;
	} else {
		var ucconfigNum = form.children("ul").find(":input").length - 1;
	}
	
    var uctraPac = form.ucPacketFormat(ucconfigNum, 7);
    updater.socket.send(JSON.stringify(uctraPac));
};

jQuery.fn.formToDict = function() {
    var fields = this.serializeArray();
    var json = {}
    for (var i = 0; i < fields.length; i++) {
        json[fields[i].name] = fields[i].value;
    }
    if (json.next) delete json.next;
    return json;
};

//将form内input和select表单变为json类型的数组
//格式为[{"name":"form_name0","value":"form_value0"},{"name":"form_name1","value":"form_value1"}]
//其中key name为表单的name字段，key value为表单的数据，遍历该数组
//然后组成json格式数据返回，uc_header和uc_body数据组成一个十六进制字符串
//add by liudawei format uc_packet to json
jQuery.fn.ucPacketFormat = function (ucconfigNum, ucheaderNum) {
		var fields = this.serializeArray();
		var uc_header = new Array();
		var uc_body = new Array();
		var uc_header_length = 0;
		var uc_body_length = 0;
		var temp = new Array();
		var json = {};
		var json_modifier = {};
		var json_modifier_temp = {};
		var k = 0;
		var invlid_em = 0;
		//uc地址配置和发包方式存入json
		for (var i = 0; i < fields.length; i++) {
				var patten_attr = fields[i].name.substring(fields[i].name.length-4, fields[i].name.length-1);
				var patten_len = fields[i].name.substring(fields[i].name.length-1);
				var fname = fields[i].name;
				var fvalue = fields[i].value;
				var randPatten = "";
				var json_temp={};
				for (var j = 0; j < parseInt(patten_len); j++) {
						randPatten += "gg";
				}			
				if (i < ucconfigNum) {						
						switch (patten_attr)
						{
						case "_MD":
								if (fields[i - 1].value != ""){
										json_temp[fname]= fvalue;
										i++;
										json_temp[fields[i].name] = fields[i].value;
										json_modifier[k + "_uc_Modifier"] = json_temp;
										json_modifier_temp[k + "uc_Modifier"] = json_temp;
										k++;
								}else {
										i++;
								}
								break;
						default:
								if (fname == "uc_IP")
								{
									var uc_ip_port_array = fvalue.split(":");
									var uc_ip = uc_ip_port_array[0];
									var uc_port = uc_ip_port_array[1];
									json[fname] = uc_ip;
									json["uc_Port"] = uc_port;
								} else {
									json[fname] = fvalue;
								}
						}  
				} else if (i < ucheaderNum+ucconfigNum) { //解析uc报文的header存为16进制的字符串，python可以用decode("hex")函数来解码
						for (var m = 0; m < Object.keys(json_modifier_temp).length; m++) {
								if (fname == json_modifier[m + "_uc_Modifier"][m + "_uc_Modifier_MDx"]) {
										json_modifier[m + "_uc_Modifier"][m + "_uc_Modifier_pos"] = i - ucconfigNum;
										json_modifier[m +"_uc_Modifier"][m + "_uc_Modifier_isheader"] = "uc_header";
										delete json_modifier_temp[m + "_uc_Modifier"];	
								}	
						}
						switch (patten_attr) 
						{
						case "_SE":
								if (fvalue.substring(2) != randPatten) {
									  json_temp[fname] = fvalue.substring(2);
								} else {
										json_temp[fname] = randHexStr(patten_len);
								}	
								break;	
						case "_NU":
								json_temp[fname] = AddZeroToHexStr(fvalue, patten_len);
								break;
						case "_SQ":
								if (fvalue.substring(2) == "00000001" ) {
										var MSeq = $(this).find("input[rel='MessageSeq']").attr("value");
										json_temp[fname] = AddZeroToHexStr(MSeq, patten_len);
										$(this).find("input[rel='MessageSeq']").attr("value",  (parseInt(MSeq) + 1).toString());	
								} else if (fvalue.substring(2) == randPatten) {
										json_temp[fname] = randHexStr(patten_len); 
								} else {
										json_temp[fname] = "00000000";
								}
								break;
						case "_LN":
								if (fvalue != "0") {
										json_temp[fname] = AddZeroToHexStr(fvalue, patten_len);
								} else {//当body长度自动计算时，将该字段临时填零，后续更新
										json_temp[fname] = "00000000";	
								}
								break;
						case "_CH":
								if (patten_len == "0") {
										json_temp[fname] = stringToHexChrStr(fvalue);
								} else {//方便调试，当为CH时，patten_len必须为0，不为零，发送error
										json_temp[fname] = "error";
								}
								break;
						default :
								json[fname] = fvalue;
						}
						
						uc_header.push(json_temp);
						uc_header_length += json_temp[fname].length;
				} else {//解析uc报文的body存为16进制的字符串，python可以用decode("hex")		
						for (var n = 0; n < Object.keys(json_modifier_temp).length; n++) {
								if (fname == json_modifier[n + "_uc_Modifier"][n + "_uc_Modifier_MDx"]) {
										var pos = i - (ucconfigNum + ucheaderNum);								
										json_modifier[n + "_uc_Modifier"][n + "_uc_Modifier_pos"] = pos - invlid_em;
										json_modifier[n + "_uc_Modifier"][n + "_uc_Modifier_isheader"] = "uc_body";
										delete json_modifier_temp[n + "_uc_Modifier"];		
								}	
						}	
						switch (patten_attr) 
						{
						case "_SE":			
								if (fvalue.substring(2) != randPatten) {
										json_temp[fname] = fvalue.substring(2);
								} else {
										json_temp[fname] = randHexStr(patten_len);
								}
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
								break;
						case "_NU":
								if (fvalue == "")
								{
										invlid_em += 1;
										break;

								} else {
										json_temp[fname] = AddZeroToHexStr(fvalue, patten_len);
										if (i < fields.length - 2) {
												uc_body.push(json_temp);	
												uc_body_length += json_temp[fname].length;
										}
										break;
								}
						case "_NM":
								if (fvalue == "")
								{
									invlid_em += 1;
									break;
								} else {
									var temp_value =  AddZeroToHexStr(fvalue, patten_len);
									json_temp[fname] = AddZeroToHexStr((temp_value.length/2 + 2).toString(), 1) + temp_value;
									if (i < fields.length - 2) {
												uc_body.push(json_temp);	
												uc_body_length += json_temp[fname].length;
										}
								}

								break;
						case "_CH":
								if (fvalue == "")
								{
										invlid_em += 1;
										break;
								} else {
										var temp_value = stringToHexChrStr(fvalue);
										if (patten_len == "0") {
											json_temp[fname] = temp_value;	
										} else {
											json_temp[fname] = AddZeroToHexStr((temp_value.length/2 + 2).toString(), 1) + temp_value;
										} 
										if (i < fields.length - 2) {
												uc_body.push(json_temp);	
												uc_body_length += json_temp[fname].length;
										}
										break;
								}	
						case "_CZ":
								if (fvalue == "")
								{
									fvalue = "0";
								}
								json_temp[fname] = AddZeroToChar(stringToHexChrStr(fvalue), patten_len);
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
								break;
						case "_TI":
								if (fvalue == "0") {
											json_temp[fname] = "00000000";
								}else if(fvalue == "1") {
											json_temp[fname] = "ffffffff";	
								} else {
											json_temp[fname] = UTCtoHexStr(fvalue);
								}
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
								break;
						case "_SN":
								if (fvalue == "")
								{
										invlid_em += 1;
										break;
								} else {
										json_temp[fname] = fvalue.substring(2);
										if (i < fields.length - 2) {
												uc_body.push(json_temp);	
												uc_body_length += json_temp[fname].length;
										}
										break;
								}							
						case "_IP":	
								if (fvalue == "")
								{
										invlid_em += 1;
										break;
								} else {
										var temp_ip = "";
										if (patten_len == "x")
										{
												if (fields[i-1].value.substring(2) == "04" || fields[i-3].value.substring(2) == "04")	{
															temp =fvalue.split(".");
															if (temp.length == 1 && temp[0] == "") {
																		temp = ["0","0","0"];
																}
															for (var k = 0; k < temp.length; k++) {
																	temp_ip += AddZeroToHexStr(temp[k], 1);	
															}
															json_temp[fname] = temp_ip;
												} else if (fields[i-1].value.substring(2) == "10" || fields[i-3].value.substring(2) == "10") {
															temp = fvalue.split(":");
															if (temp.length == 1 && temp[0] == "") {
																		temp = ["0000","0000","0000","0000","0000","0000","0000","0000"];
															}
															for (var k = 0; k < temp.length; k++) {
																  temp_ip += temp[k];	
															}	
															json_temp[fname] = temp_ip;
												}
										} else if (patten_len == "y") {
												temp =fvalue.split(".");
												if (temp.length == 1 && temp[0] == "") {
															temp = ["0","0","0"];
												}
												for (var k = 0; k < temp.length; k++) {
															temp_ip += AddZeroToHexStr(temp[k], 1);	
												}
												json_temp[fname] = temp_ip;												
										} else{
												temp =fvalue.split(".");
												if (temp.length == 1 && temp[0] == "") {
															temp = ["0","0","0"];
												}
												for (var k = 0; k < temp.length; k++) {
															temp_ip += AddZeroToHexStr(temp[k], 1);	
												}
												json_temp[fname] = AddZeroToHexStr((temp_ip.length/2 + 2).toString(), 1) + temp_ip;												
										
										}
										
										if (i < fields.length - 2) {
												uc_body.push(json_temp);	
												uc_body_length += json_temp[fname].length;
										}
										break;
								}																			
						case "_CN":
						//此处没有根据前一个表单数据判断该表单数据长度，用于测试两者不匹配情况						
								if (fvalue == "") {
										fvalue = "0";	
								}
								json_temp[fname] = AddZeroToHexStr(fvalue, patten_len);
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
								break;
						case "_IN":
						//此处不继续往下判断，改为按钮触发增加后续表单数据量，用于测试两者不匹配情况
								if (fvalue == "") {
										fvalue = "0";	
								}
								json_temp[fname] = AddZeroToHexStr(fvalue, patten_len);
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
				    		break;
						case "_SQ":
								//var MSerNo = $(this).find("input[rel='MessageSerialNo']").attr("value");
								json_temp[fname] = AddZeroToHexStr(fvalue, patten_len);
								//$(this).find("input[rel='MessageSerialNo']").attr("value", (parseInt(MSerNo) + 1).toString());
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
								break;
						default:
								json[fname] = fvalue;
								if (i < fields.length - 2) {
										uc_body.push(json_temp);	
										uc_body_length += json_temp[fname].length;
								}
						}

				}
		}
		//增加Modifier到json
		if (jQuery.isEmptyObject(json_modifier) == false) {
				json["uc_Modifier"] = json_modifier;
		}		
		//计算uc的报文长度
		if ($(this).find("input[name='uc_Header_MessageLen_LN4']").attr("value") == "0") {
				var uc_MessageLen = AddZeroToHexStr(uc_body_length/2	+ (uc_header_length)/2, 4);
				var json_temp = {};
				uc_header[uc_header.length-1].uc_Header_MessageLen_LN4 = uc_MessageLen;
				json["uc_header"] = uc_header;
		} else {
				json["uc_header"] = uc_header;
		}

    json["uc_body"] = uc_body;
    if (json.next) delete json.next;    
    return json;
	}
//add by liudawei return random toString 16
function randHexStr(patten_len) {
			return AddZeroToHexStr(Math.floor(Math.random()*Math.pow(16,parseInt(patten_len))), patten_len);
	}
//add by liudawei format UTC time toString 16
function UTCtoHexStr (str) {
		 var temp = new Array();
		 var tem1 = new Array();
		 temp = str.split(" ");
		 temp1 = temp[0].split("/");
		 var year = temp1[2];
		 var month = (parseInt(temp1[0]) - 1).toString();
		 var day = temp1[1];
		 temp1 = temp[1].split(":");
		 var hour = temp1[0];
		 var minutes = temp1[1];
		 if (year < 1970) { 
		 		var UTCs = 0;
		 }else {
		 		var datnum = new Date(Date.UTC(year, month, day, hour, minutes));
                var d = new Date();
                var UTCs = datnum.getTime()/1000.0 + d.getTimezoneOffset()*60;
		 }
		 return AddZeroToHexStr(UTCs.toString(), 4);
		 		
};

//add by liudawei 16进制数字自动高位补零,返回16进制字符串
function AddZeroToHexStr (str, byteLen) {
		var val="";
		var hexstr = parseInt(str).toString(16);
		if (str == "") {
				hexstr = "0";
			}
		if (parseInt(byteLen)*2 > hexstr.length) {
				for (var i = 0; i< parseInt(byteLen)*2 - hexstr.length; i++) {
						val += "0";
					}
			}
		val += hexstr;
		return val;
	};

//add by liudawei char字符串高位补零
function AddZeroToChar (hexstr, byteLen) {
		var val="";
		if (hexstr == "" || hexstr == "30") {
				hexstr = "0";
			}
		if (parseInt(byteLen)*2 > hexstr.length) {
				for (var i = 0; i< parseInt(byteLen)*2 - hexstr.length; i++) {
						val += "0";
					}
			}
		val = hexstr + val;
		return val;
	};
//add by liudawei check form input 
jQuery.fn.checkForm = function(start, end) {
    var fields = this.serializeArray();
    for (var i = start; i < end; i++) {
        if (fields[i].value == "") {
            return false;
        }
    }
    return true;
};

function stringToHexChrStr(str){
    var val="";
    for (var i = 0; i < str.length; i++) {
        if (val == "") {
			val = str.charCodeAt(i).toString(16);
       //计划ip需要去除点，貌似没用，导致网站转化错误
	   //} else if (str.charAt(i) == ".") {
       //     i++;
        } else {
            val += str.charCodeAt(i).toString(16);
        }
    }
    return val;
};
var updater = {
    socket: null,

    start: function() {
        var url = "ws://" + location.host + "/ucsocket";
        if ("WebSocket" in window) {
	        updater.socket = new WebSocket(url);
        } else {
            updater.socket = new MozWebSocket(url);
        }
	updater.socket.onmessage = function(event) {
	    updater.showMessage(JSON.parse(event.data));
	}
    },

    showMessage: function(message) {
        if (message.mtype == "uc_resp") {    	
   //     		var uc_resp_existing = $("#m" + message.id);
   //     		if (uc_resp_existing.length > 0) return;
       		 	var node = $(message.html);
        		node.hide();
				if ($("#uc_ack div").length > 300) {
					$("#uc_ack div").remove();
                }
        		$("#uc_ack").append(node);
        		node.slideDown();
      	} else if (message.mtype == "ud_recv") {
     //   		var ud_recv_existing = $("#d" + message.id);
     //   		if (ud_recv_existing.length > 0) return;
        		var node = $(message.html);
        		node.hide();
				if ($("#ud_show div").length > 300) {
					$("#ud_show div").remove();
                }
        		$("#ud_show").append(node);
                node.slideDown();
      	} else if (message.mtype == "uc_ip")
		{		
				var uc_ip_existing = $("#m" + message.body);
				if ( uc_ip_existing.length > 0)
				{
					return;
				}
				var node = $(message.html);
				$(":input[name=uc_IP]").append(node);
		}
    }
};
