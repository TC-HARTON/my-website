"""
HARTON サンプルサイト一括生成スクリプト
6カテゴリ・30業種のサンプルサイトを生成
"""
import os, json

SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")

# 全30業種の定義
INDUSTRIES = {
    # ① 食品関連
    "food-wholesale": {"name": "丸山食品", "industry": "食品卸", "color": "#CC0000", "tagline": "新鮮な食材を、確実にお届け。", "desc": "30,000種以上の業務用食材を全国へ", "badge": "HACCP対応", "icon": "&#128230;", "cat": "food"},
    "food-manufacturing": {"name": "富士フーズ", "industry": "食品製造", "color": "#B91C1C", "tagline": "こだわりの味を、食卓へ。", "desc": "素材の力を最大限に引き出す食品づくり", "badge": "ISO22000", "icon": "&#127859;", "cat": "food"},
    "restaurant": {"name": "和食処 さくら亭", "industry": "飲食店", "color": "#9A3412", "tagline": "旬を味わう、至福のひととき。", "desc": "地元食材にこだわった本格和食", "badge": "個室完備", "icon": "&#127860;", "cat": "food"},
    "liquor-store": {"name": "酒のまるた屋", "industry": "酒販店", "color": "#7C2D12", "tagline": "最高の一杯を、あなたに。", "desc": "厳選された日本酒・ワイン・クラフトビール", "badge": "全国配送", "icon": "&#127862;", "cat": "food"},
    "bento": {"name": "味彩弁当", "industry": "弁当仕出し", "color": "#DC2626", "tagline": "手作りの味を、届けます。", "desc": "会議・イベント・法事に真心込めたお弁当", "badge": "当日配達OK", "icon": "&#127857;", "cat": "food"},

    # ② 建設・不動産
    "construction": {"name": "田中建設", "industry": "建設業", "color": "#1E40AF", "tagline": "確かな技術で、未来を築く。", "desc": "住宅から公共工事まで安全と品質第一", "badge": "創業40年", "icon": "&#127959;", "cat": "build"},
    "builder": {"name": "杉山工務店", "industry": "工務店", "color": "#1D4ED8", "tagline": "家族の夢を、形に。", "desc": "自然素材にこだわった注文住宅", "badge": "ZEH対応", "icon": "&#127968;", "cat": "build"},
    "renovation": {"name": "リノベスタジオ", "industry": "リフォーム", "color": "#2563EB", "tagline": "暮らしを、リデザイン。", "desc": "キッチン・浴室から全面改装まで", "badge": "見積無料", "icon": "&#128295;", "cat": "build"},
    "realestate": {"name": "沼津不動産", "industry": "不動産", "color": "#059669", "tagline": "理想の暮らしを、見つけよう。", "desc": "賃貸・売買・投資用まで", "badge": "地域No.1", "icon": "&#127970;", "cat": "build"},
    "painting": {"name": "カラーペイント静岡", "industry": "塗装業", "color": "#0369A1", "tagline": "色で守る、美しさと耐久性。", "desc": "外壁・屋根塗装のプロフェッショナル", "badge": "10年保証", "icon": "&#127912;", "cat": "build"},

    # ③ 製造・卸売り
    "manufacturing": {"name": "東海精密工業", "industry": "製造業", "color": "#374151", "tagline": "精密技術で、未来をつくる。", "desc": "高精度な金属加工・組立", "badge": "ISO9001", "icon": "&#9881;", "cat": "mfg"},
    "wholesale": {"name": "三河商事", "industry": "卸売業", "color": "#4B5563", "tagline": "つなぐ力で、ビジネスを支える。", "desc": "幅広い商材を全国の小売店へ", "badge": "全国配送", "icon": "&#128666;", "cat": "mfg"},
    "machine-parts": {"name": "富士パーツ", "industry": "機械部品", "color": "#1F2937", "tagline": "精度が、信頼を生む。", "desc": "試作から量産まで一貫対応", "badge": "短納期", "icon": "&#128736;", "cat": "mfg"},
    "printing": {"name": "アクアプリント", "industry": "印刷業", "color": "#6D28D9", "tagline": "想いを、カタチに。", "desc": "チラシ・名刺からパッケージまで", "badge": "小ロットOK", "icon": "&#128424;", "cat": "mfg"},

    # ④ サービス
    "freight": {"name": "東海運輸", "industry": "貨物運送", "color": "#0F766E", "tagline": "届ける責任、届く安心。", "desc": "小口から大型輸送まで", "badge": "365日対応", "icon": "&#128667;", "cat": "service"},
    "passenger": {"name": "富士観光バス", "industry": "旅客運送", "color": "#0E7490", "tagline": "快適な移動を、すべての人に。", "desc": "貸切バス・送迎・観光", "badge": "大型バス20台", "icon": "&#128652;", "cat": "service"},
    "cleaning": {"name": "クリーンプロ静岡", "industry": "清掃業", "color": "#0891B2", "tagline": "清潔が、信頼をつくる。", "desc": "オフィス・店舗・マンション清掃", "badge": "法人実績500社", "icon": "&#10024;", "cat": "service"},
    "auto-repair": {"name": "オートガレージ沼津", "industry": "自動車整備", "color": "#475569", "tagline": "あなたの愛車を、最高の状態に。", "desc": "車検・修理・板金塗装", "badge": "国家資格", "icon": "&#128663;", "cat": "service"},
    "beauty": {"name": "Beauty Salon Luce", "industry": "美容室", "color": "#E11D73", "tagline": "あなたらしい美しさを。", "desc": "一人ひとりに合ったスタイル提案", "badge": "駅徒歩3分", "icon": "&#9986;", "cat": "service"},
    "inn": {"name": "旅館 花水月", "industry": "旅館", "color": "#92400E", "tagline": "日本のおもてなしを。", "desc": "源泉掛け流しの温泉と季節の懐石", "badge": "露天風呂付", "icon": "&#127969;", "cat": "service"},
    "hotel": {"name": "ホテルグランビュー沼津", "industry": "ホテル", "color": "#1E3A5F", "tagline": "くつろぎの空間を、あなたに。", "desc": "ビジネスから観光まで快適ステイ", "badge": "駅前好立地", "icon": "&#127976;", "cat": "service"},

    # ⑤ 医療・福祉
    "hospital": {"name": "沼津中央病院", "industry": "病院", "color": "#1D4ED8", "tagline": "地域医療を、支える。", "desc": "24時間救急対応・先進医療設備", "badge": "救急指定", "icon": "&#127973;", "cat": "medical"},
    "clinic": {"name": "はるかぜクリニック", "industry": "医院", "color": "#2563EB", "tagline": "身近なかかりつけ医として。", "desc": "内科・小児科・アレルギー科", "badge": "予約優先", "icon": "&#129657;", "cat": "medical"},
    "care": {"name": "ケアホームさくら", "industry": "介護施設", "color": "#D97706", "tagline": "笑顔あふれる、安心の毎日。", "desc": "ご家族と共に歩む温もりの介護", "badge": "24H看護", "icon": "&#127800;", "cat": "medical"},
    "dental": {"name": "スマイル歯科", "industry": "歯科医院", "color": "#0D9488", "tagline": "健康な歯で、豊かな人生を。", "desc": "痛みに配慮した丁寧な治療", "badge": "土曜診療", "icon": "&#129463;", "cat": "medical"},
    "osteopathy": {"name": "ゆるり整骨院", "industry": "整骨院", "color": "#059669", "tagline": "痛みのない毎日を、取り戻す。", "desc": "骨盤矯正・スポーツ障害・交通事故", "badge": "予約不要", "icon": "&#128170;", "cat": "medical"},
    "vet": {"name": "あおぞら動物病院", "industry": "動物病院", "color": "#16A34A", "tagline": "大切な家族を、守りたい。", "desc": "犬・猫・小動物の診療・予防・手術", "badge": "夜間対応", "icon": "&#128054;", "cat": "medical"},

    # ⑥ 士業・専門
    "lawyer": {"name": "沼津法律事務所", "industry": "弁護士", "color": "#1E293B", "tagline": "あなたの権利を、守る。", "desc": "企業法務・離婚・相続・交通事故", "badge": "初回相談無料", "icon": "&#9878;", "cat": "pro"},
    "judicial": {"name": "山田司法書士事務所", "industry": "司法書士", "color": "#334155", "tagline": "登記と法律の専門家。", "desc": "不動産登記・会社設立・相続手続き", "badge": "土日相談OK", "icon": "&#128220;", "cat": "pro"},
    "administrative": {"name": "行政書士 鈴木事務所", "industry": "行政書士", "color": "#475569", "tagline": "許認可のプロフェッショナル。", "desc": "建設業許可・車庫証明・ビザ申請", "badge": "迅速対応", "icon": "&#128203;", "cat": "pro"},
}

# Unsplash画像（業種別）
IMAGES = {
    "food-wholesale": "photo-1586528116311-ad8dd3c8310d",
    "food-manufacturing": "photo-1565958011703-44f9829ba187",
    "restaurant": "photo-1517248135467-4c7edcad34c4",
    "liquor-store": "photo-1569529465841-dfecdab7503b",
    "bento": "photo-1504674900247-0877df9cc836",
    "construction": "photo-1504307651254-35680f356dfd",
    "builder": "photo-1600585154340-be6161a56a0c",
    "renovation": "photo-1581858726788-75bc0f6a952d",
    "realestate": "photo-1560518883-ce09059eeffa",
    "painting": "photo-1562259929-b4e1fd3aef09",
    "manufacturing": "photo-1565008447742-97f6f38c985c",
    "wholesale": "photo-1553413077-190dd305871c",
    "machine-parts": "photo-1537462715315-e650ad02b684",
    "printing": "photo-1562408590-e32931084e23",
    "freight": "photo-1586528116022-ab0413e9de24",
    "passenger": "photo-1570125909517-53cb21c89ff2",
    "cleaning": "photo-1581578731548-c64695cc6952",
    "auto-repair": "photo-1619642751034-765dfdf7c58e",
    "beauty": "photo-1560066984-138dadb4c035",
    "inn": "photo-1540541338287-41700207dee6",
    "hotel": "photo-1566073771259-6a8506099945",
    "hospital": "photo-1519494026892-80bbd2d6fd0d",
    "clinic": "photo-1631815589968-fdb09a223b1e",
    "care": "photo-1576765608535-5f04d1e3f289",
    "dental": "photo-1629909613654-28e377c37b09",
    "osteopathy": "photo-1544161515-4ab6ce6db874",
    "vet": "photo-1548767797-d8c844163c4c",
    "lawyer": "photo-1589829545856-d10d557cf95f",
    "judicial": "photo-1450101499163-c8848c66ca85",
    "administrative": "photo-1507679799987-c73779587ccf",
}

# サービス項目（業種別）
SERVICES = {
    "food-wholesale": ["冷凍食品", "冷蔵食品", "青果・生鮮", "精肉・鮮魚", "調味料", "包装資材"],
    "food-manufacturing": ["OEM製造", "PB商品開発", "冷凍食品", "レトルト", "缶詰", "品質検査"],
    "restaurant": ["ランチ", "ディナー", "宴会", "法事", "テイクアウト", "ケータリング"],
    "liquor-store": ["日本酒", "ワイン", "クラフトビール", "焼酎", "ウイスキー", "ギフト"],
    "bento": ["会議弁当", "イベント弁当", "法事料理", "おせち", "仕出し", "日替わり弁当"],
    "construction": ["新築工事", "改修工事", "土木工事", "設計施工", "耐震補強", "解体工事"],
    "builder": ["注文住宅", "建替え", "二世帯住宅", "平屋", "ZEH住宅", "アフター保証"],
    "renovation": ["キッチン", "浴室", "トイレ", "外壁", "内装", "バリアフリー"],
    "realestate": ["賃貸仲介", "売買仲介", "土地売買", "投資物件", "管理業務", "査定"],
    "painting": ["外壁塗装", "屋根塗装", "防水工事", "シーリング", "付帯塗装", "色彩提案"],
    "manufacturing": ["金属加工", "組立", "検査", "試作", "量産", "表面処理"],
    "wholesale": ["日用品", "文具", "包装資材", "化粧品", "雑貨", "OEM"],
    "machine-parts": ["旋盤加工", "フライス", "研削", "放電加工", "CAD設計", "品質検査"],
    "printing": ["チラシ", "名刺", "パンフ", "ポスター", "パッケージ", "ノベルティ"],
    "freight": ["一般貨物", "チャーター", "引越し", "倉庫保管", "梱包", "緊急便"],
    "passenger": ["貸切バス", "送迎", "観光ツアー", "空港送迎", "冠婚葬祭", "企業送迎"],
    "cleaning": ["オフィス清掃", "店舗清掃", "マンション", "ビル管理", "エアコン", "ハウス"],
    "auto-repair": ["車検", "一般整備", "板金塗装", "タイヤ", "オイル交換", "カスタム"],
    "beauty": ["カット", "カラー", "パーマ", "トリートメント", "ヘッドスパ", "着付け"],
    "inn": ["宿泊", "日帰り温泉", "懐石料理", "宴会", "貸切風呂", "送迎"],
    "hotel": ["宿泊", "宴会", "会議室", "レストラン", "ウェディング", "駐車場"],
    "hospital": ["内科", "外科", "整形外科", "小児科", "眼科", "救急"],
    "clinic": ["内科", "小児科", "アレルギー科", "予防接種", "健康診断", "在宅医療"],
    "care": ["入居", "ショートステイ", "デイサービス", "訪問介護", "リハビリ", "看取り"],
    "dental": ["一般歯科", "小児歯科", "矯正", "インプラント", "審美", "予防"],
    "osteopathy": ["骨盤矯正", "肩こり", "腰痛", "スポーツ障害", "交通事故", "美容鍼"],
    "vet": ["一般診療", "予防接種", "避妊去勢", "歯科", "皮膚科", "健康診断"],
    "lawyer": ["企業法務", "離婚", "相続", "交通事故", "債務整理", "刑事弁護"],
    "judicial": ["不動産登記", "商業登記", "相続", "債務整理", "会社設立", "成年後見"],
    "administrative": ["建設業許可", "車庫証明", "ビザ申請", "法人設立", "産廃許可", "補助金"],
}

def generate_site(key, info):
    """テンプレートからサイトを生成"""
    img_id = IMAGES.get(key, "photo-1504307651254-35680f356dfd")
    services = SERVICES.get(key, ["サービス1","サービス2","サービス3","サービス4","サービス5","サービス6"])
    color = info["color"]

    svc_html = ""
    svc_icons = ["&#9733;","&#9670;","&#10004;","&#9654;","&#9679;","&#10070;"]
    for i, s in enumerate(services):
        svc_html += f'<div class="bg-gray-50 rounded-xl p-5 text-center hover:shadow-md transition"><div class="text-2xl mb-2">{svc_icons[i%6]}</div><h3 class="font-bold text-sm">{s}</h3></div>\n'

    html = f'''<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{info["name"]} | {info["tagline"]}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700;900&display=swap" rel="stylesheet">
<script>tailwind.config={{theme:{{extend:{{colors:{{brand:'{color}'}},fontFamily:{{sans:['"Noto Sans JP"','sans-serif']}}}}}}}}</script>
<style>
html{{scroll-behavior:smooth}}
.fade-in{{opacity:0;transform:translateY(24px);transition:opacity .7s,transform .7s}}
.fade-in.visible{{opacity:1;transform:translateY(0)}}
</style>
</head>
<body class="font-sans text-gray-800">
<header class="fixed top-0 inset-x-0 bg-white/90 backdrop-blur shadow-sm z-50">
<div class="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
<a href="#" class="flex items-center gap-2"><div class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm" style="background:{color}">{info["name"][0]}</div><span class="font-black text-lg">{info["name"]}</span></a>
<nav class="hidden md:flex items-center gap-6 text-sm font-medium">
<a href="#about" class="hover:opacity-70">特徴</a>
<a href="#services" class="hover:opacity-70">サービス</a>
<a href="#company" class="hover:opacity-70">会社情報</a>
<a href="tel:000-000-0000" class="text-white px-5 py-2 rounded-lg" style="background:{color}">お問い合わせ</a>
</nav>
</div>
</header>

<section class="relative min-h-screen flex items-end">
<img src="https://images.unsplash.com/{img_id}?w=1920&q=80" alt="" class="absolute inset-0 w-full h-full object-cover">
<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
<div class="relative z-10 max-w-7xl mx-auto px-4 pb-20 pt-40 w-full">
<span class="inline-block text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider" style="background:{color}">{info["badge"]}</span>
<h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-4">{info["tagline"]}</h1>
<p class="text-white/70 text-lg max-w-lg mb-8">{info["desc"]}</p>
<a href="tel:000-000-0000" class="inline-block text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition shadow-lg" style="background:{color}">お問い合わせ 000-000-0000</a>
</div>
</section>

<section id="about" class="py-20 bg-gray-50">
<div class="max-w-5xl mx-auto px-4 text-center fade-in">
<h2 class="text-3xl font-black mb-4">{info["industry"]}の<span style="color:{color}">プロフェッショナル</span></h2>
<p class="text-gray-500 max-w-2xl mx-auto leading-relaxed">{info["name"]}は、{info["desc"]}。お客様一人ひとりのニーズに合わせた最適なソリューションをご提供いたします。まずはお気軽にご相談ください。</p>
</div>
</section>

<section id="services" class="py-20 bg-white">
<div class="max-w-5xl mx-auto px-4">
<h2 class="text-3xl font-black text-center mb-12 fade-in">サービス内容</h2>
<div class="grid grid-cols-2 md:grid-cols-3 gap-4 fade-in">
{svc_html}</div>
</div>
</section>

<section id="company" class="py-20 bg-gray-50">
<div class="max-w-3xl mx-auto px-4 fade-in">
<h2 class="text-3xl font-black text-center mb-12">会社情報</h2>
<div class="bg-white rounded-2xl overflow-hidden shadow-sm">
<table class="w-full text-sm">
<tr class="border-b"><td class="px-6 py-4 font-bold w-32 bg-gray-50">社名</td><td class="px-6 py-4">{info["name"]}</td></tr>
<tr class="border-b"><td class="px-6 py-4 font-bold bg-gray-50">業種</td><td class="px-6 py-4">{info["industry"]}</td></tr>
<tr class="border-b"><td class="px-6 py-4 font-bold bg-gray-50">電話番号</td><td class="px-6 py-4"><a href="tel:000-000-0000" style="color:{color}">000-000-0000</a></td></tr>
<tr><td class="px-6 py-4 font-bold bg-gray-50">所在地</td><td class="px-6 py-4">お問い合わせください</td></tr>
</table>
</div>
</div>
</section>

<footer class="py-10 text-center text-sm text-white" style="background:{color}">
<p class="font-black text-lg mb-2">{info["name"]}</p>
<p class="opacity-60">&copy; 2026 {info["name"]}. All Rights Reserved.</p>
<p class="opacity-40 text-xs mt-2">※これはHARTONが制作したサンプルサイトです</p>
</footer>

<script>
const obs=new IntersectionObserver(es=>{{es.forEach(e=>{{if(e.isIntersecting){{e.target.classList.add('visible');obs.unobserve(e.target)}}}}}},{{threshold:.1}});
document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));
</script>
</body>
</html>'''
    return html


def main():
    # 既存の手作りサイト（food, construction, beauty, dental, realestate, care）は上書きしない
    handcrafted = {"food-wholesale", "construction", "beauty", "realestate", "dental", "care"}
    # 既存のフォルダ名とのマッピング
    folder_rename = {"food-wholesale": "food"}

    count = 0
    for key, info in INDUSTRIES.items():
        folder = folder_rename.get(key, key)
        site_dir = os.path.join(SAMPLES_DIR, folder)
        os.makedirs(site_dir, exist_ok=True)

        if key in handcrafted:
            # 既に手作りサイトがある場合はスキップ
            print(f"SKIP (handcrafted): {key} -> samples/{folder}/")
            count += 1
            continue

        html = generate_site(key, info)
        filepath = os.path.join(site_dir, "index.html")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"OK: {info['name']} ({info['industry']}) -> samples/{folder}/")
        count += 1

    print(f"\\nDone! {count} sites total.")


if __name__ == "__main__":
    main()
