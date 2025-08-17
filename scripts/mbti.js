// scripts/mbti.js
hexo.extend.filter.register('template_locals', function (locals) {
  const card_mbti_src =
    (hexo.theme.config.aside && hexo.theme.config.aside.card_mbti) ||
    (hexo.config.aside && hexo.config.aside.card_mbti) ||
    {};

  const card_mbti = JSON.parse(JSON.stringify(card_mbti_src));

  const mbtiNames = {
    INTJ: '架构师',
    INTP: '逻辑学家',
    ENTJ: '指挥官',
    ENTP: '辩论家',
    INFJ: '提倡者',
    INFP: '调停者',
    ENFJ: '主人公',
    ENFP: '活动家',
    ISTJ: '物流师',
    ISFJ: '守护者',
    ESFJ: '执政官',
    ESFP: '表演者',
    ESTJ: '管理者',
    ESTP: '企业家',
    ISFP: '冒险家',
    ISTP: '鉴赏家'
  };

  const flipMap = {
    ei: { E: 'I', I: 'E' },
    sn: { S: 'N', N: 'S' },
    tf: { T: 'F', F: 'T' },
    jp: { J: 'P', P: 'J' },
    at: { A: 'T', T: 'A' }
  };

  const flipType = ['E', 'N', 'T', 'J'];
  const mbtiKeys = ['ei', 'sn', 'tf', 'jp'];

  mbtiKeys.forEach((key) => {
    const item = card_mbti[key];
    if (!item) return;
    const val = Number(item.value);
    const type = String(item.type || '').toUpperCase();
    if (val < 50) {
      item.type = flipMap[key][type];
      item.value = 100 - val;
    } else {
      item.type = type;
      item.value = val;
    }
  });

  const percentValues = mbtiKeys.map((k) => {
    const t = card_mbti[k]?.type;
    const v = Number(card_mbti[k]?.value || 0);
    return flipType.includes(t) ? 100 - v : v;
  });
  if (card_mbti.at) {
    const atv = Number(card_mbti.at.value || 0);
    const att = String(card_mbti.at.type || '');
    percentValues.push(att === 'A' ? 100 - atv : atv);
  }

  let mbti_text = mbtiKeys.map((k) => String(card_mbti[k]?.type || '')).join('');
  let mbti_text_additional = '';
  const animation = `https://blogfiles.oss.fyz666.xyz/mbti-animation/${mbti_text.toLowerCase()}.json`;
  const name = mbtiNames[mbti_text] || '';
  if (card_mbti.at) {
    mbti_text_additional = `-${String(card_mbti.at.type || '')}`;
  }
  const mbti_text_full = `${mbti_text}${mbti_text_additional}`;
  const update = card_mbti.date;

  locals.mbti = { card_mbti, percentValues, mbti_text, mbti_text_full, name, animation, update};
  return locals;
});