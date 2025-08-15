// scripts/mbti.js
hexo.extend.filter.register('template_locals', function (locals) {
  const card_mbti_src =
    (hexo.theme.config.aside && hexo.theme.config.aside.card_mbti) ||
    (hexo.config.aside && hexo.config.aside.card_mbti) ||
    {};

  const card_mbti = JSON.parse(JSON.stringify(card_mbti_src));

  const mbtiImages = {
    INTJ: 'https://blogfiles.oss.fyz666.xyz/svg/e54d2a84-55fd-414d-81af-7493ff2e11c1.svg',
    INTP: 'https://blogfiles.oss.fyz666.xyz/svg/a10c4445-b614-4d11-b45e-cfda23dbd485.svg',
    ENTJ: 'https://blogfiles.oss.fyz666.xyz/svg/c29d423d-b3ea-49a8-a78b-1f2c74133ba9.svg',
    ENTP: 'https://blogfiles.oss.fyz666.xyz/svg/c80b91f1-2305-46b7-bb13-1dca4b168983.svg',
    INFJ: 'https://blogfiles.oss.fyz666.xyz/svg/3a894383-b796-46f3-9320-6f39360d9a66.svg',
    INFP: 'https://blogfiles.oss.fyz666.xyz/svg/39e1659f-5eef-4709-bc5f-c5e588168293.svg',
    ENFJ: 'https://blogfiles.oss.fyz666.xyz/svg/40031020-9ea7-43e0-b2ac-fd0348181a66.svg',
    ENFP: 'https://blogfiles.oss.fyz666.xyz/svg/9e11c236-d35d-4118-b1f9-2ee9427b8dcb.svg',
    ISTJ: 'https://blogfiles.oss.fyz666.xyz/svg/1222b517-92dd-48dc-a4e7-b762bafb5419.svg',
    ISFJ: 'https://blogfiles.oss.fyz666.xyz/svg/4b4833f4-b189-419a-978b-a1e2ab594e4c.svg',
    ESFJ: 'https://blogfiles.oss.fyz666.xyz/svg/d2ea3f35-23f3-4475-b238-78deea37a8f3.svg',
    ESFP: 'https://blogfiles.oss.fyz666.xyz/svg/dd593ab0-1531-4816-9eff-1658f51ba35f.svg',
    ESTJ: 'https://blogfiles.oss.fyz666.xyz/svg/3ef072a8-b238-4c83-80af-33f33b85bc47.svg',
    ESTP: 'https://blogfiles.oss.fyz666.xyz/svg/643f62d0-777c-427b-b504-8796d02bb241.svg',
    ISFP: 'https://blogfiles.oss.fyz666.xyz/svg/688412b9-d42d-4a17-bf3a-64dfd4eb76fa.svg',
    ISTP: 'https://blogfiles.oss.fyz666.xyz/svg/ff7c5a0c-a453-45b1-a18a-aefa0253b555.svg'
  };

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
  const image = mbtiImages[mbti_text] || '';
  const name = mbtiNames[mbti_text] || '';
  if (card_mbti.at) {
    mbti_text_additional = `-${String(card_mbti.at.type || '')}`;
  }
  const mbti_text_full = `${mbti_text}${mbti_text_additional}`;
  const update = card_mbti.date;

  locals.mbti = { card_mbti, percentValues, mbti_text, mbti_text_full, name, image, update};
  return locals;
});