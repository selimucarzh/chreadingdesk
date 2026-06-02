const hanziText = document.querySelector("#hanziText");
const pinyinText = document.querySelector("#pinyinText");
const translationText = document.querySelector("#translationText");
const vocabList = document.querySelector("#vocabList");
const sourceLabel = document.querySelector("#sourceLabel");
const statusLabel = document.querySelector("#statusLabel");
const strokeStatus = document.querySelector("#strokeStatus");
const strokeSvg = document.querySelector("#strokeSvg");

const selectedCharacter = document.querySelector("#selectedCharacter");
const selectedPinyin = document.querySelector("#selectedPinyin");
const selectedMeaning = document.querySelector("#selectedMeaning");
const detailHanzi = document.querySelector("#detailHanzi");
const detailPinyin = document.querySelector("#detailPinyin");
const detailMeaning = document.querySelector("#detailMeaning");
const yomitanStatus = document.querySelector("#yomitanStatus");
const yomitanList = document.querySelector("#yomitanList");

document.querySelector("#newTextBtn").addEventListener("click", loadNewText);
document.querySelector("#scmpTextBtn").addEventListener("click", loadScmpText);
document.querySelector("#dailyTextBtn").addEventListener("click", loadDailyText);
document.querySelector("#translateBtn").addEventListener("click", translateCurrentText);

let currentText = "";
let currentTranslation = "";
let activeButton = null;
let activePinyinToken = null;
let activeCharIndex = -1;
let yomitanDictionary = null;

const fallbackTexts = [
  {
    title: "Daily Mandarin",
    source: "Built-in learning text",
    text: "今天我学习中文。我喜欢读短文，也喜欢听老师说话。每天练习一点，就会进步。",
    translation:
      "Today I study Chinese. I like reading short texts, and I also like listening to the teacher speak. If I practice a little every day, I will improve.",
  },
  {
    title: "City Morning",
    source: "Built-in learning text",
    text: "早上，城市很安静。学生去学校，朋友在咖啡店见面。新的故事从这里开始。",
    translation:
      "In the morning, the city is quiet. Students go to school, and friends meet at a coffee shop. A new story begins here.",
  },
  {
    title: "Learning Plan",
    source: "Built-in learning text",
    text: "如果遇到新的汉字，我先看拼音，再看意思，最后练习写这个字。",
    translation:
      "When I meet a new Chinese character, I first look at the pinyin, then the meaning, and finally practice writing the character.",
  },
];

const dailyTexts = [
  {
    title: "Commute Choice",
    source: "HSK4-5 Daily Chinese",
    text: "最近地铁特别拥挤，我原来以为打车会更方便，不过早高峰经常堵车。为了节省时间，我决定提前出门，顺便在路上听中文播客。",
    translation:
      "Recently the subway has been especially crowded. I originally thought taking a taxi would be more convenient, but during the morning rush hour there is often traffic. To save time, I decided to leave earlier and listen to a Chinese podcast on the way.",
  },
  {
    title: "Work Coordination",
    source: "HSK4-5 Daily Chinese",
    text: "这个项目涉及好几个部门，任务比想象中复杂。经理要求我们先确定重点，再按照计划分工合作。只要沟通及时，问题应该能够解决。",
    translation:
      "This project involves several departments, and the tasks are more complex than expected. The manager asked us to first determine the priorities, then divide the work and cooperate according to the plan. As long as communication is timely, the problems should be solvable.",
  },
  {
    title: "Online Shopping Return",
    source: "HSK4-5 Daily Chinese",
    text: "我在网上买的外套质量不错，可惜尺码不太合适。客服态度很好，马上帮我申请退换货，还提醒我保留快递单号。",
    translation:
      "The coat I bought online is good quality, but unfortunately the size is not quite right. Customer service had a good attitude and immediately helped me apply for a return or exchange, and also reminded me to keep the delivery tracking number.",
  },
  {
    title: "Healthy Routine",
    source: "HSK4-5 Daily Chinese",
    text: "以前我经常熬夜，结果白天没有精神。后来医生建议我调整生活习惯，坚持运动，少喝咖啡。现在我的状态明显改善了。",
    translation:
      "I used to stay up late often, and as a result I had no energy during the day. Later, the doctor advised me to adjust my lifestyle, keep exercising, and drink less coffee. Now my condition has clearly improved.",
  },
  {
    title: "Apartment Search",
    source: "HSK4-5 Daily Chinese",
    text: "找房子的时候，交通、价格和周围环境都很重要。虽然市中心的房租比较贵，但是离公司近，生活也更加方便。",
    translation:
      "When looking for an apartment, transportation, price, and the surrounding environment are all important. Although rent downtown is relatively expensive, it is close to the company and daily life is also more convenient.",
  },
  {
    title: "Restaurant Feedback",
    source: "HSK4-5 Daily Chinese",
    text: "这家餐厅的服务很热情，菜的味道也不错。不过价格比附近的饭馆高一些，所以我只会偶尔和朋友来这里聚会。",
    translation:
      "The service at this restaurant is warm, and the dishes taste good. However, the prices are a bit higher than nearby restaurants, so I will only occasionally come here with friends for gatherings.",
  },
  {
    title: "Budget Decision",
    source: "HSK4-5 Daily Chinese",
    text: "这个月的收入还可以，但我不想随便花钱。除了房租和日常开销，我准备把一部分人民币存起来，以后用于旅行。",
    translation:
      "My income this month is okay, but I do not want to spend money casually. Apart from rent and daily expenses, I plan to save part of my RMB and use it for travel later.",
  },
  {
    title: "Learning Reflection",
    source: "HSK4-5 Daily Chinese",
    text: "学习语言不能只背单词，还要了解文化背景。通过阅读真实材料，我逐渐发现中文表达和自己的母语有很多不同。",
    translation:
      "When learning a language, you cannot only memorize vocabulary; you also need to understand cultural background. By reading authentic materials, I gradually discovered that Chinese expressions are very different from my native language.",
  },
  {
    title: "Friend Conversation",
    source: "HSK4-5 Daily Chinese",
    text: "朋友最近压力很大，我劝他别把所有事情都放在心里。如果觉得累，可以暂时休息一下，或者找人聊聊。",
    translation:
      "My friend has been under a lot of pressure recently. I advised him not to keep everything inside. If he feels tired, he can rest for a while or find someone to talk to.",
  },
  {
    title: "Service Complaint",
    source: "HSK4-5 Daily Chinese",
    text: "我预订的房间没有打扫干净，空调也有点问题。前台表示抱歉，并答应马上安排工作人员处理。",
    translation:
      "The room I reserved had not been cleaned properly, and the air conditioner also had a small problem. The front desk apologized and promised to arrange staff to handle it immediately.",
  },
  {
    title: "Community Notice",
    source: "HSK4-5 Daily Chinese",
    text: "小区通知说，明天上午会暂停供水，因为工作人员要检查管道。邻居们最好提前准备一些生活用水。",
    translation:
      "The community notice said that the water supply will be temporarily stopped tomorrow morning because workers need to inspect the pipes. Neighbors had better prepare some water for daily use in advance.",
  },
  {
    title: "Career Choice",
    source: "HSK4-5 Daily Chinese",
    text: "毕业以后，我希望找一份跟国际贸易有关的工作。虽然竞争很激烈，但我相信只要继续提高能力，就会有机会。",
    translation:
      "After graduation, I hope to find a job related to international trade. Although the competition is intense, I believe that as long as I keep improving my abilities, there will be opportunities.",
  },
];

const vocabulary = [
  ["最近", "zui4 jin4", "recently"],
  ["特别", "te4 bie2", "especially"],
  ["拥挤", "yong1 ji3", "crowded"],
  ["原来", "yuan2 lai2", "originally; as it turns out"],
  ["以为", "yi3 wei2", "to think mistakenly"],
  ["方便", "fang1 bian4", "convenient"],
  ["不过", "bu2 guo4", "however"],
  ["高峰", "gao1 feng1", "peak period"],
  ["经常", "jing1 chang2", "often"],
  ["堵车", "du3 che1", "traffic jam"],
  ["为了", "wei4 le5", "in order to"],
  ["节省", "jie2 sheng3", "to save"],
  ["决定", "jue2 ding4", "to decide"],
  ["提前", "ti2 qian2", "in advance"],
  ["顺便", "shun4 bian4", "conveniently; while doing something"],
  ["涉及", "she4 ji2", "to involve"],
  ["部门", "bu4 men2", "department"],
  ["任务", "ren4 wu4", "task"],
  ["想象", "xiang3 xiang4", "imagination; to imagine"],
  ["复杂", "fu4 za2", "complex"],
  ["经理", "jing1 li3", "manager"],
  ["要求", "yao1 qiu2", "to require; request"],
  ["确定", "que4 ding4", "to determine; definite"],
  ["重点", "zhong4 dian3", "priority; key point"],
  ["按照", "an4 zhao4", "according to"],
  ["计划", "ji4 hua4", "plan"],
  ["分工", "fen1 gong1", "division of work"],
  ["合作", "he2 zuo4", "cooperation"],
  ["只要", "zhi3 yao4", "as long as"],
  ["沟通", "gou1 tong1", "communication"],
  ["及时", "ji2 shi2", "timely"],
  ["解决", "jie3 jue2", "to solve"],
  ["质量", "zhi4 liang4", "quality"],
  ["可惜", "ke3 xi1", "unfortunately"],
  ["合适", "he2 shi4", "suitable"],
  ["客服", "ke4 fu2", "customer service"],
  ["态度", "tai4 du4", "attitude"],
  ["申请", "shen1 qing3", "to apply for"],
  ["退换货", "tui4 huan4 huo4", "return or exchange goods"],
  ["提醒", "ti2 xing3", "to remind"],
  ["保留", "bao3 liu2", "to keep; retain"],
  ["快递", "kuai4 di4", "express delivery"],
  ["单号", "dan1 hao4", "tracking/order number"],
  ["以前", "yi3 qian2", "before; formerly"],
  ["熬夜", "ao2 ye4", "to stay up late"],
  ["结果", "jie2 guo3", "as a result"],
  ["精神", "jing1 shen2", "energy; spirit"],
  ["建议", "jian4 yi4", "to suggest"],
  ["调整", "tiao2 zheng3", "to adjust"],
  ["生活习惯", "sheng1 huo2 xi2 guan4", "lifestyle habit"],
  ["坚持", "jian1 chi2", "to persist"],
  ["状态", "zhuang4 tai4", "condition; state"],
  ["明显", "ming2 xian3", "obvious"],
  ["改善", "gai3 shan4", "to improve"],
  ["交通", "jiao1 tong1", "transportation"],
  ["价格", "jia4 ge2", "price"],
  ["周围", "zhou1 wei2", "surrounding"],
  ["环境", "huan2 jing4", "environment"],
  ["虽然", "sui1 ran2", "although"],
  ["市中心", "shi4 zhong1 xin1", "city center"],
  ["房租", "fang2 zu1", "rent"],
  ["比较", "bi3 jiao4", "relatively"],
  ["收入", "shou1 ru4", "income"],
  ["随便", "sui2 bian4", "casually; as one likes"],
  ["除了", "chu2 le5", "besides; except"],
  ["日常", "ri4 chang2", "daily; everyday"],
  ["开销", "kai1 xiao1", "expense"],
  ["人民币", "ren2 min2 bi4", "RMB; Chinese yuan"],
  ["存", "cun2", "to save; deposit"],
  ["用于", "yong4 yu2", "to be used for"],
  ["语言", "yu3 yan2", "language"],
  ["文化", "wen2 hua4", "culture"],
  ["背景", "bei4 jing3", "background"],
  ["通过", "tong1 guo4", "through; by means of"],
  ["真实", "zhen1 shi2", "real; authentic"],
  ["材料", "cai2 liao4", "material"],
  ["逐渐", "zhu2 jian4", "gradually"],
  ["发现", "fa1 xian4", "to discover"],
  ["表达", "biao3 da2", "expression; to express"],
  ["母语", "mu3 yu3", "native language"],
  ["压力", "ya1 li4", "pressure"],
  ["劝", "quan4", "to advise"],
  ["暂时", "zan4 shi2", "temporary; for now"],
  ["预订", "yu4 ding4", "reservation"],
  ["打扫", "da3 sao3", "to clean"],
  ["前台", "qian2 tai2", "front desk"],
  ["表示", "biao3 shi4", "to express; indicate"],
  ["抱歉", "bao4 qian4", "to be sorry"],
  ["答应", "da1 ying4", "to promise"],
  ["安排", "an1 pai2", "to arrange"],
  ["处理", "chu3 li3", "to handle"],
  ["通知", "tong1 zhi1", "notice; to notify"],
  ["暂停", "zan4 ting2", "to pause; suspend"],
  ["供水", "gong1 shui3", "water supply"],
  ["检查", "jian3 cha2", "to inspect"],
  ["管道", "guan3 dao4", "pipe; channel"],
  ["邻居", "lin2 ju1", "neighbor"],
  ["最好", "zui4 hao3", "had better"],
  ["准备", "zhun3 bei4", "to prepare"],
  ["毕业", "bi4 ye4", "to graduate"],
  ["希望", "xi1 wang4", "to hope"],
  ["国际贸易", "guo2 ji4 mao4 yi4", "international trade"],
  ["有关", "you3 guan1", "related to"],
  ["竞争", "jing4 zheng1", "competition"],
  ["激烈", "ji1 lie4", "intense"],
  ["相信", "xiang1 xin4", "to believe"],
  ["继续", "ji4 xu4", "to continue"],
  ["提高", "ti2 gao1", "to improve; raise"],
  ["能力", "neng2 li4", "ability"],
  ["机会", "ji1 hui4", "opportunity"],
];

const dictionary = {
  今: ["jin1", "now; today"],
  天: ["tian1", "sky; day"],
  我: ["wo3", "I; me"],
  学: ["xue2", "to study; to learn"],
  习: ["xi2", "to practice; habit"],
  中: ["zhong1", "middle; China"],
  文: ["wen2", "language; writing"],
  喜: ["xi3", "to like; joy"],
  欢: ["huan1", "happy; pleased"],
  读: ["du2", "to read"],
  短: ["duan3", "short"],
  也: ["ye3", "also"],
  听: ["ting1", "to listen"],
  老: ["lao3", "old; teacher prefix"],
  师: ["shi1", "teacher; master"],
  说: ["shuo1", "to speak; to say"],
  话: ["hua4", "speech; words"],
  每: ["mei3", "every"],
  练: ["lian4", "to practice"],
  一: ["yi1", "one"],
  点: ["dian3", "point; a little"],
  就: ["jiu4", "then; exactly"],
  会: ["hui4", "can; will"],
  进: ["jin4", "to enter; advance"],
  步: ["bu4", "step; progress"],
  早: ["zao3", "early; morning"],
  上: ["shang4", "up; above; morning"],
  城: ["cheng2", "city wall; city"],
  市: ["shi4", "market; city"],
  很: ["hen3", "very"],
  安: ["an1", "peaceful; safe"],
  静: ["jing4", "quiet"],
  生: ["sheng1", "student; life; to be born"],
  去: ["qu4", "to go"],
  校: ["xiao4", "school"],
  朋: ["peng2", "friend"],
  友: ["you3", "friend"],
  在: ["zai4", "at; in; to exist"],
  咖: ["ka1", "coffee sound component"],
  啡: ["fei1", "coffee sound component"],
  店: ["dian4", "shop; store"],
  见: ["jian4", "to see; meet"],
  面: ["mian4", "face; side; noodles"],
  新: ["xin1", "new"],
  的: ["de5", "possessive particle"],
  故: ["gu4", "reason; old; story component"],
  事: ["shi4", "matter; thing; event"],
  从: ["cong2", "from; to follow"],
  这: ["zhe4", "this"],
  里: ["li3", "inside; place"],
  开: ["kai1", "to open; begin"],
  始: ["shi3", "to begin"],
  如: ["ru2", "if; as"],
  果: ["guo3", "fruit; result"],
  遇: ["yu4", "to meet; encounter"],
  到: ["dao4", "to arrive; reach"],
  汉: ["han4", "Han Chinese"],
  字: ["zi4", "written character; word"],
  先: ["xian1", "first; before"],
  看: ["kan4", "to look; to read"],
  拼: ["pin1", "to spell; join together"],
  音: ["yin1", "sound; pronunciation"],
  再: ["zai4", "again; then"],
  意: ["yi4", "meaning; idea"],
  思: ["si1", "thought; meaning"],
  最: ["zui4", "most; -est"],
  后: ["hou4", "after; behind"],
  写: ["xie3", "to write"],
  个: ["ge4", "general measure word"],
  国: ["guo2", "country"],
  人: ["ren2", "person"],
  大: ["da4", "big"],
  小: ["xiao3", "small"],
  好: ["hao3", "good"],
  不: ["bu4", "not"],
  是: ["shi4", "to be"],
  有: ["you3", "to have"],
  和: ["he2", "and; harmony"],
  年: ["nian2", "year"],
  月: ["yue4", "moon; month"],
  日: ["ri4", "sun; day"],
};

loadYomitanDictionary();
loadNewText();

function loadDailyText() {
  const text = dailyTexts[Math.floor(Math.random() * dailyTexts.length)];
  currentText = text.text;
  currentTranslation = text.translation;
  sourceLabel.textContent = `${text.source}: ${text.title}`;
  translationText.textContent = currentTranslation;
  renderText(currentText);
  setStatus("Daily Chinese text loaded");
}

async function loadNewText() {
  await loadOnlineText();
}

async function loadScmpText() {
  await loadOnlineText("scmp", "Loading SCMP Trending China text...");
}

async function loadOnlineText(source = "", loadingMessage = "Loading Chinese newspaper text...") {
  setStatus(loadingMessage);
  try {
    const article = await fetchNewspaperText(source);
    currentText = cleanChinese(article.text);
    currentTranslation = article.translation || "";
    sourceLabel.textContent = `${article.source} - ${article.category}`;
    renderText(currentText);
    if (currentTranslation) {
      translationText.textContent = currentTranslation;
      setStatus("Online text ready");
    } else {
      await translateCurrentText();
    }
  } catch (error) {
    const fallback = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
    currentText = fallback.text;
    currentTranslation = fallback.translation;
    sourceLabel.textContent = `${fallback.source}: ${fallback.title}`;
    translationText.textContent = currentTranslation;
    renderText(currentText);
    setStatus("Offline fallback loaded");
  }
}

async function fetchNewspaperText(source = "") {
  const url = new URL("/api/news", window.location.origin);
  if (source) {
    url.searchParams.set("source", source);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("local newspaper API unavailable");
  }
  return response.json();
}

async function fetchWikipediaSummary() {
  const response = await fetch("https://zh.wikipedia.org/api/rest_v1/page/random/summary");
  if (!response.ok) {
    throw new Error("failed to fetch Chinese Wikipedia");
  }
  return response.json();
}

async function translateCurrentText() {
  if (!currentText) {
    return;
  }

  setStatus("Translating...");
  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", currentText.slice(0, 480));
    url.searchParams.set("langpair", "zh-CN|en");
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("translation request failed");
    }
    const payload = await response.json();
    currentTranslation = payload.responseData?.translatedText || currentTranslation;
    translationText.textContent = currentTranslation || "Translation unavailable.";
    setStatus("Online text ready");
  } catch (error) {
    translationText.textContent = currentTranslation || "Online translation unavailable.";
    setStatus("Translation fallback shown");
  }
}

function renderText(text) {
  hanziText.replaceChildren();
  const chars = Array.from(text);
  renderVocabulary(text);

  chars.forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char;
    if (isHanzi(char)) {
      span.className = "hanzi-char";
      span.type = "button";
      span.tabIndex = 0;
      span.dataset.charIndex = String(index);
      span.addEventListener("click", () => selectCharacter(char, span, index));
      span.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCharacter(char, span, index);
        }
      });
    } else {
      span.className = "punctuation";
    }
    hanziText.append(span);
  });

  renderPinyinLine(chars);
  const first = hanziText.querySelector(".hanzi-char");
  if (first) {
    selectCharacter(first.textContent, first, Number(first.dataset.charIndex));
  }
}

function renderVocabulary(text) {
  vocabList.replaceChildren();
  const matches = vocabulary
    .filter(([word]) => text.includes(word))
    .slice(0, 18);

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "vocab-empty";
    empty.textContent = "No daily vocabulary matches in this text yet.";
    vocabList.append(empty);
    return;
  }

  matches.forEach(([word, pinyin, meaning]) => {
    const item = document.createElement("div");
    item.className = "vocab-item";
    item.innerHTML = `
      <strong>${escapeHTML(word)}</strong>
      <span>${escapeHTML(pinyin)}</span>
      <small>${escapeHTML(meaning)}</small>
    `;
    vocabList.append(item);
  });
}

async function selectCharacter(char, element, charIndex) {
  if (activeButton) {
    activeButton.classList.remove("active");
  }
  if (activePinyinToken) {
    activePinyinToken.classList.remove("active");
  }
  activeButton = element;
  activeCharIndex = charIndex;
  activeButton.classList.add("active");
  activePinyinToken = pinyinText.querySelector(`[data-char-index="${charIndex}"]`);
  if (activePinyinToken) {
    activePinyinToken.classList.add("active");
  }

  const [pinyin, meaning] = lookupCharacter(char);
  selectedCharacter.textContent = char;
  selectedPinyin.textContent = pinyin;
  selectedMeaning.textContent = meaning;
  detailHanzi.textContent = char;
  detailPinyin.textContent = pinyin;
  detailMeaning.textContent = meaning;
  renderYomitanMatches(charIndex);

  await renderStrokeOrder(char);
}

async function loadYomitanDictionary() {
  yomitanStatus.textContent = "Loading";
  renderYomitanEmpty("Loading CC-CEDICT entries...");

  try {
    const response = await fetch("./data/yomitan-cc-cedict.json");
    if (!response.ok) {
      throw new Error("dictionary unavailable");
    }
    yomitanDictionary = await response.json();
    yomitanStatus.textContent = `${yomitanDictionary.entryCount.toLocaleString()} entries`;
    if (activeCharIndex >= 0) {
      renderYomitanMatches(activeCharIndex);
    } else {
      renderYomitanEmpty("Select a Hanzi character to see CC-CEDICT matches.");
    }
  } catch (error) {
    yomitanDictionary = null;
    yomitanStatus.textContent = "Unavailable";
    renderYomitanEmpty("CC-CEDICT dictionary could not be loaded.");
  }
}

function renderYomitanMatches(charIndex) {
  if (!yomitanDictionary) {
    renderYomitanEmpty("Loading CC-CEDICT entries...");
    return;
  }

  const matches = findYomitanMatches(charIndex).slice(0, 4);
  yomitanList.replaceChildren();

  if (!matches.length) {
    renderYomitanEmpty("No CC-CEDICT entry found near this character.");
    return;
  }

  matches.forEach(({ term, entries }) => {
    entries.slice(0, 2).forEach((entry) => {
      const item = document.createElement("div");
      item.className = "yomitan-entry";
      item.innerHTML = `
        <div class="yomitan-headword">
          <strong>${escapeHTML(term)}</strong>
          <span>${escapeHTML(entry.reading || pinyinForText(term))}</span>
        </div>
        <p>${escapeHTML(entry.definitions.slice(0, 3).join("; "))}</p>
      `;
      yomitanList.append(item);
    });
  });
}

function findYomitanMatches(charIndex) {
  const entries = yomitanDictionary.entries || {};
  const chars = Array.from(currentText);
  const maxLength = Math.min(yomitanDictionary.maxTermLength || 8, 8);
  const matches = [];
  const seen = new Set();

  for (let start = Math.max(0, charIndex - maxLength + 1); start <= charIndex; start += 1) {
    for (let end = charIndex + 1; end <= Math.min(chars.length, start + maxLength); end += 1) {
      const term = chars.slice(start, end).join("");
      if (seen.has(term) || !entries[term]) {
        continue;
      }
      seen.add(term);
      matches.push({ term, entries: entries[term] });
    }
  }

  return matches.sort((left, right) => Array.from(right.term).length - Array.from(left.term).length);
}

function renderYomitanEmpty(message) {
  yomitanList.replaceChildren();
  const empty = document.createElement("p");
  empty.className = "yomitan-empty";
  empty.textContent = message;
  yomitanList.append(empty);
}

function renderPinyinLine(chars) {
  pinyinText.replaceChildren();

  chars.forEach((char, index) => {
    const span = document.createElement("span");
    if (isHanzi(char)) {
      span.className = "pinyin-token";
      span.dataset.charIndex = String(index);
      span.textContent = pinyinForChar(char);
    } else {
      span.className = "pinyin-punctuation";
      span.textContent = char.trim() ? char : " ";
    }
    pinyinText.append(span);
  });
}

async function renderStrokeOrder(char) {
  strokeSvg.replaceChildren();
  strokeStatus.textContent = "Loading strokes";

  try {
    const response = await fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`);
    if (!response.ok) {
      throw new Error("stroke data not found");
    }
    const data = await response.json();
    drawStrokes(data.strokes || []);
    strokeStatus.textContent = `${data.strokes?.length || 0} strokes`;
  } catch (error) {
    drawFallbackCharacter(char);
    strokeStatus.textContent = "Stroke data unavailable";
  }
}

function drawStrokes(strokes) {
  const group = svgElement("g");
  group.setAttribute("transform", "scale(1,-1) translate(0,-900)");
  strokeSvg.append(group);

  strokes.forEach((path, index) => {
    const stroke = svgElement("path");
    stroke.setAttribute("d", path);
    stroke.setAttribute("fill", strokeColor(index, strokes.length));
    stroke.setAttribute("stroke", "#1b1b18");
    stroke.setAttribute("stroke-width", "8");
    stroke.setAttribute("stroke-linejoin", "round");
    group.append(stroke);
  });
}

function drawFallbackCharacter(char) {
  const text = svgElement("text");
  text.textContent = char;
  text.setAttribute("x", "512");
  text.setAttribute("y", "640");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "620");
  text.setAttribute("font-family", "Noto Serif CJK SC, Songti SC, serif");
  text.setAttribute("fill", "#b33a32");
  strokeSvg.append(text);
}

function svgElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function strokeColor(index, total) {
  const hue = 4 + Math.round((index / Math.max(total - 1, 1)) * 38);
  return `hsl(${hue} 58% ${44 + (index % 2) * 8}%)`;
}

function toPinyinLine(text) {
  if (window.pinyinPro?.pinyin) {
    return window.pinyinPro.pinyin(text, { toneType: "symbol", type: "array" }).join(" ");
  }

  return Array.from(text)
    .map((char) => {
      if (!isHanzi(char)) {
        return char.trim() ? char : "";
      }
      return lookupCharacter(char)[0];
    })
    .filter(Boolean)
    .join(" ");
}

function pinyinForChar(char) {
  if (window.pinyinPro?.pinyin) {
    return window.pinyinPro.pinyin(char, { toneType: "symbol" });
  }
  return lookupCharacter(char)[0];
}

function pinyinForText(text) {
  if (window.pinyinPro?.pinyin) {
    return window.pinyinPro.pinyin(text, { toneType: "symbol" });
  }
  return Array.from(text).map((char) => lookupCharacter(char)[0]).join(" ");
}

function lookupCharacter(char) {
  if (dictionary[char]) {
    return dictionary[char];
  }

  const generatedPinyin = window.pinyinPro?.pinyin
    ? window.pinyinPro.pinyin(char, { toneType: "num" })
    : "unknown";
  return [generatedPinyin || "unknown", "Dictionary entry not loaded yet"];
}

function cleanChinese(value) {
  return String(value || "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\s+/g, "")
    .slice(0, 180);
}

function countHanzi(value) {
  return Array.from(value).filter(isHanzi).length;
}

function isHanzi(char) {
  return /\p{Script=Han}/u.test(char);
}

function setStatus(message) {
  statusLabel.textContent = message;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
