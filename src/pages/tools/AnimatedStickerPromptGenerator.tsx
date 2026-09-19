import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

type AnimatedThemeKey =
  | "businessPersonal"
  | "smallShopSupport"
  | "taiwanesePhrase"
  | "drinkShop"
  | "breakfast"
  | "nail"
  | "customerService"
  | "realtor"
  | "insuranceAdvisor"
  | "festivalDragonBoat"
  | "festivalMidAutumn"
  | "festivalLunarNewYear"
  | "festivalChristmas"
  | "festivalValentine"
  | "festivalMothersDay"
  | "festivalFathersDay"
  | "festivalHalloween";

type StickerCount = "8" | "16" | "24";
type NameMode = "none" | "person" | "shop";
type MotionStyle = "micro" | "bounce" | "expression" | "gesture" | "textPop";
type MotionPower = "soft" | "standard" | "active";
type PhotoMode = "original" | "realPerson";
type TextColor =
  | "blackWhite"
  | "blueWhite"
  | "orangeWhite"
  | "greenWhite"
  | "colorfulWhite";
type TextPosition = "top" | "bottom" | "mixed";

type AnimatedTemplate = {
  label: string;
  role: string;
  visualStyle: string;
  texts: string[];
  motions: string[];
};

const KOFI_SHOP_URL = "https://ko-fi.com/s/62381d787d";
const LINE_STICKER_STORE_URL = "https://store.line.me/stickershop/product/33968282/zh-Hant";
const SUPPORT_TW_URL = "https://p.ecpay.com.tw/FD7CD6D";
const SUPPORT_KOFI_URL = "https://ko-fi.com/ang2289";
const CONTACT_EMAIL = "rxv0227@gmail.com";

const themes: Record<AnimatedThemeKey, AnimatedTemplate> = {
  festivalDragonBoat: {
    label: "端午節動態貼圖",
    role: "一位可愛節慶角色，可以是小粽子、龍舟小隊長、原創吉祥物或可愛店長，搭配粽子、龍舟、香包、艾草與荷葉",
    visualStyle: "Q版可愛、台灣節慶感、清爽喜氣、適合端午節祝福、聊天互動與店家節慶宣傳",
    texts: [
      "端午安康",
      "端午快樂",
      "粽子吃了嗎",
      "送你一顆粽",
      "粽意你",
      "好運接粽來",
      "划龍舟加油",
      "香包送祝福",
      "今天吃粽",
      "平安健康",
      "端午來報到",
      "福氣滿滿",
      "粽香飄飄",
      "佳節愉快",
      "一起吃粽吧",
      "好事接粽而來",
      "平安順心",
      "粽夏好心情",
      "午安安康",
      "端午祝福送給你",
      "粽子出爐",
      "龍舟衝啊",
      "艾草平安",
      "端午限定",
    ],
    motions: [
      "角色抱著粽子左右輕搖，文字輕輕彈出",
      "角色揮手祝福，小粽子從旁邊跳出",
      "粽子蓋子打開冒出香氣，角色眼睛發亮",
      "角色雙手遞出粽子，愛心輕輕浮上",
      "愛心與小粽子繞角色一圈後停住",
      "粽子、星星與好運符號依序彈出",
      "角色做划槳動作，龍舟小圖示往前滑",
      "香包左右搖晃，平安星光閃爍",
      "角色開心咬一口粽子，臉頰發光",
      "角色雙手合十點頭，平安光圈亮起",
      "小粽子從畫面下方跳上來揮手",
      "福字與金色星星由小到大彈出",
      "粽葉輕輕飄動，香氣線條往上升",
      "角色微笑鞠躬，祝福泡泡浮出",
      "兩顆粽子左右跳動，角色拍手",
      "好運箭頭往上升，小粽子跟著跳",
      "角色比讚點頭，平安符號閃一下",
      "夏日小風扇轉動，角色抱粽子微笑",
      "角色拿粽子說午安，太陽小圖示眨眼",
      "祝福卡片展開，角色把卡片推向前",
      "粽子蒸籠冒熱氣，角色開心跳一下",
      "龍舟小隊往前衝，水花左右噴出",
      "艾草葉片輕晃，平安符號發光",
      "限定標籤彈跳，粽子轉一圈停住",
    ],
  },
  festivalMidAutumn: {
    label: "中秋節動態貼圖",
    role: "一位可愛節慶角色，可以是月兔、小店長、原創吉祥物或手拿月餅的角色，搭配滿月、月餅、柚子、燈籠與星光",
    visualStyle: "Q版可愛、溫暖團圓、月光療癒、適合中秋節祝福、聊天互動與店家節慶宣傳",
    texts: [
      "中秋快樂",
      "月圓人團圓",
      "一起吃月餅",
      "柚子來了",
      "賞月囉",
      "祝你平安",
      "月兔送祝福",
      "烤肉開心",
      "月亮好圓",
      "團圓最幸福",
      "月餅吃一口",
      "今晚賞月嗎",
      "好運圓圓",
      "中秋安康",
      "甜甜過中秋",
      "月光祝福你",
      "佳節愉快",
      "祝福滿滿",
      "想你了",
      "平安順心",
      "柚香滿滿",
      "燈籠亮了",
      "月兔跳跳",
      "中秋限定",
    ],
    motions: [
      "滿月慢慢亮起，角色揮手祝福",
      "月亮由小變大，家人小愛心圍繞",
      "角色遞出月餅，月餅輕輕發光",
      "柚子滾進畫面停住，角色拍手",
      "角色抬頭看月亮，星星閃爍",
      "平安符號與小星光依序浮出",
      "月兔跳出來送祝福卡片",
      "烤肉火光輕閃，角色開心比讚",
      "月亮左右微晃，角色驚喜看著它",
      "愛心與圓形光圈慢慢擴散",
      "月餅被切開一小口，香氣線往上升",
      "角色指向天空，問號泡泡變月亮",
      "圓形好運符號轉一圈停住",
      "角色雙手合十，月光灑下來",
      "糖霜星星掉落在月餅上",
      "祝福泡泡從月亮旁浮出",
      "角色鞠躬祝福，燈籠輕晃",
      "祝福字卡彈出，星星亮一下",
      "角色抱著月餅想念，愛心浮出",
      "平安光圈包住角色後淡出",
      "柚子皮小花旋轉，香氣浮上",
      "燈籠亮起後左右晃動",
      "月兔原地跳兩下，星星彈出",
      "限定標籤彈跳，月餅轉一圈",
    ],
  },
  festivalLunarNewYear: {
    label: "新年／過年動態貼圖",
    role: "一位可愛喜氣的節慶角色，可以是原創吉祥物、小店長、財神小助手或穿紅色新年服飾的角色，搭配紅包、春聯、燈籠、金元寶與煙火",
    visualStyle: "Q版可愛、紅金喜氣、熱鬧吉祥、適合過年拜年、聊天祝福與店家新年活動",
    texts: [
      "新年快樂",
      "恭喜發財",
      "紅包拿來",
      "大吉大利",
      "平安順心",
      "好運旺旺來",
      "財源滾滾",
      "開工大吉",
      "拜年囉",
      "福氣滿滿",
      "蛇年行大運",
      "年年有餘",
      "新春愉快",
      "萬事如意",
      "招財進寶",
      "好事發生",
      "新年新希望",
      "初一拜年",
      "祝你發發發",
      "新年祝福送給你",
      "春聯貼好了",
      "燈籠亮了",
      "爆竹一響",
      "過年限定",
    ],
    motions: [
      "角色揮手拜年，紅金星光閃爍",
      "金元寶從旁邊彈出，角色比讚",
      "紅包往前遞出，愛心跳一下",
      "大吉字牌彈出，角色開心點頭",
      "平安光圈慢慢擴散，角色雙手合十",
      "小狗或吉祥物跳出，好運字卡發光",
      "金幣往上跳動，財神小帽閃光",
      "角色拿公事包衝刺，開工標籤彈出",
      "角色鞠躬拜年，春聯左右晃",
      "福字旋轉貼上，星星亮起",
      "生肖小圖示跳出，角色拍手",
      "小魚左右游動，元寶浮出",
      "燈籠亮起，角色笑著揮手",
      "祝福字卡逐字彈出後停住",
      "元寶與金幣繞角色一圈",
      "好事符號從禮盒中跳出",
      "角色拿願望卡，卡片發光",
      "初一日曆翻頁，角色鞠躬",
      "發字連續彈跳三下，金光閃",
      "祝福卡片往前滑出，角色微笑",
      "春聯從上方貼下，角色比 OK",
      "兩盞燈籠左右輕晃",
      "爆竹小圖示閃一下但不過度刺眼",
      "限定標籤彈跳，紅包轉一圈",
    ],
  },
  festivalChristmas: {
    label: "聖誕節動態貼圖",
    role: "一位可愛溫暖的節慶角色，可以是聖誕小精靈、原創吉祥物、小店長或戴聖誕帽的角色，搭配禮物、聖誕樹、雪花、鈴鐺與星星",
    visualStyle: "Q版可愛、溫暖聖誕感、紅綠金配色、適合聖誕祝福、聊天互動與店家節慶活動",
    texts: [
      "聖誕快樂",
      "Merry Christmas",
      "送你禮物",
      "平安夜快樂",
      "聖誕祝福",
      "溫暖過節",
      "一起交換禮物",
      "雪花飄飄",
      "聖誕樹亮了",
      "佳節愉快",
      "祝你平安",
      "驚喜來了",
      "好想你",
      "聖誕派對囉",
      "禮物打包中",
      "暖暖祝福",
      "冬天也要開心",
      "聖誕祝福送給你",
      "幸福滿滿",
      "今天好幸福",
      "鈴鐺響了",
      "薑餅人出現",
      "雪人打招呼",
      "聖誕限定",
    ],
    motions: [
      "角色戴聖誕帽揮手，雪花輕飄",
      "英文字樣輕輕彈出，星星亮起",
      "禮物盒打開，愛心與星星飛出",
      "月亮與星光亮起，角色雙手合十",
      "祝福卡片展開，角色遞出卡片",
      "圍巾輕晃，溫暖光圈擴散",
      "兩個禮物盒左右交換位置",
      "雪花慢慢落下，角色開心抬頭",
      "聖誕樹燈泡依序亮起",
      "角色鞠躬祝福，鈴鐺左右搖",
      "平安星星亮一下，角色比心",
      "驚喜禮盒跳一下，角色眼睛發亮",
      "角色抱著禮物想念，愛心浮出",
      "彩帶從兩側滑入，角色拍手",
      "緞帶綁起，禮物盒發光",
      "祝福泡泡慢慢浮上",
      "雪人旁邊出現小太陽，角色微笑",
      "祝福卡片往前滑出，星光閃爍",
      "愛心與雪花交替彈出",
      "角色開心跳一下，星星冒出",
      "鈴鐺左右搖，音符跳出",
      "薑餅人從旁邊跳出揮手",
      "雪人帽子彈一下，角色揮手",
      "限定標籤彈跳，聖誕球轉一圈",
    ],
  },
  festivalValentine: {
    label: "情人節動態貼圖",
    role: "一位可愛甜美的節慶角色，可以是愛心小天使、情侶角色、原創吉祥物或小店長，搭配愛心、花束、巧克力、卡片與粉紅泡泡",
    visualStyle: "Q版可愛、甜蜜浪漫、粉紅柔和、適合情人節告白、聊天互動與店家活動",
    texts: [
      "情人節快樂",
      "我喜歡你",
      "愛你喔",
      "送你愛心",
      "想你了",
      "抱抱一下",
      "甜甜一整天",
      "你最可愛",
      "巧克力給你",
      "今天約會嗎",
      "心動一下",
      "一起過節吧",
      "滿滿愛心",
      "陪你一整天",
      "喜歡你更多",
      "親一個",
      "謝謝你的愛",
      "幸福冒泡",
      "愛心發射",
      "把祝福送給你",
      "花束來了",
      "卡片寫好了",
      "愛你加倍",
      "情人節限定",
    ],
    motions: [
      "角色比心，愛心從手中彈出",
      "角色害羞低頭，小愛心浮上",
      "愛心左右跳動，角色眨眼",
      "角色把大愛心往前遞出",
      "思念泡泡慢慢升起，角色抱心",
      "角色張開手臂，抱抱線條擴散",
      "糖果星星灑落，角色開心拍手",
      "角色指向對方，星光閃一下",
      "巧克力盒打開，愛心飛出",
      "日曆圈選，角色期待點頭",
      "心跳線條跳一下，角色驚喜",
      "角色牽著小愛心往前走",
      "愛心雨輕輕落下",
      "角色坐在愛心旁邊陪伴，愛心發光",
      "愛心數量變多，角色害羞微笑",
      "飛吻小愛心往前飛",
      "角色鞠躬感謝，愛心圍繞",
      "粉紅泡泡連續冒出",
      "愛心像小箭頭往外飛出",
      "祝福卡片展開，角色遞出",
      "花束從畫面下方升起，角色抱花",
      "卡片打開，愛心亮一下",
      "兩顆愛心合在一起變大",
      "限定標籤彈跳，巧克力轉一圈",
    ],
  },
  festivalMothersDay: {
    label: "母親節動態貼圖",
    role: "一位溫柔可愛的節慶角色，可以是媽媽角色、孩子角色、花束小天使或原創吉祥物，搭配康乃馨、蛋糕、卡片、愛心與溫暖光線",
    visualStyle: "Q版可愛、溫暖感謝、柔和花朵風、適合母親節祝福、聊天互動與店家送禮宣傳",
    texts: [
      "母親節快樂",
      "媽媽辛苦了",
      "謝謝媽媽",
      "我愛你",
      "送你花花",
      "抱抱媽媽",
      "今天好好休息",
      "祝你健康",
      "永遠愛你",
      "媽媽最棒",
      "感謝有你",
      "蛋糕來囉",
      "康乃馨送給你",
      "幸福滿滿",
      "平安順心",
      "今天你最大",
      "媽咪辛苦了",
      "暖暖祝福",
      "愛你一輩子",
      "把感謝送給你",
      "花束完成",
      "卡片寫好了",
      "全家愛你",
      "母親節限定",
    ],
    motions: [
      "角色抱著康乃馨揮手，花瓣輕飄",
      "角色幫媽媽搥背，愛心浮出",
      "感謝卡片打開，角色鞠躬",
      "大愛心從胸前跳出",
      "花束往前遞出，星光閃爍",
      "角色張開手臂，抱抱光圈擴散",
      "角色端茶點頭，休息符號浮上",
      "健康小葉子發光，角色雙手合十",
      "愛心繞角色一圈，停在文字旁",
      "皇冠小圖示戴上，角色拍手",
      "感謝文字泡泡彈出，花朵旋轉",
      "蛋糕蠟燭亮一下，角色開心拍手",
      "康乃馨輕輕搖動，香氣線浮上",
      "幸福光圈慢慢擴散",
      "平安符號閃一下，角色微笑",
      "星星聚光燈照下，角色比心",
      "角色拿毛巾擦汗，愛心安慰",
      "暖色光點往上浮動",
      "大愛心慢慢變大後停住",
      "感謝卡片往前滑出",
      "花束緞帶綁起，角色抱花",
      "卡片翻開，愛心跳一下",
      "三顆愛心圍繞角色",
      "限定標籤彈跳，康乃馨轉一圈",
    ],
  },
  festivalFathersDay: {
    label: "父親節動態貼圖",
    role: "一位溫暖可愛的節慶角色，可以是爸爸角色、孩子角色、原創吉祥物或小店長，搭配領帶、鬍子、蛋糕、卡片、工具箱與愛心",
    visualStyle: "Q版可愛、溫暖感謝、穩重親切、適合父親節祝福、聊天互動與店家送禮宣傳",
    texts: [
      "父親節快樂",
      "爸爸辛苦了",
      "謝謝爸爸",
      "我愛你",
      "爸爸最棒",
      "今天好好休息",
      "送你蛋糕",
      "祝你健康",
      "辛苦一家之主",
      "抱抱爸爸",
      "感謝有你",
      "平安順心",
      "今天你最大",
      "爸比辛苦了",
      "帥氣爸爸",
      "暖暖祝福",
      "愛你一輩子",
      "爸爸加油",
      "全家愛你",
      "把感謝送給你",
      "禮物來了",
      "卡片寫好了",
      "爸爸喝茶",
      "父親節限定",
    ],
    motions: [
      "角色拿領帶揮手，星星亮起",
      "角色幫爸爸搥背，愛心浮出",
      "感謝卡片打開，角色鞠躬",
      "大愛心從胸前跳出",
      "角色替爸爸戴皇冠，拍手星光",
      "角色端茶點頭，休息符號浮上",
      "蛋糕蠟燭亮一下，角色開心拍手",
      "健康小葉子發光，角色雙手合十",
      "工具箱發光，角色比讚",
      "角色張開手臂，抱抱光圈擴散",
      "感謝文字泡泡彈出，星星旋轉",
      "平安符號閃一下，角色微笑",
      "星星聚光燈照下，角色比心",
      "角色拿毛巾擦汗，愛心安慰",
      "帥氣墨鏡彈出，角色眨眼",
      "暖色光點往上浮動",
      "大愛心慢慢變大後停住",
      "角色舉手加油，旗子晃動",
      "三顆愛心圍繞角色",
      "感謝卡片往前滑出",
      "禮物盒打開，愛心飛出",
      "卡片翻開，愛心跳一下",
      "茶杯冒熱氣，角色微笑",
      "限定標籤彈跳，領帶轉一圈",
    ],
  },
  festivalHalloween: {
    label: "萬聖節動態貼圖",
    role: "一位可愛搞怪的節慶角色，可以是小南瓜、小幽靈、魔法小店長、黑貓或原創吉祥物，搭配南瓜燈、糖果、蝙蝠、星星與魔法帽",
    visualStyle: "Q版可愛、搞怪但不恐怖、紫橘節慶感、適合萬聖節互動、聊天與店家活動",
    texts: [
      "萬聖節快樂",
      "不給糖就搗蛋",
      "糖果來囉",
      "小幽靈出沒",
      "南瓜燈亮了",
      "今晚變裝嗎",
      "搞怪一下",
      "可愛嚇你",
      "魔法發射",
      "糖果收集中",
      "Trick or Treat",
      "一起去玩",
      "小心南瓜",
      "可愛鬼來了",
      "派對開始",
      "驚喜出現",
      "黑貓路過",
      "今天很神秘",
      "搗蛋成功",
      "把糖果送給你",
      "南瓜跳跳",
      "蝙蝠飛過",
      "糖果袋滿了",
      "萬聖節限定",
    ],
    motions: [
      "南瓜燈亮起，角色揮手",
      "糖果袋左右搖，角色搞怪吐舌",
      "糖果從上方掉下，角色接住",
      "小幽靈從旁邊飄過，角色眨眼",
      "南瓜燈表情閃一下，星星亮起",
      "變裝帽子戴上，角色轉一小圈",
      "角色做鬼臉，紫色星星彈出",
      "角色躲到南瓜後再探頭",
      "魔法棒揮一下，愛心與星星飛出",
      "糖果一顆顆跳進袋子",
      "英文字樣彈出，糖果旋轉",
      "角色拉著糖果袋往前跑一下",
      "南瓜從左邊滾到右邊停住",
      "可愛幽靈跳出揮手",
      "彩帶噴出，角色拍手",
      "禮盒突然打開，糖果飛出",
      "黑貓小尾巴晃一下，角色微笑",
      "神秘星光閃爍，角色拿魔法帽",
      "搗蛋旗子彈出，角色比 OK",
      "角色遞出糖果，愛心浮上",
      "南瓜原地跳兩下",
      "蝙蝠小圖示從上方飛過",
      "糖果袋變滿，角色開心點頭",
      "限定標籤彈跳，南瓜轉一圈",
    ],
  },
  businessPersonal: {
    label: "業務個人品牌動態貼圖",
    role: "一位親切又專業的年輕業務角色，穿襯衫與西裝背心，拿手機、文件夾、筆記本與成長圖表",
    visualStyle:
      "Q版可愛、親切專業、有個人品牌記憶點，適合業務回覆客戶與長期經營關係",
    texts: [
      "小宇已收到",
      "小宇幫您確認",
      "小宇稍後回覆您",
      "小宇幫您追進度",
      "小宇替您安排",
      "小宇感謝您的詢問",
      "有需要都問小宇",
      "小宇請您放心",
      "小宇已幫您備註",
      "小宇有消息通知您",
      "小宇持續跟進中",
      "小宇感謝您的信任",
      "小宇祝您順心",
      "之後需要找小宇",
      "歡迎再找小宇",
      "小宇很高興為您服務",
      "小宇會持續協助",
      "小宇幫您整理資料",
      "小宇隨時為您服務",
      "下次也可以找小宇",
      "小宇幫您安排時間",
      "小宇會再提醒您",
      "小宇資料整理好了",
      "小宇感謝您的耐心",
    ],
    motions: [
      "手機螢幕亮起，角色微笑點頭，藍色確認符號彈出",
      "角色拿放大鏡看文件，眼睛眨一下，星光閃一下",
      "角色拿手機快速打字，對話泡泡輕輕跳出",
      "角色舉起成長箭頭，拳頭輕輕往上揮動",
      "角色在筆記本打勾，行程圖示依序亮起",
      "角色微微鞠躬，愛心與星光從旁邊浮出",
      "角色揮手招呼，對話泡泡放大再縮回",
      "角色比 OK 手勢，安心光圈慢慢亮起",
      "角色拿筆在便條紙上打勾，便條紙輕晃",
      "手機通知鈴鐺彈出，角色抬頭微笑",
      "角色抱著資料夾往前小跑，綠色箭頭往上動",
      "角色雙手捧愛心，愛心輕輕跳動",
      "角色比讚眨眼，星星閃爍",
      "角色指向自己，文字氣泡輕輕彈出",
      "角色張開雙手歡迎，彩色線條往外擴散",
      "角色鞠躬微笑，服務標章亮起",
      "角色拿資料夾點頭，文件頁面翻動",
      "角色整理文件，資料疊整齊並出現打勾",
      "角色拿手機微笑待命，訊息泡泡閃一下",
      "角色揮手說再見，星光慢慢浮上",
      "角色看行事曆，日期圈選跳動",
      "角色舉起提醒鈴，鈴鐺左右搖",
      "角色把資料交出去，資料夾亮一下",
      "角色雙手合十感謝，愛心輕輕浮出",
    ],
  },
  smallShopSupport: {
    label: "小店家客服動態貼圖",
    role: "一位親切可愛的小店長或客服角色，穿圍裙或品牌制服，搭配手機、訂單、商品袋、取貨通知與感謝手勢",
    visualStyle: "Q版可愛、店家品牌感、親切好記，適合小店家回覆客人",
    texts: [
      "已收到",
      "幫您確認",
      "請稍等",
      "已幫您保留",
      "可以取貨囉",
      "感謝支持",
      "今日有營業",
      "今日完售",
      "新品上架",
      "優惠開跑",
      "稍後回覆您",
      "外送出發",
      "已安排",
      "請放心",
      "歡迎再來",
      "下次見",
      "有問題都可以問",
      "感謝您的耐心",
      "我們會盡快處理",
      "祝您順心",
      "訂單整理中",
      "幫您包裝",
      "明天再來",
      "謝謝喜歡",
    ],
    motions: [
      "訂單單據彈出並打勾",
      "角色拿手機點頭確認",
      "沙漏輕輕轉動",
      "商品袋貼上保留標籤",
      "取貨鈴鐺跳出",
      "角色鞠躬感謝，愛心浮出",
      "招牌燈亮起",
      "完售牌輕輕掛上",
      "新品星光閃爍",
      "優惠標籤彈跳",
      "角色打字回覆",
      "外送袋往右滑出",
      "行程表打勾",
      "角色比 OK",
      "角色揮手歡迎",
      "角色微笑說再見",
      "問號泡泡變成愛心",
      "角色等待並點頭",
      "處理進度條前進",
      "星光與祝福泡泡浮出",
      "訂單列表翻頁",
      "包裝緞帶綁起",
      "月亮星星出現",
      "角色開心拍手",
    ],
  },

  taiwanesePhrase: {
    label: "台語／台灣人口頭禪動態貼圖",
    role: "一位可愛親切、很有台灣在地感的原創角色，可以是工地師傅、小店長、搬家師傅、招牌師傅、輕鋼架師傅、老闆娘或社群常見職業人物，搭配台灣街口、小吃店、工具箱、安全帽、飲料袋、工作手套等生活元素",
    visualStyle:
      "Q版可愛、台灣在地感、台語感、接地氣幽默、文字粗體清楚，適合 LINE 台灣人口頭禪特輯、職業社團、店家客服與朋友聊天使用",
    texts: [
      "真的假的",
      "有影無",
      "甘安捏",
      "麥啦",
      "賀啦",
      "水啦",
      "拍謝啦",
      "多謝啦",
      "免客氣",
      "哩賀",
      "緊來喔",
      "等我一下",
      "這馬來去",
      "穩當啦",
      "母湯喔",
      "安啦安啦",
      "我看一下",
      "師傅在路上",
      "現場確認中",
      "收工啦",
      "麥緊張",
      "有夠讚",
      "來處理",
      "下次擱來",
    ],
    motions: [
      "角色驚訝眨眼，問號泡泡彈出又縮回",
      "角色把手放耳邊確認，對話泡泡左右晃一下",
      "角色歪頭思考，三個小點點依序跳出",
      "角色雙手輕輕擋在前方，文字彈跳出現",
      "角色比 OK 點頭，星星閃一下",
      "角色比讚，水花或星光往外擴散",
      "角色雙手合十微微鞠躬，愛心浮上",
      "角色遞出感謝小卡，卡片輕輕發光",
      "角色揮手說不用客氣，光圈柔和擴散",
      "角色開心揮手，招呼泡泡跳出",
      "角色招手催促，小腳步圖示往前跑",
      "沙漏轉一下，角色拿手機快速回覆",
      "角色拿工具箱往右小跑，速度線短短滑出",
      "角色拍胸口保證，盾牌圖示亮一下",
      "角色搖手提醒，紅色提醒符號彈出",
      "角色拍拍肩膀安撫，安心光圈慢慢亮起",
      "角色拿放大鏡看資料，打勾符號彈出",
      "小貨車或工具箱往前滑，角色揮手",
      "角色戴安全帽看現場，定位圖示跳一下",
      "角色擦汗微笑，收工牌子往上彈出",
      "角色雙手往下壓安撫，文字輕輕落下",
      "角色開心拍手，彩色紙花跳出",
      "角色捲起袖子準備工作，工具圖示亮起",
      "角色揮手告別，小店門口招牌燈亮一下",
    ],
  },
  drinkShop: {
    label: "飲料店營業動態貼圖",
    role: "一位可愛飲料店店員，穿清爽制服，搭配手搖杯、封膜機、珍珠、菜單與外送提袋",
    visualStyle: "Q版可愛、清爽繽紛、手搖飲品牌感，適合飲料店與顧客聊天",
    texts: [
      "想喝什麼",
      "甜度冰塊",
      "珍珠加一份",
      "飲料好了",
      "外送出發",
      "幫你保留",
      "今日推薦",
      "新品上市",
      "買一送一",
      "請稍等",
      "已收到",
      "可以取餐",
      "謝謝支持",
      "歡迎預訂",
      "杯袋要嗎",
      "少冰可以",
      "微糖可以",
      "今日完售",
      "下次再來",
      "喝起來",
      "封膜完成",
      "菜單給你",
      "今日營業中",
      "明天見",
    ],
    motions: [
      "手搖杯左右輕搖",
      "冰塊與糖度圖示彈出",
      "珍珠跳進杯子",
      "杯子蓋膜完成並發光",
      "外送提袋往前移動",
      "杯子貼上保留標籤",
      "推薦星星閃爍",
      "新品牌子彈出",
      "兩杯飲料左右跳動",
      "角色等待點頭",
      "訂單打勾",
      "取餐號碼亮起",
      "角色鞠躬感謝",
      "預訂本打勾",
      "杯袋圖示彈出",
      "冰塊減少動畫",
      "糖度條滑動",
      "完售牌掛上",
      "角色揮手",
      "吸管插入杯子",
      "封膜機壓一下",
      "菜單翻開",
      "招牌亮起",
      "角色說再見",
    ],
  },
  breakfast: {
    label: "早餐店動態貼圖",
    role: "一位親切可愛的早餐店老闆或店員，穿圍裙與工作帽，搭配蛋餅、奶茶、早餐紙袋、點餐單與小黑板",
    visualStyle: "Q版可愛、親切明亮、早餐店日常服務感",
    texts: [
      "早安",
      "歡迎光臨",
      "今天有營業",
      "要吃什麼呢",
      "請稍等",
      "現做中",
      "奶茶一杯",
      "餐點來囉",
      "幫你保留",
      "歡迎預訂",
      "已收到",
      "謝謝支持",
      "辛苦了",
      "外帶嗎",
      "內用嗎",
      "OK",
      "蛋餅好了",
      "熱熱吃最好",
      "明天見",
      "感謝光臨",
      "菜單給你",
      "早餐準備中",
      "可以取餐",
      "今日完售",
    ],
    motions: [
      "太陽升起角色揮手",
      "門鈴亮一下",
      "招牌燈亮起",
      "菜單板彈出",
      "沙漏轉動",
      "平底鍋冒熱氣",
      "奶茶杯晃一下",
      "餐盤滑出",
      "紙袋貼保留標籤",
      "預訂本打勾",
      "訂單打勾",
      "角色鞠躬",
      "角色比愛心",
      "外帶袋出現",
      "桌椅圖示亮起",
      "OK 手勢彈一下",
      "蛋餅冒熱氣",
      "熱氣往上飄",
      "月亮星星出現",
      "角色揮手",
      "菜單翻頁",
      "爐火亮起",
      "取餐號碼跳出",
      "完售牌掛上",
    ],
  },
  nail: {
    label: "美甲師預約動態貼圖",
    role: "一位可愛精緻的美甲師角色，穿工作圍裙，搭配指甲油、美甲燈、色卡、預約本與漂亮指尖",
    visualStyle: "Q版可愛、精緻甜美、粉色系美甲工作室感",
    texts: [
      "歡迎預約",
      "已幫你排好",
      "款式討論",
      "色卡給你看",
      "今天可約",
      "補甲提醒",
      "請準時喔",
      "幫你保留",
      "已完成",
      "超美的",
      "謝謝喜歡",
      "下次見",
      "稍等一下",
      "幫你確認",
      "可以換色",
      "OK",
      "今日滿約",
      "歡迎私訊",
      "新款上架",
      "感謝支持",
      "亮晶晶",
      "美美完成",
      "記得保養",
      "改期可以",
    ],
    motions: [
      "預約本翻開打勾",
      "行事曆圈選",
      "款式圖卡左右滑動",
      "色卡展開",
      "日期亮起",
      "提醒鈴搖動",
      "時鐘指針跳動",
      "座位貼保留標籤",
      "美甲燈亮起",
      "指尖星光閃爍",
      "角色鞠躬愛心浮出",
      "角色揮手",
      "沙漏轉動",
      "放大鏡看預約本",
      "色卡換色",
      "OK 手勢彈一下",
      "滿約牌掛上",
      "訊息泡泡彈出",
      "新品牌子閃光",
      "角色拍手感謝",
      "亮片閃爍",
      "完成章蓋上",
      "保養油滴出",
      "改期箭頭轉動",
    ],
  },
  customerService: {
    label: "客服回覆動態貼圖",
    role: "一位親切專業的客服人員角色，戴耳機麥克風，坐在電腦前，搭配訊息泡泡、文件、確認表與服務笑容",
    visualStyle: "Q版可愛、親切專業、客服回覆實用風",
    texts: [
      "您好",
      "已收到",
      "幫您確認",
      "請稍等",
      "馬上回覆",
      "已通知師傅",
      "處理中",
      "已完成",
      "謝謝您",
      "不好意思",
      "麻煩您了",
      "請提供資料",
      "已安排",
      "稍後通知",
      "OK",
      "感謝耐心等候",
      "已回覆",
      "請放心",
      "我們會處理",
      "祝您順心",
      "訊息收到",
      "進度更新",
      "資料確認中",
      "服務完成",
    ],
    motions: [
      "角色揮手問候",
      "訊息泡泡打勾",
      "文件放大檢查",
      "沙漏轉動",
      "鍵盤打字",
      "通知鈴跳出",
      "進度條前進",
      "完成章蓋上",
      "角色鞠躬",
      "角色雙手合十",
      "角色拿文件點頭",
      "資料夾彈出",
      "行程表打勾",
      "手機通知亮起",
      "OK 手勢",
      "等待圖示轉動",
      "回覆泡泡送出",
      "安心光圈亮起",
      "工具圖示轉動",
      "祝福星光浮出",
      "信封亮起",
      "進度箭頭上升",
      "放大鏡左右看",
      "客服耳機閃光",
    ],
  },
  realtor: {
    label: "房仲業務動態貼圖",
    role: "一位專業親切的房仲業務角色，拿鑰匙、物件資料、平板、成交牌與房屋模型",
    visualStyle: "Q版可愛、專業可信賴、房地產帶看與成交感",
    texts: [
      "物件給您參考",
      "安排帶看",
      "時間可以嗎",
      "幫您確認",
      "屋況說明",
      "價格討論",
      "地點不錯",
      "採光很好",
      "可以約看",
      "屋主回覆了",
      "資料已送出",
      "成交恭喜",
      "謝謝信任",
      "稍等一下",
      "貸款評估",
      "合約確認",
      "歡迎詢問",
      "祝您順利",
      "鑰匙準備好了",
      "今天可帶看",
      "幫您追進度",
      "資料整理中",
      "再幫您確認",
      "有消息通知您",
    ],
    motions: [
      "物件卡片滑出",
      "行事曆打勾",
      "時鐘跳動",
      "放大鏡看資料",
      "房屋模型亮起",
      "價格牌上下跳",
      "地圖定位彈出",
      "陽光照進窗戶",
      "鑰匙晃動",
      "手機訊息亮起",
      "資料夾送出",
      "成交牌彈出彩帶",
      "角色鞠躬愛心",
      "沙漏轉動",
      "計算機跳出",
      "合約蓋章",
      "對話泡泡彈出",
      "星光祝福",
      "鑰匙發光",
      "帶看路線移動",
      "進度箭頭前進",
      "文件整理成冊",
      "放大鏡再次確認",
      "通知鈴跳出",
    ],
  },
  insuranceAdvisor: {
    label: "保險顧問動態貼圖",
    role: "一位專業親切的保險顧問或理財顧問角色，穿正式襯衫與西裝外套，搭配文件、平板、保障傘、愛心與安心服務手勢",
    visualStyle: "Q版可愛、穩重專業、安心信任感，適合顧問與客戶長期溝通",
    texts: [
      "您好，我來協助您",
      "已收到資料",
      "我幫您確認",
      "稍後回覆您",
      "保障內容整理中",
      "幫您規劃看看",
      "有問題都可以問",
      "請您放心",
      "資料已幫您備註",
      "有消息馬上通知",
      "持續為您跟進",
      "感謝您的信任",
      "祝您平安順心",
      "之後需要再找我",
      "歡迎隨時詢問",
      "很高興為您服務",
      "保單內容確認",
      "提醒您注意日期",
      "幫您追進度",
      "下次再為您服務",
      "資料整理好了",
      "風險幫您評估",
      "保障傘打開",
      "安心服務中",
    ],
    motions: [
      "角色伸手協助，光圈亮起",
      "資料夾打勾",
      "放大鏡檢查保單",
      "手機打字回覆",
      "文件自動排列",
      "規劃圖表亮起",
      "問號泡泡變成答案",
      "保障傘打開",
      "便條紙貼上",
      "通知鈴搖動",
      "進度條前進",
      "角色捧愛心",
      "平安星光浮出",
      "角色指向自己",
      "對話泡泡彈出",
      "角色鞠躬服務",
      "保單章蓋上",
      "日期圈選",
      "箭頭往前移動",
      "角色揮手",
      "資料整理成冊",
      "盾牌圖示亮起",
      "傘面發光",
      "安心標章跳出",
    ],
  },
};

const COUNT_OPTIONS: Array<{
  value: StickerCount;
  label: string;
  limit: number;
}> = [
  { value: "8", label: "8 張", limit: 8 },
  { value: "16", label: "16 張", limit: 16 },
  { value: "24", label: "24 張", limit: 24 },
];

const NAME_MODE_OPTIONS: Array<{ value: NameMode; label: string }> = [
  { value: "none", label: "不加入名稱" },
  { value: "person", label: "加入人名" },
  { value: "shop", label: "加入店名／品牌名" },
];

const MOTION_STYLE_OPTIONS: Array<{
  value: MotionStyle;
  label: string;
  prompt: string;
}> = [
  {
    value: "micro",
    label: "輕微動作",
    prompt:
      "以輕微動作為主，例如眨眼、點頭、手部微動、圖示輕輕彈出，畫面穩定不誇張",
  },
  {
    value: "bounce",
    label: "Q版彈跳",
    prompt: "角色可愛彈跳、星光與小圖示彈出，節奏活潑但不可讓角色變形",
  },
  {
    value: "expression",
    label: "表情變化",
    prompt: "重點放在表情變化，例如微笑、眨眼、驚喜、安心、感謝與害羞",
  },
  {
    value: "gesture",
    label: "手勢動作",
    prompt: "重點放在手勢動作，例如揮手、比 OK、比讚、鞠躬、拿手機與打勾",
  },
  {
    value: "textPop",
    label: "文字跳出",
    prompt: "文字與圖示可輕微彈出或閃一下，但文字必須保持清楚可讀，不可亂碼",
  },
];

const MOTION_POWER_OPTIONS: Array<{
  value: MotionPower;
  label: string;
  prompt: string;
}> = [
  {
    value: "soft",
    label: "微動",
    prompt: "動作幅度小，適合專業、溫柔、穩重感",
  },
  {
    value: "standard",
    label: "標準",
    prompt: "動作幅度中等，適合多數 LINE 動態貼圖",
  },
  {
    value: "active",
    label: "活潑",
    prompt: "動作更活潑，有彈跳與情緒，但角色比例必須一致",
  },
];

const PHOTO_MODE_OPTIONS: Array<{
  value: PhotoMode;
  label: string;
  prompt: string;
}> = [
  {
    value: "original",
    label: "否，原創角色",
    prompt:
      "使用原創 Q 版角色，不參考真人照片，避免與特定真人或品牌角色過度相似",
  },
  {
    value: "realPerson",
    label: "是，真人轉 Q 版風格",
    prompt:
      "以使用者提供的真人照片為主角參考，需保留髮型、臉型、五官比例與個人氣質；請使用本人或已取得同意的照片，避免侵犯肖像權",
  },
];

const TEXT_COLOR_OPTIONS: Array<{
  value: TextColor;
  label: string;
  prompt: string;
}> = [
  {
    value: "blackWhite",
    label: "黑字＋白邊",
    prompt: "黑色粗體文字搭配厚白邊",
  },
  { value: "blueWhite", label: "藍字＋白邊", prompt: "藍色粗體文字搭配厚白邊" },
  {
    value: "orangeWhite",
    label: "橘字＋白邊",
    prompt: "橘色粗體文字搭配厚白邊",
  },
  {
    value: "greenWhite",
    label: "綠字＋白邊",
    prompt: "綠色粗體文字搭配厚白邊",
  },
  {
    value: "colorfulWhite",
    label: "彩色字＋白邊",
    prompt: "可使用藍色、綠色、橘色、粉色等彩色粗體文字，並搭配厚白邊",
  },
];

const TEXT_POSITION_OPTIONS: Array<{
  value: TextPosition;
  label: string;
  prompt: string;
}> = [
  { value: "top", label: "上方", prompt: "文字固定放在每張貼圖上方" },
  { value: "bottom", label: "下方", prompt: "文字固定放在每張貼圖下方" },
  {
    value: "mixed",
    label: "上下交錯",
    prompt: "文字可依動作安排在上方或下方，但不可遮住角色表情",
  },
];

function findPrompt<T extends string>(
  list: Array<{ value: T; prompt: string }>,
  value: T,
) {
  return list.find((item) => item.value === value)?.prompt ?? "";
}

function CreatorSupportSection({ toolName = "這個免費工具" }: { toolName?: string }) {
  return (
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white">
              免費工具
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
              支持創作
            </span>
          </div>
          <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">
            喜歡 {toolName} 嗎？
          </h2>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-700 sm:text-base">
            本站工具目前免費使用。如果這個工具有幫助到你，歡迎到 LINE STORE
            購買我的原創貼圖支持創作，或贊助一杯咖啡，讓我可以繼續更新更多免費工具與貼圖模板。
          </p>
          <p className="mt-2 text-xs font-bold leading-6 text-slate-500">
            不贊助也可以繼續免費使用，有幫助再支持就好。
          </p>
        </div>
        <div className="grid gap-3">
          <a
            href={LINE_STICKER_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow-lg"
            style={{ color: "#ffffff" }}
          >
            購買 LINE 貼圖支持
          </a>
          <a
            href={SUPPORT_TW_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-center text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-amber-600 hover:!text-white hover:shadow-lg"
            style={{ color: "#ffffff" }}
          >
            ☕ 贊助一杯咖啡
          </a>
          <a
            href={SUPPORT_KOFI_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:!text-white hover:shadow-lg"
            style={{ color: "#ffffff" }}
          >
            🌎 Ko-fi 海外支持
          </a>
        </div>
      </div>
    </section>
  );
}

function stripDemoName(line: string) {
  return line
    .replace(/小宇/g, "")
    .replace(/^有需要都問$/, "有需要都可以問")
    .replace(/^之後需要找$/, "之後需要可以再找我")
    .replace(/^歡迎再找$/, "歡迎再找我")
    .trim();
}

function applyName(line: string, mode: NameMode, name: string) {
  const safeName = name.trim();
  if (mode === "none" || !safeName) return stripDemoName(line);
  if (line.includes("小宇")) return line.replace(/小宇/g, safeName);
  return `${safeName}${line}`;
}

function getCountLimit(count: StickerCount) {
  return COUNT_OPTIONS.find((item) => item.value === count)?.limit ?? 8;
}

function buildLines(
  theme: AnimatedThemeKey,
  count: StickerCount,
  nameMode: NameMode,
  customName: string,
) {
  return themes[theme].texts
    .slice(0, getCountLimit(count))
    .map((line) => applyName(line, nameMode, customName));
}

function buildStoryboardRows(
  theme: AnimatedThemeKey,
  count: StickerCount,
  nameMode: NameMode,
  customName: string,
) {
  const lines = buildLines(theme, count, nameMode, customName);
  const motions = themes[theme].motions;
  return lines.map((text, index) => ({
    no: String(index + 1).padStart(2, "0"),
    text,
    motion: motions[index % motions.length],
    frames:
      index % 3 === 0
        ? "8～10 幀"
        : index % 3 === 1
          ? "10～12 幀"
          : "12～16 幀",
    seconds:
      index % 3 === 0
        ? "1.5～2 秒"
        : index % 3 === 1
          ? "2～2.5 秒"
          : "2.5～3 秒",
    loop: index % 2 === 0 ? "2 次" : "1～2 次",
  }));
}

function buildFullPrompt(args: {
  theme: AnimatedThemeKey;
  count: StickerCount;
  nameMode: NameMode;
  customName: string;
  motionStyle: MotionStyle;
  motionPower: MotionPower;
  photoMode: PhotoMode;
  textColor: TextColor;
  textPosition: TextPosition;
}) {
  const template = themes[args.theme];
  const rows = buildStoryboardRows(
    args.theme,
    args.count,
    args.nameMode,
    args.customName,
  );
  const storyboard = rows
    .map(
      (row) =>
        `${row.no}. 文字：${row.text}\n靜態圖：${template.role}，動作主題為「${row.text}」，白色或透明背景，文字清楚。\n動畫分鏡：${row.motion}。\n建議：${row.frames}，${row.seconds}，循環 ${row.loop}。`,
    )
    .join("\n\n");

  return `請規劃一組 LINE 動態貼圖企劃，主題為「${template.label}」。\n\n角色設定：${template.role}。\n整體風格：${template.visualStyle}。\n真人／原創設定：${findPrompt(PHOTO_MODE_OPTIONS, args.photoMode)}。\n動畫風格：${findPrompt(MOTION_STYLE_OPTIONS, args.motionStyle)}。\n動作強度：${findPrompt(MOTION_POWER_OPTIONS, args.motionPower)}。\n文字設定：使用繁體中文，粗體好讀，${findPrompt(TEXT_COLOR_OPTIONS, args.textColor)}，${findPrompt(TEXT_POSITION_OPTIONS, args.textPosition)}。\n\n請依 LINE 動態貼圖用途規劃 ${args.count} 張貼圖，每張都要保持同一位角色、同一髮型、同一服裝、同一臉部特徵，只有表情與動作變化。每張動畫動作要簡單、可循環、不要過度複雜。\n\n重要限制：不要加入品牌 Logo、不要加入浮水印、不要簡體中文、不要英文、不要多餘文字、不要把角色畫成不同人。若使用真人照片，需保留本人辨識度，且照片需為本人或已取得同意。\n\nLINE 動態貼圖規格提醒：動態貼圖通常使用 APNG，張數可規劃 8／16／24 張；每張建議 5～20 幀、總播放時間不超過 4 秒、背景透明、文字清楚、角色不可超出安全範圍。\n\n分鏡表如下：\n\n${storyboard}`;
}

function buildSimplePrompt(args: {
  theme: AnimatedThemeKey;
  count: StickerCount;
  nameMode: NameMode;
  customName: string;
  motionStyle: MotionStyle;
  motionPower: MotionPower;
  photoMode: PhotoMode;
}) {
  const template = themes[args.theme];
  const rows = buildStoryboardRows(
    args.theme,
    args.count,
    args.nameMode,
    args.customName,
  );
  return rows
    .map(
      (row) =>
        `${row.no}. ${row.text}\n角色：${template.role}\n動畫：${row.motion}\n提示詞：請製作 LINE 動態貼圖單張分鏡，${findPrompt(PHOTO_MODE_OPTIONS, args.photoMode)}，${findPrompt(MOTION_STYLE_OPTIONS, args.motionStyle)}，${findPrompt(MOTION_POWER_OPTIONS, args.motionPower)}，文字「${row.text}」需清楚可讀，角色一致，透明背景，適合 APNG。`,
    )
    .join("\n\n");
}

function buildCsv(args: {
  theme: AnimatedThemeKey;
  count: StickerCount;
  nameMode: NameMode;
  customName: string;
}) {
  const rows = buildStoryboardRows(
    args.theme,
    args.count,
    args.nameMode,
    args.customName,
  );
  const header = "編號,貼圖文字,動畫分鏡,建議幀數,建議秒數,循環";
  const body = rows
    .map((row) =>
      [row.no, row.text, row.motion, row.frames, row.seconds, row.loop]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  return `${header}\n${body}`;
}

export default function AnimatedStickerPromptGenerator() {
  const [theme, setTheme] = useState<AnimatedThemeKey>("businessPersonal");
  const [count, setCount] = useState<StickerCount>("8");
  const [nameMode, setNameMode] = useState<NameMode>("person");
  const [customName, setCustomName] = useState("小宇");
  const [motionStyle, setMotionStyle] = useState<MotionStyle>("gesture");
  const [motionPower, setMotionPower] = useState<MotionPower>("standard");
  const [photoMode, setPhotoMode] = useState<PhotoMode>("original");
  const [textColor, setTextColor] = useState<TextColor>("colorfulWhite");
  const [textPosition, setTextPosition] = useState<TextPosition>("mixed");
  const [copied, setCopied] = useState("");

  const rows = useMemo(
    () => buildStoryboardRows(theme, count, nameMode, customName),
    [theme, count, nameMode, customName],
  );

  const fullPrompt = useMemo(
    () =>
      buildFullPrompt({
        theme,
        count,
        nameMode,
        customName,
        motionStyle,
        motionPower,
        photoMode,
        textColor,
        textPosition,
      }),
    [
      theme,
      count,
      nameMode,
      customName,
      motionStyle,
      motionPower,
      photoMode,
      textColor,
      textPosition,
    ],
  );

  const simplePrompt = useMemo(
    () =>
      buildSimplePrompt({
        theme,
        count,
        nameMode,
        customName,
        motionStyle,
        motionPower,
        photoMode,
      }),
    [theme, count, nameMode, customName, motionStyle, motionPower, photoMode],
  );

  const csvText = useMemo(
    () => buildCsv({ theme, count, nameMode, customName }),
    [theme, count, nameMode, customName],
  );

  function handleThemeChange(nextTheme: AnimatedThemeKey) {
    setTheme(nextTheme);
    if (nextTheme.startsWith("festival")) {
      setNameMode("none");
    }
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1600);
  }

  async function copyEmail() {
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied("email");
    window.setTimeout(() => setCopied(""), 1600);
  }

  return (
    <>
      <SEO
        title="LINE 動態貼圖提示詞產生器｜APNG 分鏡企劃工具 - RxV AI工具中心"
        description="選擇職業、貼圖張數、動畫風格與名稱，自動產生 LINE 動態貼圖提示詞、分鏡表、幀數秒數建議與 APNG 上架提醒。"
        path="/tools/animated-sticker-prompt"
        keywords="LINE動態貼圖, APNG貼圖, 動態貼圖提示詞, LINE貼圖分鏡, 職業貼圖"
      />

      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-violet-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/tools/sticker-prompt"
            className="mb-4 inline-block text-sm font-bold text-sky-700 hover:text-sky-900"
          >
            ← 回到靜態 LINE 貼圖提示詞工具
          </Link>

          <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-black !text-white">
                動態貼圖
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                8／16／24 張
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                分鏡表＋提示詞
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              LINE 動態貼圖提示詞產生器
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              先產生動態貼圖企劃、每張貼圖分鏡、幀數秒數建議與 APNG
              規格提醒。適合業務個人品牌、店家客服、台語口頭禪、飲料店、美甲師、房仲、保險顧問等職業貼圖企劃。
            </p>
            <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-7 text-amber-800">
              提醒：這頁目前是「動態貼圖提示詞＋分鏡企劃」工具，不會直接產生
              APNG。若要正式上架，仍需依 LINE 規格製作透明背景幀圖、合成 APNG
              並檢查檔案大小。
            </p>
          </section>

          <CreatorSupportSection toolName="LINE 動態貼圖提示詞產生器" />

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">選擇設定</h2>

              <label className="mt-5 block text-xs font-black text-slate-500">
                動態貼圖主題
              </label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as AnimatedThemeKey)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {Object.entries(themes).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-slate-500">
                貼圖張數
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {COUNT_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCount(item.value)}
                    className={`rounded-2xl px-3 py-3 text-sm font-black shadow-sm ${count === item.value ? "bg-sky-600 !text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-xs font-black text-slate-500">
                是否加入人名／店名
              </label>
              <select
                value={nameMode}
                onChange={(e) => setNameMode(e.target.value as NameMode)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {NAME_MODE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              {nameMode !== "none" && (
                <div className="mt-3">
                  <label className="block text-xs font-black text-slate-500">
                    人名／店名／品牌名
                  </label>
                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="例如：小宇、雙果花、舒菓蜜"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
                  />
                </div>
              )}

              <label className="mt-5 block text-xs font-black text-slate-500">
                動畫風格
              </label>
              <select
                value={motionStyle}
                onChange={(e) => setMotionStyle(e.target.value as MotionStyle)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {MOTION_STYLE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-slate-500">
                動作強度
              </label>
              <select
                value={motionPower}
                onChange={(e) => setMotionPower(e.target.value as MotionPower)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {MOTION_POWER_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-slate-500">
                是否使用真人照片
              </label>
              <select
                value={photoMode}
                onChange={(e) => setPhotoMode(e.target.value as PhotoMode)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {PHOTO_MODE_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-slate-500">
                文字顏色
              </label>
              <select
                value={textColor}
                onChange={(e) => setTextColor(e.target.value as TextColor)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {TEXT_COLOR_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-xs font-black text-slate-500">
                文字位置
              </label>
              <select
                value={textPosition}
                onChange={(e) =>
                  setTextPosition(e.target.value as TextPosition)
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-sky-400"
              >
                {TEXT_POSITION_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-bold leading-6 text-slate-600">
                網站版提供少量試用與分鏡企劃；進階 Excel
                模板可同步更多職業、動作庫、文字設定與 8／16／24
                張完整企劃欄位。
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">產生結果</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">
                可複製到 AI 生圖／影片工具，或作為接案前分鏡企劃。
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => copyText(fullPrompt, "full")}
                  className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black !text-white shadow-md hover:bg-sky-700"
                >
                  {copied === "full" ? "已複製" : "複製完整企劃"}
                </button>
                <button
                  type="button"
                  onClick={() => copyText(simplePrompt, "single")}
                  className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700"
                >
                  {copied === "single" ? "已複製" : "複製單張提示詞"}
                </button>
                <button
                  type="button"
                  onClick={() => copyText(csvText, "csv")}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black !text-white shadow-md hover:bg-emerald-700"
                >
                  {copied === "csv" ? "已複製" : "複製分鏡 CSV"}
                </button>
              </div>

              <div className="mt-4 min-h-[860px] max-h-[960px] overflow-auto rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap text-sm font-bold leading-7 text-slate-800">
                  {fullPrompt}
                </pre>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">分鏡表預覽</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="rounded-l-2xl px-4 py-3 font-black">編號</th>
                    <th className="px-4 py-3 font-black">文字</th>
                    <th className="px-4 py-3 font-black">動畫分鏡</th>
                    <th className="px-4 py-3 font-black">幀數</th>
                    <th className="px-4 py-3 font-black">秒數</th>
                    <th className="rounded-r-2xl px-4 py-3 font-black">循環</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.no} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-black text-sky-700">
                        {row.no}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {row.text}
                      </td>
                      <td className="px-4 py-3 leading-6 text-slate-700">
                        {row.motion}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.frames}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.seconds}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.loop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-lg font-black text-slate-900">
                LINE 動態貼圖規格提醒
              </h3>
              <p className="mt-2 text-sm font-bold leading-7 text-slate-700">
                常見規劃為 8／16／24 張。每張動畫建議 5～20 幀，總播放時間不超過
                4 秒，背景透明，文字不可切到邊界。
              </p>
            </div>
            <div className="rounded-3xl border border-violet-200 bg-violet-50 p-5">
              <h3 className="text-lg font-black text-slate-900">
                進階 Excel 模板
              </h3>
              <p className="mt-2 text-sm font-bold leading-7 text-slate-700">
                想要更多職業、動作庫、分鏡欄位與大量組合，可使用進階版 Excel
                模板做接案打稿與批量企劃。
              </p>
              <a
                href={KOFI_SHOP_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700"
              >
                查看進階模板
              </a>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black text-slate-900">
                客製動態貼圖企劃
              </h3>
              <p className="mt-2 text-sm font-bold leading-7 text-slate-700">
                若要真人 Q 版、品牌角色、完整 16／24
                張分鏡與語句整理，可詢問客製服務。
              </p>
              <button
                type="button"
                onClick={copyEmail}
                className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-slate-800"
              >
                {copied === "email" ? "已複製 Email" : "複製詢問 Email"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
